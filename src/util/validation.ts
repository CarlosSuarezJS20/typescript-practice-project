export interface Validatable {
  value?: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validateInputs(validatableInput: Validatable): boolean {
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
