import firebase from 'firebase';
import { benchmark } from './benchmark';
import { initializeFirebase, generateWff } from './util';
import Logic from 'boolean-logic';

document.addEventListener('DOMContentLoaded', () => {
  initializeFirebase();
  const ref = firebase.database().ref();
  // ref.once('value').then(function(snapshot) {
  //   console.log(snapshot.val().benchmarks);
  // });

  let worker;

  if (window.Worker) {
    worker = new Worker('./worker.js');
  }

  const generateButton = document.getElementById('generateButton');
  const submitButton = document.getElementById('submitButton');
  const wffTextarea = document.getElementById('wffTextarea');
  const wffLengthInput = document.getElementById('wffLength');
  const resultDiv = document.getElementById('result');
  const keyboard = Array.from(document.querySelector('.keyboard').children);
  const bruteButton = document.getElementById('brute-force');
  const shortButton = document.getElementById('short-tables');

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
      const cursorPosition = wffTextarea.selectionStart;
      const wffArray = wffTextarea.value.split('');
      wffArray.splice(cursorPosition, 0, toSymDict[key.innerText]);
      wffTextarea.value = wffArray.join('');
      wffTextarea.focus();
      wffTextarea.selectionStart = cursorPosition + 1;
      wffTextarea.selectionEnd = cursorPosition + 1;
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

const handleInputChange = (e, resultDiv) => {
  if (e.data) {
    const symbol = toSymDict[e.data];
    if (symbol) {
      const cursorPosition = wffTextarea.selectionStart;
      const wffArray = wffTextarea.value.split('');
      wffArray.splice(cursorPosition - 1, 1, symbol);
      wffTextarea.value = wffArray.join('');
      wffTextarea.selectionStart = cursorPosition;
      wffTextarea.selectionEnd = cursorPosition;
    } else {
      const cursorPosition = wffTextarea.selectionStart;
      const wffArray = wffTextarea.value.split('');
      wffArray.splice(cursorPosition - 1, 1);
      wffTextarea.value = wffArray.join('');
      wffTextarea.selectionStart = cursorPosition;
      wffTextarea.selectionEnd = cursorPosition;
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
                  <li>( for (</li>
                  <li>) for )</li>
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
};
