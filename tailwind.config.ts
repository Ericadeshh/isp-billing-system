import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1a2b4c",
          light: "#2c3e6e",
          dark: "#0f1a2e",
        },
        pumpkin: {
          DEFAULT: "#ff6400",
          light: "#ff8533",
        },
        salad: {
          DEFAULT: "#8cc850",
        },
        bottle: {
          DEFAULT: "#003223",
          light: "#1a4d3a",
        },
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(to right, #1a2b4c, #003223)",
        "gradient-cta": "linear-gradient(to right, #ff6400, #ff8533)",
      },
    },
  },
  plugins: [],
};

export default config;
