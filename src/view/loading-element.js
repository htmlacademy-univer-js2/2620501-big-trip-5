import AbstractView from '../framework/view/abstract-view';

const loadingTemplate = () => '<p class="trip-events__msg">Loading...</p>';

export default class LoadingElement extends AbstractView {
  get template() {
    return loadingTemplate();
  }
}
