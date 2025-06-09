import Observable from '../framework/observable.js';
import {Updates} from '../constants.js';

const POINT_CONSTANTS = {
  base_price: 'basePrice',
  date_from: 'dateFrom',
  date_to: 'dateTo',
  is_favorite: 'isFavorite'
};

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
      console.error('Failed to load data:', err);
      this.#points = [];
      this.#destinations = [];
      this.#offersByType = [];
      this.#isLoadFailed = true;
    }
    this._notify(Updates.INIT);
  }

  async addPoint(point) {
    try {
      const addPoint = await this.#apiTrip.addPoint(point);
      const adaptAddedPoint = this.#adaptPoint(addPoint);

      this.#points = [adaptAddedPoint, ...this.#points,];
      this._notify(Updates.MAJOR, adaptAddedPoint);
      return adaptAddedPoint;
    } catch (err) {
      console.error('Failed to add point:', err);
      throw err;
    }
  }

  async updatePoint(point) {
    try {
      const updatedPoint = await this.#apiTrip.updatePoint(point);
      const adaptUpdatedPoint = this.#adaptPoint(updatedPoint);

      this.#points = this.#points.map((p) => p.id === adaptUpdatedPoint.id ? adaptUpdatedPoint : p);
      this._notify(Updates.PATCH, adaptUpdatedPoint);
      return adaptUpdatedPoint;
    } catch (err) {
      console.error('Failed to update point:', err);
      throw err;
    }
  }

  async deletePoint(pointToDelete) {
    try {
      await this.#apiTrip.deletePoint(pointToDelete);
      
      this.#points = this.#points.filter((point) => point.id !== pointToDelete.id);
      this._notify(Updates.MAJOR, pointToDelete);
    } catch (err) {
      console.error('Failed to delete point:', err);
      throw err;
    }
  }

  #adaptPoint(point) {
    const adaptedPoint = {...point};
    Object.entries(POINT_CONSTANTS).forEach(([key, value]) => {
      adaptedPoint[value] = point[key];
      delete adaptedPoint[key];
    });
    return adaptedPoint;
  }
}
