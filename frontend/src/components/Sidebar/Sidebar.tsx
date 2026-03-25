import { Discography } from "./Discography";
import { TrackList } from "./TrackList";

interface SidebarProps {
  isVisible: boolean;
}

export function Sidebar({ isVisible }: SidebarProps) {
  if (!isVisible) return null;

  return (
    <div className="flex w-full min-h-0 min-w-0 flex-col gap-6 lg:w-[35%] lg:shrink-0">
      <TrackList />
      <Discography />
    </div>
  );
}
