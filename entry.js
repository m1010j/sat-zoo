import Logic, { isTrue } from 'boolean-logic';
import firebase, { app, database } from 'firebase';

document.addEventListener('DOMContentLoaded', () => {
  initializeFirebase();
  const ref = firebase.database().ref();
  ref.once('value').then(function(snapshot) {
    console.log(snapshot.val().benchmarks);
  });

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
    resultDiv.innerHTML = '';
  });

  submitButton.addEventListener('click', e => {
    e.preventDefault();
    benchmark(wffTextarea.value, ref);
  });

  if (wffTextarea.addEventListener) {
    wffTextarea.addEventListener(
      'input',
      function() {
        resultDiv.innerHTML = '';
      },
      false
    );
  } else if (wffTextarea.attachEvent) {
    wffTextarea.attachEvent('onpropertychange', function() {
      resultDiv.innerHTML = '';
    });
  }
});

function checkModels(parsedWff, models) {
  for (let i = 0; i < models.length; i++) {
    if (parsedWff.isTrue(models[i])) {
      return {
        model: models[i],
        modelNumber: i + 1,
      };
    }
  }
  return false;
}

function benchmark(wff, ref) {
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
}

function nth(num) {
  if (num % 10 === 1) {
    return `${num}st`;
  } else if (num % 10 === 2) {
    return `${num}nd`;
  }
  if (num % 10 === 3) {
    return `${num}rd`;
  } else {
    return `${num}th`;
  }
}

function generateWffWithOnes(numAtoms) {
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
}

function generateWffNotDistinct(numAtoms) {
  const wff = generateWffWithOnes(numAtoms);
  const wffArray = wff.split('');
  for (let i = 0; i < wffArray.length; i++) {
    if (wffArray[i] === '1') {
      wffArray[i] = Math.floor(Math.random() * numAtoms) + 1;
    }
  }
  return wffArray.join('');
}

function generateWff(numAtoms) {
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
}

function initializeFirebase() {
  const config = {
    apiKey: 'AIzaSyBGll1MQuJnfllmhEmFnhzksHwnTiLKosY',
    authDomain: 'sat-zoo.firebaseapp.com',
    databaseURL: 'https://sat-zoo.firebaseio.com',
    projectId: 'sat-zoo',
    storageBucket: 'sat-zoo.appspot.com',
    messagingSenderId: '291041690959',
  };
  firebase.initializeApp(config);
}

function autoGenerateBenchmarks() {
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
}

window.autoGenerateBenchmarks = autoGenerateBenchmarks;
