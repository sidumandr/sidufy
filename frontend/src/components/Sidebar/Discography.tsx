import { Clock } from "lucide-react";
import { GlassCard } from "../UI/GlassCard";

interface DiscographyAlbum {
  id: string;
  title: string;
  year: number;
  cover: string;
  trackCount: number;
}

const DISCOGRAPHY: DiscographyAlbum[] = [
  {
    id: "a1",
    title: "Rainy Nights",
    year: 2024,
    cover: "https://picsum.photos/400/400?sig=10",
    trackCount: 12,
  },
  {
    id: "a2",
    title: "Morning Haze",
    year: 2023,
    cover: "https://picsum.photos/400/400?sig=11",
    trackCount: 10,
  },
];

export function Discography() {
  return (
    <GlassCard className="p-4">
      <div className="mb-4 flex items-center gap-2 text-sm font-medium opacity-80">
        <Clock size={16} /> Discography
      </div>
      <div className="grid grid-cols-2 gap-3">
        {DISCOGRAPHY.map((album) => (
          <div key={album.id} className="group cursor-pointer">
            <div className="mb-2 aspect-square overflow-hidden rounded-xl">
              <img
                src={album.cover}
                alt={album.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-white/90">
              {album.title}
            </p>
            <p className="text-[10px] text-white/40">
              {album.year} • {album.trackCount} Tracks
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
