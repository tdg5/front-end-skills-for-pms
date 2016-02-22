import classify from "underscore.string/classify";
import Reveal from "reveal";
import InstanceCache from "./instance-cache";

class SlideActivator {
  static get configKey() {
    return "slides";
  }

  constructor(slideMap) {
    this.slides = slideMap;
    let slideFactory = generateSlideFactory(this);
    this.slideCache = new InstanceCache({ factory: slideFactory });
  }

  boot() {
    this.registerHandlerSlidechanged();
  }

  registerHandlerSlidechanged() {
    let slideActivator = this;
    Reveal.addEventListener("slidechanged", function(event) {
      let controllerName = event.currentSlide.getAttribute("slide-controller");
      if(!controllerName) { return; }
      let slide = slideActivator.slideCache.get(controllerName, event);
      if(!slide) { return; }
      if(Reveal.isReady()) {
        slide.activate();
      } else {
        Reveal.addEventListener("ready", function() { slide.activate(); });
      }
    });
  }
}

function extractSlideConfig(event) {
  return {
    element: event.currentSlide,
    postion: [event.indexh, event.indexv],
  };
}

function generateSlideFactory(slideActivator) {
  return function SlideFactory(key, event) {
    let controllerClassName = classify(key);
    let slideClass = slideActivator.slides[controllerClassName];
    if(!slideClass) { return; }
    let slideConfig = extractSlideConfig(event);
    return new slideClass(slideConfig);
  }
}

export default SlideActivator;