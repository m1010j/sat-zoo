import firebase from 'firebase';
import { benchmark } from './benchmark';
import { initializeFirebase, generateWff } from './util';
import Logic from 'boolean-logic';
import Worker from 'worker-loader!./Worker.js';

document.addEventListener('DOMContentLoaded', () => {
  initializeFirebase();
  const ref = firebase.database().ref();
  // ref.once('value').then(function(snapshot) {
  //   console.log(snapshot.val().benchmarks);
  // });
  const generateButton = document.getElementById('generateButton');
  const submitButton = document.getElementById('submitButton');
  const wffTextarea = document.getElementById('wffTextarea');
  const wffLengthInput = document.getElementById('wffLength');
  const resultDiv = document.getElementById('result');
  const atoms = Array.from(document.querySelector('.atoms').children);
  const rest = Array.from(document.querySelector('.rest').children);
  const keyboard = atoms.concat(rest);
  const bruteButton = document.getElementById('brute-force');
  const shortButton = document.getElementById('short-tables');

  let worker;

  if (window.Worker) {
    worker = new Worker('./worker.js');
  } else {
    resultDiv.innerHTML = `
      <p>Sat Zoo requires <a href="https://caniuse.com/#feat=webworkers">a browser with Web Worker support</a>.</p>
    `;
  }

  generateButton.addEventListener('click', e => {
    e.preventDefault();
    const wffLength = parseInt(wffLengthInput.value);
    const wff = parseToSym(generateWff(wffLength));
    submitButton.disabled = false;
    wffTextarea.value = wff;
    resultDiv.innerHTML = '';
  });

  keyboard.forEach(key => {
    key.addEventListener('click', e => {
      const selectionStart = wffTextarea.selectionStart;
      const wffArray = wffTextarea.value.split('');
      wffArray.splice(selectionStart, 0, toSymDict[key.innerText]);
      wffTextarea.value = wffArray.join('');
      wffTextarea.focus();
      wffTextarea.selectionStart = selectionStart + 1;
      wffTextarea.selectionEnd = selectionStart + 1;
    });
  });

  [bruteButton, shortButton].forEach(button => {
    button.addEventListener('click', e => {
      try {
        if (
          (bruteButton.checked || shortButton.checked) &&
          Logic._parse(parseFromSym(wffTextarea.value))
        ) {
          submitButton.disabled = false;
        } else {
          submitButton.disabled = true;
        }
      } catch (error) {
        submitButton.disabled = true;
      }
    });
  });

  submitButton.addEventListener('click', e => {
    e.preventDefault();
    benchmark(parseFromSym(wffTextarea.value), ref, worker);
  });

  if (wffTextarea.addEventListener) {
    wffTextarea.addEventListener(
      'input',
      e => {
        handleInputChange(e, resultDiv);
      },
      false
    );
    wffTextarea.addEventListener('paste', e => {
      handleInputChange(e, resultDiv);
    });
  } else if (wffTextarea.attachEvent) {
    wffTextarea.attachEvent('onpropertychange', e => {
      handleInputChange(e, resultDiv);
    });
  }

  wffLengthInput.addEventListener('input', () => {
    if (parseInt(wffLengthInput.value) > 0) {
      generateButton.disabled = false;
    } else {
      generateButton.disabled = true;
    }
  });
});

const toSymDict = {
  t: '⊤',
  f: '⊥',
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '(': '(',
  ')': ')',
  N: '¬',
  A: '∧',
  O: '∨',
  X: '⊻',
  T: '→',
  B: '≡',
  '¬': '¬',
  '∧': '∧',
  '∨': '∨',
  '⊻': '⊻',
  '→': '→',
  '≡': '≡',
  '⊤': '⊤',
  '⊥': '⊥',
};

const fromSymDict = {
  '⊤': 't',
  '⊥': 'f',
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '(': '(',
  ')': ')',
  '¬': 'N',
  '∧': 'A',
  '∨': 'O',
  '⊻': 'X',
  '→': 'T',
  '≡': 'B',
  t: 't',
  f: 'f',
  N: 'N',
  A: 'A',
  O: 'O',
  X: 'X',
  T: 'T',
  B: 'B',
};

const parseToSym = str => {
  let parsed = '';
  for (let ch of str) {
    parsed += toSymDict[ch];
  }
  return parsed;
};

const parseFromSym = str => {
  let parsed = '';
  for (let ch of str) {
    parsed += fromSymDict[ch];
  }
  return parsed;
};

