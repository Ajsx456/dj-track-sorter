import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import FileUpload from "@/components/file-upload";
import LoadingScreen from "@/components/loading-screen";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/sessions");
      return response.json();
    },
  });

  const uploadTracksMutation = useMutation({
    mutationFn: async ({ sessionId, files }: { sessionId: string; files: File[] }) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('tracks', file);
      });
      
      const response = await fetch(`/api/sessions/${sessionId}/tracks`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload tracks');
      }
      
      return response.json();
    },
  });

  const handleStartSorting = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select some MP3 files to sort.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create session
      const sessionResult = await createSessionMutation.mutateAsync();
      const sessionId = sessionResult.session.sessionId;
      
      // Upload tracks
      await uploadTracksMutation.mutateAsync({
        sessionId,
        files: selectedFiles,
      });
      
      // Navigate to sorting interface
      setLocation(`/sorting/${sessionId}`);
    } catch (error) {
      console.error("Error starting sorting:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload tracks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (isUploading) {
    return <LoadingScreen message="Uploading your tracks..." />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <Music className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            DJ Track Sorter
          </h1>
          <p className="text-gray-300 text-lg">Sort your music collection with style</p>
        </div>
        
        <FileUpload
          onFilesSelected={handleFilesSelected}
          selectedFiles={selectedFiles}
          onRemoveFile={handleRemoveFile}
        />
        
        {selectedFiles.length > 0 && (
          <div className="mt-6">
            <Button
              onClick={handleStartSorting}
              disabled={createSessionMutation.isPending || uploadTracksMutation.isPending}
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all transform hover:scale-105"
            >
              {createSessionMutation.isPending || uploadTracksMutation.isPending 
                ? "Starting..." 
                : "Start Sorting"
              }
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
