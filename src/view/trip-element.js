import AbstractView from '../framework/view/abstract-view.js';
import {encodeHtml} from '../utils.js';

const tripTemplate = (title, dates, totalCost) => (
  `<section class="trip-main__trip-info  trip-info">
    <div class="trip-info__main">
      <h1 class="trip-info__title">${encodeHtml(title)}</h1>
      <p class="trip-info__dates">${encodeHtml(dates)}</p>
    </div>
    <p class="trip-info__cost">
      Total: €&nbsp;<span class="trip-info__cost-value">${encodeHtml(totalCost)}</span>
    </p>
  </section>`
);

export default class TripElement extends AbstractView {
  #title = null;
  #dates = null;
  #totalCost = null;

  constructor({title, dates, totalCost}) {
    super();
    this.#title = title;
    this.#dates = dates;
    this.#totalCost = totalCost;
  }

  get template() {
    return tripTemplate(this.#title, this.#dates, this.#totalCost);
  }
}
