import {render, replace, remove} from '../framework/render.js';
import PointElement from '../view/point-element.js';
import PointEditElement from '../view/edit-element.js';
import SortView from '../view/sort-view.js';
import EmptyPointsView from '../view/empty-points-view.js';

export default class BoardPresenter {
  #container = null;
  #tripEvents = null;
  #routePoints = [];
  #destinations = [];
  #offersByType = {};

  #component = null;
  #emptyComponent = null;

  constructor({container}) {
    this.#container = container;

  }

  init(routePoints, destinations, offersByType) {
    this.#routePoints = routePoints;
    this.#destinations = destinations;
    this.#offersByType = offersByType;

    this.#clearBoard();

    this.#renderBoard();
  }

  #clearBoard() {
    if (this.#tripEvents) {
      this.#tripEvents.innerHTML = '';
      remove(this.#tripEvents);
      this.#tripEvents = null;
    }
    if (this.#component) {
      remove(this.#component);
      this.#component = null;
    }
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
  }

  #renderBoard() {
    if (this.#routePoints.length === 0) {
      this.#emptyComponent = new EmptyPointsView();
      render(this.#emptyComponent, this.container);
      return;
    }

    this.#component = new SortView();
    render(this.#component, this.container);

    this.#tripEvents = document.createElement('ul');
    this.#tripEvents.classList.add('trip-events__list');
    this.#container.append(this.#tripEvents);

    for (let i = 0; i < this.#routePoints.length; i++) {
      this.#renderPoint(this.#routePoints[i]);
    }
  }

  #renderPoint(point) {
    let pointComponent = null;
    let pointEditComponent = null;
    function escKeyDownHandler(evt) {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        replace(pointComponent, pointEditComponent);
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    }
    pointComponent = new PointElement({
      point: point,
      onEditClick: () => {
        replace(pointEditComponent, pointComponent);
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    pointEditComponent = new PointEditElement({
      point: point,
      destinations: this.#destinations,
      offersByType: this.#offersByType,
      onFormSubmit: () => {
        replace(pointComponent, pointEditComponent);
        document.removeEventListener('keydown', escKeyDownHandler);
      },
      onRollUpClick: () => {
        replace(pointComponent, pointEditComponent);
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    });

    render(pointComponent, this.#tripEvents);
  }
}
