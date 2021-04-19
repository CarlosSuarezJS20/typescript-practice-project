import { Draggable } from "../models/drag-drop-interfaces.js";
import { ComponentBase } from "./base-component.js";
import { autobind } from "../decorators/autobind.js";
import { Project } from "../models/project.js";

export class ProjectItem
  extends ComponentBase<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  projectObject: Project;

  get peopleMessage() {
    if (this.projectObject.people === 1) {
      return `High Priority.`;
    }
    if (this.projectObject.people === 2) {
      return "Medium Priority";
    }

    return "Low Priority";
  }

  constructor(hostElId: string, project: Project) {
    super("single-project", hostElId, false, project.id);
    this.projectObject = project;
    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.projectObject.id);
    event.dataTransfer!.effectAllowed = "move";
  }
  dragEndHandler(_: DragEvent) {}

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.projectObject.t;
    this.element.querySelector("h3")!.textContent = this.peopleMessage;
    this.element.querySelector("p")!.textContent = this.projectObject.desc;
  }
}
