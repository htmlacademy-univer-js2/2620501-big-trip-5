import AbstractView from '../framework/view/abstract-view.js';
import {encodeHtml} from '../utils.js';

const FilterItemTemplate = (filter, currentFilter) => (
  `<div class="trip-filters__filter">
    <input
      id="filter-${encodeHtml(filter.type)}"
      class="trip-filters__filter-input  visually-hidden"
      type="radio"
      name="trip-filter"
      value="${encodeHtml(filter.type)}"
      ${filter.type === currentFilter ? 'checked' : ''}
      ${filter.isDisabled ? 'disabled' : ''}
      ${filter.count === 0 && filter.type !== 'everything' ? 'disabled' : ''}
    >
    <label class="trip-filters__filter-label" for="filter-${encodeHtml(filter.type)}">${encodeHtml(filter.name)}</label>
  </div>`
);

const FilterTemplate = (filterItems, currentFilterType) => {
  const filterItemsTemplate = filterItems
    .map((filter) => FilterItemTemplate(filter, currentFilterType))
    .join('');

  return (
    `<form class="trip-filters" action="#" method="get">
      ${filterItemsTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`
  );
};

export default class FilterElement extends AbstractView {
  #filters = null;
  #currentFilterType = null;
  handleFilterChange = null;

  constructor({filters, currentFilterType, onFilterTypeChange}) {
    super();
    this.#filters = filters;
    this.#currentFilterType = currentFilterType;
    this.handleFilterChange = onFilterTypeChange;

    if (this.handleFilterChange) {
      this.element.addEventListener('change', this.#onFilterChange);
    }
  }

  get template() {
    return FilterTemplate(this.#filters, this.#currentFilterType);
  }

  #onFilterChange = (evt) => {
    evt.preventDefault();
    this.handleFilterChange(evt.target.value);
  };
}
