import { createContext, useContext, useState } from "react";

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
});

export default function ContextProvider({ children, navigation }: { children: React.ReactNode; navigation: any }) {
  const [category, setCategory] = useState("");
  const [pageRange, setPageRange] = useState("1");
  const [genre, setGenre] = useState<
    {
      id: number;
      name: string;
    }[]
  >([]);

  const [providers, setProviders] = useState<number[]>([]);

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
      }}
    >
      {children}
    </CreateRoomContext.Provider>
  );
}
