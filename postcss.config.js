module.exports = {
  plugins: [
    require("postcss-import"),
    require("tailwindcss"),
    require("postcss-nesting"),
    require("autoprefixer"),
    process.env.NODE_ENV === "production" &&
      require("@fullhuman/postcss-purgecss")({
        content: ["./public/*.html"],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        whitelist: ["tab-active"]
      }),
    process.env.NODE_ENV === "production" &&
      require("cssnano")({
        preset: ["default", { discardComments: { removeAll: true } }]
      })
  ]
};
