import { useEffect, useRef, useState } from "react";

interface WaveformProps {
  audioUrl: string;
  isPlaying?: boolean;
  currentTime?: number;
  duration?: number;
  onSeek?: (time: number) => void;
  height?: number;
}

export default function Waveform({ 
  audioUrl, 
  isPlaying = false, 
  currentTime = 0, 
  duration = 0,
  onSeek,
  height = 96 
}: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  // Generate mock waveform data (in a real app, you'd analyze the audio)
  useEffect(() => {
    // Generate random waveform data for visualization
    const mockData = Array.from({ length: 100 }, () => Math.random() * 0.8 + 0.2);
    setWaveformData(mockData);
  }, [audioUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height: canvasHeight } = canvas;
    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Draw waveform bars
    waveformData.forEach((amplitude, index) => {
      const barHeight = amplitude * canvasHeight * 0.8;
      const x = index * barWidth;
      const y = (canvasHeight - barHeight) / 2;
      
      // Determine color based on progress
      const barProgress = index / waveformData.length;
      const isPlayed = barProgress <= progress;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      if (isPlayed) {
        gradient.addColorStop(0, 'hsl(249, 82%, 65%)'); // primary
        gradient.addColorStop(1, 'hsl(252, 82%, 69%)'); // secondary
      } else {
        gradient.addColorStop(0, 'hsl(249, 82%, 65%, 0.3)');
        gradient.addColorStop(1, 'hsl(252, 82%, 69%, 0.3)');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, Math.max(barWidth - 1, 1), barHeight);
    });

    // Draw progress line
    if (progress > 0) {
      const progressX = progress * width;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, canvasHeight);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration, isPlaying]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || duration === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickProgress = x / rect.width;
    const seekTime = clickProgress * duration;
    
    onSeek(seekTime);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        width={300}
        height={height}
        className="w-full cursor-pointer"
        onClick={handleClick}
        style={{ height: `${height}px` }}
      />
      
      {/* Animated pulse overlay when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse pointer-events-none" />
      )}
      
      {/* Fallback animated bars if no waveform data */}
      {waveformData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center space-x-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-primary/60 rounded-full waveform-bar`}
              style={{ 
                height: `${20 + Math.random() * 30}px`,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
