import { useEffect, useState } from "react";
import { url } from "./SocketContext";

export default function useFetch(path: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refetch();
  }, []);

  const refetch = async () => {
    try {
      setLoading(true);
      const response = await fetch(url + path, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setError(response.statusText);
      }

      const data = await response.json();
      setData(data);
    } catch (error) {
      setError(error as any);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}
