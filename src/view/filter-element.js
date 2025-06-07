import AbstractView from '../framework/view/abstract-view.js';

const filterItemTemplate = (filter, currentFilter) => (
  `<div class="trip-filters__filter">
    <input
      id="filter-${filter.type}"
      class="trip-filters__filter-input  visually-hidden"
      type="radio"
      name="trip-filter"
      value="${filter.type}"
      ${filter.type === currentFilter ? 'checked' : ''}
      ${filter.isDisabled ? 'disabled' : ''}
      ${filter.count === 0 && filter.type !== 'everything' ? 'disabled' : ''}
    >
    <label class="trip-filters__filter-label" for="filter-${filter.type}">${filter.name}</label>
  </div>`
);

const FilterTemplate = (filterItems, currentFilterType) => {
  const filterItemsTemplate = filterItems
    .map((filter) => filterItemTemplate(filter, currentFilterType))
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
  #currentFilter = null;
  #filterChange = null;

  constructor({filters, currentFilter, filterChange}) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this.#filterChange = filterChange;

    if (this.#filterChange) {
      this.element.addEventListener('change', this.#onFilterChange);
    }
  }

  get template() {
    return FilterTemplate(this.#filters, this.#currentFilter);
  }

  #onFilterChange = (evt) => {
    evt.preventDefault();
    this.#filterChange(evt.target.value);
  };
}
