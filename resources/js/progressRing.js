"use strict";
// Some portions of code from: https://css-tricks.com/building-progress-ring-quickly/

////////////////////////////////////////////
// Constants
const ANIMATION_SPEED = 50; //ms
const HOVER_DELAY = 350;
const HOVER_SCALE = 1.1;
const PROGRESS_INCREMENT_AMOUNT = 10;
const TRANSITION_SPEED = `0.5s`;
const DEFAULT_STROKE = 15;
const DEFAULT_RADIUS = 200;
const DEFAULT_COLOR = "#059905";
const DEFAULT_LINK = "#";
const DEFAULT_IMAGE = `none`;
const DEFAULT_TITLE = ``;
const DEFAULT_SUBTITLE = ``;
const DEFAULT_PROGRESS = 0;
const DEFAULT_COMPLETION = 100;
const RESIZE_RADIUS_SCALE = 0.75;
const RESIZE_SCREEN_SIZE = 1023;

////////////////////////////////////////////
// Web Component
class ProgressRing extends HTMLElement {
  constructor() {
    super();
    // Inputs
    this._stroke = this.getAttribute("stroke") ?? DEFAULT_STROKE;
    this._radius = this.getAttribute("radius") ?? DEFAULT_RADIUS;
    this._color = this.getAttribute("color") ?? DEFAULT_COLOR;
    this._link = this.getAttribute("href") ?? DEFAULT_LINK;
    this._backgroundImage = this.getAttribute("src") ?? DEFAULT_IMAGE;
    this._title = this.getAttribute("title") ?? DEFAULT_TITLE;
    this._subtitle = this.getAttribute("subtitle") ?? DEFAULT_SUBTITLE;
    this._progress = Number(this.getAttribute("progress")) ?? DEFAULT_PROGRESS;
    this._completion =
      Number(this.getAttribute("completion")) ?? DEFAULT_COMPLETION;
    this._root = this.attachShadow({ mode: "open" });
    this._timer = null;

    // Setup & Initial Animation
    this.render();
    this.addHandlerHover();
    this.runProgressionAnimation();
  }

  // Methods
  /**
   * Renders the progressRing using the object's assigned properties. If the window in which the object exists is less that the RESIZE_SCREEN_SIZE, the size of the object will be reduced by a factor of RESIZE_RADIUS_SCALE.
   */
  render() {
    const radius = Math.trunc(
      window.innerWidth > RESIZE_SCREEN_SIZE
        ? this._radius
        : this._radius * RESIZE_RADIUS_SCALE
    );
    const normalizedRadius = radius - this._stroke * 2;
    this._circumference = normalizedRadius * 2 * Math.PI;
    this._root.innerHTML =
      // prettier-ignore
      `
      <div class="progress-card-container">    
          <div class="progress-circle-container"> 
              <svg
              height="${radius * 2}px"
              width="${radius * 2}px"
              >
              <circle
                  stroke="${this._color}"
                  stroke-dasharray="${this._circumference} ${this._circumference}"
                  style="stroke-dashoffset:${this._circumference}"
                  stroke-width="${this._stroke}"
                  fill="transparent"
                  r="${normalizedRadius}"
                  cx="${radius}"
                  cy="${radius}"
              />
              </svg>
              <a href="${this._link}"
                  target="_blank"
                  rel="noopener noreferrer">
              </a>
          </div>
          <h2>${this._title}</h2>
          <h3>${this._subtitle}</h3>
      </div>
      <style>
            * {
            transition-duration: ${TRANSITION_SPEED};
            margin: 0;
            padding: 0;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;              
          }
          
          .progress-card-container{
            display: grid;
            grid-template-rows: repeat(3, auto);
            grid-template-columns: auto;
            grid-template-areas: 
            "circle"
            "title"
            "subtitle"
            ;
          }
          
          .progress-circle-container {
            position: relative;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: center;
            -ms-flex-pack: center;
            justify-content: center;
            height:${radius * 2}px;
            width:${radius * 2}px;
            grid-area: circle;
          }
          
          svg{
            position: absolute;
          }
          
          circle {
            -webkit-transition: stroke-dashoffset 0.35s;
            -o-transition: stroke-dashoffset 0.35s;
            transition: stroke-dashoffset 0.35s;
            -webkit-transform: rotate(-90deg);
            -ms-transform: rotate(-90deg);
            transform: rotate(-90deg);
            -webkit-transform-origin: 50% 50%;
            -ms-transform-origin: 50% 50%;
            transform-origin: 50% 50%;
            position: absolute;
          }
          
          a{
            position: absolute;
            height: ${(radius - 2.5 * this._stroke) * 2}px;
            width: ${(radius - 2.5 * this._stroke) * 2}px;
            background-image: url(${this._backgroundImage});
            background-position: center;
            background-size: contain;
            border-radius: 50%;
          }
          
          .progress-circle-container:hover svg{
            -webkit-transform: scale(${HOVER_SCALE} , ${HOVER_SCALE});
            -ms-transform: scale(${HOVER_SCALE} , ${HOVER_SCALE});
            transform: scale(${HOVER_SCALE} , ${HOVER_SCALE});
          }
          .progress-circle-container:hover a{
            -webkit-transform: scale(${HOVER_SCALE * 0.95},${HOVER_SCALE * 0.95});
            -ms-transform: scale(${HOVER_SCALE * 0.95},${HOVER_SCALE * 0.95});
            transform: scale(${HOVER_SCALE * 0.95},${HOVER_SCALE * 0.95});
          }
          
          h2, h3{
            max-width: ${radius * 2}px;
            text-align: center;
            place-self: center;
          }
          
          h2 {
            grid-area: title;
            font-size: 200%;
          
          }
          h3 {
            grid-area: subtitle;
            font-style: italic;
            font-weight: 400;
          }
      </style>
    `;
  }

