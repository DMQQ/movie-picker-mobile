import { loadAsync } from "expo-font";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";

export default function useInit() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          setIsUpdating(true);
          await Updates.fetchUpdateAsync();

          await Updates.reloadAsync({
            reloadScreenOptions: {
              backgroundColor: "#000",
              fade: true,
              image: require("../../assets/images/icon-light.png"),
            },
          });
        }
      } catch (error) {
        setIsUpdating(false);
      }
    };

    Promise.allSettled([
      loadAsync({
        Bebas: require("../../assets/fonts/BebasNeue-Regular.ttf"),
      }),
      Promise.race([initializeApp(), new Promise((res) => setTimeout(res, 7500))]),
    ]).finally(() => {
      setIsLoaded(true);
      setIsUpdating(false);
    });
  }, []);

  return { isLoaded, isUpdating };
}
