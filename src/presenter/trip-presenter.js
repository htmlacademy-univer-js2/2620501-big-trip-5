import {render, replace, remove, RenderPosition} from '../framework/render.js';
import TripElement from '../view/trip-element.js';
import {sortByDay} from '../utils.js';
import dayjs from 'dayjs';

export default class TripPresenter {
  #container = null;
  #pointModel = null;
  #component = null;

  constructor({container, pointModel}) {
    this.#container = container;
    this.#pointModel = pointModel;
  }

  get points() {
    return this.#pointModel.points;
  }

  get destinations() {
    return this.#pointModel.destinations;
  }

  get offersData() {
    return this.#pointModel.rawOffers;
  }

  init() {
    if (this.#pointModel) {
      this.#pointModel.addObserver(this.#eventModel);
      this.#render();
    }
  }

  #getTotalPrice(points, offersData) {
    let totalPrice = 0;
    if (!points || points.length === 0 || !offersData) {
      return 0;
    }
    const offerType = {};
    offersData.forEach((offerType) => {
      offerType[offerType.type] = offerType.offers;
    });

    points.forEach((point) => {
      totalPrice += Number(point.basePrice) || 0;
      const typeOfOffer = offerType[point.type] || [];
      if (point.offers && Array.isArray(point.offers)) {
        point.offers.forEach((selectedOfferId) => {
          const offerDetails = typeOfOffer.find((o) => o.id === selectedOfferId);
          if (offerDetails) {
            totalPrice += Number(offerDetails.price) || 0;
          }
        });
      }
    });
    return totalPrice;
  }

  #generateTitle(points, destinations) {
    if (!points || points.length === 0 || !destinations || destinations.length === 0) {
      return '';
    }
    const sortPoints = [...points].sort(sortByDay);

    const uniqueDestination = [];
    const seenDestination = new Set();
    for (const point of sortPoints) {
      if (point.destination && !seenDestination.has(point.destination)) {
        uniqueDestination.push(point.destination);
        seenDestination.add(point.destination);
      }
    }

    const cityNames = uniqueDestination
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
    const sortPoints = [...points].sort(sortByDay);
    const dateFrom = dayjs(sortPoints[0].dateFrom);
    const dateTo = dayjs(sortPoints[sortPoints.length - 1].dateTo);

    if (!dateFrom.isValid() || !dateTo.isValid()) {
      return '';
    }

    if (dateFrom.month() === dateTo.month()) {
      return `${dateFrom.format('DD MMM')} — ${dateTo.format('DD')}`;
    }
    return `${dateFrom.format('DD MMM')} — ${dateTo.format('DD MMM')}`;
  }

  #render() {
    const points = this.points;
    const destinations = this.destinations;
    const offersData = this.offersData;

    if (points.length === 0 || !destinations || destinations.length === 0) {
      if (this.#component) {
        remove(this.#component);
        this.#component = null;
      }
      return;
    }

    const title = this.#generateTitle(points, destinations);
    const date = this.#getDates(points);
    const totalPrice = this.#getTotalPrice(points, offersData);

    const prevComponent = this.#component;
    this.#component = new TripElement({title, dates: date, totalCost: totalPrice});

    if (prevComponent === null) {
      render(this.#component, this.#container, RenderPosition.AFTERBEGIN);
    } else {
      replace(this.#component, prevComponent);
      remove(prevComponent);
    }
  }

  #eventModel = () => {
    if (!this.#pointModel) {
      return;
    }
    this.#render();
  };
}
