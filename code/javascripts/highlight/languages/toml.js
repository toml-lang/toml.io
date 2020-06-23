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
        // begin: /[ a-z0-9\[\]"'_\.-]+\s*=\s*/, end: '$',
        begin: /[^\u0000-\u0008\u000a-\u001f\u007f]+\s*=\s*/, end: '$',
        returnBegin: true,
        contains: [
          {
            className: 'attr',
            begin: /[^\u0000-\u0008\u000a-\u001f\u007f=]+/
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
                className: 'literal',
                begin: /\bon|off|true|false|yes|no\b/
              },
              {
                className: 'number',
                begin: /([\+\-\d(inf|nan|0o|0b|0x)])+[\d_eETZa-fA-F\:\-\+\.(inf|nan)]+/
              },
              hljs.NUMBER_MODE
            ]
          }
        ]
      }
    ]
  };
};
