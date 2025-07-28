import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  colors: {
    brand: {
      100: "#f9f8f6", // 배경
      300: "#e6d9cd", // 인풋 기본 border
      500: "#d57239", // 포인트색
    },
    text: {
      primary: "#000000",  // 일반 텍스트
      secondary: "#d7d4d2", // 부연설명
      tertiary : "#808080", //찐한 회색
      placeholder: "#b3b0aeff",
    },
  },
  components: {
    Modal: {
      baseStyle: {
        dialog: {
          bg: "brand.100",
          color: "text.primary",
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: "brand.300",
            _hover: {
              borderColor: "brand.500",
            },
            _focus: {
              borderColor: "brand.500",
              boxShadow: "0 0 0 1px #d57239", 
            },
            color: "text.primary", 
            _placeholder: {        
              color: "text.placeholder",
                       
            },
          },
        },
      },
    },
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "#c6652f",
          },
        },
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          borderColor: "brand.300",
          _checked: {
            bg: "brand.500",
            borderColor: "brand.500",
          },
        },
      },
    },
  },
});

export default theme;
