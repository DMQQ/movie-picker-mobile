import { MD2DarkTheme, Text } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

interface RatingIconsProps {
  vote: number;
  size: number;

  activeColor?: string;

  inactiveColor?: string;

  showText?: boolean;
}

export default function RatingIcons({ vote, size = 15, showText, activeColor = "#f9f871", inactiveColor = "#9E9E9E" }: RatingIconsProps) {
  return (
    <>
      {Array.from({ length: 10 }, (_, index) => {
        const rating = vote;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        if (index < fullStars) {
          return <MaterialIcons key={index} name="star" size={size} color={activeColor} />;
        } else if (index === fullStars && hasHalfStar) {
          return <MaterialIcons key={index} name="star-half" size={size} color={activeColor} />;
        } else {
          return <MaterialIcons key={index} name="star-border" size={size} color={inactiveColor} />;
        }
      })}

      {showText && (
        <Text style={{ color: "white", marginLeft: 5, fontSize: size * 0.8 }}>{vote === 10 ? "10/10" : vote.toFixed(1)}/10</Text>
      )}
    </>
  );
}
