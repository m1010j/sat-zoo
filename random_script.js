const generateButton = document.getElementById('generate-button');
const submitButton = document.getElementById('submit-button');
const wffTextarea = document.getElementById('wff-textarea');
const resultDiv = document.getElementById('result');
const wffLengthInput = document.getElementById('wff-length');

const randomLength = () => Math.floor(Math.random() * 21);

const submit = () => {
  if (wffTextarea.value.length > 0) {
    submitButton.disabled = false;
    submitButton.click();
  } else {
    setTimeout(submit, 50);
  }
};

const restart = () => {
  if (resultDiv.innerText[0] === 'R') {
    run();
  } else {
    setTimeout(restart, 100);
  }
};

const run = () => {
  wffTextarea.value = '';
  resultDiv.innerText = '';
  wffLengthInput.value = randomLength();
  generateButton.disabled = false;
  generateButton.click();
  submit();
  restart();
};
