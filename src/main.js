import Presenter from './presenter/presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import PointModel from './model/model.js';
import FiltersModel from './model/filters-model.js';
import TripApi from './trip-api.js';
import UiBlocker from './framework/ui-blocker/ui-blocker.js';
import TripPresenter from './presenter/trip-presenter.js';

const LICENSE = 'Basic hS2sfS44wcl1sa2j';
const END = 'https://24.objects.htmlacademy.pro/big-trip';
const limit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};
const uiBlocker = new UiBlocker({
  lowerLimit: limit.LOWER_LIMIT,
  upperLimit: limit.UPPER_LIMIT
});

const mainElement = document.querySelector('.trip-events');
const tripMainElement = document.querySelector('.trip-main');
const headerElement = document.querySelector('.trip-controls__filters');
const tripApi = new TripApi(END, LICENSE);

const pointModel = new PointModel({apiService: tripApi});
const filterModel = new FiltersModel();
const eventButton = document.querySelector('.trip-main__event-add-btn');

const presenter = new Presenter({
  mainElement: mainElement,
  pointModel: pointModel,
  filterModel: filterModel,
  uiBlocker: uiBlocker,
});

const filterPresenter = new FilterPresenter({
  filterContainer: headerElement,
  pointModel: pointModel,
  filterModel: filterModel,
});

const tripPresenter = new TripPresenter({
  tripMainElement: tripMainElement,
  pointModel: pointModel
});

tripPresenter.init();
filterPresenter.init();
presenter.init();
pointModel.init()
  .finally(() => {
    if (eventButton) {
      eventButton.disabled = false;
      eventButton.addEventListener('click', (evt) => {
        evt.preventDefault();
        presenter.createPoint();
      });
    }
  });
