import Logic, { isSat } from 'boolean-logic';

export const generateWffWithOnes = numAtoms => {
  const connectives = ['N', 'A', 'O', 'X', 'T', 'B'];
  if (numAtoms === 1) {
    const addNegation = Math.floor(Math.random()) > 0.5 ? true : false;
    if (addNegation) {
      return '(N1)';
    } else {
      return '1';
    }
  } else if (numAtoms === 2) {
    let connIdx = Math.floor(Math.random() * 5) + 1;
    return `(1${connectives[connIdx]}1)`;
  } else {
    let connIdx = Math.floor(Math.random() * 6);
    if (connIdx > 0) {
      let firstNumAtoms = Math.floor(Math.random() * (numAtoms - 1)) + 1;
      let secondNumAtoms = numAtoms - firstNumAtoms;
      let firstWff = generateWffWithOnes(firstNumAtoms);
      let secondWff = generateWffWithOnes(secondNumAtoms);
      return `(${firstWff}${connectives[connIdx]}${secondWff})`;
    } else {
      let negatumWff = generateWffWithOnes(numAtoms);
      return `(N${negatumWff})`;
    }
  }
};

export const generateWffNotDistinct = numAtoms => {
  const wff = generateWffWithOnes(numAtoms);
  const wffArray = wff.split('');
  for (let i = 0; i < wffArray.length; i++) {
    if (wffArray[i] === '1') {
      wffArray[i] = Math.floor(Math.random() * numAtoms) + 1;
    }
  }
  return wffArray.join('');
};

export const generateWff = numAtoms => {
  let numNotDistinct = Math.floor(Math.random() * numAtoms * 10) + 1;
  let wff = generateWffNotDistinct(numNotDistinct);
  while (Logic._atomics(wff).length !== numAtoms) {
    numNotDistinct = Math.floor(Math.random() * numAtoms * 10) + 1;
    wff = generateWffNotDistinct(numNotDistinct);
  }
  return wff;
};

export const benchmark = wff => {
  const beforeDate = new Date();
  const beforeTime = beforeDate.getTime();
  const result = isSat(wff, true);
  const afterDate = new Date();
  const afterTime = afterDate.getTime();
  const duration = afterTime - beforeTime;

  if (Boolean(result)) {
    console.log('The formula is satisfiable.');
    console.log(`The first model found was:`);
    console.log(result);
    console.log(`It took ${duration} milliseconds to find this model.`);
  } else {
    console.log("The formula isn't satisfiable.");
    console.log(`It took ${duration} milliseconds to determine this.`);
  }
};

const wff = generateWff(15);
console.log(`Testing this formula: '${wff}'`);
benchmark(wff);

window.generateWff = generateWff;
window.generateWffWithOnes = generateWffWithOnes;
window.benchmark = benchmark;
