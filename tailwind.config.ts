/** @type {import('tailwindcss').Config} */
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fairway: { 50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d" },
        turf: { 50:"#f7fee7",100:"#ecfccb",200:"#d9f99d",300:"#bef264",400:"#a3e635",500:"#84cc16",600:"#65a30d",700:"#4d7c0f",800:"#3f6212",900:"#365314" },
        ink: { 900:"#0b1220",700:"#1e293b",500:"#475569",300:"#94a3b8",100:"#f1f5f9" },
      },
      fontFamily: { sans: ["ui-sans-serif","system-ui","-apple-system","Segoe UI","Roboto","Helvetica Neue","Arial"] },
      boxShadow: { card: "0 1px 2px rgba(11,18,32,.06), 0 8px 24px rgba(11,18,32,.08)" },
    },
  },
  plugins: [],
};
export default config;
