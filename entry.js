import firebase from 'firebase';
import { benchmark } from './benchmark';
import { initializeFirebase, generateWff } from './util';
import Logic from 'boolean-logic';
import Worker from 'worker-loader!./Worker.js';

document.addEventListener('DOMContentLoaded', () => {
  const resultDiv = document.getElementById('result');

  resetResultDiv(resultDiv);

  initializeFirebase();
  const ref = firebase.database().ref();
  // ref.once('value').then(function(snapshot) {
  //   console.log(snapshot.val().benchmarks);
  // });
  const generateButton = document.getElementById('generate-button');
  const resetButton = document.getElementById('reset-button');
  const submitButton = document.getElementById('submit-button');
  const wffTextarea = document.getElementById('wff-textarea');
  const wffLengthInput = document.getElementById('wff-length');
  const keypad = Array.from(document.getElementsByClassName('keypad-button'));
  const formulas = Array.from(document.getElementsByClassName('formula'));
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
    resetResultDiv(resultDiv);
    adjustTextarea(wffTextarea);
  });

  resetButton.addEventListener('click', e => {
    e.preventDefault();
    wffTextarea.value = '';
    wffLengthInput.value = '';
    resetResultDiv(resultDiv);
    generateButton.disabled = true;
    submitButton.disabled = true;
  });

  keypad.forEach(key => {
    key.addEventListener('mousedown', e => {
      e.preventDefault();
    });
    key.addEventListener('click', e => {
      if (key.children[0] && key.children[0].nodeName === 'svg') {
        handleBackspace(wffTextarea);
      } else {
        const selectionStart = wffTextarea.selectionStart;
        const wffArray = wffTextarea.value.split('');
        wffArray.splice(selectionStart, 0, toSymDict[key.innerText]);
        wffTextarea.value = wffArray.join('');
        wffTextarea.focus();
        wffTextarea.selectionStart = selectionStart + 1;
        wffTextarea.selectionEnd = selectionStart + 1;
        adjustTextarea(wffTextarea);
      }
    });
  });

  formulas.forEach(formula => {
    formula.addEventListener('mousedown', e => {
      e.preventDefault();
    });
    formula.addEventListener('click', e => {
      wffTextarea.value = formula.innerText;
      wffTextarea.selectionStart = formula.innerText.length;
      wffTextarea.selectionEnd = formula.innerText.length;
      submitButton.disabled = false;
      wffTextarea.focus();
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
        e.preventDefault();
        if (e.data) {
          handleInputChange(e, resultDiv);
        } else {
          adjustTextarea(wffTextarea);
        }
      },
      false
    );
    wffTextarea.addEventListener('paste', e => {
      handleInputChange(e, resultDiv);
    });
  } else if (wffTextarea.attachEvent) {
    wffTextarea.attachEvent('onpropertychange', e => {
      e.preventDefault();
      if (e.data) {
        handleInputChange(e, resultDiv);
      } else {
        handleBackspace(wffTextarea);
      }
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
  const generateButton = document.getElementById('generate-button');
  const submitButton = document.getElementById('submit-button');
  const wffTextarea = document.getElementById('wff-textarea');
  const wffLengthInput = document.getElementById('wff-length');
  const keypad = Array.from(document.getElementsByClassName('keypad-button'));
  const bruteButton = document.getElementById('brute-force');
  const shortButton = document.getElementById('short-tables');

  resetResultDiv(resultDiv);

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
        resetResultDiv(resultDiv);
        setTimeout(() => {
          resultDiv.innerHTML = instructionsCorrection;
          setTimeout(() => {
            resetResultDiv(resultDiv);
            setTimeout(() => {
              resetResultDiv(resultDiv);
              setTimeout(() => {
                resultDiv.innerHTML = instructionsCorrection;
                setTimeout(() => {
                  resetResultDiv(resultDiv);
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

const handleBackspace = wffTextarea => {
  const selectionStart = wffTextarea.selectionStart;
  const wffArray = wffTextarea.value.split('');
  if (selectionStart - 1 < 0) return;

  wffArray.splice(selectionStart - 1, 1);
  wffTextarea.value = wffArray.join('');
  wffTextarea.focus();
  wffTextarea.selectionStart = selectionStart - 1;
  wffTextarea.selectionEnd = selectionStart - 1;
  adjustTextarea(wffTextarea);
};

const adjustTextarea = textarea => {
  textarea.style.height = '1px';
  textarea.style.height = `${textarea.scrollHeight - 15}px`;
  document.getElementById(
    'result'
  ).style.height = `calc(100vh + 17px - 27.1rem - ${textarea.style.height})`;
};

const resetResultDiv = resultDiv => {
  resultDiv.innerHTML = instructions;
  const generateButton = document.getElementById('generate-button');
  const submitButton = document.getElementById('submit-button');
  const wffTextarea = document.getElementById('wff-textarea');
  const wffLengthInput = document.getElementById('wff-length');
  const formulas = Array.from(document.getElementsByClassName('formula'));
  formulas.forEach(formula => {
    formula.addEventListener('mousedown', e => {
      e.preventDefault();
    });
    formula.addEventListener('click', e => {
      wffTextarea.value = formula.innerText;
      wffTextarea.selectionStart = formula.innerText.length;
      wffTextarea.selectionEnd = formula.innerText.length;
      submitButton.disabled = false;
      adjustTextarea(wffTextarea);
      wffTextarea.focus();
    });
  });
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
  <p>
    You can choose one or two algorithms to determine satisfiability. The brute force algorithm generates all possible models
    for a well-formed formula (i.e. all possible assignments of truth values to the atoms). It then searches through these possible 
    models until it finds one in which the formula is true.
  </p>
  <p>The short truth table method starts by supposing that the well-formed formula is true and assigns all subformulas the truth 
    values that immediately follow. If no further assignment follows, it successively goes through open possibilities. If it ever 
    encounters a contradiction, it backtracks and tries the next possibility, until it either finds a model or else concludes that there
    is no model.
  </p>
  <p>
    To see the relative strengths of these two algorithms, try the following formulas:
    <ul>
      <li>
      <p class="formula">1∧¬1∧2∧3∧4∧5∧6∧7∧8∧9∧10∧11∧12∧13∧14∧15∧16</p>
      </li>
      <li>
      <p class="formula">((1⊻18)→((4≡((15→5)⊻24))→((¬(12→(((4⊻19)∧5)⊻(19∨(17⊻17)))))→(5⊻3))))∧((4∨22)⊻(3∨(14→4)))</p>
      </li>
    </ul>
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
  <p>
    You can choose one or two algorithms to determine satisfiability. The brute force algorithm generates all possible models
    for a well-formed formula (i.e. all possible assignments of truth values to the atoms). It then searches through these possible 
    models until it finds one in which the formula is true.
  </p>
  <p>The short truth table method starts by supposing that the well-formed formula is true and assigns all subformulas the truth 
    values that immediately follow. If no further assignment follows, it successively goes through open possibilities. If it ever 
    encounters a contradiction, it backtracks and tries the next possibility, until it either finds a model or else concludes that there
    is no model.
  </p>
  <p>
    To see the relative strengths of these two algorithms, try the following formulas:
    <ul>
      <li>
      <p class="formula">1∧¬1∧2∧3∧4∧5∧6∧7∧8∧9∧10∧11∧12∧13∧14∧15∧16</p>
      </li>
      <li>
      <p class="formula">((1⊻18)→((4≡((15→5)⊻24))→((¬(12→(((4⊻19)∧5)⊻(19∨(17⊻17)))))→(5⊻3))))∧((4∨22)⊻(3∨(14→4)))</p>
      </li>
    </ul>
  </p>
`;
