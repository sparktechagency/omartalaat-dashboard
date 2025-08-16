/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#057199",
        secondary: "#69CDFF",
        baseBg: "#fff",
      },
    },
  },
  plugins: [],
};

// CA3939 + DE5555