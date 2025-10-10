// src/components/ui/toaster.jsx
import { createToaster } from "@chakra-ui/react";

// customize se quiser: placement, max, overlap, etc.
export const toaster = createToaster({
  placement: "top-right",
  duration: 3000,
  pauseOnHover: true,
  // max: 3,
  // overlap: false,
  // pauseOnPageIdle: true,
});

export function ToasterProvider() {
  // o provider visual que renderiza os toasts
  return toaster.toaster;
}