const symStrIsValid = str => {
  for (let ch of str) {
    if (!fromSymDict[ch]) {
      return false;
    }
  }
  return true;
};

const handleInputChange = (e, resultDiv) => {
  e.preventDefault();

  const data =
    e.data ||
    (e.clipboardData && e.clipboardData.getData('Text')) ||
    (window.clipboardData && window.clipboardData.getData('Text')) ||
    wffTextarea.value;
  if (data) {
    const symbol = toSymDict[data];
    let dataParsed;
    try {
      dataParsed = Logic._parse(parseFromSym(data));
    } catch (error) {}
    if (symbol) {
      let selectionStart = wffTextarea.selectionStart;
      let selectionEnd = wffTextarea.selectionEnd;
      if (e.clipboardData) {
        selectionStart += 1;
      }
      const spliceNum = e.clipboardData
        ? selectionEnd - selectionStart + data.length
        : selectionEnd - selectionStart + 1;
      const wffArray = wffTextarea.value.split('');
      wffArray.splice(selectionStart - 1, spliceNum, symbol);
      wffTextarea.value = wffArray.join('');
      wffTextarea.selectionStart = selectionStart;
      wffTextarea.selectionEnd = selectionStart;
      let wffParsed;
      try {
        wffParsed = Logic._parse(parseFromSym(wffTextarea.value));
      } catch (error) {}
      if (wffParsed) {
        submitButton.disabled = false;
      } else {
        submitButton.disabled = true;
      }
    } else if (dataParsed) {
      const selectionStart = wffTextarea.selectionStart;
      const wffArray = wffTextarea.value.split('');
      wffArray.splice(selectionStart, data.length, parseToSym(data));
      wffTextarea.value = wffArray.join('');
      wffTextarea.selectionStart = selectionStart + data.length;
      wffTextarea.selectionEnd = selectionStart + data.length;
      let wffParsed;
      try {
        wffParsed = Logic._parse(parseFromSym(wffTextarea.value));
      } catch (error) {}
      if (wffParsed) {
        submitButton.disabled = false;
      } else {
        const wffArray = wffTextarea.value.split('');
        wffArray.splice(selectionStart, data.length);
        wffTextarea.value = wffArray.join('');
        submitButton.disabled = true;
      }
    } else if (symStrIsValid(data)) {
      submitButton.disabled = true;
      let selectionStart = wffTextarea.selectionStart;
      if (!(e.data || (e.clipboardData && e.clipboardData.getData('Text')))) {
        selectionStart = wffTextarea.selectionStart - data.length;
      }
      const wffArray = wffTextarea.value.split('');
      wffArray.splice(selectionStart, data.length, parseToSym(data));
      wffTextarea.value = wffArray.join('');
      wffTextarea.selectionStart = selectionStart + data.length;
      wffTextarea.selectionEnd = selectionStart + data.length;
    } else {
      submitButton.disabled = true;
      const selectionStart = wffTextarea.selectionStart;
      const wffArray = wffTextarea.value.split('');
      wffArray.splice(selectionStart - 1, 1);
      wffTextarea.value = wffArray.join('');
      wffTextarea.selectionStart = selectionStart;
      wffTextarea.selectionEnd = selectionStart;
      resultDiv.innerHTML = `
              <div>
                The only inputs allowed are:
                <ul>
                  <li>⊤</li>
                  <li>⊥</li>
                  <li>0</li>
                  <li>1</li>
                  <li>2</li>
                  <li>3</li>
                  <li>4</li>
                  <li>5</li>
                  <li>6</li>
                  <li>7</li>
                  <li>8</li>
                  <li>9</li>
                  <li>(</li>
                  <li>)</li>
                  <li>¬</li>
                  <li>∧</li>
                  <li>∨</li>
                  <li>⊻</li>
                  <li>→</li>
                  <li>≡</li>
                </ul>
                You can also use the following shortcuts:
                <ul>
                  <li>t for ⊤</li>
                  <li>f for ⊥</li>
                  <li>N for ¬</li>
                  <li>A for ∧</li>
                  <li>O for ∨</li>
                  <li>X for ⊻</li>
                  <li>T for →</li>
                  <li>B for ≡</li>
                </ul>
              </div>
            `;
    }
  }
  try {
    const parsed = Logic._parse(parseFromSym(wffTextarea.value));
    if (
      (document.getElementById('brute-force').checked ||
        document.getElementById('short-tables').checked) &&
      parsed
    ) {
      submitButton.disabled = false;
    } else {
      submitButton.disabled = true;
    }
  } catch (error) {
    submitButton.disabled = true;
  }
};
