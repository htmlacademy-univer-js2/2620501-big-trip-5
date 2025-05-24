import {render, remove} from '../framework/render.js';
import SortView, {SortType} from '../view/sort-view.js';
import EmptyPointElement from '../view/empty-points-element.js';
import PointPresenter from './point-presenter.js';
import {sortByDay, sortByTime, sortByPrice} from '../utils.js';

export default class Presenter {
  #container = null;
  #tripEvents = null;
  #routePoints = [];
  #destinations = [];
  #offersByType = {};
  #sortingComponent = null;
  #emptyComponent = null;
  #pointPresenters = new Map();
  #sortType = SortType.DAY;

  constructor({container}) {
    this.#container = container;
  }
  init(routePoints, destinations, offersByType) {
    this.#routePoints = [...routePoints];
    this.#destinations = destinations;
    this.#offersByType = offersByType;

    this.#sortPoints(this.#sortType);
    this.#clearingBoard({resetSortType: false});
    this.#renderBoard();
  }

  #sortPoints(sortType) {
    switch (sortType) {
      case SortType.TIME:
        this.#routePoints.sort(sortByTime);
        break;
      case SortType.PRICE:
        this.#routePoints.sort(sortByPrice);
        break;
      case SortType.DAY:
      default:
        this.#routePoints.sort(sortByDay);
    }
    this.#sortType = sortType;
  }

  #sortTypeChange = (sortType) => {
    if (this.#sortType === sortType) {
      return;
    }
    this.#sortPoints(sortType);
    this.#clearPoints();
    this.#renderPoints();
  };

  #dataChange = (updatedPoint) => {
    this.#routePoints = this.#routePoints.map((point) => point.id === updatedPoint.id ? updatedPoint : point);
    this.#pointPresenters.get(updatedPoint.id).init(updatedPoint);
  };
  #modeChange = (activePresenter) => {
    this.#pointPresenters.forEach((presenter) => {
      if (presenter !== activePresenter) {
        presenter.resetView();
      }
    });
  };

  #clearingBoard({resetSortType = false} = {}) {
    this.#clearPoints();

    if (this.#sortingComponent) {
      remove(this.#sortingComponent);
      this.#sortingComponent = null;
    }
    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }
    if (resetSortType) {
      this.#sortType = SortType.DAY;
    }
  }

  #clearPoints() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
  }

  #renderSort() {
    this.#sortingComponent = new SortView({
      onSortTypeChange: this.#sortTypeChange
    });
    const currentSortInput = this.#sortingComponent.element.querySelector(`[data-sort-type="${this.#sortType}"]`);
    if (currentSortInput) {
      const inputId = currentSortInput.htmlFor || currentSortInput.id;
      const inputElement = this.#sortingComponent.element.querySelector(`#${inputId.startsWith('sort-') ? inputId : `sort-${this.#sortType}`}`);
      if(inputElement) {
        inputElement.checked = true;
      }
    }
    render(this.#sortingComponent, this.#container);
  }

  #renderPoints() {
    for (let i = 0; i < this.#routePoints.length; i++) {
      this.#renderPoint(this.#routePoints[i]);
    }
  }

  #renderBoard() {
    if (this.#routePoints.length === 0 && !this.#emptyComponent) { // Рисуем пустое, только если его еще нет
      if (this.#tripEvents) {
        remove(this.#tripEvents);
        this.#tripEvents = null;
      }
      this.#emptyComponent = new EmptyPointElement();
      render(this.#emptyComponent, this.#container);
      if (!this.#sortingComponent) {
        this.#renderSort();
      }
      return;
    }

    if (this.#emptyComponent) {
      remove(this.#emptyComponent);
      this.#emptyComponent = null;
    }

    if (!this.#sortingComponent) {
      this.#renderSort();
    }

    if (!this.#tripEvents) {
      this.#tripEvents = document.createElement('ul');
      this.#tripEvents.classList.add('trip-events__list');
      if(this.#sortingComponent && this.#sortingComponent.element.nextSibling) {
        this.#container.insertBefore(this.#tripEvents, this.#sortingComponent.element.nextSibling);
      } else {
        this.#container.append(this.#tripEvents);
      }
    }
    this.#renderPoints();
  }

  #renderPoint(point) {
    const pointPresenter = new PointPresenter({
      pointListContainer: this.#tripEvents,
      destinations: this.#destinations,
      offersByType: this.#offersByType,
      onDataChange: this.#dataChange,
      onModeChange: this.#modeChange,
    });
    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }
}
