import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // これでsrc以下の全ファイルを監視
  ],
  theme: {
    extend: {
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' }, // 50%移動させてループさせる
        },
      },
      animation: {
        // '60s' は速度です。遅くしたい場合は数字を大きくしてください。
        'marquee': 'marquee 60s linear infinite', 
        'marquee-reverse': 'marquee 60s linear infinite reverse', // reverse で逆向きにする
      },
    },
  },
  plugins: [],
};
export default config;