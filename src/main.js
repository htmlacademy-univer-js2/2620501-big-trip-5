import TaskButtonElement from './view/task-button-element.js';
import FilterElement from './view/filter-element.js';
import {render} from './render.js';
import BoardPresenter from './presenter/presenter.js';

const mainElement = document.querySelector('.page-main');
const headerElement = document.querySelector('.trip-controls__filters');
const presenter = new BoardPresenter({boardContainer: mainElement});

render(new TaskButtonElement(), headerElement);
render(new FilterElement(), headerElement);

presenter.init();
