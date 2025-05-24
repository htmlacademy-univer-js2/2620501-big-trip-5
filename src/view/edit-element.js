import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {TYPE} from '../point/point.js';

const offerTemplate = (available, selected) => {
  if (!available || !available.length) {
    return '';
  }

  return `<section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${available.map((offer) => `
        <div class="event__offer-selector">
        <input class="event__offer-checkbox visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer-${offer.id}" data-offer-id="${offer.id}" ${selected.includes(offer.id) ? 'checked' : ''}>
          <label class="event__offer-label" for="event-offer-${offer.id}">
            <span class="event__offer-title">${offer.title}</span>
            +€
            <span class="event__offer-price">${offer.price}</span>
          </label>
        </div>
      `).join('')}
    </div>
  </section>`;
};

const destinationTemplate = (destination) => {
  if (!destination || !destination.name) {
    return '';
  }
  const picturesTemplate = destination.pictures && destination.pictures.length
    ? `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${destination.pictures.map((picture) => `
            <img class="event__photo" src="${picture.src}" alt="${picture.description}">
          `).join('')}
        </div>
      </div>`
    : '';

  return `<section class="event__section  event__section--destination">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    <p class="event__destination-description">${destination.description || ''}</p>
    ${picturesTemplate}
  </section>`;
};

const pointEditTemplate = (point, destinations, offersByType) => {
  const currentDestination = point.destination;
  const availableOffers = offersByType[point.type] || [];
  const formatValueDate = (dateString) => {
    if (!dateString) {
      return '';
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  return `<form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${TYPE.map((type) => `
              <div class="event__type-item">
                <input id="event-type-${type}-1" class="event__type-input visually-hidden" type="radio" name="event-type" value="${type}" ${type === point.type ? 'checked' : ''}>
                <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${type}</label>
              </div>
            `).join('')}
          </fieldset>
        </div>
      </div>
      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${point.type}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${currentDestination ? currentDestination.name : ''}" list="destination-list-1">
        <datalist id="destination-list-1">
          ${destinations.map((dest) => `<option value="${dest.name}"></option>`).join('')}
        </datalist>
      </div>
      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatValueDate(point.dateFrom)}">
        —
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatValueDate(point.dateTo)}">
      </div>
      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          €
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${point.basePrice}">
      </div>
      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn" type="reset">${point.id !== undefined ? 'Delete' : 'Cancel'}</button> 
      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    ${offerTemplate(availableOffers, point.offers)}
    ${destinationTemplate(currentDestination)}
  </form>`;
};

export default class PointEditElement extends AbstractStatefulView {
  #point = null;
  #handleForm = null;
  #handleRollUp = null;
  #allDestinations = [];
  #allOffers = {};

  constructor({point, onFormSubmit, onRollUpClick, destinations, offersByType}) {
    super();
    this.#point = point;
    this.#handleForm = onFormSubmit;
    this.#handleRollUp = onRollUpClick;
    this.#allDestinations = destinations;
    this.#allOffers = offersByType;

    this._restoreHandlers();
  }

  get template() {
    return pointEditTemplate(this.#point, this.#allDestinations, this.#allOffers);
  }

  _restoreHandlers() {
    this.element.addEventListener('submit', this.#formSubmit);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#rollUpClick);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChange);
    const offersElement = this.element.querySelector('.event__available-offers');
    if (offersElement) {
      offersElement.addEventListener('change', this.#offerChange);
    }
  }

  #formSubmit = (evt) => {
    evt.preventDefault();
    this.#handleForm(PointEditElement.parseStateToPoint(this.#point));
  };

  #rollUpClick = (evt) => {
    evt.preventDefault();
    this.#handleRollUp();
  };
  
  #typeChange = (evt) => {
    evt.preventDefault();
    if (evt.target.classList.contains('event__type-input')) {
      this.updateElement({
        type: evt.target.value,
        offers: []
      });
    }
  };

  #destinationChange = (evt) => {
    evt.preventDefault();
    const selectedDestination = this.#allDestinations.find((dest) => dest.name === evt.target.value);
    if (selectedDestination) {
      this.updateElement({
        destination: selectedDestination
      });
    } else {
      this.updateElement({
        destination: { name: evt.target.value, description: '', pictures: [] }
      });
    }
  };

  #offerChange = (evt) => {
    evt.preventDefault();
    if (evt.target.classList.contains('event__offer-checkbox')) {
      const offerId = Number(evt.target.dataset.offerId);
      const currentOffers = this.#point.offers.includes(offerId)
        ? this.#point.offers.filter((id) => id !== offerId)
        : [...this.#point.offers, offerId];

      this.updateElement({
        offers: currentOffers
      });
    }
  };

  reset(point) {
    this.updateElement(PointEditElement.parsePointToState(point));
  }

  static PointToState(point) {
    const clonedPoint = structuredClone(point);
    return {...clonedPoint};
  }

  static StateToPoint(state) {
    const point = {...state};
    return point;
  }
}
