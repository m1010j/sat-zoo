import firebase from 'firebase';
import Logic, { isSat } from 'boolean-logic';
import { nth } from './util';

export const benchmark = (wff, ref) => {
  const generateButton = document.getElementById('generateButton');
  const submitButton = document.getElementById('submitButton');
  const wffTextarea = document.getElementById('wffTextarea');
  const resultDiv = document.getElementById('result');
  const wffLengthInput = document.getElementById('wffLength');
  const bruteChecked = document.getElementById('brute-force').checked;
  const shortChecked = document.getElementById('short-tables').checked;
  generateButton.disabled = true;
  submitButton.disabled = true;
  wffTextarea.disabled = true;
  wffLengthInput.disabled = true;

  try {
    let bruteModel;
    let bruteTestDuration;
    let shortModel;
    let shortTestDuration;

    if (bruteChecked) {
      const beforeTime = new Date();
      bruteModel = isSat(wff, true, true);
      const afterTime = new Date();
      if (bruteModel === undefined) {
        resultDiv.innerHTML = `<p>Must provide a well-formed formula.</p>`;
        generateButton.disabled = false;
        submitButton.disabled = false;
        wffTextarea.disabled = false;
        wffLengthInput.disabled = false;
        return;
      }
      bruteTestDuration = afterTime.getTime() - beforeTime.getTime();
    }

    if (shortChecked) {
      const beforeTime = new Date();
      shortModel = isSat(wff, true, false);
      const afterTime = new Date();
      if (shortModel === undefined) {
        resultDiv.innerHTML = `<p>Must provide a well-formed formula.</p>`;
        generateButton.disabled = false;
        submitButton.disabled = false;
        wffTextarea.disabled = false;
        wffLengthInput.disabled = false;
        return;
      }
      shortTestDuration = afterTime.getTime() - beforeTime.getTime();
    }

    const browserName = navigator.appName;
    const browserEngine = navigator.product;
    const browserVersion1 = navigator.appVersion;
    const browserVersion2 = navigator.userAgent;
    const browserOnline = navigator.onLine;
    const browserPlatform = navigator.platform;

    if (bruteChecked) {
      let postData = {
        wff,
        numAtomics: Logic._atomics(wff).length,
        algorithm: 'brute',
        isSat: Boolean(bruteModel),
        bruteModel: bruteModel ? bruteModel : null,
        bruteTestDuration,
        browser: {
          browserName,
          browserEngine,
          browserVersion1,
          browserVersion2,
          browserPlatform,
        },
      };
      let newPostKey = firebase
        .database()
        .ref()
        .child('benchmarks')
        .push().key;
      let updates = {};
      updates['/benchmarks/' + newPostKey] = postData;
      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          if (shortChecked) {
            postData = {
              wff,
              numAtomics: Logic._atomics(wff).length,
              algorithm: 'short',
              isSat: Boolean(shortModel),
              shortModel: shortModel ? shortModel : null,
              bruteTestDuration,
              browser: {
                browserName,
                browserEngine,
                browserVersion1,
                browserVersion2,
                browserPlatform,
              },
            };
            newPostKey = firebase
              .database()
              .ref()
              .child('benchmarks')
              .push().key;
            updates = {};
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

                if (bruteModel) {
                  let resultString = '';
                  for (let key in bruteModel) {
                    resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${
                      bruteModel[key]
                    }`;
                  }
                  resultDiv.innerHTML = `
                    <p>The formula is satisfiable.</p>
                    <p>The first model found was:</p>
                    <p>{${resultString}<br />}</p>
                    <p>It took ${bruteTestDuration} milliseconds to find this model.</p>
                    ${browserInfo}
                  `;
                } else {
                  resultDiv.innerHTML = `
                    <p>The formula isn't satisfiable</p>
                    <p>It took ${bruteTestDuration} milliseconds to arrive at this.</p>
                    ${browserInfo}
                  `;
                }
              });
          } else {
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

            if (bruteModel) {
              let resultString = '';
              for (let key in bruteModel) {
                resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${
                  bruteModel[key]
                }`;
              }
              resultDiv.innerHTML = `
                    <p>The formula is satisfiable.</p>
                    <p>The first model found was:</p>
                    <p>{${resultString}<br />}</p>
                    <p>It took ${bruteTestDuration} milliseconds to find this model.</p>
                    ${browserInfo}
                  `;
            } else {
              resultDiv.innerHTML = `
                    <p>The formula isn't satisfiable</p>
                    <p>It took ${bruteTestDuration} milliseconds to arrive at this.</p>
                    ${browserInfo}
                  `;
            }
          }
        });
    } else if (shortChecked) {
      if (shortChecked) {
        let postData = {
          wff,
          numAtomics: Logic._atomics(wff).length,
          algorithm: 'short',
          isSat: Boolean(shortModel),
          shortModel: shortModel ? shortModel : null,
          shortTestDuration,
          browser: {
            browserName,
            browserEngine,
            browserVersion1,
            browserVersion2,
            browserPlatform,
          },
        };
        let newPostKey = firebase
          .database()
          .ref()
          .child('benchmarks')
          .push().key;
        let updates = {};
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

            if (shortModel) {
              let resultString = '';
              for (let key in shortModel) {
                resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${
                  shortModel[key]
                }`;
              }
              resultDiv.innerHTML = `
                    <p>The formula is satisfiable.</p>
                    <p>The first model found was:</p>
                    <p>{${resultString}<br />}</p>
                    <p>It took ${shortTestDuration} milliseconds to find this model using the short truth table algorithm.</p>
                    ${browserInfo}
                  `;
            } else {
              resultDiv.innerHTML = `
                    <p>The formula isn't satisfiable</p>
                    <p>It took ${shortTestDuration} milliseconds to arrive at this using the short truth table algorithm.</p>
                    ${browserInfo}
                  `;
            }
          });
      }
    }
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
