import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light", // 👈 muda para light
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#ffffff",
      100: "#f7f7f7",
      200: "#ededed",
      300: "#e2e2e2",
      400: "#cccccc",
      500: "#999999",
      600: "#666666",
      700: "#333333",
      800: "#222222",
      900: "#111111",
    },
  },
  styles: {
    global: {
      body: {
        bg: "white", // 👈 fundo geral branco
        color: "gray.800", // texto escuro
      },
    },
  },
  components: {
    Button: {
      defaultProps: { colorScheme: "gray" }, // botões em cinza neutro
    },
  },
});

export default theme;