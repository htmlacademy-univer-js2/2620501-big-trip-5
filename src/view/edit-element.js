import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import {TYPE} from '../constants.js';
import {encodeHtml, checkImageUrl} from '../utils.js';
import dayjs from 'dayjs';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

const renderOffersSection = (available, selected, isShown) => {
  if (!available || !available.length) {
    return '';
  }

  return `<section class="event__section  event__section--offers">
    <h3 class="event__section-title  event__section-title--offers">Offers</h3>
    <div class="event__available-offers">
      ${available.map((offer) => `
        <div class="event__offer-selector">
          <input class="event__offer-checkbox  visually-hidden" id="event-offer-${encodeHtml(offer.id)}" type="checkbox" name="event-offer-${encodeHtml(offer.id)}" data-offer-id="${encodeHtml(offer.id)}" ${selected.includes(offer.id) ? 'checked' : ''} ${isShown ? 'disabled' : ''}>
          <label class="event__offer-label" for="event-offer-${encodeHtml(offer.id)}">
            <span class="event__offer-title">${encodeHtml(offer.title)}</span>
            +€
            <span class="event__offer-price">${encodeHtml(offer.price)}</span>
          </label>
        </div>
      `).join('')}
    </div>
  </section>`;
};

const renderDestinationSection = (destination) => {
  if (!destination || !destination.name) {
    return '';
  }
  const imgTemplate = destination.pictures && destination.pictures.length
    ? `<div class="event__photos-container">
        <div class="event__photos-tape">
          ${destination.pictures.map((picture) => `
            <img class="event__photo" src="${checkImageUrl(picture.src) ? picture.src : ''}" alt="${encodeHtml(picture.description)}">
          `).join('')}
        </div>
      </div>`
    : '';

  return `<section class="event__section  event__section--destination">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    <p class="event__destination-description">${encodeHtml(destination.description || '')}</p>
    ${imgTemplate}
  </section>`;
};

const createEditFormTemplate = (_state, destinationsList, offersByType) => {
  const currDestination = _state.destination;
  const availableOffer = offersByType[_state.type] || [];

  const formatDateForInput = (dateString) => dateString ? dayjs(dateString).format('DD/MM/YY HH:mm') : '';

  let resetButtonText;
  if (_state.isDeleting) {
    resetButtonText = 'Deleting...';
  } else {
    if (_state.id !== undefined) {
      resetButtonText = 'Delete';
    } else {
      resetButtonText = 'Cancel';
    }
  }

  return `<form class="event event--edit ${_state.isShake ? 'shake' : ''}" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${encodeHtml(_state.type)}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox" ${_state.isDisabled ? 'disabled' : ''}>
        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${TYPE.map((type) => `
              <div class="event__type-item">
                <input id="event-type-${encodeHtml(type)}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${encodeHtml(type)}" ${type === _state.type ? 'checked' : ''} ${_state.isDisabled ? 'disabled' : ''}>
                <label class="event__type-label  event__type-label--${encodeHtml(type)}" for="event-type-${encodeHtml(type)}-1">${encodeHtml(type)}</label>
              </div>
            `).join('')}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${encodeHtml(_state.type)}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${encodeHtml(currDestination ? currDestination.name : '')}" list="destination-list-1" ${_state.isDisabled ? 'disabled' : ''}>
        <datalist id="destination-list-1">
          ${destinationsList.map((dest) => `<option value="${encodeHtml(dest.name)}"></option>`).join('')}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${encodeHtml(formatDateForInput(_state.dateFrom))}" ${_state.isDisabled ? 'disabled' : ''}>
        —
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${encodeHtml(formatDateForInput(_state.dateTo))}" ${_state.isDisabled ? 'disabled' : ''}>
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          €
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="number" name="event-price" value="${encodeHtml(_state.basePrice)}" min="0" ${_state.isDisabled ? 'disabled' : ''}>
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit" ${_state.isDisabled ? 'disabled' : ''}>
        ${_state.isSaving ? 'Saving...' : 'Save'}
      </button>
      <button class="event__reset-btn" type="reset" ${_state.isDisabled ? 'disabled' : ''}>
        ${encodeHtml(resetButtonText)}
      </button>
      <button class="event__rollup-btn" type="button" ${_state.isDisabled ? 'disabled' : ''}>
        <span class="visually-hidden">Open event</span>
      </button>
    </header>
    ${renderOffersSection(availableOffer, _state.offers, _state.isDisabled)}
    ${renderDestinationSection(currDestination)}
  </form>`;
};

export default class EditElement extends AbstractStatefulView {
  #handleFormSubmit = null;
  #handleRollUpClick = null;
  #handleDeleteClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;
  #allDestinations = [];
  #allOffersByType = {};

