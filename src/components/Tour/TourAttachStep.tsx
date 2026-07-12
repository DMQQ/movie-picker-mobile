import { ReactElement, useCallback, useEffect, useRef } from "react";
import { LayoutRectangle, StyleProp, View, ViewStyle } from "react-native";
import { useTourStableContext } from "./TourContext";

interface Props {
  index: number;
  children: ReactElement;
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function TourAttachStep({ index, children, fill = false, style }: Props) {
  const { registerMeasurer } = useTourStableContext();
  const ref = useRef<View>(null);

  const measure = useCallback((): Promise<LayoutRectangle> => {
    return new Promise(resolve => {
      ref.current?.measureInWindow((x, y, width, height) => {
        resolve({ x, y, width, height });
      });
    });
  }, []);

  useEffect(() => {
    registerMeasurer(index, measure);
  }, [index, measure, registerMeasurer]);

  return (
    <View
      ref={ref}
      style={[{ alignSelf: fill ? "stretch" : "flex-start" }, style]}
      collapsable={false}
    >
      {children}
    </View>
  );
}
