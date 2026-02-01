import { useEffect, useState } from "react";
import { View } from "react-native";

export interface YoutubePlayerProps {
  videoId: string;
  width: number;
  height: number;
  play?: boolean;
  onReady?: () => void;
}

export default function YoutubePlayer({ videoId, width, height, play, onReady }: YoutubePlayerProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded && onReady) {
      onReady();
    }
  }, [loaded, onReady]);

  return (
    <View style={{ width, height }}>
      <iframe
        width={width}
        height={height}
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${play ? 1 : 0}&enablejsapi=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        style={{ border: "none", borderRadius: 12 }}
      />
    </View>
  );
}
