import { useRef } from "react";

type EventMap = Record<string, any>;
type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}

export class EventEmitter<T extends EventMap> implements Emitter<T> {
  private listeners: {
    [K in keyof EventMap]?: Array<(p: EventMap[K]) => void>;
  } = {};

  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    this.listeners[eventName] = (this.listeners[eventName] || []).concat(fn);
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void {
    this.listeners[eventName] = (this.listeners[eventName] || []).filter((f) => f !== fn);
  }

  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void {
    (this.listeners[eventName] || []).forEach((fn) => fn(params));
  }
}

export const useEventEmitter = <T extends EventMap>() => {
  return useRef(new EventEmitter<T>()).current;
};

type AppEvents = {
  userLogin: { userId: string; email: string };
  userLogout: { userId: string };
  dataUpdate: { id: string; data: any };
  notification: { message: string; type: "success" | "error" | "info" };
};

export const appEventEmitter = new EventEmitter<AppEvents>();
