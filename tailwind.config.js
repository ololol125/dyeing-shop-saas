/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // 👈 이 부분이 들어있으면 (auth)도 자동으로 포함되어야 합니다.
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
