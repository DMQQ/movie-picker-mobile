import { createContext, useContext } from "react";
import { LayoutRectangle } from "react-native";

export interface TourStepRenderProps {
  current: number;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  stop: () => void;
}

export interface TourStep {
  render: (props: TourStepRenderProps) => React.ReactElement;
  placement?: "top" | "bottom";
  spotRadius?: number;
  before?: () => Promise<void> | void;
}

export interface TourRef {
  start: () => void;
  stop: () => void;
}

export interface TourContextValue {
  current: number | undefined;
  spot: LayoutRectangle;
  steps: TourStep[];
  next: () => void;
  stop: () => void;
}

export interface TourStableContextValue {
  registerMeasurer: (index: number, fn: () => Promise<LayoutRectangle>) => void;
}

export const TourContext = createContext<TourContextValue>({
  current: undefined,
  spot: { x: 0, y: 0, width: 0, height: 0 },
  steps: [],
  next: () => {},
  stop: () => {},
});

export const TourStableContext = createContext<TourStableContextValue>({
  registerMeasurer: () => {},
});

export function useTourContext() {
  return useContext(TourContext);
}

export function useTourStableContext() {
  return useContext(TourStableContext);
}
