import { IconButton, MD2DarkTheme } from "react-native-paper";
import { useDispatch } from "react-redux";
import { Movie } from "../../types";
import { removeFavorite, saveFavorite } from "../redux/favourites/favourites";
import { useAppSelector } from "../redux/store";

export default function Favourite({ movie }: { movie: Movie }) {
  const dispatch = useDispatch<any>();

  const favourites = useAppSelector((state) => state.favourite);

  const isFavorite = favourites?.movies.some((m: Movie) => m.id === movie.id);

  return (
    <IconButton
      icon={isFavorite ? "heart" : "heart-outline"}
      iconColor={isFavorite ? "red" : "white"}
      size={30}
      onPress={() => (isFavorite ? dispatch(removeFavorite(movie.id)) : dispatch(saveFavorite(movie)))}
    />
  );
}
