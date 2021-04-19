import { ComponentBase } from "./base-component.js";
import { autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";
import { Validatable, validateInputs } from "../util/validation.js";

export class ProjectInput extends ComponentBase<
  HTMLDivElement,
  HTMLFormElement
> {
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
      maxLength: 50,
    };

    const descriptionValidatable: Validatable = {
      value: descriptionTextAreaElValue,
      required: true,
      minLength: 5,
      maxLength: 50,
    };

    const peopleValidatable: Validatable = {
      value: +peopleInputValue,
      required: true,
      min: 1,
      max: 3,
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
