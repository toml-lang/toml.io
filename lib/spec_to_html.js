// Copies markdown spec files from /specs and creates real HTML files from them
// and turns them into HTML files at https://semver.org

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
const SPEC_TEMPLATE_PATH = path.join(HTML_DIR, "_spec.html.template");
const NAV_TEMPLATE_PATH = path.join(HTML_DIR, "_nav.html.template");

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
      console.info("No index.html found, skipping");
      return false;
    }
  }

  extractNav(html) {
    console.log(`Extracting nav...`);
    const extractor = new NavExtractor(html);

    return extractor.process();
  }

  // converts markdown spec to HTML, copies to build directory
  createSpec(locale, specFilename, specTemplate) {
    if (specFilename.match(/\.md$/) && !specFilename.match(/^_/)) {
      let specPath = path.join(SPEC_DIR, locale, specFilename);
      let outputDir = path.join(HTML_DIR, locale);
      let outputFilename = path.join(outputDir, specFilename.replace(/\.md/, ".html"));
      let specRaw = fs.readFileSync(specPath).toString();

      // replace markdown frontmatter
      specRaw = specRaw.replace(/^---.*?---/s, "");
      let specHtml = Formatter.format(marked(specRaw));
      let asideHtml = this.extractNav(specHtml)

      let outputHtml = specTemplate.replace(/\{\{\s*spec\s*\}\}/, specHtml);
      outputHtml = outputHtml.replace(/\{\{\s*aside\s*\}\}/, asideHtml);
      outputHtml = outputHtml.replace(/\{\{\s*locale\s*\}\}/, locale);

      fs.writeFileSync(outputFilename, outputHtml);
      this.generatedSpecs[locale].push(specFilename.replace(/\.md/, ""));
      console.log(`Saved ${outputFilename}`);
    }
  }

  generateSpecs() {
    const specTemplate = fs.readFileSync(SPEC_TEMPLATE_PATH).toString();

    fs.readdirSync(SPEC_DIR).forEach(locale => {
      if (!this.shouldGenerate(locale)) return;

      console.info(`\nWorking on ${locale} locale...`);
      console.group();

      // make directory for this locale
      fs.mkdirSync(path.join(HTML_DIR, locale), { recursive: true });

      this.createIndex(locale);

      // create placeholder for which versions were created for this locale
      this.generatedSpecs[locale] = [];

      // turn each spec into HTML and copy to output dir
      fs.readdirSync(path.join(SPEC_DIR, locale)).forEach(specFilename => {
        this.createSpec(locale, specFilename, specTemplate);
      });
      console.groupEnd();
    });
    return true;
  }

  generateNav() {
    console.log("generateNav", this.generatedSpecs);

    console.log("Generating navigation elements...");
    console.group();

    // languages
    const locationsList = [];
    for (let locale in this.generatedSpecs) {
      const versions = this.generatedSpecs[locale];
      const translation = fs
        .readFileSync(path.join(SPEC_DIR, locale, LOCALE_FILENAME))
        .toString()
        .trim();
      locationsList.push(
        `<li><a href="/${locale}/${versions[versions.length - 1]}.html">${translation}</a></li>`
      );
    }

    // versions
    for (let locale in this.generatedSpecs) {
      let navTemplate = fs.readFileSync(NAV_TEMPLATE_PATH).toString();
      const navOutputPath = path.join(HTML_DIR, locale, "_nav.html");
      const versions = this.generatedSpecs[locale];
      const versionsList = [];

      versions.reverse().forEach(version => {
        versionsList.push(`<li><a href="/${locale}/${version}.html">${version}</a></li>`);
      });

      navTemplate = navTemplate
        .replace(/\{\{\s+versions\s+\}\}/, versionsList.join("\n"))
        .replace(/\{\{\s+languages\s+\}\}/, locationsList.join("\n"));

      fs.writeFileSync(navOutputPath, navTemplate);
      console.log(`Saved ${navOutputPath}`);
    }

    console.groupEnd();
  }
}

const generator = new SpecToHtml();
generator.start();
