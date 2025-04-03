import {createElement} from '../render.js';

function boardTemplate() {
  return '<section class="board container"></section>';
}

export default class BoardElement {
  getTemplate() {
    return boardTemplate();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}
