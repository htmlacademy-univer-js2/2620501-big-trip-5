import {render, remove, RenderPosition} from '../framework/render.js';
import {sortByDay, sortByTime, sortByPrice, filterPointsByTime} from '../utils.js';
import {Updates, Actions, Filters, BLANK} from '../constants.js';
import PointPresenter from './point-presenter.js';
import EditElement from '../view/edit-element.js';
import EmptyElement from '../view/empty-element.js';
import LoadingElement from '../view/loading-element.js';
import SortElement, {SortType} from '../view/sort-element.js';

const ERROR = 'Failed to load latest route information';

export default class Presenter {
  #сontainer = null;
  #pointsModel = null;
  #filtersModel = null;
  #uiBlocker = null;

  #pointsListElement = null;
  #sortView = null;
  #emptyListView = null;
  #loadingView = null;
  #newPointView = null;

  #pointPresenters = new Map();
  #currentSortType = SortType.DAY;
  #isLoading = true;
  #isCreatingNewPoint = false;

  constructor({boardContainer, pointsModel, filtersModel, uiBlocker}) {
    this.#сontainer = boardContainer;
    this.#pointsModel = pointsModel;
    this.#filtersModel = filtersModel;
    this.#uiBlocker = uiBlocker;

    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#filtersModel.addObserver(this.#handleModelEvent);
  }

