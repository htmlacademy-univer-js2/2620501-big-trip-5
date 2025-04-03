import {createElement} from '../render.js';

function taskListTemplate() {
  return '<div class="board__tasks"></div>';
}

export default class TaskListElement {
  getTemplate() {
    return taskListTemplate();
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
