import { useState } from 'react';
import { ImageUpload } from '@/components/ImageUpload';
import { ImageCard } from '@/components/ImageCard';
import { Sparkles } from 'lucide-react';

interface AnalyzedImage {
  id: string;
  imageData: string;
  caption: string;
  tags: string[];
}

const Index = () => {
  const [images, setImages] = useState<AnalyzedImage[]>([]);

  const handleImageAnalyzed = (result: { imageData: string; caption: string; tags: string[] }) => {
    const newImage: AnalyzedImage = {
      id: Date.now().toString(),
      ...result,
    };
    setImages((prev) => [newImage, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Visual Caption & Tag Studio
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Upload images and let AI generate perfect captions and tags instantly
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto mb-12">
          <ImageUpload onImageAnalyzed={handleImageAnalyzed} />
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>Analyzed Images</span>
              <span className="text-sm font-normal text-muted-foreground">({images.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <ImageCard
                  key={image.id}
                  imageData={image.imageData}
                  caption={image.caption}
                  tags={image.tags}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No images yet</h3>
            <p className="text-muted-foreground">
              Upload your first image to see AI-generated captions and tags
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Powered by Lovable AI • Free during beta
        </div>
      </footer>
    </div>
  );
};

export default Index;