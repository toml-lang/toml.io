// Copies markdown spec files from /specs and creates real HTML files from them
// and turns them into HTML files at https://toml.io

const path = require("path");
const fs = require("fs");
const marked = require("marked");
const Formatter = require("./formatter")
const NavExtractor = require("./nav_extractor")

const ROOT_DIR = path.join(__dirname, "..");
const SPEC_DIR = path.join(ROOT_DIR, "specs");
const HTML_DIR = path.join(ROOT_DIR, "code", "html");
const INDEX_FILENAME = "index.html";
const LOCALE_FILENAME = "_locale.md";

const SPEC_TEMPLATE = fs.readFileSync(path.join(HTML_DIR, "spec.html.template")).toString()
const NAV_TEMPLATE = fs.readFileSync(path.join(HTML_DIR, "_nav.html.template")).toString()
const LATEST_TEMPLATE =  fs.readFileSync(path.join(HTML_DIR, "latest.html.template")).toString()
const INDEX_TEMPLATE =  fs.readFileSync(path.join(HTML_DIR, "index.html.template")).toString()

class SpecToHtml {
  constructor() {
    this.generatedSpecs = {};
  }

  start() {
    this.generateSpecs() && this.generateNav();
  }

  // whether the given locale directory should generate specs
  shouldGenerate(locale) {
    if (locale.match(/\.DS_Store/)) return false;
    if (process.env.LOCALES && process.env.LOCALES.indexOf(locale) === -1) return false;

    return true;
  }

  // copies index (if present) from spec directory to build directory
  createIndex(locale) {
    try {
      const indexHtml = fs.readFileSync(path.join(SPEC_DIR, locale, INDEX_FILENAME)).toString();
      fs.writeFileSync(path.join(HTML_DIR, locale, INDEX_FILENAME), indexHtml);
      console.info("Copied index.html");
      return true;
    } catch (e) {
      fs.writeFileSync(path.join(HTML_DIR, locale, 'index.html'), INDEX_TEMPLATE)
      console.info("No index.html found, creating placeholder");
      return false;
    }
  }

  extractNav(html) {
    console.info(`Extracting nav...`);
    const extractor = new NavExtractor(html);

    return extractor.process();
  }

  // converts markdown spec to HTML, copies to build directory
  createSpec(locale, specFilename) {
    if (specFilename.match(/\.md$/) && !specFilename.match(/^_/)) {
      const specPath = path.join(SPEC_DIR, locale, specFilename);
      const outputDir = path.join(HTML_DIR, locale);
      const outputFilename = path.join(outputDir,specFilename.replace(/\.md/g,".html"));
      let version = specFilename.split('.')
      version.pop()
      version = version.join('.')
      let specRaw = fs.readFileSync(specPath).toString();

      // replace markdown frontmatter
      specRaw = specRaw.replace(/^---.*?---/s, "");
      const specHtml = Formatter.format(marked(specRaw), { locale, version });
      const asideHtml = this.extractNav(specHtml)

      let outputHtml = SPEC_TEMPLATE.replace(/\{\{\s*spec\s*\}\}/g, specHtml);
      outputHtml = outputHtml.replace(/\{\{\s*aside\s*\}\}/g, asideHtml);
      outputHtml = outputHtml.replace(/\{\{\s*locale\s*\}\}/g, locale);
      outputHtml = outputHtml.replace(/\{\{\s*language\s*\}\}/g, this.getLanguage(locale));
      outputHtml = outputHtml.replace(/\{\{\s*version\s*\}\}/g, version);

      fs.writeFileSync(outputFilename, outputHtml);
      this.generatedSpecs[locale].push(specFilename.replace(/\.md/, ""));
      console.info(`Saved ${outputFilename}`);
    }
  }

  generateSpecs() {
    fs.readdirSync(SPEC_DIR).forEach(locale => {
      if (!this.shouldGenerate(locale))
        return;

      console.info(`\nWorking on ${locale} locale...`);
      console.group();

      // make directory for this locale
      fs.mkdirSync(path.join(HTML_DIR, locale), { recursive: true });

      this.createIndex(locale);

      // create placeholder for which versions were created for this locale
      this.generatedSpecs[locale] = [];

      // turn each spec into HTML and copy to output dir
      fs.readdirSync(path.join(SPEC_DIR, locale)).forEach(specFilename => {
        this.createSpec(locale, specFilename);
      });

      // generate a latest.html that redirects to latest version
      const latestVersion = this.generatedSpecs[locale].reverse()[0]
      const latestContent = LATEST_TEMPLATE.replace(/\{\{\s+version\s+\}\}/, latestVersion)
      fs.writeFileSync(path.join(HTML_DIR, locale, 'latest.html'), latestContent)

      console.groupEnd();
    });

    return true;
  }

  getLanguage(locale) {
    return fs.readFileSync(path.join(SPEC_DIR, locale, LOCALE_FILENAME)).toString().trim();
  }

  generateNav() {
    console.info("Generating navigation elements...");
    console.group();
    const latestVersion = this.generatedSpecs['en'][0]

    // languages
    const locationsList = [];
    for (let locale in this.generatedSpecs) {
      const versions = this.generatedSpecs[locale].reverse();
      const translation = this.getLanguage(locale);
      locationsList.push(
        `<li data-target="application.language" data-language="${locale}"><a href="/${locale}/${versions[versions.length - 1]}.html">${translation}</a></li>`
      );
    }

    // versions
    for (let locale in this.generatedSpecs) {
      const navOutputPath = path.join(HTML_DIR, locale, "_nav.html");
      const versions = this.generatedSpecs[locale];

      const versionsList = versions.reverse().map(version => {
        return `<li data-target="application.version" data-version="${version}"><a href="/${locale}/${version}.html">${version}</a></li>`;
      });

      const output = NAV_TEMPLATE
        .replace(/\{\{\s+versions\s+\}\}/g, versionsList.join("\n"))
        .replace(/\{\{\s+languages\s+\}\}/g, locationsList.join("\n"))
        .replace(/\{\{\s+latestVersion\s+\}\}/g, latestVersion);

      fs.writeFileSync(navOutputPath, output);
      console.info(`Saved ${navOutputPath}`);
    }

    console.groupEnd();
  }
}

const generator = new SpecToHtml();
generator.start();
