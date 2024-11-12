const { nextui } = require('@nextui-org/react');
const plugin = require('tailwindcss/plugin');

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}', './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'],

  theme: {
    extend: {
      colors: {
        content: 'hsl(var(--content) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        shadow: 'hsl(var(--shadow) / <alpha-value>)',
        primary: 'hsl(var(--primary) / <alpha-value>)',
        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        special: 'hsl(var(--special) / <alpha-value>)',
        asset: 'hsl(var(--asset) / <alpha-value>)',
        errorBg: 'hsl(var(--errorBg) / <alpha-value>)',
        errorTxt: 'hsl(var(--errorTxt) / <alpha-value>)',
        validBg: 'hsl(var(--validBg) / <alpha-value>)',
        validTxt: 'hsl(var(--validTxt) / <alpha-value>)',
        successBg: 'hsl(var(--successBg) / <alpha-value>)',
        successTxt: 'hsl(var(--successTxt) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        load: 'hsl(var(--load) / <alpha-value>)',
        logo: 'hsl(var(--logo))',
      },
    },
    screens: {
      md: '1024px',
      lg: '1440px',
      xl: '1865px',
      '2xl': '2560px',
    },
  },
  darkMode: 'class',
  plugins: [
    nextui(),
    plugin(function ({ addUtilities }) {
      const sizes = {
        h1: {
          md: { textSize: 1.3, lineHeight: 1.1 },
          lg: { textSize: 1.55, lineHeight: 1.2 },
          xl: { textSize: 1.68, lineHeight: 1.3 },
        },
        h2: {
          md: { textSize: 0.95, lineHeight: 1.1 },
          lg: { textSize: 1.17, lineHeight: 1.2 },
          xl: { textSize: 1.29, lineHeight: 1.3 },
        },
        h3: {
          md: { textSize: 0.835, lineHeight: 1.1 },
          lg: { textSize: 1.05, lineHeight: 1.2 },
          xl: { textSize: 1.25, lineHeight: 1.3 },
        },
        h4: {
          md: { textSize: 0.8225, lineHeight: 1.1 },
          lg: { textSize: 1.0, lineHeight: 1.2 },
          xl: { textSize: 1.05, lineHeight: 1.3 },
        },
        p1: {
          md: { textSize: 0.8125, lineHeight: 1.1 },
          lg: { textSize: 0.98, lineHeight: 1.2 },
          xl: { textSize: 1.15, lineHeight: 1.3 },
        },
        p2: {
          md: { textSize: 0.75, lineHeight: 1.1 },
          lg: { textSize: 0.925, lineHeight: 1.2 },
          xl: { textSize: 1.125, lineHeight: 1.3 },
        },
        p3: {
          md: { textSize: 0.7, lineHeight: 1.1 },
          lg: { textSize: 0.895, lineHeight: 1.2 },
          xl: { textSize: 1.025, lineHeight: 1.3 },
        },
        p4: {
          md: { textSize: 0.65, lineHeight: 1.1 },
          lg: { textSize: 0.8, lineHeight: 1.2 },
          xl: { textSize: 0.95, lineHeight: 1.3 },
        },
        p5: {
          md: { textSize: 0.6, lineHeight: 1.1 },
          lg: { textSize: 0.75, lineHeight: 1.2 },
          xl: { textSize: 0.9, lineHeight: 1.3 },
        },
        i1: {
          md: { textSize: 0.65, lineHeight: 1.1 },
          lg: { textSize: 0.75, lineHeight: 1.2 },
          xl: { textSize: 0.85, lineHeight: 1.3 },
        },
        i2: {
          md: { textSize: 0.6, lineHeight: 1.1 },
          lg: { textSize: 0.7, lineHeight: 1.2 },
          xl: { textSize: 0.8, lineHeight: 1.3 },
        },
        i3: {
          md: { textSize: 0.6, lineHeight: 1.1 },
          lg: { textSize: 0.7, lineHeight: 1.2 },
          xl: { textSize: 0.77, lineHeight: 1.3 },
        },
        i4: {
          md: { textSize: 0.6, lineHeight: 1.1 },
          lg: { textSize: 0.7, lineHeight: 1.2 },
          xl: { textSize: 0.6, lineHeight: 1 },
        },
      };

      const newUtilities = {};

      Object.keys(sizes).forEach(size => {
        newUtilities[`.text-${size}`] = {
          fontSize: `${sizes[size].md.textSize}rem`,
          lineHeight: `${sizes[size].md.lineHeight}`,
          '@screen lg': {
            fontSize: `${sizes[size].lg.textSize}rem`,
            lineHeight: `${sizes[size].lg.lineHeight}`,
          },
          '@screen xl': {
            fontSize: `${sizes[size].xl.textSize}rem`,
            lineHeight: `${sizes[size].xl.lineHeight}`,
          },
        };
      });

      addUtilities(newUtilities, ['responsive']);
    }),
  ],
};
export default config;
