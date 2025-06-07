import {render, replace, remove} from '../framework/render.js';
import PointElement from '../view/point-element.js';
import PointEditElement from '../view/edit-element.js';
import {UserActions} from '../constants.js';

const status = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #pointContainer = null;
  #point = null;
  #destinations = [];
  #offeringType = {};
  #pointElement = null;
  #pointEditElement = null;
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

    const prevElement = this.#pointElement;
    const prevEditElement = this.#pointEditElement;

    this.#pointElement = new PointElement({
      point: this.#point,
      editClick: this.#editClick,
      favoriteClick: this.#favoriteClick,
    });

    this.#pointEditElement = new PointEditElement({
      point: this.#point,
      destinations: this.#destinations,
      offeringType: this.#offeringType,
      formSubmit: this.#formSubmit,
      rollUpClick: this.#rollUpClick,
      deleteClick: this.#deleteClick,
    });

    if (prevElement === null || prevEditElement === null) {
      render(this.#pointElement, this.#pointContainer);
      return;
    }

    if (this.#status === status.DEFAULT) {
      replace(this.#pointElement, prevElement);
    }

    if (this.#status === status.EDITING) {
      replace(this.#pointEditElement, prevEditElement);
    }

    remove(prevElement);
    remove(prevEditElement);
  }

  destroy() {
    remove(this.#pointElement);
    remove(this.#pointEditElement);
    document.removeEventListener('keydown', this.#escKeyDown);
  }

  reset() {
    if (this.#status !== status.DEFAULT) {
      this.#replaceForm();
    }
  }

  #replaceCard = () => {
    replace(this.#pointEditElement, this.#pointElement);
    document.addEventListener('keydown', this.#escKeyDown);
    this.#status = status.EDITING;
    if (this.#statusChange) {
      this.#statusChange(this);
    }
  };

  #replaceForm = () => {
    if (this.#pointEditElement && this.#pointEditElement.element.parentElement) {
      replace(this.#pointElement, this.#pointEditElement);
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
    this.#dataChange(UserActions.UPDATE_POINT, {...this.#point, isFavorite: !this.#point.isFavorite});
  };

   #deleteClick = () => {
    this.#dataChange(UserActions.DELETE_POINT, this.#point);
  };
}
