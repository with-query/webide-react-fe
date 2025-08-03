import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // 'global' 변수를 window 객체로 정의하여 브라우저 환경에서 참조할 수 있도록 합니다.
    global: 'window', 
  },

  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
})
