import {render, remove, RenderPosition} from '../framework/render.js';
import SortView, {SortType} from '../view/sort-view.js';
import EmptyPointElement from '../view/empty-points-element.js';
import PointPresenter from './point-presenter.js';
import {sortByDay, sortByTime, sortByPrice, filter} from '../utils.js';
import {Updates, UserActions, Filters, BLANK} from '../constants.js';
import LoadingElement from '../view/loading-element.js';
import PointEditElement from '../view/edit-element.js';

export default class Presenter {
  #container = null;
  #tripEvents = null;
  #sortingComponent = null;
  #emptyComponent = null;
  #pointPresenters = new Map();
  #sortType = SortType.DAY;
  #pointModel = null;
  #filterModel = null;
  #newPresenter = null;
  #loadingComponent = null;
  #isLoad = true;
  #formComponent = null;
  #isPointCreate = false;
  #uiBlocker = null;

  constructor({container, pointModel, filterModel, uiBlocker}) {
    this.#container = container;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;
    this.#pointModel.addObserver(this.#modelEvents);
    this.#filterModel.addObserver(this.#modelEvents);
    this.#uiBlocker = uiBlocker;
  }

  get points() {
    const currentFilter = this.#filterModel.filter;
    const allPoints = this.#pointModel.points;
    const allFilteredPoints = filter[currentFilter](allPoints);

    switch (this.#sortType) {
      case SortType.TIME:
        return allFilteredPoints.sort(sortByTime);

      case SortType.PRICE:
        return allFilteredPoints.sort(sortByPrice);

      case SortType.DAY:
      default:
        return allFilteredPoints.sort(sortByDay);
    }
  }

   get destinations() {
    return this.#pointModel.destinations;
  }

  get offerByType() {
    return this.#pointModel.offerByType;
  }

  init() {
    this.#renderBoard();
  }

