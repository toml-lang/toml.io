module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    process.env.NODE_ENV === 'production' && require('@fullhuman/postcss-purgecss')({
      content: [
        './public/*.html'
      ],
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
      whitelist: ['tab-active']
    }),
    require('cssnano')({
      preset: [
        'default',
        { "discardComments": { "removeAll": true } }
      ]
    })
  ]
}
