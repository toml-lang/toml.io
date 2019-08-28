import { Controller } from "stimulus"
import hljs from 'highlight.js';
import ini from 'highlight.js/lib/languages/ini';

export default class extends Controller {
  connect() {
    hljs.registerLanguage('ini', ini);
    hljs.highlightBlock(this.element);
  }
}
