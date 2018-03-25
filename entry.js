import firebase from 'firebase';
import { benchmark } from './benchmark';
import { initializeFirebase, generateWff } from './util';

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
