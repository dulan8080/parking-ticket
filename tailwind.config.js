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
        primary: "#1e3a8a",    // Blue-900
        "primary-foreground": "#f8fafc",  // Slate-50
        secondary: "#f1f5f9",  // Slate-100
        "secondary-foreground": "#1e293b", // Slate-800
        muted: "#f1f5f9",      // Slate-100
        "muted-foreground": "#64748b", // Slate-500
        accent: "#f1f5f9",     // Slate-100
        "accent-foreground": "#1e293b", // Slate-800
        background: "#ffffff",
        foreground: "#0f172a",  // Slate-900
        border: "#e2e8f0",      // Slate-200
        input: "#e2e8f0",       // Slate-200
        ring: "#1e293b",        // Slate-800
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
}; 