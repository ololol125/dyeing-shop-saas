/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // 🟢 (owner) 폴더를 포함한 app 하위 모든 폴더 자동 스캔!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
