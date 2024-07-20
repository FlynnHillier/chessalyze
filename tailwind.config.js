import * as containerQueries from "@tailwindcss/container-queries";
import * as scrollbarHide from "tailwind-scrollbar-hide";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  plugins: [containerQueries, scrollbarHide],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
      },
      spacing: {
        0.25: "1px",
        88: "22rem",
        104: "26rem",
        106: "27rem",
        108: "28rem",
        112: "29rem",
        116: "30rem",
        120: "31rem",
        124: "32rem",
        128: "33rem",
        132: "34rem",
        136: "35rem",
        140: "36rem",
        224: "58rem",
        256: "66rem",
        280: "72rem",
      },
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
