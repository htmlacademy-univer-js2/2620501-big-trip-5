import {render, replace, remove, RenderPosition} from '../framework/render.js';
import TripElement from '../view/trip-element.js';
import {sortByDay} from '../utils.js';
import dayjs from 'dayjs';

export default class TripPresenter {
  #container = null;
  #pointsModel = null;
  #tripElement = null;

  constructor({tripMainContainer, pointsModel}) {
    this.#container = tripMainContainer;
    this.#pointsModel = pointsModel;
  }

  get points() {
    return this.#pointsModel.points;
  }

  get destinations() {
    return this.#pointsModel.destinations;
  }

  get offersData() {
    return this.#pointsModel.rawOffers;
  }

  init() {
    if (this.#pointsModel) {
      this.#pointsModel.addObserver(this.#handleModelEvent);
      this.#renderElement();
    }
  }

  #getTotalCost(points, offersData) {
    let totalCost = 0;
    const offersByType = {};
    offersData.forEach((offerType) => {
      offersByType[offerType.type] = offerType.offers;
    });

    points.forEach((point) => {
      totalCost += Number(point.basePrice) || 0;
      const typeOffers = offersByType[point.type] || [];
      if (point.offers && Array.isArray(point.offers)) {
        point.offers.forEach((selectedOfferId) => {
          const offerDetails = typeOffers.find((o) => o.id === selectedOfferId);
          if (offerDetails) {
            totalCost += Number(offerDetails.price) || 0;
          }
        });
      }
    });
    return totalCost;
  }

  #getTitle(points, destinations) {
    if (!points || points.length === 0 || !destinations || destinations.length === 0) {
      return '';
    }
    const sortedPoints = [...points].sort(sortByDay);

    const uniqueDestinationIdsInOrder = [];
    const seenDestinationIds = new Set();
    for (const point of sortedPoints) {
      if (point.destination && !seenDestinationIds.has(point.destination)) {
        uniqueDestinationIdsInOrder.push(point.destination);
        seenDestinationIds.add(point.destination);
      }
    }

    const cityNames = uniqueDestinationIdsInOrder
      .map((id) => destinations.find((d) => d.id === id)?.name)
      .filter((name) => name);

    if (cityNames.length === 0) {
      return '';
    }
    if (cityNames.length <= 3) {
      return cityNames.join(' — ');
    }
    return `${cityNames[0]} — ... — ${cityNames[cityNames.length - 1]}`;
  }

  #getDates(points) {
    if (!points || points.length === 0) {
      return '';
    }
    const sortedPoints = [...points].sort(sortByDay);
    const startDate = dayjs(sortedPoints[0].dateFrom);
    const endDate = dayjs(sortedPoints[sortedPoints.length - 1].dateTo);

    if (!startDate.isValid() || !endDate.isValid()) {
      return '';
    }

    if (startDate.month() === endDate.month()) {
      return `${startDate.format('DD MMM')} — ${endDate.format('DD')}`;
    }
    return `${startDate.format('DD MMM')} — ${endDate.format('DD MMM')}`;
  }

  #renderElement() {
    const points = this.points;
    const destinations = this.destinations;
    const offersData = this.offersData;

    if (points.length === 0 || !destinations || destinations.length === 0) {
      if (this.#tripElement) {
        remove(this.#tripElement);
        this.#tripElement = null;
      }
      return;
    }

    const title = this.#getTitle(points, destinations);
    const dates = this.#getDates(points);
    const totalCost = this.#getTotalCost(points, offersData);

    const prevTripInfoComponent = this.#tripElement;
    this.#tripElement = new TripElement({title, dates, totalCost});

    if (prevTripInfoComponent === null) {
      render(this.#tripElement, this.#container, RenderPosition.AFTERBEGIN);
    } else {
      replace(this.#tripElement, prevTripInfoComponent);
      remove(prevTripInfoComponent);
    }
  }

  #handleModelEvent = () => {
    if (!this.#pointsModel) {
      return;
    }
    this.#renderElement();
  };
}
