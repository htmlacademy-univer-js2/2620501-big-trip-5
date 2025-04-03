import {createElement} from '../render.js';

function taskButtonTemplate() {
  return '<button class="control__button">+ ADD NEW TASK</button>';
}

export default class TaskButtonElement {
  getTemplate() {
    return taskButtonTemplate();
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
