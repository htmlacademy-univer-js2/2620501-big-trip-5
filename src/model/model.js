import Observable from '../framework/observable.js';
import {Updates} from '../constants.js';

export default class Model extends Observable {
  #points = [];
  #destinations = [];
  #offersByType = [];
  #isLoadFailed = false;
  #apiTrip = null;

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

  get offersByType() {
    return this.#offersByType.reduce((acc, offerType) => {
      acc[offerType.type] = offerType.offers;
      return acc;
    }, {});
  }

  get rawOffers() {
    return this.#offersByType;
  }

  get isLoadFailed() {
    return this.#isLoadFailed;
  }

  async init() {
    this.#isLoadFailed = false;
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#apiTrip.getPoints(),
        this.#apiTrip.getDestinations(),
        this.#apiTrip.getOffers(),
      ]);

      this.#points = points.map(this.#adaptPoint);
      this.#destinations = destinations;
      this.#offersByType = offers;
    } catch(err) {
      this.#points = [];
      this.#destinations = [];
      this.#offersByType = [];
      this.#isLoadFailed = true;
    }
    this._notify(Updates.INIT);
  }

  async addPoint(point) {
    const addPoint = await this.#apiTrip.addPoint(point);
    const adaptAddedPoint = this.#adaptPoint(addPoint);

    this.#points = [adaptAddedPoint, ...this.#points,];
    this._notify(Updates.MAJOR, adaptAddedPoint);
    return adaptAddedPoint;
  }

  async updatePoint(point) {
    const updatedPoint = await this.#apiTrip.updatePoint(point);
    const adaptUpdatedPoint = this.#adaptPoint(updatedPoint);
    const index = this.#points.findIndex((p) => p.id === adaptUpdatedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point in local model');
    }

    this.#points = [...this.#points.slice(0, index), adaptUpdatedPoint, ...this.#points.slice(index + 1),];
    this._notify(UpdateType.PATCH, adaptUpdatedPoint);
    return adaptUpdatedPoint;
  }

  async deletePoint(pointToDelete) {
    await this.#apiTrip.deletePoint(pointToDelete);
    const index = this.#points.findIndex((point) => point.id === pointToDelete.id);

    if (index === -1) {
      throw new Error('Can\'t delete unexisting point from local model');
    }
    this.#points = [...this.#points.slice(0, index), ...this.#points.slice(index + 1),];
    this._notify(UpdateType.MAJOR, pointToDelete);
  }

  #adaptPoint(point) {
    const adaptUpdatedPoint = {
      ...point,
      basePrice: point.base_price,
      dateFrom: point.date_from,
      dateTo: point.date_to,
      isFavorite: point.is_favorite,
    };

    delete adaptUpdatedPoint.base_price;
    delete adaptUpdatedPoint.date_from;
    delete adaptUpdatedPoint.date_to;
    delete adaptUpdatedPoint.is_favorite;

    return adaptUpdatedPoint;
  }
}