  constructor({point, onFormSubmit, onRollUpClick, onDeleteClick, destinations, offersByType}) {
    super();
    this.#allDestinations = destinations;
    this.#allOffersByType = offersByType;
    this._state = EditElement.parsePoint(point, this.#allDestinations, this.#allOffersByType);
    this.#handleFormSubmit = onFormSubmit;
    this.#handleRollUpClick = onRollUpClick;
    this.#handleDeleteClick = onDeleteClick;

    this._restoreHandlers();
  }

  static parsePoint(point, allDestinations) {
    const state = structuredClone(point);

    if (typeof state.destination === 'number' || typeof state.destination === 'string') {
      state.destination = allDestinations.find((dest) => dest.id === state.destination) || null;
    }

    return {
      ...state,
      isDisabled: false,
      isSaving: false,
      isDeleting: false,
      isShake: false,
    };
  }

  get template() {
    return createEditFormTemplate(this._state, this.#allDestinations, this.#allOffersByType);
  }

  removeElement() {
    super.removeElement();
    [this.#datepickerFrom, this.#datepickerTo].forEach((picker) => picker?.destroy());
    this.#datepickerFrom = null;
    this.#datepickerTo = null;
  }

  _restoreHandlers() {
    if (this._state.isDisabled) {
      return;
    }
    this.element.addEventListener('submit', this.#onFormSubmit);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#onRollUpClick);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#onTypeChange);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#onDestinationChange);

    const offersElement = this.element.querySelector('.event__available-offers');
    if (offersElement) {
      offersElement.addEventListener('change', this.#onOfferChange);
    }

    const resetButton = this.element.querySelector('.event__reset-btn');
    if (resetButton && this.#handleDeleteClick) {
      resetButton.addEventListener('click', this.#resetButton);
    }

    this.element.querySelector('.event__input--price')
      .addEventListener('input', this.#onPriceInput);

    this.#initDatepickers();
  }

  #initDatepickers() {
    const commonConfig = {
      enableTime: true,
      'time_24hr': true,
      dateFormat: 'Z',
      altInput: true,
      altFormat: 'd/m/y H:i',
      allowInput: true,
    };

    this.#datepickerFrom = flatpickr(
      this.element.querySelector('#event-start-time-1'),
      {
        ...commonConfig,
        defaultDate: this._state.dateFrom,
        onClose: ([date]) => {
          this.updateElement({ dateFrom: date?.toISOString() || null });
          this.#datepickerTo?.set('minDate', date || null);
        },
      }
    );

    this.#datepickerTo = flatpickr(
      this.element.querySelector('#event-end-time-1'),
      {
        ...commonConfig,
        defaultDate: this._state.dateTo,
        minDate: this._state.dateFrom || null,
        onClose: ([date]) => {
          this.updateElement({ dateTo: date?.toISOString() || null });
        },
      }
    );
  }

  #onFormSubmit = (evt) => {
    evt.preventDefault();
    const point = EditElement.parseState(this._state);
    point.basePrice = Number(point.basePrice) || 0;
    this.#handleFormSubmit(point);
  };

  #onRollUpClick = (evt) => {
    evt.preventDefault();
    this.#handleRollUpClick();
  };

  #onTypeChange = (evt) => {
    evt.preventDefault();
    if (evt.target.classList.contains('event__type-input')) {
      this.updateElement({
        type: evt.target.value,
        offers: []
      });
    }
  };

  #onDestinationChange = (evt) => {
    evt.preventDefault();
    const enteredValue = evt.target.value.trim();

    const selectedDestination = this.#allDestinations.find(
      (dest) => dest.name.toLowerCase() === enteredValue.toLowerCase()
    );

    this.updateElement({
      destination: selectedDestination || '',
    });
  };

  #onOfferChange = (evt) => {
    if (evt.target.classList.contains('event__offer-checkbox')) {
      const offerId = evt.target.dataset.offerId;
      const updatedOffers = evt.target.checked
        ? [...this._state.offers, offerId]
        : this._state.offers.filter((id) => id !== offerId);
      this.updateElement({ offers: updatedOffers });
    }
  };

  #resetButton = (evt) => {
    evt.preventDefault();
    this.#handleDeleteClick(EditElement.parseState(this._state));
  };

  #onPriceInput = (evt) => {
    let priceValue = evt.target.value.replace(/\D/g, '');
    priceValue = priceValue === '' ? '0' : priceValue.replace(/^0+/, '') || '0';
    evt.target.value = priceValue;
    this.updateElement({ basePrice: Number(priceValue) });
  };

  reset(point) {
    this.updateElement(EditElement.parsePoint(point, this.#allDestinations, this.#allOffersByType));
  }

  static parseState(state) {
    const point = {...state};
    delete point.isDisabled;
    delete point.isSaving;
    delete point.isDeleting;
    delete point.isShake;
    return point;
  }
}
