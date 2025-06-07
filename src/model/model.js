import Observable from '../framework/observable.js';
import {DESTINATION, EXTRA_TYPE, generatePoint} from '../point/point.js';
import {Updates} from '../constants.js';

const adaptPoint = (point) => {
  const destination = DESTINATION.find((dest) => dest.id === point.destination);
  const extraType = EXTRA_TYPE[point.type] || [];
  const selectOffers = extraType.filter((offer) => point.offers.includes(offer.id));

  return {
    ...point,
    destination,
    selectOffers
  };
};

export default class PointsModel extends Observable {
  #points = [];
  #destinations = DESTINATION;
  #offersByType = EXTRA_TYPE;

  constructor() {
    super();
    const generatedPoints = generatePoint(5);
    this.#points = generatedPoints.map(adaptPoint);
  }

  get points() {
    return this.#points;
  }

get destinations() {
    return this.#destinations;
  }

  get offersByType() {
    return this.#offersByType;
  }

  updatePoint(updatedPoint) {
    const index = this.#points.findIndex((point) => point.id === updatedPoint.id);

    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }

    this.#points = [
      ...this.#points.slice(0, index),
      updatedPoint,
      ...this.#points.slice(index + 1),
    ];
    this._notify(Updates.PATCH, updatedPoint);
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

  setPoints(points) {
    this.#points = [...points];
    this._notify(Updates.MAJOR, points);
  }
}
