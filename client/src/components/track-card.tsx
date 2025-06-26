import { Play, Pause, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { type Track } from "@shared/schema";
import { formatFileSize, formatDuration } from "@/lib/audio-utils";
import Waveform from "./waveform";

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onLike: () => void;
  onDislike: () => void;
  onSeek: (time: number) => void;
  disabled?: boolean;
}

export default function TrackCard({
  track,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onLike,
  onDislike,
  onSeek,
  disabled = false,
}: TrackCardProps) {
  const audioUrl = `/api/tracks/${track.id}/audio`;

  return (
    <Card className="bg-gradient-to-b from-dark-blue to-dark border border-gray-700 p-6 shadow-2xl transform transition-transform duration-300">
      {/* Track Info */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2 truncate">
          {track.originalName}
        </h3>
        <p className="text-gray-400 text-sm">
          {formatDuration(duration)} • {formatFileSize(track.fileSize)}
        </p>
      </div>

      {/* Waveform */}
      <div className="mb-6">
        <Waveform 
          audioUrl={audioUrl}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </div>

      {/* Play Control */}
      <div className="text-center mb-8">
        <Button
          onClick={onTogglePlay}
          disabled={disabled}
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
          onClick={onDislike}
          disabled={disabled}
          className="w-14 h-14 bg-gradient-to-br from-destructive to-red-600 hover:from-destructive/80 hover:to-red-600/80 rounded-full p-0 shadow-lg transform hover:scale-110 transition-all"
        >
          <X className="w-6 h-6" />
        </Button>
        <Button
          onClick={onLike}
          disabled={disabled}
          className="w-14 h-14 bg-gradient-to-br from-success to-green-600 hover:from-success/80 hover:to-green-600/80 rounded-full p-0 shadow-lg transform hover:scale-110 transition-all"
        >
          <Heart className="w-6 h-6" />
        </Button>
      </div>
    </Card>
  );
}
