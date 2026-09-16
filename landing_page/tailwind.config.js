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
          dark: "var(--qht-dark)",
          primary: "var(--qht-primary)",
          primaryHover: "var(--qht-primary-hover)",
          green: "var(--qht-primary-hover)",
          accent: "var(--qht-accent)",
          vividGreen: "var(--qht-vivid-green)",
          lightBg: "var(--qht-light-bg)",
          lightBgAlt: "var(--qht-light-bg-alt)",
          cardBorder: "#e4eae4",
          textMuted: "#676767",
          textDark: "var(--qht-dark)",
          gold: "var(--qht-accent)",
        },
        nexgen: {
          mainDarkBg: "var(--nexgen-main-dark-bg)",
          servicesSection: "var(--nexgen-services-section)",
          serviceInnerCard: "var(--nexgen-service-inner-card)",
          veryDarkHeader: "var(--nexgen-very-dark-header)",
          primaryGold: "var(--nexgen-primary-gold)",
          brightGold: "var(--nexgen-bright-gold-cta)",
          softGold: "var(--nexgen-soft-gold)",
          navBg: "var(--nexgen-nav-bg)",
          pageLightBg: "var(--nexgen-page-light-bg)",
          deepNavy: "var(--color-deep-navy)",
          midnightTealNavy: "var(--color-midnight-teal-navy)",
          slateTeal: "var(--color-slate-teal)",
          darkNavy: "var(--color-dark-navy)",
          luxuryGold: "var(--color-luxury-gold)",
          champagneGold: "var(--color-champagne-gold)",
          sandGold: "var(--color-sand-gold)",
          warmIvory: "var(--color-warm-ivory)",
          cream: "var(--color-cream)",
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
