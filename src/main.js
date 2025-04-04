import FilterElement from './view/filter-element.js';
import {render} from './render.js';
import BoardPresenter from './presenter/presenter.js';
import PointsModel from './model/points-model.js';
import SortView from './view/sort-view.js';

const mainElement = document.querySelector('.trip-events');
const headerElement = document.querySelector('.trip-controls__filters');

const pointsModel = new PointsModel();
const boardPresenter = new BoardPresenter({
  boardContainer: mainElement,
  pointsModel
});

render(new FilterElement(), headerElement);
boardPresenter.init();

const sortComponent = new SortView();
render(sortComponent, mainElement);
