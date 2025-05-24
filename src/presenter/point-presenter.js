import {render, replace, remove} from '../framework/render.js';
import PointElement from '../view/point-element.js';
import PointEditElement from '../view/edit-element.js';

const status = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointContainer = null;
  #point = null;
  #destinations = [];
  #offeringType = {};
  #pointComponent = null;
  #pointEditComponent = null;
  #status = status.DEFAULT;
  #dataChange = null;
  #statusChange = null;


  constructor({pointContainer, destinations, offeringType, dataChange, statusChange}) {
    this.#pointContainer = pointContainer;
    this.#destinations = destinations;
    this.#offeringType = offeringType;
    this.#dataChange = dataChange;
    this.#statusChange = statusChange;
  }

  init(point) {
    this.#point = point;

    const prevComponent = this.#pointComponent;
    const prevEditComponent = this.#pointEditComponent;

    this.#pointComponent = new PointElement({
      point: this.#point,
      editClick: this.#editClick,
      favoriteClick: this.#favoriteClick,
    });

    this.#pointEditComponent = new PointEditElement({
      point: this.#point,
      destinations: this.#destinations,
      offeringType: this.#offeringType,
      formSubmit: this.#formSubmit,
      rollUpClick: this.#rollUpClick,
    });

    if (prevComponent === null || prevEditComponent === null) {
      render(this.#pointComponent, this.#pointContainer);
      return;
    }

    if (this.#status === status.DEFAULT) {
      replace(this.#pointComponent, prevComponent);
    }

    if (this.#status === status.EDITING) {
      replace(this.#pointEditComponent, prevEditComponent);
    }

    remove(prevComponent);
    remove(prevEditComponent);
  }

  destroy() {
    remove(this.#pointComponent);
    remove(this.#pointEditComponent);
    document.removeEventListener('keydown', this.#escKeyDown);
  }

  reset() {
    if (this.#status !== status.DEFAULT) {
      this.#replaceForm();
    }
  }

  #replaceCard = () => {
    replace(this.#pointEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDown);
    this.#status = status.EDITING;
    if (this.#statusChange) {
      this.#statusChange(this);
    }
  };

  #replaceForm = () => {
    if (this.#pointEditComponent && this.#pointEditComponent.element.parentElement) {
      replace(this.#pointComponent, this.#pointEditComponent);
    }
    document.removeEventListener('keydown', this.#escKeyDown);
    this.#status = status.DEFAULT;
  };

  #escKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#replaceForm();
    }
  };

  #editClick = () => {
    this.#replaceCard();
  };

  #formSubmit = () => {
    this.#replaceForm();
  };

  #rollUpClick = () => {
    this.#replaceForm();
  };

  #favoriteClick = () => {
    this.#dataChange({...this.#point, isFavorite: !this.#point.isFavorite});
  };
}
