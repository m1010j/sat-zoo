import firebase from 'firebase';
import Logic, { isTrue } from 'boolean-logic';
import { checkModels, nth } from './util';

export const benchmark = (wff, ref) => {
  const generateButton = document.getElementById('generateButton');
  const submitButton = document.getElementById('submitButton');
  const wffTextarea = document.getElementById('wffTextarea');
  const resultDiv = document.getElementById('result');
  const wffLengthInput = document.getElementById('wffLength');

  generateButton.disabled = true;
  submitButton.disabled = true;
  wffTextarea.disabled = true;
  wffLengthInput.disabled = true;

  try {
    const beforeParseDate = new Date();
    const beforeParseTime = beforeParseDate.getTime();
    const parsedWff = Logic._parse(wff, true);
    const afterParseDate = new Date();
    const afterParseTime = afterParseDate.getTime();
    const parseDuration = afterParseTime - beforeParseTime;

    const beforeGenerateModelsDate = new Date();
    const beforeGenerateModelsTime = beforeGenerateModelsDate.getTime();
    if (!parsedWff) {
      resultDiv.innerHTML = `<p>Must provide a well-formed formula.</p>`;
      generateButton.disabled = false;
      submitButton.disabled = false;
      wffTextarea.disabled = false;
      wffLengthInput.disabled = false;
      return;
    }
    wff = parsedWff.stringify();
    const models = Logic._generateModels(wff);
    const afterGenerateModelsDate = new Date();
    const afterGenerateModelsTime = afterGenerateModelsDate.getTime();
    const generateModelsDuration =
      afterGenerateModelsTime - beforeGenerateModelsTime;

    const beforeCheckDate = new Date();
    const beforeCheckTime = beforeCheckDate.getTime();
    const result = checkModels(parsedWff, models);
    const afterCheckDate = new Date();
    const afterCheckTime = afterCheckDate.getTime();
    const checkDuration = afterCheckTime - beforeCheckTime;

    const browserName = navigator.appName;
    const browserEngine = navigator.product;
    const browserVersion1 = navigator.appVersion;
    const browserVersion2 = navigator.userAgent;
    const browserOnline = navigator.onLine;
    const browserPlatform = navigator.platform;

    const postData = {
      wff,
      numAtomics: Logic._atomics(wff).length,
      algorithm: 'truth table',
      isSat: Boolean(result),
      model: result ? result.model : null,
      modelNumber: result ? result.modelNumber : null,
      parseDuration,
      generateModelsDuration,
      checkDuration,
      browser: {
        browserName,
        browserEngine,
        browserVersion1,
        browserVersion2,
        browserPlatform,
      },
    };
    const newPostKey = firebase
      .database()
      .ref()
      .child('benchmarks')
      .push().key;
    const updates = {};
    updates['/benchmarks/' + newPostKey] = postData;
    firebase
      .database()
      .ref()
      .update(updates)
      .then(() => {
        generateButton.disabled = false;
        submitButton.disabled = false;
        wffTextarea.disabled = false;
        wffLengthInput.disabled = false;

        const browserInfo = `
        <p>Browser name: ${browserName}</p>
        <p>Browser engine: ${browserEngine}</p>
        <p>Browser version 1a: ${browserVersion1}</p>
        <p>Browser version 1b: ${browserVersion2}</p>
        <p>Browser platform: ${browserPlatform}</p>
        `;

        if (result) {
          let resultString = '';
          for (let key in result.model) {
            resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${
              result.model[key]
            }`;
          }
          resultDiv.innerHTML = `
            <p>The formula is satisfiable.</p>
            <p>The first model found was:</p>
            <p>{${resultString}<br />}</p>
            <p>It took ${parseDuration} milliseconds to parse the wff.</p>
            <p>
              It took ${generateModelsDuration} milliseconds to generate all ${
            models.length
          } models of this wff.</p>
            <p>It took ${checkDuration} milliseconds to find the above model.</p>
            <p>The above model was the ${nth(
              result.modelNumber
            )} model checked.</p>
            ${browserInfo}
          `;
        } else {
          resultDiv.innerHTML = `
            <p>The formula isn't satisfiable</p>
            <p>It took ${parseDuration} milliseconds to parse the wff.</p>
            <p>It took ${generateModelsDuration} milliseconds to generate all ${
            models.length
          } models of this wff.</p>
            <p>It took ${checkDuration} milliseconds to check every model.</p>
            ${browserInfo}
          `;
        }
      });
  } catch (error) {
    resultDiv.innerHTML = `<p>${error}</p>`;
    generateButton.disabled = false;
    submitButton.disabled = false;
    wffTextarea.disabled = false;
    wffLengthInput.disabled = false;
  }
};

const autoGenerateBenchmarks = () => {
  const generateButton = document.getElementById('generateButton');
  const submitButton = document.getElementById('submitButton');
  const wffLengthInput = document.getElementById('wffLength');
  const wffTextarea = document.getElementById('wffTextarea');

  let maxLength;
  const over20 = Math.floor(Math.random()) > 0.7;
  if (over20) {
    maxLength = 25;
  } else {
    maxLength = 20;
  }

  if (!wffLengthInput.disabled) {
    const length = Math.floor(Math.random() * maxLength) + 1;
    wffLengthInput.value = length;
    generateButton.click();
    setTimeout(() => {
      submitButton.click();
      setTimeout(autoGenerateBenchmarks, 100);
    }, 100);
  } else {
    setTimeout(autoGenerateBenchmarks, 1000);
  }
};

window.autoGenerateBenchmarks = autoGenerateBenchmarks;
