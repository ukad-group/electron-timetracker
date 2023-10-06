export const replaceHyphensWithSpaces = (inputString: string): string => {
  const resultString = inputString.replace(/ - /g, " ");

  return resultString;
};
