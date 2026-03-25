const PRIMARY_COLOR = "#c084fc";

interface EqualizerProps {
  isPlaying: boolean;
}

export function Equalizer({ isPlaying }: EqualizerProps) {
  const bars = [14, 20, 16, 22];

  return (
    <div className="flex items-end gap-1">
      {bars.map((height, index) => (
        <div
          key={index}
          className="w-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor: PRIMARY_COLOR,
            height: isPlaying ? `${height}px` : "4px",
            animation: isPlaying
              ? `equalizer 0.5s ease-in-out ${index * 0.1}s infinite alternate`
              : "none",
          }}
        />
      ))}
    </div>
  );
}
