import AbstractView from '../framework/view/abstract-view.js';

const tripTemplate = (title, date, totalPrice) => (
  `<section class="trip-main__trip-info  trip-info">
    <div class="trip-info__main">
      <h1 class="trip-info__title">${title}</h1>
      <p class="trip-info__dates">${date}</p>
    </div>
    <p class="trip-info__cost">
      Total: €&nbsp;<span class="trip-info__cost-value">${totalPrice}</span>
    </p>
  </section>`
);

export default class TripElement extends AbstractView {
  #title = null;
  #date = null;
  #totalPrice = null;

  constructor({title, date, totalPrice}) {
    super();
    this.#title = title;
    this.#date = date;
    this.#totalPrice = totalPrice;
  }

  get template() {
    return tripTemplate(this.#title, this.#date, this.#totalPrice);
  }
}
