import Presenter from './presenter/board-presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointModel from './model/model.js';
import FiltersModel from './model/filters-model.js';

const mainElement = document.querySelector('.trip-events');
const headerElement = document.querySelector('.trip-controls__filters');

const pointModel = new PointModel();
const filterModel = new FiltersModel();

const presenter = new Presenter({
  boardContainer: mainElement,
  pointsModel: pointModel,
  filtersModel: filterModel,
});

const filterPresenter = new FilterPresenter({
  filterContainer: headerElement,
  pointsModel: pointModel,
  filtersModel: filterModel,
});

filterPresenter.init();
presenter.init();
