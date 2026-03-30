import type { AppTab } from "../layout/AppNav";
import { Discography } from "./Discography";
import { SidebarPlaylists } from "./SidebarPlaylists";
import { TrackList } from "./TrackList";

interface SidebarProps {
  isVisible: boolean;
  onNavigateTab?: (tab: AppTab) => void;
}

export function Sidebar({ isVisible, onNavigateTab }: SidebarProps) {
  if (!isVisible) return null;

  return (
    <div className="flex w-full min-h-0 min-w-0 flex-col gap-6">
      <SidebarPlaylists onNavigateTab={onNavigateTab} />
      <TrackList />
      <Discography />
    </div>
  );
}
