import ApiService from './framework/api-service';

const action = {
  GET: 'GET',
  PUT: 'PUT',
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
      method: action.PUT,
      body: JSON.stringify(this.#adaptPoint(point)),
      headers: new Headers({'Content-Type': 'application/json'}),
    })
      .then(ApiService.parseResponse);
  }

  #adaptPoint(point) {
    const adaptPoint = {
      ...point,
      'base_price': point.basePrice,
      'date_from': point.dateFrom,
      'date_to': point.dateTo,
      'is_favorite': point.isFavorite,
      destination: (typeof point.destination === 'object' && point.destination !== null) ? point.destination.id : point.destination,
    };

    delete adaptPoint.basePrice;
    delete adaptPoint.dateFrom;
    delete adaptPoint.dateTo;
    delete adaptPoint.isFavorite;
    delete adaptPoint.selectedOffers;

    return adaptPoint;
  }
}
