import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, View } from "react-native";

type AddNode = (node: ReactNode) => () => void;

const PortalContext = createContext<AddNode>(() => () => {});

export function PortalProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<Record<string, ReactNode>>({});
  const nextId = useRef(0);

  const addNode = useCallback((node: ReactNode) => {
    const id = String(nextId.current++);
    setNodes((prev) => ({ ...prev, [id]: node }));
    return () => {
      setNodes((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };
  }, []);

  return (
    <PortalContext.Provider value={addNode}>
      {children}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {Object.values(nodes)}
      </View>
    </PortalContext.Provider>
  );
}

export default function Portal({ children }: { children: ReactNode }) {
  const addNode = useContext(PortalContext);
  useEffect(() => addNode(children), [children, addNode]);
  return null;
}
