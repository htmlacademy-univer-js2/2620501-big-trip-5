import {createElement} from '../render.js';

function moreButtonTemplate() {
  return '<button class="load-more" type="button">load more</button>';
}

export default class MoreButtonElement {
  getTemplate() {
    return moreButtonTemplate();
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
