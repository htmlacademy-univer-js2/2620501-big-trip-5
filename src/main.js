import Presenter from './presenter/presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripPresenter from './presenter/trip-presenter.js';
import Model from './model/model.js';
import FilterModel from './model/filters-model.js';
import TripApi from './trip-api-service.js';
import {getRandomStr} from './utils.js';
import UiBlocker from './framework/ui-blocker/ui-blocker.js';

const limit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

const LICENSE = `Basic ${getRandomStr()}`;
const END = 'https://24.objects.htmlacademy.pro/big-trip';

const mainElement = document.querySelector('.trip-events');
const headerElement = document.querySelector('.trip-controls__filters');
const tripMainElement = document.querySelector('.trip-main');

const apiTrip = new TripApi(END, LICENSE);
const model = new Model({apiTrip});
const filterModel = new FilterModel();

const uiBlocker = new UiBlocker({
  lowerLimit: limit.LOWER_LIMIT,
  upperLimit: limit.UPPER_LIMIT
});

const presenter = new Presenter({
  boardContainer: mainElement,
  pointsModel: model,
  filtersModel: filterModel,
  uiBlocker: uiBlocker,
});

const filterPresenter = new FilterPresenter({
  filterContainer: headerElement,
  pointsModel: model,
  filtersModel: filterModel,
});

const tripPresenter = new TripPresenter({
  tripMainContainer: tripMainElement,
  pointsModel: model
});

const newEventButton = document.querySelector('.trip-main__event-add-btn');

filterPresenter.init();
tripPresenter.init();
presenter.init();
model.init()
  .finally(() => {
    if (newEventButton) {
      newEventButton.disabled = false;
      newEventButton.addEventListener('click', (evt) => {
        evt.preventDefault();
        presenter.createPoint();
      });
    }
  });
