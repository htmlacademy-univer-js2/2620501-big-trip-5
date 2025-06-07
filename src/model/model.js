import Observable from '../framework/observable.js';
import {Updates} from '../constants.js';

export default class PointsModel extends Observable {
  #points = [];
  #apiTrip = null;
  #destinations = [];
  #offers = [];
  #loadFailed = false;

  constructor({apiTrip}) {
    super();
    this.#apiTrip = apiTrip;
  }

  get points() {
    return this.#points;
  }
  get destinations() {
    return this.#destinations;
  }

  get offers() {
    const offersMap = {};
    this.#offers.forEach((offerType) => {
      offersMap[offerType.type] = offerType.offers;
    });
    return offersMap;
  }

  get rawOffers() {
    return this.#offers;
  }

  get loadFailed() {
    return this.#loadFailed;
  }

  async init() {
    this.#loadFailed = false;
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#apiTrip.getPoints(),
        this.#apiTrip.getDestinations(),
        this.#apiTrip.getOffers(),
      ]);

      this.#points = points.map(this.#pointToClient);
      this.#destinations = destinations;
      this.#offers = offers;
    } catch(err) {
      this.#points = [];
      this.#destinations = [];
      this.#offers = [];
      this.#loadFailed = true;
    }
    this._notify(Updates.INIT);
  }

  #pointToClient(point) {
    const adaptedPoint = {
      ...point,
      basePrice: point.base_price,
      dateFrom: point.date_from,
      dateTo: point.date_to,
      isFavorite: point.is_favorite,
    };

    delete adaptedPoint.base_price;
    delete adaptedPoint.date_from;
    delete adaptedPoint.date_to;
    delete adaptedPoint.is_favorite;

    return adaptedPoint;
  }

  async updatePoint(point) {
    const updatedPoint = await this.#apiTrip.updatePoint(point);
    const adaptedPoint = this.#pointToClient(updatedPoint);

    const index = this.#points.findIndex((p) => p.id === adaptedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point in local model');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      adaptedPoint,
      ...this.#points.slice(index + 1),
    ];
    this._notify(Updates.PATCH, adaptedPoint);
    return adaptedPoint;
  }

  addPoint(point) {
    const newPointWithId = {...point, id: crypto.randomUUID()};
    this.#points = [
      newPointWithId,
      ...this.#points,
    ];
    this._notify(Updates.MAJOR, newPointWithId);
  }
  deletePoint(pointToDelete) {
    const index = this.#points.findIndex((point) => point.id === pointToDelete.id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }
    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1),
    ];
    this._notify(Updates.MAJOR, pointToDelete);
  }
}
