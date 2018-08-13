import Logic from 'boolean-logic';

export const benchmark = (wff, worker) => {
  const generateButton = document.getElementById('generate-button');
  const submitButton = document.getElementById('submit-button');
  const wffTextarea = document.getElementById('wff-textarea');
  const resultDiv = document.getElementById('result');
  const wffLengthInput = document.getElementById('wff-length');
  const bruteChecked = document.getElementById('brute-force').checked;
  const shortChecked = document.getElementById('short-tables').checked;
  const loader = document.getElementById('loader-container');

  generateButton.disabled = true;
  submitButton.disabled = true;
  wffTextarea.disabled = true;
  wffLengthInput.disabled = true;

  const beforeTime = new Date();
  if (worker) {
    loader.style.display = 'block';
    worker.postMessage({ wff, bruteChecked, shortChecked });
  }
  worker.onmessage = e => {
    loader.style.display = 'none';
    const postData = e.data;

    if (bruteChecked) {
      if (shortChecked) {
        if (postData.brute.bruteModel) {
          let resultString = '';
          const keys = Object.keys(postData.brute.bruteModel);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (i < keys.length - 1) {
              resultString = `${resultString}&nbsp;&nbsp;${key}: ${
                postData.brute.bruteModel[key]
              }</br>`;
            } else {
              resultString = `${resultString}&nbsp;&nbsp;${key}: ${
                postData.brute.bruteModel[key]
              }`;
            }
          }
          resultDiv.innerHTML = `
              <h2>Result</h2>
              <h3>Brute force</h3>
              <p>The formula is satisfiable.</p>
              <p>The first model found was:</p>
              <p class="model">${resultString}</p>
              <p>It took ${
                postData.brute.testDuration
              } milliseconds to find this model.</p>
            `;
        } else {
          resultDiv.innerHTML = `
              <p>The formula isn't satisfiable.</p>
              <p>It took ${
                postData.brute.testDuration
              } milliseconds to arrive at this.</p>
            `;
        }

        generateButton.disabled = !(parseInt(wffLengthInput.value) > 0);
        submitButton.disabled = false;
        wffTextarea.disabled = false;
        wffLengthInput.disabled = false;

        if (postData.short.shortModel) {
          let resultString = '';
          const keys = Object.keys(postData.short.shortModel);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (i < keys.length - 1) {
              resultString = `${resultString}&nbsp;&nbsp;${key}: ${
                postData.short.shortModel[key]
              }</br>`;
            } else {
              resultString = `${resultString}&nbsp;&nbsp;${key}: ${
                postData.short.shortModel[key]
              }`;
            }
          }
          resultDiv.innerHTML = `
                  ${resultDiv.innerHTML}
                  <h3>Short truth tables</h3>
                  <p>The formula is satisfiable.</p>
                  <p>The model found was:</p>
                  <p class="model">${resultString}</p>
                  <p>It took ${
                    postData.short.testDuration
                  } milliseconds to find this model.</p>
                `;
        } else {
          resultDiv.innerHTML = `
                  <h2>Result</h2>
                  <p>The formula isn't satisfiable.</p>
                  <p>It took ${
                    postData.brute.testDuration
                  } milliseconds to arrive at this using the brute force algorithm.</p>
                  <p>It took ${
                    postData.short.testDuration
                  } milliseconds to arrive at this using the short truth tables algorithm.</p>
                `;
        }
      } else {
        generateButton.disabled = !(parseInt(wffLengthInput.value) > 0);
        submitButton.disabled = false;
        wffTextarea.disabled = false;
        wffLengthInput.disabled = false;

        if (postData.brute.bruteModel) {
          let resultString = '';
          const keys = Object.keys(postData.brute.bruteModel);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (i < keys.length - 1) {
              resultString = `${resultString}&nbsp;&nbsp;${key}: ${
                postData.brute.bruteModel[key]
              }</br>`;
            } else {
              resultString = `${resultString}&nbsp;&nbsp;${key}: ${
                postData.brute.bruteModel[key]
              }`;
            }
          }
          resultDiv.innerHTML = `
              <h2>Result</h2>
              <h3>Brute force</h3>
              <p>The formula is satisfiable.</p>
              <p>The first model found was:</p>
              <p class="model">${resultString}</p>
              <p>It took ${
                postData.brute.testDuration
              } milliseconds to find this model.</p>
            `;
        } else {
          resultDiv.innerHTML = `
              <h2>Result</h2>
              <p>The formula isn't satisfiable.</p>
              <p>It took ${
                postData.brute.testDuration
              } milliseconds to arrive at this using the brute force algorithm.</p>
            `;
        }
      }
    } else if (shortChecked) {
      if (shortChecked) {
        generateButton.disabled = !(parseInt(wffLengthInput.value) > 0);
        submitButton.disabled = false;
        wffTextarea.disabled = false;
        wffLengthInput.disabled = false;

        if (postData.short.shortModel) {
          let resultString = '';
          const keys = Object.keys(postData.short.shortModel);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (i < keys.length - 1) {
              resultString = `${resultString}&nbsp;&nbsp;${key}: ${
                postData.short.shortModel[key]
              }</br>`;
            } else {
              resultString = `${resultString}&nbsp;&nbsp;${key}: ${
                postData.short.shortModel[key]
              }`;
            }
          }
          resultDiv.innerHTML = `
                <h2>Result</h2>
                <h3>Short truth tables</h3>
                <p>The formula is satisfiable.</p>
                <p>The model found was:</p>
                <p class="model">${resultString}</p>
                <p>It took ${
                  postData.short.testDuration
                } milliseconds to find this model.</p>
              `;
        } else {
          resultDiv.innerHTML = `
                <h2>Result</h2>
                <p>The formula isn't satisfiable.</p>
                <p>It took ${
                  postData.short.testDuration
                } milliseconds to arrive at this using the short truth tables algorithm.</p>
              `;
        }
      }
    }
  };
};

const autoGenerateBenchmarks = () => {
  const generateButton = document.getElementById('generate-button');
  const submitButton = document.getElementById('submit-button');
  const wffLengthInput = document.getElementById('wff-length');
  const wffTextarea = document.getElementById('wff-textarea');

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
