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
  const generateButton = document.getElementById('generate-button');
  const submitButton = document.getElementById('submit-button');
  const wffTextarea = document.getElementById('wff-textarea');
  const wffLengthInput = document.getElementById('wff-length');
  const resultDiv = document.getElementById('result');
  const keypad = Array.from(document.getElementsByClassName('keypad-button'));
  const bruteButton = document.getElementById('brute-force');
  const shortButton = document.getElementById('short-tables');
  let worker;

  resultDiv.innerHTML = instructions;

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
    resultDiv.innerHTML = instructions;
    adjustTextarea(wffTextarea);
  });

  keypad.forEach(key => {
    key.addEventListener('mousedown', e => {
      e.preventDefault();
    });
    key.addEventListener('click', e => {
      const selectionStart = wffTextarea.selectionStart;
      const wffArray = wffTextarea.value.split('');
      if (key.children[0] && key.children[0].nodeName === 'svg') {
        if (selectionStart - 1 < 0) return;

        wffArray.splice(selectionStart - 1, 1);
        wffTextarea.value = wffArray.join('');
        wffTextarea.focus();
        wffTextarea.selectionStart = selectionStart - 1;
        wffTextarea.selectionEnd = selectionStart - 1;
        adjustTextarea(wffTextarea);
      } else {
        wffArray.splice(selectionStart, 0, toSymDict[key.innerText]);
        wffTextarea.value = wffArray.join('');
        wffTextarea.focus();
        wffTextarea.selectionStart = selectionStart + 1;
        wffTextarea.selectionEnd = selectionStart + 1;
        adjustTextarea(wffTextarea);
      }
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

  const generateButton = document.getElementById('generate-button');
  const submitButton = document.getElementById('submit-button');
  const wffTextarea = document.getElementById('wff-textarea');
  const wffLengthInput = document.getElementById('wff-length');
  const keypad = Array.from(document.getElementsByClassName('keypad-button'));
  const bruteButton = document.getElementById('brute-force');
  const shortButton = document.getElementById('short-tables');

  resultDiv.innerHTML = instructions;

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
      resultDiv.innerHTML = instructionsCorrection;
      setTimeout(() => {
        resultDiv.innerHTML = instructions;
        setTimeout(() => {
          resultDiv.innerHTML = instructionsCorrection;
          setTimeout(() => {
            resultDiv.innerHTML = instructions;
            setTimeout(() => {
              resultDiv.innerHTML = instructions;
              setTimeout(() => {
                resultDiv.innerHTML = instructionsCorrection;
                setTimeout(() => {
                  resultDiv.innerHTML = instructions;
                }, 333);
              });
            });
          }, 333);
        });
      }, 333);
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

  adjustTextarea(wffTextarea);
};

const adjustTextarea = textarea => {
  textarea.style.height = '1px';
  textarea.style.height = `${textarea.scrollHeight - 15}px`;
  document.getElementById(
    'result'
  ).style.height = `calc(100vh + 17px - 27.1rem - ${textarea.style.height})`;
};

const instructions = `
  <h2>
    Instructions
  </h2>
  <p>Sat Zoo is a tool to test whether a well-formed formula of Boolean logic is satisfiable. Use the keypad or your keyboard
    to enter to enter a formula above, or randomly generate a formula containing a specified number of atoms.</p>
  <p>Well-formed formulas are made up of integers, which are understood as atoms, and the connectives ¬ ('not'), ∧ ('and'),
    ∨ ('or'), ⊻ ('xor'), → ('if . . . then . . .'), ≡ ('if and only if'), and the parentheses. </p>
  <p>To use your keyboard to type in a well-formed formula, type 'N' for ¬, 'A' for ∧, 'O' for ∨, 'X' for ⊻, 'T' for →, and
    'B' for ≡.</p>
  <p>You can choose one or two algorithms to determine satisfiability. The brute force algorithm generates all possible models
    for a well-formed formula (i.e. all possible assignments of truth values to the atoms). The short truth table method
    starts by supposing that the well-formed formula is true and assigns all subformulas the truth values that immediately
    follow. If no further assignment follows, it successively goes through open possibilities. If it ever encounters a
    contradiction, it backtracks and tries the next possibility, until it either finds a model or else concludes that there
    is no model.
  </p>
`;

const instructionsCorrection = `
  <h2>
    Instructions
  </h2>
  <p>Sat Zoo is a tool to test whether a well-formed formula of Boolean logic is satisfiable. Use the keypad or your keyboard
    to enter to enter a formula above, or randomly generate a formula containing a specified number of atoms.</p>
  <p class="warning">Well-formed formulas are made up of integers, which are understood as atoms, and the connectives ¬ ('not'), ∧ ('and'),
    ∨ ('or'), ⊻ ('xor'), → ('if . . . then . . .'), ≡ ('if and only if'), and the parentheses. </p>
  <p class="warning">To use your keyboard to type in a well-formed formula, type 'N' for ¬, 'A' for ∧, 'O' for ∨, 'X' for ⊻, 'T' for →, and
    'B' for ≡.</p>
  <p>You can choose one or two algorithms to determine satisfiability. The brute force algorithm generates all possible models
    for a well-formed formula (i.e. all possible assignments of truth values to the atoms). The short truth table method
    starts by supposing that the well-formed formula is true and assigns all subformulas the truth values that immediately
    follow. If no further assignment follows, it successively goes through open possibilities. If it ever encounters a
    contradiction, it backtracks and tries the next possibility, until it either finds a model or else concludes that there
    is no model.
  </p>
`;
