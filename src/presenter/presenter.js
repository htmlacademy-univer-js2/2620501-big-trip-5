import BoardElement from '../view/board-element.js';
import SortView from '../view/sort-view.js';
import TaskListElement from '../view/task-list-element.js';
import TaskElement from '../view/task-element.js';
import EditElement from '../view/edit-element.js';
import MoreButtonElement from '../view/more-button-element.js';
import {render} from '../render.js';

export default class BoardPresenter {
  component = new BoardElement();
  taskListComponent = new TaskListElement();

  constructor({boardContainer}) {
    this.boardContainer = boardContainer;
  }

  init() {
    render(this.component, this.boardContainer);
    render(new SortView(), this.component.getElement());
    render(this.taskListComponent, this.component.getElement());
    render(new EditElement(), this.taskListComponent.getElement());

    for (let i = 0; i < 3; i++) {
      render(new TaskElement(), this.taskListComponent.getElement());
    }

    render(new MoreButtonElement(), this.component.getElement());
  }
}
