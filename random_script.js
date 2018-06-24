const generateButton = document.getElementById('generate-button');
const submitButton = document.getElementById('submit-button');
const wffTextarea = document.getElementById('wff-textarea');
const resultDiv = document.getElementById('result');
const wffLengthInput = document.getElementById('wff-length');

const randomLength = maxLength => Math.floor(Math.random() * maxLength);

const submit = () => {
  if (wffTextarea.value.length > 0) {
    submitButton.disabled = false;
    submitButton.click();
  } else {
    setTimeout(submit, 50);
  }
};

const restart = maxLength => {
  if (resultDiv.innerText[0] === 'R') {
    run(maxLength);
  } else {
    setTimeout(() => restart(maxLength), 100);
  }
};

const run = maxLength => {
  wffTextarea.value = '';
  resultDiv.innerText = '';
  wffLengthInput.value = randomLength(maxLength);
  generateButton.disabled = false;
  generateButton.click();
  submit();
  restart(maxLength);
};
