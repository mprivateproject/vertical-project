import type { Config } from "tailwindcss"

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "hsl(var(--background))",
        fg: "hsl(var(--foreground))",

        primary: "hsl(var(--primary))",
        "primary-fg": "hsl(var(--primary-foreground))",

        secondary: "hsl(var(--secondary))",
        "secondary-fg": "hsl(var(--secondary-foreground))",

        accent: "hsl(var(--accent))",
        "accent-fg": "hsl(var(--accent-foreground))",

        muted: "hsl(var(--muted))",
        "muted-fg": "hsl(var(--muted-foreground))",

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        card: "hsl(var(--card))",
      },
      borderRadius: {
        xl: "var(--radius)",
      },
      fontFamily: {
        body: "var(--font-body)",
        heading: "var(--font-heading)",
        thai: "var(--font-thai)",
      },
      transitionTimingFunction: {
        apple: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config
