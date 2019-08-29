import { Controller } from "stimulus"
import hljs from 'highlight.js';
import toml from '../highlight.js/toml';
import json from 'highlight.js/lib/languages/json';

export default class extends Controller {
  connect() {
    hljs.registerLanguage('toml', toml);
    hljs.registerLanguage('json', json);
    hljs.highlightBlock(this.element);
  }
}
