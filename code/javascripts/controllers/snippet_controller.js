import { Controller } from "stimulus";
import hljs from "../highlight/index.js";

export default class extends Controller {
  connect() {
    hljs.highlightBlock(this.element);
  }
}
