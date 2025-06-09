import AbstractView from '../framework/view/abstract-view.js';
import {Filters} from '../constants.js';
import {encodeHtml} from '../utils.js';

const DEFAULT_MESSAGE_TYPE = Filters.EVERYTHING;

const EmptyMessages = {
  [Filters.EVERYTHING]: 'Click New Event to create your first point',
  [Filters.PAST]: 'There are no past events now',
  [Filters.PRESENT]: 'There are no present events now',
  [Filters.FUTURE]: 'There are no future events now',
};

const emptyTemplate = (message) => (
  `<p class="trip-events__msg">${encodeHtml(message)}</p>`
);

export default class EmptyElement extends AbstractView {
  #message = '';

  constructor({ messageType = DEFAULT_MESSAGE_TYPE, customMessage = null } = {}) {
    super();
    this.#message = customMessage ?? EmptyMessages[messageType] ?? EmptyMessages[DEFAULT_MESSAGE_TYPE];
  }

  get template() {
    return emptyTemplate(this.#message);
  }
}
