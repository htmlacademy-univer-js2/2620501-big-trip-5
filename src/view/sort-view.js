import AbstractView from '../framework/view/abstract-view.js';

export const SortType = {
  DAY: 'day',
  EVENT: 'event',
  TIME: 'time',
  PRICE: 'price',
  OFFER: 'offer',
};

const sortTemplate = () => (
  `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
    <div class="trip-sort__item  trip-sort__item--day">
      <input id="sort-day" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-day" data-sort-type="${SortType.DAY}" checked>
      <label class="trip-sort__btn" for="sort-day" data-sort-type="${SortType.DAY}">Day</label>
    </div>
    <div class="trip-sort__item  trip-sort__item--event">
      <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-event" data-sort-type="${SortType.EVENT}" disabled>
      <label class="trip-sort__btn" for="sort-event" data-sort-type="${SortType.EVENT}">Event</label>
    </div>
    <div class="trip-sort__item  trip-sort__item--time">
      <input id="sort-time" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-time" data-sort-type="${SortType.TIME}">
      <label class="trip-sort__btn" for="sort-time" data-sort-type="${SortType.TIME}">Time</label>
    </div>
    <div class="trip-sort__item  trip-sort__item--price">
      <input id="sort-price" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-price" data-sort-type="${SortType.PRICE}">
      <label class="trip-sort__btn" for="sort-price" data-sort-type="${SortType.PRICE}">Price</label>
    </div>
    <div class="trip-sort__item  trip-sort__item--offer">
      <input id="sort-offer" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="sort-offer" data-sort-type="${SortType.OFFER}" disabled>
      <label class="trip-sort__btn" for="sort-offer" data-sort-type="${SortType.OFFER}">Offers</label>
    </div>
  </form>`
);

export default class SortView extends AbstractView {
  #typeChange = null;

  constructor({onTypeChange}) {
    super();
    this.#typeChange = onTypeChange;
    this.element.addEventListener('click', this.#changeHandler);
  }

  get template() {
    return sortTemplate();
  }

  #changeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL' && evt.target.tagName !== 'INPUT') {
      return;
    }

    const sortType = evt.target.dataset.sortType || document.querySelector(`label[for="${evt.target.id}"]`).dataset.sortType;

    if (!sortType || evt.target.disabled) {
      return;
    }
    evt.preventDefault();
    this.#typeChange(sortType);
  };
}
