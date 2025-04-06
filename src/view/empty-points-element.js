import AbstractView from '../framework/view/abstract-view.js';

const emptyPointTemplate = () => (
  '<p class="trip-events__msg">Click New Event to create your first point</p>' // Используем разметку из /markup
);

export default class EmptyPointElement extends AbstractView {
  get template() {
    return emptyPointTemplate();
  }
}
