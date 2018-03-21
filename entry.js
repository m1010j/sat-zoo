import Logic, { isSat } from 'boolean-logic';

export const benchmark = (wff, resultDiv) => {
  const beforeParseDate = new Date();
  const beforeParseTime = beforeParseDate.getTime();
  const parsedWff = Logic._parse(wff, true);
  const afterParseDate = new Date();
  const afterParseTime = afterParseDate.getTime();
  const parseDuration = afterParseTime - beforeParseTime;

  const beforeGenerateModelsDate = new Date();
  const beforeGenerateModelsTime = beforeGenerateModelsDate.getTime();
  if (!parsedWff) {
    return;
  }
  const models = Logic._generateModels(wff);
  const afterGenerateModelsDate = new Date();
  const afterGenerateModelsTime = afterGenerateModelsDate.getTime();
  const generateModelsDuration =
    afterGenerateModelsTime - beforeGenerateModelsTime;

  const beforeCheckDate = new Date();
  const beforeCheckTime = beforeCheckDate.getTime();
  const result = Logic._checkModels(parsedWff, models, true);
  const afterCheckDate = new Date();
  const afterCheckTime = afterCheckDate.getTime();
  const checkDuration = afterCheckTime - beforeCheckTime;

  if (Boolean(result)) {
    let resultString = '';
    for (let key in result) {
      resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${result[key]}`;
    }
    resultDiv.innerHTML = `
      <p>The formula is satisfiable.</p>
      <p>The first model found was:</p>
      <p>{${resultString}<br />}</p>
      <p>It took ${parseDuration} milliseconds to parse the wff.</p>
      <p>
        It took ${generateModelsDuration} milliseconds to generate all models of this wff.</p>
      <p>It took ${checkDuration} milliseconds to find the above model.</p>
      <p>It took ${generateModelsDuration +
        checkDuration} milliseconds to generate all models of this wff and to find the above model.</p>
      <p>It took ${parseDuration +
        generateModelsDuration +
        checkDuration} milliseconds to do everything.</p>
    `;
  } else {
    resultDiv.innerHTML = `
      <p>The formula isn't satisfiable</p>
      <p>It took ${parseDuration} milliseconds to parse the wff.</p>
      <p>It took ${generateModelsDuration} milliseconds to generate all models of this wff.</p>
      <p>It took ${checkDuration} milliseconds to check every model.</p>
      <p>It took ${generateModelsDuration +
        checkDuration} milliseconds to generate all models of this wff and to check all of them.</p>
      <p>It took ${parseDuration +
        generateModelsDuration +
        checkDuration} milliseconds to do everything.</p>
    `;
  }
};

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
  const negationProbability = Math.random();
  if (negationProbability < 0.5) {
    return wff;
  } else {
    return `(N${wff})`;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const generateButton = document.getElementById('generateButton');
  const submitButton = document.getElementById('submitButton');
  const wffTextarea = document.getElementById('wffTextarea');
  const wffLengthInput = document.getElementById('wffLength');
  const resultDiv = document.getElementById('result');
  generateButton.addEventListener('click', e => {
    e.preventDefault();
    const wffLength = parseInt(wffLengthInput.value);
    const wff = generateWff(wffLength);
    wffTextarea.value = wff;
  });

  submitButton.addEventListener('click', e => {
    e.preventDefault();
    const result = benchmark(wffTextarea.value, resultDiv);
  });
});

// const wff = generateWff(15);
// console.log(`Testing this formula: '${wff}'`);
// benchmark(wff);

// window.generateWff = generateWff;
// window.generateWffWithOnes = generateWffWithOnes;
// window.benchmark = benchmark;
