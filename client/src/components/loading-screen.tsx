import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
}

export default function LoadingScreen({ 
  message = "Processing tracks...",
  showProgress = true 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Analyzing audio files",
    "Generating waveforms", 
    "Extracting metadata",
    "Preparing interface"
  ];

  useEffect(() => {
    if (!showProgress) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [showProgress]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 1500);

    return () => clearInterval(stepInterval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6">
      <div className="text-center max-w-md mx-auto">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <Music className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary" />
        </div>

        {/* Message */}
        <h2 className="text-2xl font-semibold mb-2">{message}</h2>
        <p className="text-gray-400 mb-6">{steps[currentStep]}</p>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-64 mx-auto mb-4">
            <Progress 
              value={progress} 
              className="h-2 bg-gray-700"
            />
            <p className="text-sm text-gray-500 mt-2">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}

        {/* Pulsing dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
