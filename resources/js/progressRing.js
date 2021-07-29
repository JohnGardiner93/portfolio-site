"use strict";
// Some portions of code from: https://css-tricks.com/building-progress-ring-quickly/

////////////////////////////////////////////
// Constants
const ANIMATION_SPEED = 75; //ms
const HOVER_SCALE = 1.1;
const PROGRESS_INCREMENT_AMOUNT = 5;
const TRANSITION_SPEED = `0.5s`;
const DEFAULT_STROKE = "15";
const DEFAULT_RADIUS = "200";
const DEFAULT_COLOR = "#059905";
const DEFAULT_LINK = "#";
const DEFAULT_IMAGE = `none`;
const DEFAULT_TITLE = ``;
const DEFAULT_SUBTITLE = ``;

////////////////////////////////////////////
// Web Component
class ProgressRing extends HTMLElement {
  constructor() {
    super();
    // Inputs
    const stroke = this.getAttribute("stroke") ?? DEFAULT_STROKE;
    const radius = this.getAttribute("radius") ?? DEFAULT_RADIUS;
    const color = this.getAttribute("color") ?? DEFAULT_COLOR;
    const link = this.getAttribute("href") ?? DEFAULT_LINK;
    const backgroundImage = this.getAttribute("src") ?? DEFAULT_IMAGE;
    const title = this.getAttribute("title") ?? DEFAULT_TITLE;
    const subtitle = this.getAttribute("subtitle") ?? DEFAULT_SUBTITLE;
    const normalizedRadius = radius - stroke * 2;
    this._circumference = normalizedRadius * 2 * Math.PI;

    // Setup
    this._root = this.attachShadow({ mode: "open" });
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
                    stroke="${color}"
                    stroke-dasharray="${this._circumference} ${this._circumference}"
                    style="stroke-dashoffset:${this._circumference}"
                    stroke-width="${stroke}"
                    fill="transparent"
                    r="${normalizedRadius}"
                    cx="${radius}"
                    cy="${radius}"
                />
                </svg>
                <a href="${link}"
                    target="_blank"
                    rel="noopener noreferrer">
                </a>
            </div>
            <h2>${title}</h2>
            <h3>${subtitle}</h3>
        </div>
        <style>
            * {
                transition-duration: ${TRANSITION_SPEED};
                margin: 0;
                padding: 0;
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
                display: flex;
                align-items: center;
                justify-content: center;
                height:${radius * 2}px;
                width:${radius * 2}px;
                grid-area: circle;
            }

            svg{
                position: absolute;
            }

            circle {
                transition: stroke-dashoffset 0.35s;
                transform: rotate(-90deg);
                transform-origin: 50% 50%;
                position: absolute;
            }

            a{
                position: absolute;
                height: ${(radius - 2.5 * stroke) * 2}px;
                width: ${(radius - 2.5 * stroke) * 2}px;
                background-image: url(${backgroundImage});
                background-position: center;
                background-size: contain;
                border-radius: 50%;
            }

            .progress-circle-container:hover svg{
                transform: scale(${HOVER_SCALE} , ${HOVER_SCALE});
            }
            .progress-circle-container:hover a{
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
  // Methods
  /**
   * Changes strokeDashoffset of svg circle based on provided percent complete. A value of 50% provided would cause half of the circle to be remdered.
   * @param {Number} percent - The desired % of circle to be shown.
   */
  setProgress(percent) {
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
   * @param {String} oldValue - The old value of the attribute.
   * @param {String} newValue - The new value of the attribute.
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "progress") {
      this.setProgress(newValue);
    }
  }
}

// Standard for web components. Defines custom element.
window.customElements.define("progress-ring", ProgressRing);

////////////////////////////////////////////
// Functions
const addProgressToRing = function (el, timer) {
  const newProgress =
    Number(el.getAttribute("progress")) + PROGRESS_INCREMENT_AMOUNT;
  el.setAttribute("progress", newProgress);
  if (
    newProgress === Number(el.getAttribute("completion")) ||
    newProgress === 100
  )
    clearInterval(timer);
};

////////////////////////////////////////////
// Executed Code
const rings = document.querySelectorAll("progress-ring");

rings.forEach((el) => {
  // Anonymous function required so that interval can be fully declared before being used in addProgressToRing
  const interval = setInterval(() => {
    addProgressToRing(el, interval);
  }, ANIMATION_SPEED);
});

////////////////////////////////////////////
// For every ring on the page, kick off animation until completion level is hit.
// rings.forEach((el) => {
//   const interval = setInterval(() => {
//     const newProgress =
//       Number(el.getAttribute("progress")) + PROGRESS_INCREMENT_AMOUNT;
//     el.setAttribute("progress", newProgress);
//     if (
//       newProgress === Number(el.getAttribute("completion")) ||
//       newProgress === 100
//     )
//       clearInterval(interval);
//   }, ANIMATION_SPEED);
// });
