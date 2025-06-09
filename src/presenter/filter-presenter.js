import {render, replace, remove} from '../framework/render.js';
import FilterElement from '../view/filter-element.js';
import {filter} from '../utils';
import {Filters, Updates} from '../constants.js';

export default class FilterPresenter {
  #container = null;
  #model = null;
  #pointModel = null;
  #component = null;

  constructor({container, model, pointModel}) {
    this.#container = container;
    this.#model = model;
    this.#pointModel = pointModel;

    this.#pointModel.addObserver(this.#modelEvent);
    this.#model.addObserver(this.#modelEvent);
  }

  get filters() {
    const points = this.#pointModel.points;
    return Object.values(Filters).map((type) => {
      const filteredPoints = filter[type](points);
      return {
        type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        count: filteredPoints.length,
        isDisabled: type !== Filters.EVERYTHING && filteredPoints.length === 0,
      };
    });
  }

  init() {
    const currentFilters = this.filters;
    const previousFilters = this.#component;

    this.#component = new FilterElement({
      filters: currentFilters,
      currentFilterType: this.#model.filter,
      onFilterTypeChange: this.#filterTypeChange
    });

    if (previousFilters === null) {
      render(this.#component, this.#container);
      return;
    }
    replace(this.#component, previousFilters);
    remove(previousFilters);
  }

  #filterTypeChange = (filterType) => {
    if (this.#model.filter === filterType) {
      return;
    }
    this.#model.setFilter(Updates.MAJOR, filterType);
  };

  #modelEvent = () => {
    this.init();
  };
}
