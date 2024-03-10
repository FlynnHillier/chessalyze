import type { Config } from "tailwindcss";
import * as containerQueries from "@tailwindcss/container-queries";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {},
  plugins: [containerQueries],
};
export default config;
