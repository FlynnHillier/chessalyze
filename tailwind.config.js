import * as containerQueries from "@tailwindcss/container-queries";
import * as scrollbarHide from "tailwind-scrollbar-hide";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [containerQueries, scrollbarHide],
  theme: {
    extend: {
      keyframes: {
        fade: {
          "0%": { opacity: "0" },
          "1%": { opacity: "1" },
        },
        verticalWobble: {
          "0%": { transform: "translateY(0)" },
          "25%": { transform: "translateY(20%)" },
          "50%": { transform: "translateY(0)" },
          "75%": { transform: "translateY(-20%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        fade: "fade 2s linear infinite",
        "vertical-wobble": "verticalWobble 0.75s linear infinite",
      },
    },
  },
};
export default config;
