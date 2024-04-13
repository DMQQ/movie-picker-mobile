import { createContext, useContext, useState } from "react";

const stages = [
  "ChooseCategory",
  "ChooseGenre",
  "ChoosePage",
  "QRCode",
] as const;

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

  stage: string;
}>({
  category: "",
  setCategory: () => {},
  pageRange: "1",
  setPageRange: () => {},
  genre: [],
  setGenre: ((genre: { id: number; name: string }) => {}) as any,
  onJoinOwnRoom: () => {},

  stage: "category",
});

export default function ContextProvider({
  children,
  navigation,
}: {
  children: React.ReactNode;
  navigation: any;
}) {
  const [category, setCategory] = useState("");
  const [pageRange, setPageRange] = useState("1");
  const [genre, setGenre] = useState<
    {
      id: number;
      name: string;
    }[]
  >([]);
  const [stage, setStage] = useState(stages[0]);

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
        stage,
      }}
    >
      {children}
    </CreateRoomContext.Provider>
  );
}
