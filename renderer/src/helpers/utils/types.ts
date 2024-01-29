export type HintConitions = {
  groupName: string;
  newConditions: Array<boolean>;
  existingConditions: Array<boolean | "same">;
};
