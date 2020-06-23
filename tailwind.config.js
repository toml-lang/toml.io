/* See https://tailwindcss.com/docs/configuration for more options */

module.exports = {
  purge: {
    content: ["./publish/**/*.html"],
    options: {
      whitelist: []
    }
  },
  theme: {
    extend: {
      spacing: {
        '13': '3.25rem',
        '14': '3.5rem',
        '15': '3.75rem',
      }
    }
  },
  variants: {},
  plugins: []
};
