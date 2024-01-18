module.exports = {
  roots: ["<rootDir>/renderer"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "\\.tsx$": "<rootDir>/node_modules/babel-jest",
    "^.+\\.(ts)$": ["ts-jest", { tsconfig: "./renderer/tsconfig.json" }], // by default ts-jest looks for tsconfig in root directory, so i need to change to ./renderer/tsconfig.json
  },
  testEnvironment: "jsdom",
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/renderer/src/$1',
    '^@electron/(.*)$': '<rootDir>/electron-src/$1',
  },
};
