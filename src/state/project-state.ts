import { ProjectStatus, Project } from "../models/project.js";

type Listener<T> = (items: T[]) => void;

// Project State Management class

class State<T> {
  protected listeners: Listener<T>[] = []; // ACCESS FROM OUTSITE BUT ONLY WHERE EXTENDS

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

export class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  switchProjectStatus(projectId: string, newStatus: ProjectStatus) {
    const projectToSwitchStatus = this.projects.find(
      (prj) => prj.id === projectId
    );
    if (
      projectToSwitchStatus &&
      projectToSwitchStatus.projectStatus !== newStatus
    ) {
      projectToSwitchStatus.projectStatus = newStatus;

      this.updateListeners();
    }
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.NewTicket
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  private updateListeners() {
    for (const listener of this.listeners) {
      listener(this.projects.slice()); // I'm passing a copy of the original projects property class
    }
  }
}

export const projectState = ProjectState.getInstance();
// only one state management class
