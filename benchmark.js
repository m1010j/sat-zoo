import Logic from 'boolean-logic';
import firebase from 'firebase';

export const benchmark = (wff, ref, worker) => {
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

  const beforeTime = new Date();
  if (worker) {
    worker.postMessage({ wff, bruteChecked, shortChecked });
  }

  worker.onmessage = e => {
    const postData = e.data;

    if (bruteChecked) {
      let newPostKey = firebase
        .database()
        .ref()
        .child('benchmarks')
        .push().key;
      let updates = {};
      updates['/benchmarks/' + newPostKey] = postData.brute;
      firebase
        .database()
        .ref()
        .update(updates)
        .then(() => {
          if (shortChecked) {
            if (postData.brute.bruteModel) {
              let resultString = '';
              for (let key in postData.brute.bruteModel) {
                resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${
                  postData.brute.bruteModel[key]
                }`;
              }
              resultDiv.innerHTML = `
              <h2>Brute force</h2>
              <p>The formula is satisfiable.</p>
              <p>The first model found was:</p>
              <p>{${resultString}<br />}</p>
              <p>It took ${
                postData.brute.testDuration
              } milliseconds to find this model.</p>
            `;
            } else {
              resultDiv.innerHTML = `
              <p>The formula isn't satisfiable</p>
              <p>It took ${
                postData.brute.testDuration
              } milliseconds to arrive at this.</p>
            `;
            }

            newPostKey = firebase
              .database()
              .ref()
              .child('benchmarks')
              .push().key;
            updates = {};
            updates['/benchmarks/' + newPostKey] = postData.short;
            firebase
              .database()
              .ref()
              .update(updates)
              .then(() => {
                generateButton.disabled = false;
                submitButton.disabled = false;
                wffTextarea.disabled = false;
                wffLengthInput.disabled = false;

                if (postData.short.shortModel) {
                  let resultString = '';
                  for (let key in postData.short.shortModel) {
                    resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${
                      postData.short.shortModel[key]
                    }`;
                  }
                  resultDiv.innerHTML = `
                  ${resultDiv.innerHTML}
                  <h2>Short truth tables</h2>
                  <p>The formula is satisfiable.</p>
                  <p>The model found was:</p>
                  <p>{${resultString}<br />}</p>
                  <p>It took ${
                    postData.short.testDuration
                  } milliseconds to find this model.</p>
                `;
                } else {
                  resultDiv.innerHTML = `
                  <p>The formula isn't satisfiable</p>
                  <p>It took ${
                    postData.short.testDuration
                  } milliseconds to arrive at this.</p>
                `;
                }
              });
          } else {
            submitButton.disabled = false;

            if (postData.brute.bruteModel) {
              let resultString = '';
              for (let key in postData.brute.bruteModel) {
                resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${
                  postData.brute.bruteModel[key]
                }`;
              }
              resultDiv.innerHTML = `
              <h2>Brute force</h2>
              <p>The formula is satisfiable.</p>
              <p>The first model found was:</p>
              <p>{${resultString}<br />}</p>
              <p>It took ${
                postData.brute.testDuration
              } milliseconds to find this model.</p>
            `;
            } else {
              resultDiv.innerHTML = `
              <p>The formula isn't satisfiable</p>
              <p>It took ${
                postData.brute.testDuration
              } milliseconds to arrive at this.</p>
            `;
            }
          }
        });
    } else if (shortChecked) {
      if (shortChecked) {
        let newPostKey = firebase
          .database()
          .ref()
          .child('benchmarks')
          .push().key;
        let updates = {};
        updates['/benchmarks/' + newPostKey] = postData.short;
        firebase
          .database()
          .ref()
          .update(updates)
          .then(() => {
            submitButton.disabled = false;

            if (postData.short.shortModel) {
              let resultString = '';
              for (let key in postData.short.shortModel) {
                resultString = `${resultString}<br />&nbsp;&nbsp;${key}: ${
                  postData.short.shortModel[key]
                }`;
              }
              resultDiv.innerHTML = `
                    <h2>Short truth tables</h2>
                    <p>The formula is satisfiable.</p>
                    <p>The model found was:</p>
                    <p>{${resultString}<br />}</p>
                    <p>It took ${
                      postData.short.testDuration
                    } milliseconds to find this model.</p>
                  `;
            } else {
              resultDiv.innerHTML = `
                    <p>The formula isn't satisfiable</p>
                    <p>It took ${
                      postData.short.testDuration
                    } milliseconds to arrive at this.</p>
                  `;
            }
          });
      }
    }
  };
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
