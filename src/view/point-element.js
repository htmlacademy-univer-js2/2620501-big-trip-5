import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {formatMonthDay, formatHourMinute, formatDuration, encodeHtml} from '../utils.js';

const pointTemplate = (point) => {
  const destinationName = point.destination?.name || 'Unknown destination';
  const selectedOffers = point.selectedOffers || [];
  const headerDate = formatMonthDay(point.dateFrom);
  const timeFrom = formatHourMinute(point.dateFrom);
  const timeTo = formatHourMinute(point.dateTo);
  const duration = formatDuration(point.dateFrom, point.dateTo);

  return `<li class="trip-events__item">
    <div class="event">
      <time class="event__date" datetime="${encodeHtml(point.dateFrom)}">${encodeHtml(headerDate)}</time>
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${encodeHtml(point.type)}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${encodeHtml(point.type)} ${encodeHtml(destinationName)}</h3>
      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${encodeHtml(point.dateFrom)}">${encodeHtml(timeFrom)}</time>
          —
          <time class="event__end-time" datetime="${encodeHtml(point.dateTo)}">${encodeHtml(timeTo)}</time>
        </p>
        <p class="event__duration">${encodeHtml(duration)}</p>
      </div>
      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${encodeHtml(point.basePrice)}</span>
      </p>
      <h4 class="visually-hidden">Offers:</h4>
      <ul class="event__selected-offers">
        ${selectedOffers.map((offer) => `
          <li class="event__offer">
            <span class="event__offer-title">${encodeHtml(offer.title)}</span>
            +€
            <span class="event__offer-price">${encodeHtml(offer.price)}</span>
          </li>
        `).join('')}
      </ul>
      <button class="event__favorite-btn ${point.isFavorite ? 'event__favorite-btn--active' : ''}" type="button" ${point.isFavoriteProcessing ? 'disabled' : ''}>
        <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </button>
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
  </li>`;
};

export default class PointElement extends AbstractStatefulView {
  #onEditClickCallback = null;
  #onFavoriteClickCallback = null;

  constructor({point, onEditClick, onFavoriteClick}) {
    super();
    this._state = PointElement.parsePointToState(point);
    this.#onEditClickCallback = onEditClick;
    this.#onFavoriteClickCallback = onFavoriteClick;

    this.#setHandlers();
  }

  get template() {
    return pointTemplate(this._state);
  }

  _restoreHandlers() {
    this.#setHandlers();
  }

  #editButton = (evt) => {
    evt.preventDefault();
    if (this.#onEditClickCallback) {
      this.#onEditClickCallback();
    }
  };

  #favoriteButton = (evt) => {
    evt.preventDefault();

    if (this._state.isFavoriteProcessing) {
      return;
    }
    this.updateElement({ isFavoriteProcessing: true });

    if (this.#onFavoriteClickCallback) {
      this.#onFavoriteClickCallback();
    }
  };

  #setHandlers() {
    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editButton);
    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteButton);
  }

  static parsePointToState(point) {
    return {
      ...point,
      isFavoriteProcessing: false,
    };
  }
}
