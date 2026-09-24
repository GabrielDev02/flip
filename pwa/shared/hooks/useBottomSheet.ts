"use client";

import { useDragControls, type PanInfo } from "motion/react";
import { useModalDismiss } from "@/pwa/shared/hooks/useModalDismiss";

/**
 * Behavior shared by the bottom-sheet modals: everything useModalDismiss does,
 * plus closing when the handle is dragged down far or fast enough.
 */
export function useBottomSheet(onClose: () => void) {
  const dragControls = useDragControls();

  useModalDismiss(onClose);

  function handleDragEnd(_event: PointerEvent, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 500) onClose();
  }

  return { dragControls, handleDragEnd };
}
