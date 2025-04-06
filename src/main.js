import FilterElement from './view/filter-element.js';
import {render} from './framework/render.js';
import BoardPresenter from './presenter/presenter.js';
import {generateRoute, DESTINATION, EXTRA_TYPE} from './point/point.js';

const mainElement = document.querySelector('.trip-events');
const headerElement = document.querySelector('.trip-controls__filters');

const routePoints = generateRoute(5);

const adaptedRoute = routePoints.map((point) => {
  const destination = DESTINATION.find((dest) => dest.id === point.destination);
  const pointType = EXTRA_TYPE[point.type] || [];
  const selectedOffers = pointType.filter((offer) => point.offers.includes(offer.id));

  return {
    ...point,
    destination,
    selectedOffers
  };
});

const filter = {
  everything: adaptedRoute.length > 0,
  future: true,
  present: true,
  past: true
};

const boardPresenter = new BoardPresenter({
  boardContainer: mainElement,
});

render(new FilterElement(filter), headerElement);
boardPresenter.init(adaptedRoute, DESTINATION, EXTRA_TYPE);
