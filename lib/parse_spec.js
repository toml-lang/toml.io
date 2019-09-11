const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const dasherize = require("string-dasherize");
const MarkdownIt = require("markdown-it");
const md = new MarkdownIt();

const specUrl = "https://raw.githubusercontent.com/toml-lang/toml/master/README.md";

function textToId(text) {
  console.log(text);
  return dasherize(text.toLowerCase()).replace("/", "-");
}

class Formatter {
  static format(text) {
    return this.style(this.anchor(this.chomp(text)));
  }

  static chomp(text) {
    const startRegex = new RegExp("^.*?<h2>Spec</h2>(.*)$", "s");
    const endRegex = new RegExp("^(.*?)<h2>Comparison with Other Formats</h2>.*$", "s");

    return text.replace(startRegex, "$1").replace(endRegex, "$1");
  }

  static anchor(text) {
    return text.replace(/<h2>(.*?)<\/h2>/g, ($0, $1) => {
      return `<h2 id="${textToId($1)}" data-target="nav.header">${$1}</h2>`;
    });
  }

  static style(text) {
    // return this.styleLists(this.styleCode(this.styleParagraphs(this.styleHeaders(text))));
    return this.styleCode(text);
  }

  static styleHeaders(text) {
    return text.replace(/<h2 (.*?)>/g, `<h2 class="${classes.header}" $1>`);
  }

  static styleParagraphs(text) {
    return text.replace(/<p>/g, `<p class="${classes.paragraph}" $1>`);
  }

  static styleCode(text) {
    let output = text.replace(/<pre><code>/g, `<pre><code class="language-toml">`);
    return output.replace(/<pre><code /g, `<pre><code data-controller="snippet" `);
  }

  static styleLists(text) {
    return text.replace(/<ul>/g, `<ul class="${classes.list}" $1>`);
  }
}

class NavExtractor {
  static extract(text) {
    const lines = text.split("\n");
    return lines
      .map(line => {
        let match = line.match(/^<h2.*?id="(.*?)".*?>(.*)<\/h2>$/);

        if (match) {
          return `<li><a href="#${match[1]}" data-target="nav.link" data-id="${match[1]}">${
            match[2]
          }</a></li>`;
        }
      })
      .filter(nav => nav);
  }
}

class ParseSpec {
  constructor() {
    this.specOutputPath = path.join(__dirname, "..", "code", "html", "partials", "spec.html");
    this.navOutputPath = path.join(__dirname, "..", "code", "html", "partials", "spec_nav.html");

    this.raw = "";
    this.html = "";
    this.nav = [];
  }

  async process() {
    await this.get();
    this.convert();
    this.format();
    this.extractNav();
    this.save();
  }

  async get() {
    const response = await fetch(specUrl);
    this.raw = await response.text();
  }

  convert() {
    this.html = md.render(this.raw);
  }

  format() {
    this.html = Formatter.format(this.html);
  }

  extractNav() {
    this.nav = NavExtractor.extract(this.html);
  }

  save() {
    // save spec
    fs.writeFileSync(this.specOutputPath, this.html);
    // save nav
    fs.writeFileSync(this.navOutputPath, `<ul>\n${this.nav.join("\n")}\n</ul>`);
  }
}

(async () => {
  let instance = new ParseSpec();
  await instance.process();
  console.log(instance);
})();
