import { sessions, tracks, type Session, type Track, type InsertSession, type InsertTrack } from "@shared/schema";
import fs from "fs";
import path from "path";

export interface IStorage {
  // Session management
  createSession(session: InsertSession): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  
  // Track management
  createTrack(track: InsertTrack): Promise<Track>;
  getTracksBySession(sessionId: string): Promise<Track[]>;
  updateTrack(id: number, updates: Partial<Track>): Promise<Track | undefined>;
  deleteTrack(id: number): Promise<void>;
  
  // File management
  saveFile(sessionId: string, fileName: string, buffer: Buffer): Promise<string>;
  getFile(filePath: string): Promise<Buffer | undefined>;
  deleteSessionFiles(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, Session> = new Map();
  private tracks: Map<number, Track> = new Map();
  private files: Map<string, Buffer> = new Map();
  private sessionIdCounter = 1;
  private trackIdCounter = 1;
  private uploadsDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = {
      id: this.sessionIdCounter++,
      ...insertSession,
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    return this.sessions.get(sessionId);
  }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const track: Track = {
      id: this.trackIdCounter++,
      ...insertTrack,
      duration: insertTrack.duration ?? null,
      liked: insertTrack.liked ?? null,
      processed: insertTrack.processed ?? false,
    };
    this.tracks.set(track.id, track);
    return track;
  }

  async getTracksBySession(sessionId: string): Promise<Track[]> {
    return Array.from(this.tracks.values()).filter(
      track => track.sessionId === sessionId
    );
  }

  async updateTrack(id: number, updates: Partial<Track>): Promise<Track | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;
    
    const updatedTrack = { ...track, ...updates };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }

  async deleteTrack(id: number): Promise<void> {
    this.tracks.delete(id);
  }

  async saveFile(sessionId: string, fileName: string, buffer: Buffer): Promise<string> {
    const sessionDir = path.join(this.uploadsDir, sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }
    
    const filePath = path.join(sessionDir, fileName);
    this.files.set(filePath, buffer);
    
    // Also save to filesystem for persistence across restarts
    fs.writeFileSync(filePath, buffer);
    
    return filePath;
  }

  async getFile(filePath: string): Promise<Buffer | undefined> {
    // Try memory first, then filesystem
    let buffer = this.files.get(filePath);
    if (!buffer && fs.existsSync(filePath)) {
      buffer = fs.readFileSync(filePath);
      this.files.set(filePath, buffer);
    }
    return buffer;
  }

  async deleteSessionFiles(sessionId: string): Promise<void> {
    const sessionDir = path.join(this.uploadsDir, sessionId);
    if (fs.existsSync(sessionDir)) {
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
    
    // Clear from memory
    Array.from(this.files.keys())
      .filter(path => path.includes(sessionId))
      .forEach(path => this.files.delete(path));
  }
}

export const storage = new MemStorage();
