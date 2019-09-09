// See https://stimulusjs.org for more about StimulusJS

import { Controller } from "stimulus";

export default class extends Controller {
  connect() {
    console.info("Stimulus Connected.");
  }
}
