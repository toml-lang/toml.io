module.exports = function (hljs) {
  var STRING = {
    className: "string",
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: "'''", end: "'''",
        relevance: 10
      }, {
        begin: '"""', end: '"""',
        relevance: 10
      }, {
        begin: '"', end: '"'
      }, {
        begin: "'", end: "'"
      }
    ]
  };
  return {
    aliases: ['toml'],
    case_insensitive: true,
    illegal: /\S/,
    contains: [
      hljs.COMMENT(';', '$'),
      hljs.HASH_COMMENT_MODE,
      {
        className: 'section',
        begin: /^\s*\[+/, end: /\]+/
      },
      {
        begin: /^[ a-z0-9\[\]_\.-]+\s*=\s*/, end: '$',
        returnBegin: true,
        contains: [
          {
            className: 'attr',
            begin: /[a-z0-9\[\]_\.-]+/
          },
          {
            begin: /=/, endsWithParent: true,
            relevance: 0,
            contains: [
              hljs.COMMENT(';', '$'),
              hljs.HASH_COMMENT_MODE,
              {
                className: 'variable',
                variants: [
                  { begin: /\$[\w\d"][\w\d_]*/ },
                  { begin: /\$\{(.*?)}/ }
                ]
              },
              STRING,
              {
                className: 'number',
                begin: /([\+\-\d(inf|nan|0o|0b|0x)])+[\d_eETZa-fA-F\:\-\+\.(inf|nan)]+/
              },
              {
                className: 'literal',
                begin: /\bon|off|true|false|yes|no\b/
              },
              hljs.NUMBER_MODE
            ]
          }
        ]
      }
    ]
  };
};
