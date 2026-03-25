import { useState } from "react";
import { Music2 } from "lucide-react";
import { useMusicStore } from "../../store/useMusicStore";
import { GlassCard } from "../UI/GlassCard";
import { TrackItem } from "./TrackItem";

export function TrackList() {
  const queue = useMusicStore((state) => state.queue);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  return (
    <GlassCard className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 border-b border-white/10 p-4 text-sm font-medium opacity-80">
        <Music2 size={16} /> Up Next
      </div>
      <div className="min-h-0 max-h-[min(22rem,42vh)] flex-1 space-y-2 overflow-y-auto overflow-x-hidden p-2">
        {queue.map((track) => (
          <TrackItem
            key={track.id}
            trackId={track.id}
            isSelected={selectedTrackId === track.id}
            onSelect={setSelectedTrackId}
          />
        ))}
      </div>
    </GlassCard>
  );
}
