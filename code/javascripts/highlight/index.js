import hljs from "./highlight.js";
import json from "./languages/json.js";
import toml from "./languages/toml.js";

hljs.registerLanguage("json", json);
hljs.registerLanguage("toml", toml);

export default hljs;
