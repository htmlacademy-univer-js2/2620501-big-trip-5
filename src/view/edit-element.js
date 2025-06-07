import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {TYPE} from '../point/point.js';
import flatpicker from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import dayjs from 'dayjs';

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
  const formatDate = (dateString) => dateString ? dayjs(dateString).format('DD/MM/YY HH:mm') : '';

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
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${formatDate(point.dateFrom)}">
        —
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${formatDate(point.dateTo)}">
      </div>
      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          €
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${point.basePrice}" min="0">
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
  #formSubmit = null;
  #rollUpClick = null;
  #destinations = [];
  #allOffers = {};
  #dateFrom = null;
  #dateTo = null;
  #deleteClick = null;

  constructor({point, formSubmit, rollUpClick, destinations, allOffersByType, deleteClick}) {
    super();
    this.#point = point;
    this.#formSubmit = formSubmit;
    this.#rollUpClick = rollUpClick;
    this.#destinations = destinations;
    this.#allOffers = allOffersByType;
    this.#deleteClick = deleteClick;

    this._restoreHandlers();
  }

  get template() {
    return pointEditTemplate(this.#point, this.#destinations, this.#allOffers);
  }

  removeElement() {
    super.removeElement();
    if (this.#dateFrom) {
      this.#dateFrom.destroy();
      this.#dateFrom = null;
    }
    if (this.#dateTo) {
      this.#dateTo.destroy();
      this.#dateTo = null;
    }
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

    const resetButton = this.element.querySelector('.event__reset-btn');
    if (resetButton && this.#deleteClick) {
      resetButton.addEventListener('click', this.#resetButtonClick);
    }

    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#priceInput);

    this.#setDatepick();
  }

  #setDatepick() {
    if (this.#dateFrom) {
      this.#dateFrom.destroy();
      this.#dateFrom = null;
    }
    if (this.#dateTo) {
      this.#dateTo.destroy();
      this.#dateTo = null;
    }

    const commonConfig = {
      enableTime: true,
      time24hr: true,
      dateFormat: 'Z',
      altInput: true,
      altFormat: 'd/m/y H:i',
      allowInput: true,
    };

    this.#dateFrom = flatpicker(
      this.element.querySelector('#event-start-time-1'),
      {
        ...commonConfig,
        defaultDate: this._state.dateFrom || 'today',
        onClose: ([userDate]) => {
          this.updateElement({ dateFrom: userDate ? userDate.toISOString() : null });
          if (this.#dateTo) {
            this.#dateTo.set('minDate', userDate || null);
          }
        },
      }
    );

    this.#dateTo = flatpicker(
      this.element.querySelector('#event-end-time-1'),
      {
        ...commonConfig,
        defaultDate: this._state.dateTo || 'today',
        minDate: this._state.dateFrom || null,
        onClose: ([userDate]) => {
          this.updateElement({ dateTo: userDate ? userDate.toISOString() : null });
        },
      }
    );
  }

  #formSubmit = (evt) => {
    evt.preventDefault();
    const pointSubmit = PointEditView.parseStateToPoint(this._state);
    if (typeof pointSubmit.basePrice !== 'number') {
      pointSubmit.basePrice = Number(pointSubmit.basePrice) || 0;
    }
    this.#formSubmit(pointSubmit);
  };

  #rollUpClick = (evt) => {
    evt.preventDefault();
    this.#rollUpClick();
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
     const enterValue = evt.target.value.trim();

    const selectDestination = this.#destinations.find(
      (dest) => dest.name.toLowerCase() === enterValue.toLowerCase()
    );

    if (selectDestination) {
      this.updateElement({
        destination: selectDestination,
      });
    } else {
      evt.target.value = '';
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

  #resetButtonClick = (evt) => {
    evt.preventDefault();
    this.#deleteClick(PointEditView.parseStateToPoint(this._state));
  };

  #priceInput = (evt) => {
    evt.preventDefault();
    let priceValue = evt.target.value;

    priceValue = priceValue.replace(/[^\d]/g, '');

    if (priceValue.length > 1 && priceValue.startsWith('0')) {
      priceValue = priceValue.substring(1);
    }

    if (priceValue === '') {
      priceValue = '0';
    }

    evt.target.value = priceValue;

    this.updateElement({
      basePrice: Number(priceValue)
    });
  };

  reset(point) {
    this.updateElement(PointEditElement.PointToState(point));
  }

  static PointToState(point) {
    return {
      ...structuredClone(point),
      basePrice: point.basePrice !== undefined ? Number(point.basePrice) : 0,
    };
  }

  static StateToPoint(state) {
    return structuredClone(state);
  }
}
