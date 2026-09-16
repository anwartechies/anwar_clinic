/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        qht: {
          dark: "#162418",
          primary: "#1b392b",
          primaryHover: "#284c3b",
          green: "#2c402e",
          accent: "#b1fc85",
          vividGreen: "#00d084",
          lightBg: "#f8faf8",
          lightBgAlt: "#f1f5f2",
          cardBorder: "#e4eae4",
          textMuted: "#676767",
          textDark: "#111111",
          gold: "#ffb400",
        },
        nexgen: {
          mainDarkBg: "#032A3A",
          servicesSection: "#06384A",
          serviceInnerCard: "#244F60",
          veryDarkHeader: "#021E2B",
          primaryGold: "#D6A447",
          brightGold: "#EDB957",
          softGold: "#C99A43",
          navBg: "#FBF9F5",
          pageLightBg: "#F7F2E9",
          deepNavy: "#032A3A",
          midnightTealNavy: "#06384A",
          slateTeal: "#244F60",
          darkNavy: "#021E2B",
          luxuryGold: "#D6A447",
          champagneGold: "#EDB957",
          sandGold: "#C99A43",
          warmIvory: "#FBF9F5",
          cream: "#F7F2E9",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(0, 0, 0, 0.04)",
        cardHover: "0 16px 36px rgba(27, 57, 43, 0.12)",
        button: "0 4px 14px rgba(27, 57, 43, 0.2)",
      },
    },
  },
  plugins: [],
};
