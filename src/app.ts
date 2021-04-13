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
  value: string | number;
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

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionTextAreaEl: HTMLTextAreaElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";
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
    this.attach();
  }

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
      console.log(title, desc, people);
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectInstant = new ProjectInput();
