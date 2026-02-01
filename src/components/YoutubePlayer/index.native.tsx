import YoutubeIframe from "react-native-youtube-iframe";

export interface YoutubePlayerProps {
  videoId: string;
  width: number;
  height: number;
  play?: boolean;
  onReady?: () => void;
}

export default function YoutubePlayer({ videoId, width, height, play, onReady }: YoutubePlayerProps) {
  return <YoutubeIframe videoId={videoId} width={width} height={height} play={play} onReady={onReady} />;
}
