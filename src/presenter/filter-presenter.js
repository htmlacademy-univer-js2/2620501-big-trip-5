import {render, replace, remove} from '../framework/render.js';
import FilterElement from '../view/filter-element.js';
import {Filters, Updates} from '../constants.js';
import {filterPointsByTime} from '../utils';

export default class FilterPresenter {
  #container = null;
  #filtersModel = null;
  #pointsModel = null;
  #filtersView = null;

  constructor({filterContainer, filtersModel, pointsModel}) {
    this.#container = filterContainer;
    this.#filtersModel = filtersModel;
    this.#pointsModel = pointsModel;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filtersModel.addObserver(this.#handleModelEvent);
  }

  get filters() {
    return Object.values(Filters).map((type) => {
      const filteredPoints = filterPointsByTime[type](this.#pointsModel.points);
      return {
        type,
        name: type.charAt(0).toUpperCase() + type.slice(1),
        count: filteredPoints.length,
        isDisabled: type !== Filters.EVERYTHING && filteredPoints.length === 0,
      };
    });
  }

  init() {
    const filters = this.filters;
    const prevFilterComponent = this.#filtersView ;

    this.#filtersView = new FilterElement({
      filters,
      currentFilterType: this.#filtersModel.filter,
      onFilterTypeChange: this.#handleFilterChange
    });

    if (prevFilterComponent === null) {
      render(this.#filtersView , this.#container);
      return;
    }
    replace(this.#filtersView , prevFilterComponent);
    remove(prevFilterComponent);
  }

  #handleFilterChange = (filterType) => {
    if (this.#filtersModel.filter === filterType) {
      return;
    }
    this.#filtersModel.setFilter(Updates.MAJOR, filterType);
  };

  #handleModelEvent = () => {
    this.init();
  };
}

