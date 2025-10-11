import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ImageCardProps {
  imageData: string;
  caption: string;
  tags: string[];
}

export const ImageCard = ({ imageData, caption, tags }: ImageCardProps) => {
  return (
    <Card className="group overflow-hidden bg-gradient-to-br from-card to-card/80 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
      <div className="aspect-video overflow-hidden relative">
        <img
          src={imageData}
          alt={caption}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5 space-y-3">
        <p className="text-foreground font-medium line-clamp-2 min-h-[3rem]">
          {caption}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-secondary/50 hover:bg-primary/20 border border-border/30 transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </Card>
  );
};