import { useCallback, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageAnalyzed: (result: { imageData: string; caption: string; tags: string[] }) => void;
}

export const ImageUpload = ({ onImageAnalyzed }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        // Call the edge function to analyze the image
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageData }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to analyze image');
        }

        const result = await response.json();
        onImageAnalyzed({
          imageData,
          caption: result.caption,
          tags: result.tags,
        });

        toast({
          title: 'Image analyzed!',
          description: 'Caption and tags generated successfully',
        });
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Failed to analyze image',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [onImageAnalyzed, toast]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFile(file);
      }
    };
    input.click();
  }, [handleFile]);

  return (
    <div
      onClick={isAnalyzing ? undefined : handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative overflow-hidden
        border-2 border-dashed rounded-xl
        transition-all duration-300
        cursor-pointer
        min-h-[300px] flex items-center justify-center
        ${
          isDragging
            ? 'border-primary bg-primary/10 scale-105'
            : 'border-border hover:border-primary/50 hover:bg-card/50'
        }
        ${isAnalyzing ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <div className="text-center p-8">
        {isAnalyzing ? (
          <>
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Image...</h3>
            <p className="text-muted-foreground">AI is generating captions and tags</p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <Upload className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload an Image</h3>
            <p className="text-muted-foreground mb-1">Drag and drop or click to browse</p>
            <p className="text-sm text-muted-foreground">AI will generate captions and tags automatically</p>
          </>
        )}
      </div>
    </div>
  );
};