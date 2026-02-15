import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef } from "react";

export default function useIsMounted() {
  const isFocused = useIsFocused();
  const wasMounted = useRef(false);

  useEffect(() => {
    if (isFocused) {
      wasMounted.current = true;
    }
  }, [isFocused]);

  return isFocused || wasMounted.current;
}
