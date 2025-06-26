import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatFileSize } from "@/lib/audio-utils";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
}

export default function FileUpload({ onFilesSelected, selectedFiles, onRemoveFile }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const mp3Files = acceptedFiles.filter(file => 
      file.type === 'audio/mpeg' || file.name.toLowerCase().endsWith('.mp3')
    );
    
    if (mp3Files.length !== acceptedFiles.length) {
      // Some files were filtered out
      console.warn('Only MP3 files are allowed');
    }
    
    const allFiles = [...selectedFiles, ...mp3Files];
    onFilesSelected(allFiles);
    setIsDragActive(false);
  }, [selectedFiles, onFilesSelected]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
    },
    noClick: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  return (
    <div className="w-full">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-primary bg-primary/10 scale-105'
            : 'border-primary/50 bg-dark-blue/30'
        } backdrop-blur-sm hover:border-primary`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">Drop MP3 files here</p>
        <p className="text-gray-400 text-sm mb-4">or click to browse</p>
        <Button
          onClick={open}
          className="bg-primary hover:bg-primary/80 text-white px-6 py-2 font-medium"
        >
          Choose Files
        </Button>
      </Card>

      {selectedFiles.length > 0 && (
        <Card className="mt-6 bg-dark-blue/50 border-gray-700">
          <div className="p-4">
            <h3 className="font-medium mb-3">Selected Files ({selectedFiles.length}):</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Music className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-48">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFile(index)}
                    className="p-1 hover:bg-gray-700 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
