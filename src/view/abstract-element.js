import {createElement} from '../render.js';

export default class AbstractElement {
  #element = null;
  _callback = {};

  constructor() {
    if (new.target === AbstractElement) {
      throw new Error('Can\'t instantiate AbstractElement, only concrete one.');
    }
  }

  get element() {
    if (!this.#element) {
      this.#element = createElement(this.template);
    }

    return this.#element;
  }

  getElement() {
    return this.element;
  }

  removeElement() {
    this.#element = null;
  }

  get template() {
    throw new Error('Abstract method not implemented: get template');
  }
}
