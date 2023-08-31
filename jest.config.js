module.exports = {
  roots: ["<rootDir>/renderer"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "\\.tsx$": "<rootDir>/node_modules/babel-jest",
    "^.+\\.(ts)$": "ts-jest",
  },
  testEnvironment: "jsdom",
};