  /**
   * Kicks off progression animation. Creates an interval timer which calls addProgressToRing. The timer object is passed to addProgressToRing in case a cancellation is needed.
   * @param {*} speed - The time between each interval code execution.
   */
  runProgressionAnimation(speed = ANIMATION_SPEED) {
    const interval = setInterval(() => {
      this.addProgressToRing(interval);
    }, speed);
  }

  /**
   * Adds progress to the progress ring on the element in increments of PROGRESS_INCREMENT_AMOUNT. First checks if the completion number has been reached or if 100 or greater has been reached (as a failsafe.) Only progresses ring if there is room to grow.
   * @param {*} timer - The interval timer calling addProgressToRing for the element.
   * @returns {undefined}
   */
  addProgressToRing(timer) {
    if (this._progress === Number(this._completion) || this._progress >= 100) {
      clearInterval(timer);
      return;
    }
    const newProgress = Number(this._progress) + PROGRESS_INCREMENT_AMOUNT;
    this.setProgress(newProgress);
  }

  /**
   * Adds hover effect to the progress ring. The progress ring disappears, is reset to 0, pauses to allow the ring to reset, then displays the progress ring once more and progresses though the progression animation.
   */
  addHandlerHover() {
    this.addEventListener("mouseenter", function (e) {
      this._root.querySelector("circle").style.opacity = 0;
      this.setProgress(0);
      setTimeout(() => {
        this._root.querySelector("circle").style.opacity = 1;
        this.runProgressionAnimation();
      }, HOVER_DELAY);
    });
  }

  /**
   * Changes strokeDashoffset of svg circle based on provided percent complete. A value of 50% provided would cause half of the circle to be remdered.
   * @param {Number} percent - The desired % of circle to be shown.
   */
  setProgress(percent) {
    this._progress = percent;
    const offset = this._circumference - (percent / 100) * this._circumference;
    const circle = this._root.querySelector("circle");
    circle.style.strokeDashoffset = offset;
  }

  /**
   * Indicates which attributes should be monitored for changes. Standard for web components.
   */
  static get observedAttributes() {
    return ["progress"];
  }

  /**
   * Fires when an attribute is changed on the web component. Standard for web components.
   * @param {String} name - The name of the attribute that was changed.
   * @param {String} _ - The old value of the attribute.
   * @param {String} newValue - The new value of the attribute.
   */
  attributeChangedCallback(name, _, newValue) {
    if (name === "progress") {
      this.setProgress(newValue);
    }
  }
}

////////////////////////////////////////////
// Executed Code
// Standard for web components. Defines custom element.
window.customElements.define("progress-ring", ProgressRing);

// Global Variables
const rings = document.querySelectorAll("progress-ring");
let currentWindowSize = window.innerWidth;

////////////////////////////////////////////
// Event listeners
window.addEventListener(`resize`, function (e) {
  const newWindowSize = Number(window.innerWidth);

  // Only fires resizing when the screen size has changed from small to large or large to small. Avoids minor screen size changes within the same screen size.
  if (
    (currentWindowSize < RESIZE_SCREEN_SIZE &&
      newWindowSize > RESIZE_SCREEN_SIZE) ||
    (currentWindowSize > RESIZE_SCREEN_SIZE &&
      newWindowSize < RESIZE_SCREEN_SIZE)
  ) {
    rings.forEach((el) => {
      el.setProgress(0);
      el.render();
      el.runProgressionAnimation();
    });
  }
  currentWindowSize = newWindowSize;
});

////////////////////////////////////////////
