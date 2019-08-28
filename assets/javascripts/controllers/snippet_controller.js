import { Controller } from "stimulus"
import hljs from 'highlight.js';
import toml from '../highlight.js/toml';

export default class extends Controller {
  connect() {
    hljs.registerLanguage('toml', toml);
    hljs.highlightBlock(this.element);
  }
}
