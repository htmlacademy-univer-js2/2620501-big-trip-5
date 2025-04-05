import {render, replace} from '../framework/render.js';
import PointElement from '../view/point-element.js';
import PointEditElement from '../view/edit-element.js';
import SortView from '../view/sort-view.js';

export default class BoardPresenter {
  #container = null;
  #pointsModel = null;
  #tripEvents = null;

  #component = null;
  #editComponent = null;

  constructor({container, pointsModel}) {
    this.#container = container;
    const points = this.#pointsModel.points;
    render(new SortView(), this.#container);

    this.#tripEvents = document.createElement('ul');
    this.#tripEvents.classList.add('trip-events__list');
    this.#container.append(this.#tripEvents);

    for (let i = 0; i < points.length; i++) {
      this.#renderPoint(points[i]);
    }
  }

  #renderPoint(point) {
    this.#component = new PointElement({
      point: point,
      onEditClick: () => {
        replace(this.#editComponent, this.#component);
        document.addEventListener('keydown', this.#escKeyDownHandler);
      }
    });

    this.#editComponent = new PointEditElement({
      point: point,
      onFormSubmit: () => {
        replace(this.#component, this.#editComponent);
        document.removeEventListener('keydown', this.#escKeyDownHandler);
      },
      onRollUpClick: () => {
        replace(this.#component, this.#editComponent);
        document.removeEventListener('keydown', this.#escKeyDownHandler);
      }
    });

    render(this.#component, this.#tripEvents);
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      replace(this.#component, this.#editComponent);
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  };
}
