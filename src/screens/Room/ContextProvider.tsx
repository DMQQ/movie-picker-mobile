import { createContext, useContext, useState } from "react";
import useTranslation from "../../service/useTranslation";
import { getMovieCategories } from "../../utils/roomsConfig";

export const useCreateRoom = () => useContext(CreateRoomContext);

const CreateRoomContext = createContext<{
  category: string;
  setCategory: (category: string) => void;

  pageRange: string;
  setPageRange: (pageRange: string) => void;

  genre: {
    id: number;
    name: string;
  }[];

  setGenre: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        name: string;
      }[]
    >
  >;

  onJoinOwnRoom: () => void;

  providers: number[];

  setProviders: React.Dispatch<React.SetStateAction<number[]>>;

  maxRounds: number;
  setMaxRounds: (maxRounds: number) => void;
}>({
  category: "",
  setCategory: () => {},
  pageRange: "1",
  setPageRange: () => {},
  genre: [],
  setGenre: ((genre: { id: number; name: string }) => {}) as any,
  onJoinOwnRoom: () => {},

  providers: [],

  setProviders: () => {},

  maxRounds: 10,
  setMaxRounds: () => {},
});

export default function ContextProvider({ children, navigation }: { children: React.ReactNode; navigation: any }) {
  const t = useTranslation();
  const [category, setCategory] = useState(getMovieCategories(t)[0].path);
  const [pageRange, setPageRange] = useState("1");
  const [genre, setGenre] = useState<
    {
      id: number;
      name: string;
    }[]
  >([]);

  const [providers, setProviders] = useState<number[]>([]);
  const [maxRounds, setMaxRounds] = useState(10);

  return (
    <CreateRoomContext.Provider
      value={{
        category,
        setCategory,
        pageRange,
        setPageRange,
        genre,
        setGenre,
        onJoinOwnRoom: () => {},

        providers,

        setProviders,

        maxRounds,
        setMaxRounds,
      }}
    >
      {children}
    </CreateRoomContext.Provider>
  );
}
