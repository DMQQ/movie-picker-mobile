import Svg, { Path } from "react-native-svg";

export default function ThumbsUp({ width = 24, height = 24, color = "#fff" }: { width?: number; height?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={width} height={height} fill="none" role="img">
      <Path
        fill={color}
        fillRule="evenodd"
        d="m17.31 2.5.1.76a6 6 0 0 1 0 1.48L17.12 7h4.38a1.5 1.5 0 0 1 .83 2.75h.17a1.5 1.5 0 0 1 .29 2.97A1.5 1.5 0 0 1 22 15.5h-.38q.37.42.38 1c0 .83-.67 1.5-1.5 1.5h-2.58a3.5 3.5 0 0 0-.93-3.21l.01-.29a3.5 3.5 0 0 0-3.5-3.5h-2.1a8 8 0 0 0 0-2l-.1-.74-1.24.15 1.24-.15-.04-.27a2 2 0 0 0 .65-.64l1.94-3.1A1 1 0 0 0 14 3.7V.48c0-.27.21-.48.48-.48a2.86 2.86 0 0 1 2.83 2.5m-8 6 .1.76a6 6 0 0 1 0 1.48L9.12 13h4.38a1.5 1.5 0 0 1 .83 2.75h.17a1.5 1.5 0 0 1 .29 2.97A1.5 1.5 0 0 1 14 21.5h-.38q.37.42.38 1c0 .83-.67 1.5-1.5 1.5H8.02a7.6 7.6 0 0 1-3.77-1l-.17-.1a7 7 0 0 0-3.4-.9.7.7 0 0 1-.68-.68v-5.57a1 1 0 0 1 .73-.96l2.03-.58a2 2 0 0 0 1.15-.86l1.94-3.1A1 1 0 0 0 6 9.7V6.48c0-.27.21-.48.48-.48A2.86 2.86 0 0 1 9.3 8.5"
        clipRule="evenodd"
      ></Path>
    </Svg>
  );
}
