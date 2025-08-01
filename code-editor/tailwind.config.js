module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // React 컴포넌트 경로에 맞게 조정
  ],
  theme: {
    extend: {
      colors: {
        // 배경색
        'background': '#f9f8f6',

        // 포인트색
        'point': '#d57239',
        'point-hover': '#e5793a',

        // 텍스트색
        'text-main': '#333333',
        'text-sub': '#666666',

        // UI 요소
        'ui-white': '#ffffff',
        'ui-hover': '#f2f2f2',
        'ui-border': '#e5793a', // 경계선

        // 모달 전용
        'modal-input-border': '#cab8ae',
        'modal-placeholder': '#cab8ae',
      },
    },
  },
  plugins: [],
}