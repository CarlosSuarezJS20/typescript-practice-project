import { DragTarget } from "../models/drag-drop-interfaces.js";
import { ComponentBase } from "./base-component.js";
import { autobind } from "../decorators/autobind.js";
import { ProjectItem } from "./project-item.js";
import { Project, ProjectStatus } from "../models/project.js";
import { projectState } from "../state/project-state.js";

export class ProjectList
  extends ComponentBase<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: Project[];

  constructor(private typeProject: "new-ticket" | "in-Progress" | "finished") {
    super("project-list", "app", false, `${typeProject}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent) {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.switchProjectStatus(
      prjId,
      this.typeProject === "new-ticket"
        ? ProjectStatus.NewTicket
        : this.typeProject === "in-Progress"
        ? ProjectStatus.InProgress
        : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("drop", this.dropHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.typeProject === "new-ticket") {
          return prj.projectStatus === ProjectStatus.NewTicket;
        }
        if (this.typeProject === "in-Progress") {
          return prj.projectStatus === ProjectStatus.InProgress;
        }
        return prj.projectStatus === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects; //overwriting
      this.renderProjects();
    });
  }

  renderContent() {
    const unorderListElement = this.element.querySelector(
      "ul"
    )! as HTMLUListElement;
    unorderListElement.id = `${this.typeProject}-projects-list`;
    this.element.querySelector("h2")!.textContent =
      this.typeProject.toUpperCase() + " PINTEREST";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.typeProject}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = ""; //cleans the UI from previous elements so theere is not duplicates
    for (let prj of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, prj);
    }
  }
}
