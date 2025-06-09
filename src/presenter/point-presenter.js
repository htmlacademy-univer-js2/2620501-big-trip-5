import {render, replace, remove} from '../framework/render.js';
import PointElement from '../view/point-element.js';
import EditElement from '../view/edit-element.js';
import {Actions} from '../constants.js';

const Status = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

export default class PointPresenter {
  #container = null;
  #point = null;
  #destinations = [];
  #offersByType = {};
  #pointElement = null;
  #editElement = null;

  #currentStatus = Status.DEFAULT;
  #handleDataChange = null;
  #handleModeChange = null;

  #isFavoriteUpdating = false;

  constructor({pointListContainer, destinations, offersByType, onDataChangeCallback, onModeChangeCallback}) {
    this.#container = pointListContainer;
    this.#destinations = destinations;
    this.#offersByType = offersByType;
    this.#handleDataChange = onDataChangeCallback;
    this.#handleModeChange = onModeChangeCallback;
  }

  init(point) {
    this.#point = point;

    const destination = this.#destinations.find((dest) => dest.id === this.#point.destination);
    const offers = this.#offersByType[this.#point.type] || [];

    const selectedPointOfferObjects = offers.filter((offer) => this.#point.offers.includes(offer.id));

    const prevPointView = this.#pointElement;
    const prevEditView = this.#editElement;

    this.#pointElement = new PointElement({
      point: { ...point, destination, selectedOffers: offers },
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick,
    });

    this.#editElement = new EditElement({
      point: this.#point,
      destinations: this.#destinations,
      offersByType: this.#offersByType,
      onFormSubmit: this.#handleFormSubmit,
      onRollUpClick: this.#handleRollUpClick,
      onDeleteClick: this.#handleDeleteClick,
    });

    if (prevPointView === null || prevEditView === null) {
      render(this.#pointElement, this.#container);
      return;
    }

    if (this.#currentStatus === Status.DEFAULT) {
      replace(this.#pointElement, prevPointView);
    }

    if (this.#currentStatus === Status.EDITING) {
      replace(this.#editElement, prevEditView);
    }

    remove(prevPointView);
    remove(prevEditView);
  }

  resetView() {
    if (this.#currentStatus !== Status.DEFAULT) {
      this.#switchToViewMode();
    }
  }

  setSaving() {
    if (this.#currentStatus === Status.EDITING && this.#editElement) {
      this.#editElement.updateElement({
        isDisabled: true,
        isSaving: true,
        isShake: false,
      });
    }
  }

  setDeleting() {
    if (this.#currentStatus === Status.EDITING && this.#editElement) {
      this.#editElement.updateElement({
        isDisabled: true,
        isDeleting: true,
        isShake: false,
      });
    }
  }

  setAborting() {
    if (this.#currentStatus === Status.EDITING && this.#editElement) {
      const resetFormState = () => {
        if (this.#editElement && this.#editElement.element && document.body.contains(this.#editElement.element)) {
          this.#editElement.updateElement({
            isDisabled: false,
            isSaving: false,
            isDeleting: false,
            isShake: false,
          });
        }
      };
      if (this.#editElement.element && document.body.contains(this.#editElement.element)) {
        this.#editElement.shake(resetFormState);
      }
    }
  }

  destroy() {
    remove(this.#pointElement);
    remove(this.#editElement);
    document.removeEventListener('keydown', this.#handleEscKey);
  }

  #switchToEditMode = () => {
    replace(this.#editElement, this.#pointElement);
    document.addEventListener('keydown', this.#handleEscKey);
    this.#currentStatus = Status.EDITING;
    if (this.#handleModeChange) {
      this.#handleModeChange(this);
    }
  };

  #switchToViewMode = () => {
    if (this.#editElement) {
      this.#editElement.reset(this.#point);
    }

    if (this.#editElement && this.#editElement.element.parentElement) {
      replace(this.#pointElement, this.#editElement);
    }
    document.removeEventListener('keydown', this.#handleEscKey);
    this.#currentStatus = Status.DEFAULT;
  };

  #handleEscKey = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#switchToViewMode();
    }
  };

  #handleEditClick = () => {
    this.#switchToEditMode();
  };

  #handleFormSubmit = async (pointFromForm) => {
    try {
      await this.#handleDataChange(Actions.UPDATE_POINT, pointFromForm);
      this.#switchToViewMode();
    } catch (err) {
      // Форма остается открытой при ошибке
    }
  };

  #handleDeleteClick = async () => {
    try {
      await this.#handleDataChange(Actions.DELETE_POINT, this.#point);
    } catch (err) {
      // Форма остается открытой при ошибке
    }
  };

  #handleRollUpClick = () => {
    this.#switchToViewMode();
  };

  #handleFavoriteClick = async () => {
    if (this.#isFavoriteUpdating) {
      return;
    }
    this.#isFavoriteUpdating = true;

    const originalValue = this.#point.isFavorite;

    if (this.#pointElement && typeof this.#pointElement.updateElement === 'function') {
      this.#pointElement.updateElement({ isFavoriteProcessing: true });
    }

    try {
      await this.#handleDataChange(
        Actions.UPDATE_POINT,
        {...this.#point, isFavorite: !this.#point.isFavorite}
      );
    } catch (err) {
      if (this.#pointElement && typeof this.#pointElement.updateElement === 'function') {
        this.#pointElement.updateElement({
          isFavorite: originalValue,
          isFavoriteProcessing: false
        });
        this.#pointElement.shake();
      }
    } finally {
      this.#isFavoriteUpdating = false;
    }
  };
}