  get points() {
    const filteredPoints = filterPointsByTime[this.#filtersModel.filter](this.#pointsModel.points);

    switch (this.#currentSortType) {
      case SortType.TIME:
        return filteredPoints.sort(sortByTime);
      case SortType.PRICE:
        return filteredPoints.sort(sortByPrice);
      case SortType.DAY:
      default:
        return filteredPoints.sort(sortByDay);
    }
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offersType() {
    return this.#pointsModel.offersByType;
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    if (this.#isCreatingNewPoint) {
      return;
    }
    this.#isCreatingNewPoint = true;
    this.#currentSortType = SortType.DAY;
    this.#filtersModel.setFilter(Updates.MAJOR, Filters.EVERYTHING);
    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    this.#newPointView = new EditElement({
      point: BLANK,
      destinations: this.destinations,
      offersByType: this.offersType,
      onFormSubmit: this.#handleNewPointSubmit,
      onRollUpClick: this.#closeNewPointForm,
      onDeleteClick: this.#closeNewPointForm,
    });

    const targetContainer = this.#pointsListElement || this.#сontainer;
    render(this.#newPointView, targetContainer, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#handleNewPointEscKey);

    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    newEventButton?.setAttribute('disabled', '');
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#pointsListElement,
      destinations: this.destinations,
      offersByType: this.offersType,
      onDataChangeCallback: this.#handleViewAction,
      onModeChangeCallback: this.#handlePointModeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #clearBoard({resetSortType = false} = {}) {
    if (this.#newPointView) {
      this.#closeNewPointForm();
    }

    this.#clearPoints();

    if (this.#sortView) {
      remove(this.#sortView);
      this.#sortView = null;
    }
    if (this.#emptyListView) {
      remove(this.#emptyListView);
      this.#emptyListView = null;
    }
    if (this.#pointsListElement) {
      this.#pointsListElement.remove();
      this.#pointsListElement = null;
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DAY;
    }
  }

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderSortView() {
    this.#sortView = new SortElement({
      currentSortType: this.#currentSortType,
      onSortTypeChange: this.#handleSortTypeChange
    });
    render(this.#sortView, this.#сontainer);
  }

  #renderEmptyListView() {
    let messageToShow;

    if (this.#pointsModel.isLoadFailed) {
      messageToShow = ERROR;
    }

    if (messageToShow) {
      this.#emptyListView = new EmptyElement({ customMessage: messageToShow });
    } else {
      this.#emptyListView = new EmptyElement({ messageType: this.#filtersModel.filter });
    }

    render(this.#emptyListView, this.#сontainer);
  }

  #renderPointsList() {
    const pointsToRender = this.points;
    for (let i = 0; i < pointsToRender.length; i++) {
      this.#renderPoint(pointsToRender[i]);
    }
  }

  #renderBoard() {
    if (this.#isLoading) {
      if (this.#loadingView === null) {
        this.#loadingView = new LoadingElement();
        render(this.#loadingView, this.#сontainer);
      }
      return;
    }

    if (this.#loadingView) {
      remove(this.#loadingView);
      this.#loadingView = null;
    }

    const points = this.points;

    if (points.length === 0) {
      this.#clearPoints();
      if (this.#pointsListElement) {
        remove(this.#pointsListElement);
        this.#pointsListElement = null;
      }
      remove(this.#sortView);
      this.#sortView = null;
      this.#renderEmptyListView();
      return;
    }

    if (this.#emptyListView) {
      remove(this.#emptyListView);
      this.#emptyListView = null;
    }

    if(!this.#sortView) {
      this.#renderSortView();
    }

    if (!this.#pointsListElement) {
      this.#pointsListElement = document.createElement('ul');
      this.#pointsListElement.classList.add('trip-events__list');
      this.#сontainer.insertBefore(this.#pointsListElement, this.#sortView.element.nextSibling);
    }
    this.#renderPointsList();
  }

   #closeNewPointForm = () => {
    if (!this.#newPointView) {
      return;
    }
    this.#isCreatingNewPoint = false;
    remove(this.#newPointView);
    this.#newPointView = null;
    document.removeEventListener('keydown', this.#handleNewPointEscKey);

    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    if (newEventButton) {
      newEventButton.disabled = false;
    }

    if (this.points.length === 0 && !this.#emptyListView) {
      this.#clearPoints();
      if(this.#pointsListElement) {
        remove(this.#pointsListElement);
        this.#pointsListElement = null;
      }
      this.#renderEmptyListView();
    }
  };

  #handleNewPointSubmit = async (pointData) => {
    this.#newPointView.updateElement({ isDisabled: true, isSaving: true, isShake: false });
    try {
      await this.#handleViewAction(Actions.ADD_POINT, pointData);
    } catch (err) {
      if (this.#newPointView && this.#newPointView.element && document.body.contains(this.#newPointView.element)) {
        this.#newPointView.shake(() => {
          if (this.#newPointView && this.#newPointView.element && document.body.contains(this.#newPointView.element)) {
            this.#newPointView.updateElement({ isDisabled: false, isSaving: false });
          }
        });
      }
    }
  };

  #handleNewPointEscKey = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#closeNewPointForm();
    }
  };

  #handleViewAction = async (actionType, update) => {
    this.#uiBlocker.block();

    try {
      switch (actionType) {
        case Actions.UPDATE_POINT:
          this.#pointPresenters.get(update.id)?.setSaving();
          try {
            await this.#pointsModel.updatePoint(update);
          } catch (errInternal) {
            this.#pointPresenters.get(update.id)?.setAborting();
            throw errInternal;
          }
          break;
        case Actions.ADD_POINT:
          this.#newPointView?.updateElement({ isDisabled: true, isSaving: true, isShake: false });
          try {
            await this.#pointsModel.addPoint(update);
          } catch (errInternal) {
            this.#newPointView?.shake(() => {
              this.#newPointView.updateElement({ isDisabled: false, isSaving: false });
            });
            throw errInternal;
          }
          break;
        case Actions.DELETE_POINT:
          this.#pointPresenters.get(update.id)?.setDeleting();
          try {
            await this.#pointsModel.deletePoint(update);
          } catch (errInternal) {
            this.#pointPresenters.get(update.id)?.setAborting();
            throw errInternal;
          }
          break;
      }
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleModelEvent = (updateType, data) => {
    switch (updateType) {
      case Updates.PATCH:
        if (this.#pointPresenters.has(data.id)) {
          this.#pointPresenters.get(data.id).init(data);
        }
        break;
      case Updates.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case Updates.MAJOR:
        this.#clearBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case Updates.INIT:
        this.#isLoading = false;
        remove(this.#loadingView);
        this.#loadingView = null;
        this.#renderBoard();
        break;
    }
  };

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#clearBoard({resetSortType: false});
    this.#renderBoard();
  };

  #handlePointModeChange = (activePresenter) => {
    if (this.#newPointView) {
      this.#closeNewPointForm();
    }

    this.#pointPresenters.forEach((presenter) => {
      if (presenter !== activePresenter) {
        presenter.resetView();
      }
    });
  };
}
