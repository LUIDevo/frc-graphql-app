export interface Header {
  name: string;
  inputName: string;
  required?: boolean;
  requiredError?: (
    headerName: string,
    rowNumber: number,
    columnNumber: number,
  ) => string;
  unique?: boolean;
  uniqueError?: (headerName: string, rowNumber: number) => string;
  validate?: string | ((value: any) => boolean);
  validateError?: (
    headerName: string,
    rowNumber: number,
    columnNumber: number,
  ) => string;
  dependentValidate?: (value: any, row: any[]) => boolean;
  dependentValidateError?: (
    headerName: string,
    rowNumber: number,
    columnNumber: number,
  ) => string;
  optional?: boolean;
  headerError?: (
    headerValue: any,
    headerName: string,
    rowNumber: number,
    columnNumber: number,
  ) => string;
  isArray?: boolean;
}

export interface Validator {
  name: string;
  validator: (value: any) => boolean;
  message: (
    headerName: string,
    rowNumber: number,
    columnNumber: number,
    value: any,
  ) => string;
}

export const csvHeaders: Header[] = [
  {
    name: "matchNumber",
    inputName: "matchNumber",
    required: true,
    validate: "isNumeric",
  },
  {
    name: "TeamNumber",
    inputName: "teamNumber",
    required: true,
    validate: "isNumeric",
  },
  {
    name: "scoutId",
    inputName: "scoutName",
    required: false,
    validate: "isAlphaNumeric",
  },
  { name: "teamPosition", inputName: "teamPosition", required: false },
  { name: "teamColour", inputName: "teamColour", required: false },
  {
    name: "AutoFuel",
    inputName: "autoFuel",
    required: false,
    validate: "isNumeric",
  },
  {
    name: "TeleopFuel",
    inputName: "teleopFuel",
    required: false,
    validate: "isNumeric",
  },
  {
    name: "NumberOfMissed",
    inputName: "missed",
    required: false,
    validate: "isNumeric",
  },
  {
    name: "ClimbLevel",
    inputName: "climbLevel",
    required: false,
    validate: (value: string) =>
      ["none", "level1", "level2", "level3"].includes(value.toLowerCase()),
  },
  {
    name: "AutoClimb",
    inputName: "autoClimb",
    required: false,
  },
  {
    name: "Penalty",
    inputName: "penalties",
    required: false,
    validate: "isNumeric",
  },
  { name: "Comments", inputName: "notes", required: false },
  { name: "Auto Comments", inputName: "autoNotes", required: false },
];

const customValidators: Validator[] = [
  {
    name: "isNumeric",
    validator: (value: string) =>
      !isNaN(Number(value)) && !isNaN(parseFloat(value)),
    message: (headerName, rowNumber, columnNumber, value) =>
      `Row ${rowNumber}, Column ${columnNumber} (${headerName}): Value '${value}' is not a valid number.`,
  },
  {
    name: "isAlphaNumeric",
    validator: (value: string) => /^[a-zA-Z0-9\s]*$/.test(value),
    message: (headerName, rowNumber, columnNumber, value) =>
      `Row ${rowNumber}, Column ${columnNumber} (${headerName}): Value '${value}' contains special characters.`,
  },
];

export const csvValidationConfig = {
  headers: csvHeaders,
  isHeaderNameOptional: false,
  extraValidation: customValidators,
};
