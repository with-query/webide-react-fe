import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { ReactNode } from 'react';

// Chakra UI 테마 설정 - 기존 디자인과 일치하도록 커스터마이징
const theme = extendTheme({
  colors: {
    brand: {
      50: '#fff5f0',
      100: '#ffe5d1',
      200: '#ffc599',
      300: '#ff9f61',
      400: '#ff7a29',
      500: '#f56500', // 메인 오렌지 색상
      600: '#d45200',
      700: '#b33e00',
      800: '#912b00',
      900: '#701800',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #ff7a29, #ff9f61, #e91e63)',
      secondary: 'linear-gradient(135deg, #667eea, #764ba2)',
      warm: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
    }
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 'full',
        fontWeight: 'semibold',
        transition: 'all 0.3s ease',
        _hover: {
          transform: 'scale(1.05)',
        },
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        gradient: {
          bgGradient: 'linear(to-r, brand.400, pink.400)',
          color: 'white',
          _hover: {
            bgGradient: 'linear(to-r, brand.500, pink.500)',
          },
        },
      },
    },
    Input: {
      variants: {
        filled: {
          field: {
            borderRadius: 'full',
            bg: 'white',
            border: '2px solid',
            borderColor: 'gray.200',
            _focus: {
              borderColor: 'brand.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '2xl',
          bg: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        minHeight: '100vh',
      },
    },
  },
});

interface ChatProviderProps {
  children: ReactNode;
}

export default function ChatProvider({ children }: ChatProviderProps) {
  return (
    <ChakraProvider theme={theme}>
      {children}
    </ChakraProvider>
  );
}