  createPoint() {
    if (this.#isPointCreate) {
      return;
    }
    this.#isPointCreate = true;

    this.#sortType = SortType.DAY;
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#filterModel.setFilter(Updates.MAJOR, Filters.EVERYTHING);

    this.#formComponent = new PointEditElement({
      point: BLANK,
      destinations: this.destinations,
      offersByType: this.offerByType,
      onFormSubmit: this.#newFormSubmit,
      onRollUp: this.#newFormClose,
      onDelete: this.#newFormClose,
    });

    const targetElement = this.#tripEvents || this.#container;
    render(this.#formComponent, targetElement, RenderPosition.AFTERBEGIN);

    document.addEventListener('keydown', this.#escKeyDownPoint);

    const newButton = document.querySelector('.trip-main__event-add-btn');
    if (newButton) {
      newButton.disabled = true;
    }

  }

  #newFormSubmit = async (pointData) => {
    this.#formComponent.updateElement({ isDisabled: true, isSaving: true, isShake: false });
    try {
      await this.#viewAction(UserAction.ADD_POINT, pointData);
    } catch (err) {
      if (this.#formComponent && this.#formComponent.element && document.body.contains(this.#formComponent.element)) {
        this.#formComponent.shake(() => {
          if (this.#formComponent && this.#formComponent.element && document.body.contains(this.#formComponent.element)) {
            this.#formComponent.updateElement({ isDisabled: false, isSaving: false });
          }
        });
      }
    }
  };

  #newFormClose = () => {
    if (!this.#formComponent) {
      return;
    }
    this.#isPointCreate = false;
    remove(this.#formComponent);
    this.#formComponent = null;
    document.removeEventListener('keydown', this.#escKeyDownPoint);

    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    if (newEventButton) {
      newEventButton.disabled = false;
    }

    if (this.points.length === 0 && !this.#emptyComponent) {
      this.#clearingPoints();
      if(this.#tripEvents) {
        remove(this.#tripEvents);
        this.#tripEvents = null;
      }
      this.#renderEmptyList();
    }
  };

  #escKeyDownPoint = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#newFormClose();
    }
  };

  #viewAction = async (actionType, update) => {
    this.#uiBlocker.block();

    let success = false;

    try {
      switch (actionType) {
        case UserActions.UPDATE_POINT:
          this.#pointPresenters.get(update.id)?.setSaving();
          try {
            await this.#pointModel.updatePoint(update);
            success = true;
          } catch (errInternal) {
            this.#pointPresenters.get(update.id)?.setAborting();
          }
          break;
        case UserActions.ADD_POINT:
          this.#formComponent?.updateElement({ isDisabled: true, isSaving: true, isShake: false });
          try {
            await this.#pointModel.addPoint(update);
            success = true;
          } catch (errInternal) {
            this.#formComponent?.shake(() => {
              this.#formComponent.updateElement({ isDisabled: false, isSaving: false });
            });
          }
          break;
        case UserActions.DELETE_POINT:
          this.#pointPresenters.get(update.id)?.setDeleting();
          try {
            await this.#pointModel.deletePoint(update);
            success = true;
          } catch (errInternal) {
            this.#pointPresenters.get(update.id)?.setAborting();
          }
          break;
      }
    } catch (errOuter) {
      //console.error('[BoardPresenter] #handleViewAction - Outer logic or UI method error:', errOuter);
    } finally {
      this.#uiBlocker.unblock();
    }

    if (!success && actionType === UserActions.UPDATE_POINT && update.isFavorite !== undefined) {
      //проверка для обновления Favorite
    }
  };

  #modelEvents = (updateType, data) => {
    switch (updateType) {
      case Updates.PATCH:
        this.#pointPresenters.get(data.id).init(data);
        break;
      case Updates.MINOR:
        this.#clearingBoard();
        this.#renderBoard();
        break;
      case Updates.MAJOR:
        this.#clearingBoard({resetSortType: true});
        this.#renderBoard();
        break;
      case Updates.INIT:
        this.#isLoad = false;
        remove(this.#loadingComponent);
        this.#loadingComponent = null;
        this.#renderBoard();
        break;
    }
  };

  #sortTypeChange = (sortType) => {
    if (this.#sortType === sortType) {
      return;
    }
    this.#sortType = sortType;
    this.#clearingPoints();
    this.#renderPoints();
  };

  #modeChange = (activePresenter) => {
    this.#pointPresenters.forEach((presenter) => {
      if (presenter !== activePresenter) {
        presenter.resetView();
      }
    });
  };

  #clearingBoard({resetSortType = false} = {}) {
    if (this.#formComponent) {
      this.#newFormClose();
    }

    this.#clearingPoints();

    if (this.#sortingComponent) {
      remove(this.#sortingComponent);
      this.#sortingComponent = null;
    }

    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }

    if (this.#tripEvents) {
      this.#tripEvents.remove();
      this.#tripEvents = null;
    }

    if (resetSortType) {
      this.#sortType = SortType.DAY;
    }
  }

  #clearingPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderSort() {
    this.#sortingComponent = new SortView({
      sortType: this.#sortType,
      onSortTypeChange: this.#sortTypeChange
    });
    render(this.#sortingComponent, this.#container);
  }

  #renderEmptyList() {
    const ERROR_MESSAGE = 'Failed to load latest route information';
    let messageToShow;

    if (this.#pointModel.isLoadFailed) {
      messageToShow = ERROR_MESSAGE;
    }

    if (messageToShow) {
      this.#emptyComponent = new EmptyPointElement({ customMessage: messageToShow });
    } else {
      this.#emptyComponent = new EmptyPointElement({ messageType: this.#filterModel.filter });
    }
    render(this.#emptyComponent, this.#container);
  }

  #renderPoints() {
    const pointsToRender = this.points;
    for (let i = 0; i < pointsToRender.length; i++) {
      this.#renderPoint(pointsToRender[i]);
    }
  }

  #renderBoard() {
    if (this.#isLoad) {
      if (this.#loadingComponent === null) {
        this.#loadingComponent = new LoadingElement();
        render(this.#loadingComponent, this.#container);
      }
      return;
    }

     if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }

    const points = this.points;

    if (points.length === 0 && !this.#newPresenter) {
      this.#clearingPoints();
      if (this.#tripEvents) {
        remove(this.#tripEvents);
        this.#tripEvents = null;
      }
      remove(this.#sortingComponent);
      this.#sortingComponent = null;

      this.#renderEmptyList();
      return;
    }

    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }

    if(!this.#sortingComponent) {
      this.#renderSort();
    }

    if (!this.#tripEvents) {
      this.#tripEvents = document.createElement('ul');
      this.#tripEvents.classList.add('trip-events__list');
      this.#container.insertBefore(this.#tripEvents, this.#sortingComponent.element.nextSibling);
    }
    this.#renderPoints();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#tripEvents,
      destinations: this.destinations,
      offersByType: this.offerByType,
      onDataChange: this.#viewAction,
      onModeChange: this.#modeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }
}
