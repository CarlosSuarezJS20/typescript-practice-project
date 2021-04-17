// Drag and Drop interface
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// project Type

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public t: string,
    public desc: string,
    public people: number,
    public projectStatus: ProjectStatus
  ) {}
}

type Listener<T> = (items: Project[]) => void;

// Project State Management class

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
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
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }

  private updateListeners() {
    for (const listener of this.listeners) {
      listener(this.projects.slice()); // this doesn't allowing editing
    }
  }
}

const projectState = ProjectState.getInstance();
// only one state management class

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
}

// Validation
interface Validatable {
  value?: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validateInputs(validatableInput: Validatable): boolean {
  let isValid = true;
  if (validatableInput.required && validatableInput.value) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null && //this means is not equal to undefined or null;
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value?.trim().length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null && //this means is not equal to undefined or null;
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value?.trim().length <= validatableInput.maxLength;
  }

  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}

//Component base class

//abstract class does not allowed the class to be instantiated
abstract class ComponentBase<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string //same thing that doing string | undefined
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  // ==== This requires every class that inherites from this one to have the methods
  // Private abstracts is not allowed

  abstract configure(): void;
  abstract renderContent(): void;
}

//ProjectItem Class

class ProjectItem
  extends ComponentBase<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  projectObject: Project;

  get peopleMessage() {
    if (this.projectObject.people === 1) {
      return `1 person.`;
    } else {
      return `${this.projectObject.people} people `;
    }
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
    this.element.querySelector("h3")!.textContent =
      this.peopleMessage + "assigned";
    this.element.querySelector("p")!.textContent = this.projectObject.desc;
  }
}

// Project List class

class ProjectList
  extends ComponentBase<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: Project[];

  constructor(private typeProject: "active" | "finished") {
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
      this.typeProject === "active"
        ? ProjectStatus.Active
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
        if (this.typeProject === "active") {
          return prj.projectStatus === ProjectStatus.Active;
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
      this.typeProject.toUpperCase() + " PROJECTS";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.typeProject}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (let prj of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, prj);
    }
  }
}

// Project Input class

class ProjectInput extends ComponentBase<HTMLDivElement, HTMLFormElement> {
  titleInputEl: HTMLInputElement;
  descriptionTextAreaEl: HTMLTextAreaElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputEl = this.element.querySelector(
      "#title"
    )! as HTMLInputElement;
    this.descriptionTextAreaEl = this.element.querySelector(
      "#description"
    )! as HTMLTextAreaElement;
    this.peopleInputEl = this.element.querySelector(
      "#people"
    )! as HTMLInputElement;
    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private gatherUserInput(): [string, string, number] | void {
    const titleElValue = this.titleInputEl.value;
    const descriptionTextAreaElValue = this.descriptionTextAreaEl.value;
    const peopleInputValue = this.peopleInputEl.value;

    const titleValidatable: Validatable = {
      value: titleElValue,
      required: true,
      minLength: undefined,
      maxLength: 20,
    };

    const descriptionValidatable: Validatable = {
      value: descriptionTextAreaElValue,
      required: true,
      minLength: 10,
      maxLength: 50,
    };

    const peopleValidatable: Validatable = {
      value: +peopleInputValue,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validateInputs(titleValidatable) ||
      !validateInputs(descriptionValidatable) ||
      !validateInputs(peopleValidatable)
    ) {
      alert("invalid");
      return;
    } else {
      this.clearInputs([
        this.titleInputEl,
        this.descriptionTextAreaEl,
        this.peopleInputEl,
      ]);
      return [titleElValue, descriptionTextAreaElValue, +peopleInputValue];
    }
  }

  private clearInputs(
    inputs: [HTMLInputElement, HTMLTextAreaElement, HTMLInputElement]
  ) {
    for (let input of inputs) {
      input.value = "";
    }
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInputs = this.gatherUserInput();
    if (Array.isArray(userInputs)) {
      const [title, desc, people] = userInputs;
      projectState.addProject(title, desc, people);
    }
  }
}

const projectInstant = new ProjectInput();
const projectsListActiveProjects = new ProjectList("active");
const projectsListsFinishProjects = new ProjectList("finished");
