// Downloads spec files from https://github.com/toml-lang/toml/tree/master/versions and turns them
// into HTML files for browsing at https://toml.io

const path = require("path");
const Downloader = require("./parse_spec/downloader.js");

const OUTPUT_DIR = path.join(__dirname, "..", "code", "html", "v1");
const GITHUB_PATH = "/versions";

Downloader.start(OUTPUT_DIR, GITHUB_PATH);
