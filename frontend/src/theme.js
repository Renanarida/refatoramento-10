// src/theme.js
import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    config: {
      initialColorMode: "light",
      useSystemColorMode: false,
    },
    tokens: {
      colors: {
        brand: {
          50:  { value: "#ffffff" },
          100: { value: "#f7f7f7" },
          200: { value: "#ededed" },
          300: { value: "#e2e2e2" },
          400: { value: "#cccccc" },
          500: { value: "#999999" },
          600: { value: "#666666" },
          700: { value: "#333333" },
          800: { value: "#222222" },
          900: { value: "#111111" },
        },
      },
    },
    globalCss: {
      body: {
        backgroundColor: "white",
        color: "gray.800",
      },
    },
    recipes: {
      Button: {
        base: {
          colorPalette: "gray",
        },
      },
    },
  },
});
