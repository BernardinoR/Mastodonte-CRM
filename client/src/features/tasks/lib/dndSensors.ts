import { PointerSensor } from "@dnd-kit/core";
import type { PointerEvent as ReactPointerEvent } from "react";

function isInteractiveElement(element: Element | null): boolean {
  if (!element) return false;

  const interactiveElements = ["button", "input", "textarea", "select", "option", "a"];
  if (interactiveElements.includes(element.tagName.toLowerCase())) {
    return true;
  }

  if (element.getAttribute("role") === "button" || element.getAttribute("role") === "checkbox") {
    return true;
  }

  return false;
}

function shouldHandleEvent(element: HTMLElement | null): boolean {
  let cur = element;
  while (cur) {
    if (cur.dataset && cur.dataset.noDnd) {
      return false;
    }
    cur = cur.parentElement;
  }
  return true;
}

export class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent: event }: ReactPointerEvent) => {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          isInteractiveElement(event.target as Element)
        ) {
          return false;
        }
        return shouldHandleEvent(event.target as HTMLElement);
      },
    },
  ];
}
