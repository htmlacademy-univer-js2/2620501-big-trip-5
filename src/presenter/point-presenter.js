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
  _isFavoriteUpdating = false;

  constructor({pointContainer, destinations, offeringType, dataChange, statusChange}) {
    this.#pointContainer = pointContainer;
    this.#destinations = destinations;
    this.#offeringType = offeringType;
    this.#dataChange = dataChange;
    this.#statusChange = statusChange;
  }

  init(point) {
    this.#point = point;

    const destinationObject = this.#destinations.find((dest) => dest.id === this.#point.destination);
    const availableOffers = this.#offeringType[this.#point.type] || [];
    const selectedOffers = availableOffers.filter((offer) => this.#point.offers.includes(offer.id));

    const prevElement = this.#pointElement;
    const prevEditElement = this.#pointEditElement;

    this.#pointElement = new PointElement({
      point: {
        ...this.#point,
        destination: destinationObject,
        selectedOffers: selectedOffers,
      },
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

  #formSubmit = async (pointFromForm) => {
    try {
      await this.#dataChange(UserActions.UPDATE_POINT, pointFromForm);
      this.#replaceForm();
    } catch (err) {
      // Обработка ошибки
    }
  };

  #rollUpClick = () => {
    this.#replaceForm();
  };

  #favoriteClick = async () => {
    if (this._isFavoriteUpdating) {
      return;
    }
    this._isFavoriteUpdating = true;

    const originalIsFavorite = this.#point.isFavorite;

    try {
      await this.#dataChange(
        UserActions.UPDATE_POINT,
        {...this.#point, isFavorite: !this.#point.isFavorite}
      );
    } catch (err) {
      if (this.#pointElement && typeof this.#pointElement.updateElement === 'function') {
        this.#pointElement.updateElement({
          isFavorite: originalIsFavorite,
          isFavoriteProcessing: false
        });
      }
    } finally {
      this._isFavoriteUpdating = false;
    }
  };

  setSaving() {
    if (this.#status === status.EDITING && this.#pointEditElement) {
      this.#pointEditElement.updateElement({
        isDisabled: true,
        isSaving: true,
        isShake: false,
      });
    }
  }

  setDeleting() {
    if (this.#status === status.EDITING && this.#pointEditElement) {
      this.#pointEditElement.updateElement({
        isDisabled: true,
        isDeleting: true,
        isShake: false,
      });
    }
  }

  setAborting() {
    if (this.#status === status.EDITING && this.#pointEditElement) {
      const resetFormState = () => {
        if (this.#pointEditElement && this.#pointEditElement.element && document.body.contains(this.#pointEditElement.element)) {
          this.#pointEditElement.updateElement({
            isDisabled: false,
            isSaving: false,
            isDeleting: false,
            isShake: false,
          });
        }
      };
      if (this.#pointEditElement.element && document.body.contains(this.#pointEditElement.element)) {
        this.#pointEditElement.shake(resetFormState);
      }
    }
  }

  #deleteClick = async () => {
    try {
      await this.#dataChange(UserActions.DELETE_POINT, this.#point);
    } catch (err) {
      //оработка ошибки
    }
  };
}
