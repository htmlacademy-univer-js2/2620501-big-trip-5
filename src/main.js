import Presenter from './presenter/presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointModel from './model/model.js';
import FiltersModel from './model/filters-model.js';
import TripApi from './trip-api.js';

const LICENSE = 'Basic hS2sfS44wcl1sa2j';
const END = 'https://24.objects.htmlacademy.pro/big-trip';

const mainElement = document.querySelector('.trip-events');
const headerElement = document.querySelector('.trip-controls__filters');
const tripApi = new TripApi(END, LICENSE);

const pointModel = new PointModel({apiService: tripApi});
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
pointModel.init();
