import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, X, Play, Pause, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAudio } from "@/hooks/use-audio";
import { type Track } from "@shared/schema";
import Waveform from "@/components/waveform";
import { formatFileSize, formatDuration } from "@/lib/audio-utils";

interface SortingProps {
  params: { sessionId: string };
}

export default function Sorting({ params }: SortingProps) {
  const { sessionId } = params;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const { data: tracksData } = useQuery({
    queryKey: [`/api/sessions/${sessionId}/tracks`],
    enabled: !!sessionId,
  });

  const tracks: Track[] = tracksData?.tracks || [];
  const currentTrack = tracks[currentTrackIndex];
  const progress = tracks.length > 0 ? ((currentTrackIndex + 1) / tracks.length) * 100 : 0;

  const audioUrl = currentTrack ? `/api/tracks/${currentTrack.id}/audio` : null;
  const { isPlaying, currentTime, duration, togglePlay, seek } = useAudio(audioUrl);

  const updateTrackMutation = useMutation({
    mutationFn: async ({ trackId, liked }: { trackId: number; liked: boolean }) => {
      const response = await apiRequest("PATCH", `/api/tracks/${trackId}`, { liked });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/sessions/${sessionId}/tracks`] });
    },
  });

  const handleLike = useCallback(async () => {
    if (!currentTrack) return;
    
    try {
      await updateTrackMutation.mutateAsync({ 
        trackId: currentTrack.id, 
        liked: true 
      });
      
      if (currentTrackIndex + 1 >= tracks.length) {
        setLocation(`/statistics/${sessionId}`);
      } else {
        setCurrentTrackIndex(prev => prev + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save track preference",
        variant: "destructive",
      });
    }
  }, [currentTrack, currentTrackIndex, tracks.length, updateTrackMutation, sessionId, setLocation, toast]);

  const handleDislike = useCallback(async () => {
    if (!currentTrack) return;
    
    try {
      await updateTrackMutation.mutateAsync({ 
        trackId: currentTrack.id, 
        liked: false 
      });
      
      if (currentTrackIndex + 1 >= tracks.length) {
        setLocation(`/statistics/${sessionId}`);
      } else {
        setCurrentTrackIndex(prev => prev + 1);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save track preference",
        variant: "destructive",
      });
    }
  }, [currentTrack, currentTrackIndex, tracks.length, updateTrackMutation, sessionId, setLocation, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleDislike();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleLike();
          break;
        case 'KeyH':
          e.preventDefault();
          setShowKeyboardShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleLike, handleDislike]);

  if (!currentTrack) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No tracks to sort</h2>
          <p className="text-gray-400">All tracks have been processed.</p>
          <Button 
            onClick={() => setLocation(`/statistics/${sessionId}`)}
            className="mt-4"
          >
            View Results
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with Progress */}
      <div className="sticky top-0 bg-dark/90 backdrop-blur-sm border-b border-gray-800 px-6 py-4 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Track Sorting</h2>
            <span className="text-sm text-gray-400">
              {currentTrackIndex + 1} / {tracks.length}
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)] px-4 py-8">
        <div className="relative w-full max-w-sm">
          <Card className="bg-gradient-to-b from-dark-blue to-dark border border-gray-700 p-6 shadow-2xl">
            {/* Track Info */}
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2 truncate">
                {currentTrack.originalName}
              </h3>
              <p className="text-gray-400 text-sm">
                {formatDuration(duration)} • {formatFileSize(currentTrack.fileSize)}
              </p>
            </div>

            {/* Waveform */}
            <div className="mb-6">
              <Waveform 
                audioUrl={audioUrl || ''}
                isPlaying={isPlaying}
                currentTime={currentTime}
                duration={duration}
                onSeek={seek}
              />
            </div>

            {/* Play Control */}
            <div className="text-center mb-8">
              <Button
                onClick={togglePlay}
                className="w-16 h-16 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 rounded-full p-0 shadow-lg transform hover:scale-110 transition-all"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </Button>
              <div className="mt-2 text-xs text-gray-500">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-8">
              <Button
                onClick={handleDislike}
                disabled={updateTrackMutation.isPending}
                className="w-14 h-14 bg-gradient-to-br from-destructive to-red-600 hover:from-destructive/80 hover:to-red-600/80 rounded-full p-0 shadow-lg transform hover:scale-110 transition-all"
              >
                <X className="w-6 h-6" />
              </Button>
              <Button
                onClick={handleLike}
                disabled={updateTrackMutation.isPending}
                className="w-14 h-14 bg-gradient-to-br from-success to-green-600 hover:from-success/80 hover:to-green-600/80 rounded-full p-0 shadow-lg transform hover:scale-110 transition-all"
              >
                <Heart className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="fixed bottom-4 left-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
          className="bg-dark-blue/80 backdrop-blur-sm text-gray-400 hover:text-white"
        >
          <Keyboard className="w-4 h-4 mr-2" />
          Shortcuts
        </Button>
        
        {showKeyboardShortcuts && (
          <div className="absolute bottom-full left-0 mb-2 bg-dark-blue/90 backdrop-blur-sm rounded-lg p-3 text-xs text-gray-400 whitespace-nowrap">
            <div className="space-y-1">
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd> Play/Pause</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd> Dislike</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd> Like</div>
              <div><kbd className="bg-gray-700 px-2 py-1 rounded">H</kbd> Toggle shortcuts</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
