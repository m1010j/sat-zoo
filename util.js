import Logic from 'boolean-logic';
import firebase from 'firebase';

export const checkModels = (parsedWff, models) => {
  for (let i = 0; i < models.length; i++) {
    if (parsedWff.isTrue(models[i])) {
      return {
        model: models[i],
        modelNumber: i + 1,
      };
    }
  }
  return false;
};

export const nth = num => {
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
};

const generateWffWithOnes = numAtoms => {
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
};

const generateWffNotDistinct = numAtoms => {
  const wff = generateWffWithOnes(numAtoms);
  const wffArray = wff.split('');
  for (let i = 0; i < wffArray.length; i++) {
    if (wffArray[i] === '1') {
      wffArray[i] = Math.floor(Math.random() * numAtoms) + 1;
    }
  }
  return wffArray.join('');
};

export const generateWff = numAtoms => {
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
};

export const initializeFirebase = () => {
  const config = {
    apiKey: 'AIzaSyBGll1MQuJnfllmhEmFnhzksHwnTiLKosY',
    authDomain: 'sat-zoo.firebaseapp.com',
    databaseURL: 'https://sat-zoo.firebaseio.com',
    projectId: 'sat-zoo',
    storageBucket: 'sat-zoo.appspot.com',
    messagingSenderId: '291041690959',
  };
  firebase.initializeApp(config);
};
