import {render, remove} from '../framework/render.js';
import SortView, {SortType} from '../view/sort-view.js';
import EmptyPointElement from '../view/empty-points-element.js';
import PointPresenter from './point-presenter.js';
import {sortByDay, sortByTime, sortByPrice, filter} from '../utils.js';
import {Updates, UserActions, Filters} from '../constants.js';
import LoadingElement from '../view/loading-element.js';

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

  constructor({container, pointModel, filterModel}) {
    this.#container = container;
    this.#pointModel = pointModel;
    this.#filterModel = filterModel;
    this.#pointModel.addObserver(this.#modelEvents);
    this.#filterModel.addObserver(this.#modelEvents);
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
    this.#filterModel.setFilter(Updates.MAJOR, Filters.EVERYTHING);
    this.#sortType = SortType.DAY;

    this.#pointPresenters.forEach((presenter) => presenter.resetView());

    if (this.#newPresenter) {
      this.#newPresenter.destroy();
    }

  }

  #viewAction = (actionType, update) => {
    switch (actionType) {
      case UserActions.UPDATE_POINT:
        this.#pointModel.updatePoint(update);
        break;
      case UserActions.ADD_POINT:
        this.#pointModel.addPoint(update);
        break;
      case UserActions.DELETE_POINT:
        this.#pointModel.deletePoint(update);
        break;
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

  #dataChange = (updatedPoint) => {
    this.#pointModel.updatePoint(updatedPoint);
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
      this.#emptyComponent = new EmptyPointsView({ customMessage: messageToShow });
    } else {
      this.#emptyComponent = new EmptyPointsView({ messageType: this.#filterModel.filter });
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
