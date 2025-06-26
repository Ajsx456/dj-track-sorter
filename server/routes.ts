import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertSessionSchema, insertTrackSchema, type ProcessedTrack, type Track } from "@shared/schema";
import { nanoid } from "nanoid";
import JSZip from "jszip";
import path from "path";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype === 'audio/mpeg' || file.originalname.toLowerCase().endsWith('.mp3')) {
      cb(null, true);
    } else {
      cb(new Error('Only MP3 files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new sorting session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionId = nanoid();
      const session = await storage.createSession({
        sessionId,
        createdAt: new Date().toISOString(),
      });
      
      res.json({ session });
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Upload tracks for a session
  app.post("/api/sessions/:sessionId/tracks", upload.array('tracks'), async (req, res) => {
    try {
      const { sessionId } = req.params;
      const files = (req as any).files as any[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      const tracks = [];
      
      for (const file of files) {
        // Save file to storage
        const fileName = `${nanoid()}-${file.originalname}`;
        const filePath = await storage.saveFile(sessionId, fileName, file.buffer);
        
        // Create track record
        const track = await storage.createTrack({
          sessionId,
          fileName,
          originalName: file.originalname,
          fileSize: file.size,
          duration: null, // Will be populated when processing
          liked: null,
          processed: false,
          filePath,
        });
        
        tracks.push(track);
      }

      res.json({ tracks });
    } catch (error) {
      console.error("Error uploading tracks:", error);
      res.status(500).json({ error: "Failed to upload tracks" });
    }
  });

  // Get tracks for a session
  app.get("/api/sessions/:sessionId/tracks", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const tracks = await storage.getTracksBySession(sessionId);
      res.json({ tracks });
    } catch (error) {
      console.error("Error fetching tracks:", error);
      res.status(500).json({ error: "Failed to fetch tracks" });
    }
  });

  // Serve audio files
  app.get("/api/tracks/:trackId/audio", async (req, res) => {
    try {
      const trackId = parseInt(req.params.trackId);
      const tracks = Array.from((storage as any).tracks.values()) as Track[];
      const track = tracks.find((t: Track) => t.id === trackId);
      
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }

      const fileBuffer = await storage.getFile(track.filePath);
      if (!fileBuffer) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileBuffer.length,
        'Accept-Ranges': 'bytes',
      });
      
      res.send(fileBuffer);
    } catch (error) {
      console.error("Error serving audio:", error);
      res.status(500).json({ error: "Failed to serve audio file" });
    }
  });

  // Update track (like/dislike)
  app.patch("/api/tracks/:trackId", async (req, res) => {
    try {
      const trackId = parseInt(req.params.trackId);
      const { liked } = req.body;
      
      const updatedTrack = await storage.updateTrack(trackId, { liked });
      if (!updatedTrack) {
        return res.status(404).json({ error: "Track not found" });
      }

      res.json({ track: updatedTrack });
    } catch (error) {
      console.error("Error updating track:", error);
      res.status(500).json({ error: "Failed to update track" });
    }
  });

  // Get session statistics
  app.get("/api/sessions/:sessionId/statistics", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const tracks = await storage.getTracksBySession(sessionId);
      
      const statistics = {
        totalListened: tracks.filter(t => t.liked !== null).length,
        totalSaved: tracks.filter(t => t.liked === true).length,
        totalRemoved: tracks.filter(t => t.liked === false).length,
        likedTracks: tracks.filter(t => t.liked === true),
      };

      res.json({ statistics });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  // Download liked tracks as ZIP
  app.get("/api/sessions/:sessionId/download", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const tracks = await storage.getTracksBySession(sessionId);
      const likedTracks = tracks.filter(t => t.liked === true);
      
      if (likedTracks.length === 0) {
        return res.status(404).json({ error: "No liked tracks to download" });
      }

      const zip = new JSZip();
      
      // Add audio files to ZIP
      for (const track of likedTracks) {
        const fileBuffer = await storage.getFile(track.filePath);
        if (fileBuffer) {
          zip.file(track.originalName, fileBuffer);
        }
      }
      
      // Generate playlist file
      const playlist = likedTracks.map(t => t.originalName).join('\n');
      zip.file('playlist.txt', playlist);
      
      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
      
      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="liked-tracks-${sessionId}.zip"`,
        'Content-Length': zipBuffer.length,
      });
      
      res.send(zipBuffer);
    } catch (error) {
      console.error("Error creating download:", error);
      res.status(500).json({ error: "Failed to create download" });
    }
  });

  // Download playlist as text file
  app.get("/api/sessions/:sessionId/playlist", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const tracks = await storage.getTracksBySession(sessionId);
      const likedTracks = tracks.filter(t => t.liked === true);
      
      const playlist = likedTracks.map(t => t.originalName).join('\n');
      
      res.set({
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="playlist-${sessionId}.txt"`,
      });
      
      res.send(playlist);
    } catch (error) {
      console.error("Error creating playlist:", error);
      res.status(500).json({ error: "Failed to create playlist" });
    }
  });

  // Download single track
  app.get("/api/tracks/:trackId/download", async (req, res) => {
    try {
      const trackId = parseInt(req.params.trackId);
      const tracks = Array.from((storage as any).tracks.values()) as Track[];
      const track = tracks.find((t: Track) => t.id === trackId);
      
      if (!track) {
        return res.status(404).json({ error: "Track not found" });
      }

      const fileBuffer = await storage.getFile(track.filePath);
      if (!fileBuffer) {
        return res.status(404).json({ error: "Audio file not found" });
      }

      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${track.originalName}"`,
        'Content-Length': fileBuffer.length,
      });
      
      res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading track:", error);
      res.status(500).json({ error: "Failed to download track" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
