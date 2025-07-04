import ApiService from './framework/api-service';

const Action = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  DELETE: 'DELETE',
};

export default class TripApi extends ApiService {
  async getPoints() {
    return this._load({url: 'points'})
      .then(ApiService.parseResponse);
  }

  async getDestinations() {
    return this._load({url: 'destinations'})
      .then(ApiService.parseResponse);
  }

  async getOffers() {
    return this._load({url: 'offers'})
      .then(ApiService.parseResponse);
  }

  async updatePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: Action.PUT,
      body: JSON.stringify(this.#adaptPoint(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(ApiService.parseResponse);
  }

  async addPoint(point) {
    return this._load({
      url: 'points',
      method: Action.POST,
      body: JSON.stringify(this.#adaptPoint(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(ApiService.parseResponse);
  }

  async deletePoint(point) {
    return this._load({
      url: `points/${point.id}`,
      method: Action.DELETE,
    });
  }

  #adaptPoint(point) {
    const adaptedPoint = {
      ...point,
      'base_price': Number(point.basePrice),
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'is_favorite': point.isFavorite,
      destination: (point.destination && typeof point.destination === 'object' && point.destination.id !== undefined)
        ? point.destination.id
        : point.destination,
      offers: point.offers,
    };

    delete adaptedPoint.basePrice;
    delete adaptedPoint.dateFrom;
    delete adaptedPoint.dateTo;
    delete adaptedPoint.isFavorite;
    delete adaptedPoint.selectedOffers;

    if (point.id === undefined || point.id === null || String(point.id).startsWith('local_')) {
      delete adaptedPoint.id;
    }

    return adaptedPoint;
  }
}
