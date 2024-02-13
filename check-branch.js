const fs = require('fs');
const path = require('path');

const branchName = getCurrentBranchName();

const isValidBranchName = branchName === "dev" || /^(feature|fix)\/.+$/.test(branchName);

if (!isValidBranchName) {
  console.error('Error: Branch name must start with "feature/" or "fix/".');
  process.exit(1);
}

function getCurrentBranchName() {
  const headPath = path.resolve('.git', 'HEAD');
  const headContent = fs.readFileSync(headPath, 'utf-8').trim();

  const branchMatch = headContent.match(/^ref: refs\/heads\/(.+)$/);

  if (branchMatch && branchMatch[1]) {
    return branchMatch[1];
  } else {
    console.error('Error: Unable to determine the current branch.');
    process.exit(1);
  }
}