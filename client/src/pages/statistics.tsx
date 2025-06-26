import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BarChart3, Heart, Trash2, Headphones, Download, List, RotateCcw, Share, Play, Search, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatFileSize, formatDuration } from "@/lib/audio-utils";
import { type Track } from "@shared/schema";

interface StatisticsProps {
  params: { sessionId: string };
}

export default function Statistics({ params }: StatisticsProps) {
  const { sessionId } = params;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: statisticsData } = useQuery({
    queryKey: [`/api/sessions/${sessionId}/statistics`],
    enabled: !!sessionId,
  });

  const statistics = statisticsData?.statistics;
  const likedTracks: Track[] = statistics?.likedTracks || [];

  const filteredTracks = likedTracks.filter(track =>
    track.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadTracks = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download tracks');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `liked-tracks-${sessionId}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Download started",
        description: "Your liked tracks are being downloaded as a ZIP file.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download tracks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPlaylist = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/playlist`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download playlist');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `playlist-${sessionId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Playlist downloaded",
        description: "Your playlist has been saved as a text file.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download playlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSingleTrack = async (trackId: number, filename: string) => {
    try {
      const response = await fetch(`/api/tracks/${trackId}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download track');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Track downloaded",
        description: `${filename} has been downloaded.`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download track. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Loading Statistics...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Sorting Complete!</h1>
          <p className="text-gray-400">Here's what happened to your music collection</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-dark-blue to-dark border border-gray-700 text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{statistics.totalListened}</h3>
              <p className="text-gray-400">Total Listened</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-dark-blue to-dark border border-gray-700 text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{statistics.totalSaved}</h3>
              <p className="text-gray-400">Tracks Saved</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-dark-blue to-dark border border-gray-700 text-center">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold mb-1">{statistics.totalRemoved}</h3>
              <p className="text-gray-400">Tracks Removed</p>
            </CardContent>
          </Card>
        </div>

        {/* Download Options */}
        {statistics.totalSaved > 0 && (
          <Card className="bg-gradient-to-br from-dark-blue to-dark border border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="w-6 h-6 text-primary mr-3" />
                Download Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={handleDownloadTracks}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white p-4 h-auto font-medium transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download All Tracks (ZIP)
                </Button>
                <Button
                  onClick={handleDownloadPlaylist}
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-600 text-white p-4 h-auto font-medium transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  <List className="w-5 h-5 mr-2" />
                  Download Playlist (TXT)
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Tracks List */}
        {statistics.totalSaved > 0 && (
          <Card className="bg-gradient-to-br from-dark-blue to-dark border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Music className="w-6 h-6 text-success mr-3" />
                Saved Tracks ({statistics.totalSaved})
              </CardTitle>
              
              {/* Search */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 pl-10"
                />
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between bg-gray-800/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium">{track.originalName}</h4>
                        <p className="text-sm text-gray-400">
                          {formatDuration(track.duration || 0)} • {formatFileSize(track.fileSize)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const audio = new Audio(`/api/tracks/${track.id}/audio`);
                          audio.play();
                        }}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Preview"
                      >
                        <Play className="w-4 h-4 text-gray-400" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadSingleTrack(track.id, track.originalName)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {filteredTracks.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-gray-400">
                    No tracks found matching "{searchQuery}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="text-center mt-8 space-x-4">
          <Button
            onClick={() => setLocation("/")}
            variant="secondary"
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Sort More Tracks
          </Button>
          <Button
            onClick={() => {
              const data = {
                session: sessionId,
                statistics,
                timestamp: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `session-${sessionId}.json`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              
              toast({
                title: "Session exported",
                description: "Session data has been saved as JSON file.",
              });
            }}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white px-6 py-3 font-medium"
          >
            <Share className="w-4 h-4 mr-2" />
            Export Session
          </Button>
        </div>
      </div>
    </div>
  );
}
