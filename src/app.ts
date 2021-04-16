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

type Listener<T> = (items: Project[]) => void; // no matter what returns

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

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    for (const listener of this.listeners) {
      listener(this.projects.slice()); // this doesn't allowing editing
    }
  }
}

const projectState = ProjectState.getInstance();
// only one state management class

// autobind decorator
function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
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

abstract class ComponentBase<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
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

  abstract configure(): void;
  abstract renderContent(): void;
}

//ProjectItem Class

class projectItem extends ComponentBase<HTMLUListElement, HTMLLIElement> {
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
    this.renderContent();
  }

  configure() {}
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.projectObject.t;
    this.element.querySelector("h3")!.textContent =
      this.peopleMessage + "assigned";
    this.element.querySelector("p")!.textContent = this.projectObject.desc;
  }
}

// Project List class

class ProjectList extends ComponentBase<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[];

  constructor(private typeProject: "active" | "finished") {
    super("project-list", "app", false, `${typeProject}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  configure() {
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
      new projectItem(this.element.querySelector("ul")!.id, prj);
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

  @Autobind
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
