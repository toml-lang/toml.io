import hljs from "./highlight.js";
import json from "./languages/json.js";
import toml from "./languages/toml.js";
import yaml from "./languages/yaml.js";

hljs.registerLanguage("json", json);
hljs.registerLanguage("toml", toml);
hljs.registerLanguage("yaml", yaml);

export default hljs;
