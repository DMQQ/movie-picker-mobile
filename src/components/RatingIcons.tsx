import { MD2DarkTheme } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function RatingIcons({ vote, size = 15 }: { vote: number; size: number }) {
  return (
    <>
      {Array.from({ length: 10 }, (_, index) => {
        const rating = vote;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating - fullStars >= 0.5;

        if (index < fullStars) {
          return <MaterialIcons key={index} name="star" size={size} color={MD2DarkTheme.colors.primary} />;
        } else if (index === fullStars && hasHalfStar) {
          return <MaterialIcons key={index} name="star-half" size={size} color={MD2DarkTheme.colors.primary} />;
        } else {
          return <MaterialIcons key={index} name="star-border" size={size} color="#9E9E9E" />;
        }
      })}
    </>
  );
}
