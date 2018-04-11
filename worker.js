onmessage = e => {
  const { wff, bruteChecked, shortChecked } = e.data;

  const browserName = navigator.appName;
  const browserEngine = navigator.product;
  const browserVersion1 = navigator.appVersion;
  const browserVersion2 = navigator.userAgent;
  const browserOnline = navigator.onLine;
  const browserPlatform = navigator.platform;

  let bruteModel;
  let bruteTestDuration;
  let shortModel;
  let shortTestDuration;

  if (bruteChecked) {
    const beforeTime = new Date();
    bruteModel = Logic.isSat(wff, true, true);
    const afterTime = new Date();
    bruteTestDuration = afterTime.getTime() - beforeTime.getTime();
  }

  if (shortChecked) {
    const beforeTime = new Date();
    shortModel = Logic.isSat(wff, true, false);
    const afterTime = new Date();
    shortTestDuration = afterTime.getTime() - beforeTime.getTime();
  }

  const postData = {};

  if (bruteChecked) {
    postData.brute = {
      wff,
      numAtomics: Logic._atomics(wff).length,
      algorithm: 'brute',
      isSat: Boolean(bruteModel),
      bruteModel: bruteModel ? bruteModel : null,
      testDuration: bruteTestDuration,
      browser: {
        browserName,
        browserEngine,
        browserVersion1,
        browserVersion2,
        browserPlatform,
      },
    };
  }

  if (shortChecked) {
    postData.short = {
      wff,
      numAtomics: Logic._atomics(wff).length,
      algorithm: 'short',
      isSat: Boolean(shortModel),
      shortModel: shortModel ? shortModel : null,
      testDuration: shortTestDuration,
      browser: {
        browserName,
        browserEngine,
        browserVersion1,
        browserVersion2,
        browserPlatform,
      },
    };
  }

  postMessage(postData);
};

class Logic {
  constructor(value) {
    this.value = value;
    this.parent = null;
    this.children = [];
  }
}

Logic.prototype.setParent = function(parent) {
  if (this.parent === parent) {
    return;
  }

  if (this.parent) {
    const children = this.parent.children;
    const thisIndex = children.indexOf(this);
    children.splice(thisIndex, 1);
  }

  this.parent = parent;

  if (this.parent) {
    this.parent.children.push(this);
  }
};

Logic.prototype.addChild = function(child) {
  child.setParent(this);
};

Logic.prototype.removeChild = function(child) {
  if (this.children.includes(child)) child.setParent(null);
};

Logic.prototype.atomic = function() {
  return this.children.length === 0 && Logic._isAtomic(this.value);
};

Logic.prototype.wff = function() {
  const connectives = Object.keys(this.constructor._connectives);
  if (!this.atomic() && !connectives.includes(this.value)) {
    return false;
  } else if (this.atomic()) {
    return true;
  } else if (
    this.value === 'N' &&
    this.children.length === 1 &&
    this.children[0].wff()
  ) {
    return true;
  } else if (
    this.constructor._binaryConns.includes(this.value) &&
    this.children.length === 2 &&
    this.children[0].wff() &&
    this.children[1].wff()
  ) {
    return true;
  }

  return false;
};

Logic.prototype.dup = function() {
  return this.constructor._parse(this.stringify());
};

Logic.prototype.reduce = function() {
  if (this.children.length === 0) {
    return this.dup();
  } else if (this.value === 'N') {
    const negation = new this.constructor('N');
    negation.addChild(this.children[0].reduce());
    return negation;
  } else if (this.value === 'O') {
    const disjunction = new this.constructor('O');
    disjunction.addChild(this.children[0].reduce());
    disjunction.addChild(this.children[1].reduce());
    return disjunction;
  } else if (this.value === 'A') {
    const firstNegation = new this.constructor('N');
    const secondNegation = new this.constructor('N');
    const thirdNegation = new this.constructor('N');
    const disjunction = new this.constructor('O');
    const firstChildReduced = this.children[0].reduce();
    const secondChildReduced = this.children[1].reduce();
    firstNegation.addChild(firstChildReduced);
    secondNegation.addChild(secondChildReduced);
    disjunction.addChild(firstNegation);
    disjunction.addChild(secondNegation);
    thirdNegation.addChild(disjunction);
    return thirdNegation;
  } else if (this.value === 'X') {
    const firstChildReduced1 = this.children[0].reduce();
    const secondChildReduced1 = this.children[1].reduce();
    const firstChildReduced2 = firstChildReduced1.dup();
    const secondChildReduced2 = secondChildReduced1.dup();
    const disjunction = new this.constructor('O');
    disjunction.addChild(firstChildReduced1);
    disjunction.addChild(secondChildReduced1);
    const firstConjunction = new this.constructor('A');
    firstConjunction.addChild(firstChildReduced2);
    firstConjunction.addChild(secondChildReduced2);
    const negation = new this.constructor('N');
    negation.addChild(firstConjunction);
    const secondConjunction = new this.constructor('A');
    secondConjunction.addChild(disjunction);
    secondConjunction.addChild(negation);
    return secondConjunction.reduce();
  } else if (this.value === 'T') {
    const firstChildReduced = this.children[0].reduce();
    const secondChildReduced = this.children[1].reduce();
    const negation = new this.constructor('N');
    negation.addChild(firstChildReduced);
    const disjunction = new this.constructor('O');
    disjunction.addChild(negation);
    disjunction.addChild(secondChildReduced);
    return disjunction;
  } else if (this.value === 'B') {
    const firstChildReduced1 = this.children[0].reduce();
    const secondChildReduced1 = this.children[1].reduce();
    const firstChildReduced2 = firstChildReduced1.dup();
    const secondChildReduced2 = secondChildReduced1.dup();
    const negation1 = new this.constructor('N');
    negation1.addChild(firstChildReduced1);
    const disjunction1 = new this.constructor('O');
    disjunction1.addChild(negation1);
    disjunction1.addChild(secondChildReduced1);
    const negation2 = new this.constructor('N');
    negation2.addChild(secondChildReduced2);
    const disjunction2 = new this.constructor('O');
    disjunction2.addChild(negation2);
    disjunction2.addChild(firstChildReduced2);
    const conjunction = new this.constructor('A');
    conjunction.addChild(disjunction1);
    conjunction.addChild(disjunction2);
    return conjunction.reduce();
  }
};

Logic.prototype.stringify = function() {
  if (this.children.length === 0) {
    return this.value;
  } else if (this.children.length === 1) {
    const child0String = this.children[0].stringify();
    if (!child0String) {
      return;
    } else {
      return `(${this.value}${child0String})`;
    }
  } else if (this.children.length === 2) {
    const child0String = this.children[0].stringify();
    const child1String = this.children[1].stringify();
    if (!child0String || !child1String) {
      return;
    } else {
      return `(${child0String}${this.value}${child1String})`;
    }
  } else {
    return;
  }
};

Logic.prototype.isTrue = function(model = {}) {
  const modelValues = Object.keys(model).map(key => model[key]);
  for (let modelValue of modelValues) {
    if (modelValue !== true && modelValue !== false) {
      return;
    }
  }

  const fullModel = Object.assign({}, model || {}, this.constructor._booleans);
  if (this.atomic()) {
    return fullModel[this.value];
  } else {
    const childOne = this.children[0].isTrue(model);
    let childTwo;
    if (this.children[1]) childTwo = this.children[1].isTrue(model);
    const connective = this.constructor._connectives[this.value];
    return connective(childOne, childTwo);
  }
};

Logic.prototype.supposeTrue = () => {
  const reduced = this.reduce();
  const numAtomics = Logic._atomics(reduced.stringify()).length;
  const models = [{}];
  if (reduced.children.length === 0) {
    if (reduced.value === 't') {
      return { t: boolean };
    } else if (reduced.value === 'f') {
      return;
    } else {
    }
  } else {
    if (reduced.value === 'N') {
      models;
    } else {
    }
  }
};

Logic._checkModels = function(parsedWff, models, returnModel) {
  for (let model of models) {
    if (parsedWff.isTrue(model)) {
      return returnModel ? model : true;
    }
  }
  return false;
};

Logic._booleans = {
  t: true,
  f: false,
};

Logic._binaryConns = ['A', 'O', 'T', 'B', 'X'];

Logic._vocabulary = Logic._binaryConns.concat(['N', '(', ')', 't', 'f']);

Logic._connectives = {
  A: (sentOne, sentTwo) => sentOne && sentTwo,
  O: (sentOne, sentTwo) => sentOne || sentTwo,
  T: (sentOne, sentTwo) => !sentOne || sentTwo,
  B: (sentOne, sentTwo) => (!sentOne || sentTwo) && (!sentTwo || sentOne),
  X: (sentOne, sentTwo) => (!sentOne && sentTwo) || (sentOne && !sentTwo),
  N: sentence => !sentence,
};

Logic._generateModels = function(wff) {
  const atomics = this._atomics(wff);
  const subsets = this._subsets(atomics);
  return subsets.map(subset => {
    const newModel = {};
    atomics.forEach(atomic => {
      if (subset.includes(atomic)) {
        newModel[atomic] = false;
      } else {
        newModel[atomic] = true;
      }
    });
    return newModel;
  });
};

Logic._atomics = function(wff) {
  wff = this._ensureIsArray(wff);
  if (!wff) {
    return;
  }
  const atomics = [];
  wff.forEach(el => {
    if (this._isAtomic(el) && !atomics.includes(el)) {
      atomics.push(el);
    }
  });
  return atomics;
};

Logic._parse = function(wff) {
  this._ensureIsLegal(wff);
  wff = Logic._ensureIsArray(wff);
  if (!wff) {
    throw new Error('Argument must be either a string or an array');
  }
  const mainConnectiveIdx = this._mainConnectiveIdx(wff);

  const mainConnective = wff[mainConnectiveIdx];
  if (wff.length === 1 && Logic._isAtomic(wff[0])) {
    return new Logic(wff[0]);
  } else if (
    wff[0] === '(' &&
    wff.length > 3 &&
    this._matchingClosingParensIdx(wff, 0) === wff.length - 1
  ) {
    if (
      wff[1] === '(' &&
      this._matchingClosingParensIdx(wff, 1) === wff.length - 2
    ) {
      return;
    } else {
      return this._parse(wff.slice(1, wff.length - 1));
    }
  } else if (mainConnectiveIdx === 0) {
    const prejacent = this._parse(wff.slice(1));
    const connective = new Logic(wff[mainConnectiveIdx]);
    if (prejacent) {
      connective.addChild(prejacent);
      return connective;
    }
  } else if (mainConnectiveIdx) {
    const firstConjunct = this._parse(wff.slice(0, mainConnectiveIdx));
    const secondConjunct = this._parse(wff.slice(mainConnectiveIdx + 1));
    if (firstConjunct && secondConjunct) {
      const connective = new Logic(mainConnective);
      if (mainConnective) {
        connective.addChild(firstConjunct);
        connective.addChild(secondConjunct);
        return connective;
      }
    }
  }
};

Logic._parseString = function(str) {
  const parsed = [];
  for (let i = 0; i < str.length; i++) {
    if (this._vocabulary.includes(str[i])) {
      parsed.push(str[i]);
    } else {
      let subStr = '';
      for (
        let j = i;
        j < str.length && !this._vocabulary.includes(str[j]);
        j++
      ) {
        subStr += str[j];
        i = j;
      }
      if (this._isAtomic(subStr)) {
        parsed.push(subStr);
      } else {
        return;
      }
    }
  }
  return parsed;
};

Logic._isAtomic = function(str) {
  if (['t', 'f'].includes(str) || !isNaN(parseInt(str))) {
    return true;
  } else {
    return false;
  }
};

Logic._mainConnectiveIdx = function(sentArr) {
  const binaryConns = this._binaryConns;
  if (sentArr.length === 1) {
    return;
  } else if (sentArr[0] === 'I') {
    const thenIdx = this._mainConnectiveIdx(sentArr.slice(1));
    if (sentArr[thenIdx + 1] === 'T') {
      return thenIdx + 1;
    } else {
      return;
    }
  } else if (
    sentArr[0] === '(' &&
    this._matchingClosingParensIdx(sentArr, 0) === sentArr.length - 1
  ) {
    if (
      sentArr[1] === '(' &&
      this._matchingClosingParensIdx(sentArr, 1) === sentArr.length - 2
    ) {
      return;
    } else {
      return this._mainConnectiveIdx(sentArr.slice(1, sentArr.length - 1)) + 1;
    }
  } else if (
    sentArr.length === 2 &&
    sentArr[0] === 'N' &&
    Logic._isAtomic(sentArr[1])
  ) {
    return 0;
  } else if (
    sentArr[0] === 'N' &&
    sentArr[1] === '(' &&
    this._matchingClosingParensIdx(sentArr, 1) === sentArr.length - 1
  ) {
    return 0;
  } else if (
    sentArr[0] === 'N' &&
    sentArr[1] === 'N' &&
    this._mainConnectiveIdx(sentArr.slice(1)) === 0
  ) {
    return 0;
  } else if (sentArr[0] === 'N' && this._mainConnectiveIdx(sentArr.slice(1))) {
    return this._mainConnectiveIdx(sentArr.slice(1)) + 1;
  } else if (
    sentArr.length === 3 &&
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    Logic._isAtomic(sentArr[2])
  ) {
    return 1;
  } else if (
    sentArr.length === 3 &&
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    Logic._isAtomic(sentArr[2])
  ) {
    return 1;
  } else if (
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[2] === '(' &&
    this._matchingClosingParensIdx(sentArr, 2) === sentArr.length - 1
  ) {
    return 1;
  } else if (
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[2] === 'N'
  ) {
    return 1;
  } else if (
    Logic._isAtomic(sentArr[0]) &&
    binaryConns.includes(sentArr[1]) &&
    sentArr[this._mainConnectiveIdx(sentArr.slice(2)) + 2] === sentArr[1]
  ) {
    return 1;
  } else if (sentArr[0] === '(') {
    const matchingClosingParensIdx = this._matchingClosingParensIdx(sentArr, 0);
    if (!matchingClosingParensIdx) {
      return undefined;
    } else if (
      binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) &&
      Logic._isAtomic(sentArr[matchingClosingParensIdx + 2]) &&
      sentArr.length === matchingClosingParensIdx + 3
    ) {
      return matchingClosingParensIdx + 1;
    } else if (
      binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) &&
      sentArr[matchingClosingParensIdx + 2] === 'N'
    ) {
      return matchingClosingParensIdx + 1;
    } else if (
      binaryConns.includes(sentArr[matchingClosingParensIdx + 1]) &&
      sentArr[matchingClosingParensIdx + 2] === '(' &&
      this._matchingClosingParensIdx(sentArr, matchingClosingParensIdx + 2) ===
        sentArr.length - 1
    ) {
      return matchingClosingParensIdx + 1;
    } else {
      const secondMainConnIdx =
        this._mainConnectiveIdx(sentArr.slice(matchingClosingParensIdx + 2)) +
        matchingClosingParensIdx +
        2;
      if (
        sentArr[secondMainConnIdx] === sentArr[matchingClosingParensIdx + 1]
      ) {
        return matchingClosingParensIdx + 1;
      }
    }
  }
};

Logic._matchingClosingParensIdx = function(sentArr, idx) {
  let openCount = 0;
  for (let i = idx + 1; i < sentArr.length; i++) {
    if (sentArr[i] === '(') {
      openCount++;
    } else if (sentArr[i] === ')' && openCount > 0) {
      openCount--;
    } else if (sentArr[i] === ')' && openCount === 0) {
      return i;
    }
  }
};

Logic._subsets = function(array) {
  if (array.length === 0) {
    return [[]];
  }
  const subs = this._subsets(array.slice(0, array.length - 1));
  const concatted = subs.map(sub => {
    return sub.concat([array[array.length - 1]]);
  });
  return subs.concat(concatted);
};

Logic._remove = function(sentArr, el) {
  const idx = sentArr.indexOf(el);
  if (idx !== -1) sentArr.splice(idx, 1);
};

Logic._ensureIsArray = function(wff) {
  if (typeof wff === 'string') {
    wff = this._parseString(wff);
  } else if (!(wff instanceof Array)) {
    return;
  }
  return wff;
};

Logic._ensureIsLegal = function(wff) {
  for (let i = 0; i < wff.length; i++) {
    if (!this._vocabulary.includes(wff[i]) && !this._isAtomic(wff[i])) {
      throw new Error(
        "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)"
      );
    }
  }
};

Logic._modelsAreEqual = function(first, second) {
  const firstKeys = Object.keys(first).sort();
  const secondKeys = Object.keys(second).sort();
  if (!this._arraysAreEqual(firstKeys, secondKeys)) {
    return false;
  }
  for (let key in first) {
    if (first[key] !== second[key]) {
      return false;
    }
  }
  return true;
};

Logic._modelsAreConsistent = function(first, second) {
  for (let key in first) {
    if (
      first[key] !== undefined &&
      second[key] !== undefined &&
      first[key] !== second[key]
    ) {
      return false;
    }
  }
  return true;
};

Logic._arraysAreEqual = function(first, second) {
  for (let i = 0; i < first.length; i++) {
    if (first[i] !== second[i]) {
      return false;
    }
  }
  return true;
};

Logic._validateArgument = function(argument) {
  if (typeof argument === 'string') {
    return this.normalize(argument);
  } else if (argument instanceof Array && argument.length === 2) {
    let premises = argument[0];
    if (premises instanceof Array) {
      premises = this._normalizeArray(premises);
      if (premises.length === 0) {
        premises = 't';
      } else {
        premises = premises.join('A');
      }
    }

    let conclusions = argument[1];
    if (conclusions instanceof Array) {
      conclusions = this._normalizeArray(conclusions);
      if (conclusions.length === 0) {
        conclusions = 'f';
      } else {
        conclusions = conclusions.join('O');
      }
    }
    return `(${this.normalize(premises)}T${this.normalize(conclusions)})`;
  } else {
    throw new Error(
      'Argument must be either a string, an array of two strings, or an array of two (possibly empty) arrays of strings.'
    );
  }
};

Logic._normalizeArray = function(array) {
  return array.map(wff => {
    return this.normalize(wff);
  });
};

Logic.prototype.forEach = function(callback) {
  let nodes = [this];
  while (nodes.length > 0) {
    let node = nodes.shift();
    callback(node);
    nodes = nodes.concat(node.children);
  }
};

Logic.prototype.length = function() {
  let num = 0;
  this.forEach(node => {
    num += 1;
  });
  return num;
};

Logic.prototype.nthNode = function(n) {
  if (n === 0) return this;
  const children = this.children;
  for (let i = 0; i < children.length; i++) {
    n--;
    let result = children[i].nthNode(n);
    if (result) {
      return result;
    } else {
      n = n - children[i].length() + 1;
    }
  }
};

Logic.prototype.findIdx = function(str) {
  const length = this.length();
  for (let i = 0; i < length; i++) {
    if (this.nthNode(i).stringify() === str) {
      return i;
    }
  }
};

Logic.prototype.supposeTrue = function() {
  if (this.value === 'f') {
    return;
  }

  const wff = this;
  const length = wff.length();
  let model = {
    [wff.stringify()]: { truthValue: true },
    t: { truthValue: true },
    f: { truthValue: false },
  };
  let i = 0;
  let node;
  let nodeString;
  let nodeValueInModel;
  let negatumString;
  let negatumValueInModel;
  let firstComponentString;
  let secondComponentString;
  let firstComponentValueInModel;
  let secondComponentValueInModel;
  let nodeOpenPossibilities;

  while (!model.busted && i < length) {
    node = wff.nthNode(i);
    nodeString = node.stringify();
    if (model[nodeString] !== undefined) {
      nodeValueInModel = model[nodeString].truthValue;
    }
    if (typeof nodeValueInModel === 'boolean') {
      if (node.value === 'N') {
        handleNot();
      } else if (node.value === 'A') {
        handleAnd();
      } else if (node.value === 'O') {
        handleOr();
      } else if (node.value === 'X') {
        handleXor();
      } else if (node.value === 'T') {
        handleIf();
      } else if (node.value === 'B') {
        handleIff();
      }
    }
    i++;
  }
  if (!model.busted) {
    return extractRealModel(model);
  }

  function extractRealModel() {
    const realModel = {};
    const wffString = wff.stringify();
    const containsT = wffString.includes('t');
    const containsF = wffString.includes('f');

    if (containsT && containsF) {
      for (let key in model) {
        if (Logic._isAtomic(key)) {
          realModel[key] = model[key].truthValue;
        }
      }
    } else if (containsT && !containsF) {
      for (let key in model) {
        if (key !== 'f' && Logic._isAtomic(key)) {
          realModel[key] = model[key].truthValue;
        }
      }
    } else if (!containsT && containsF) {
      for (let key in model) {
        if (key !== 't' && Logic._isAtomic(key)) {
          realModel[key] = model[key].truthValue;
        }
      }
    } else if (!containsT && !containsF) {
      for (let key in model) {
        if (key !== 't' && key !== 'f' && Logic._isAtomic(key)) {
          realModel[key] = model[key].truthValue;
        }
      }
    }

    return realModel;
  }

  function handleNot() {
    negatumValueInModel = undefined;
    negatumString = node.children[0].stringify();
    if (model[negatumString] !== undefined) {
      negatumValueInModel = model[negatumString].truthValue;
    }
    if (negatumValueInModel === nodeValueInModel) {
      handleInconsistency();
    } else if (negatumValueInModel === undefined) {
      model[negatumString] = { truthValue: !nodeValueInModel };
    }
  }

  function handleAnd() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (nodeValueInModel) {
      handleNodeTrue();
    } else {
      handleNodeFalse();
    }

    function handleNodeTrue() {
      if (
        firstComponentValueInModel === false ||
        secondComponentValueInModel === false
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: true };
      }
    }

    function handleNodeFalse() {
      if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === true
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        addFalseTrue();
        handleFalseUndef();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        addTrueFalse();
        handleUndefFalse();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueFalse();
        handleUndefUndef();
      }
    }

    function handleFalseUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[secondComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[secondComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefFalse() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, true]);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
        if (
          model[secondComponentString] &&
          model[secondComponentString].truthValue
        ) {
          handleInconsistency();
        } else {
          model[secondComponentString] = { truthValue: false };
        }
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
        if (
          model[secondComponentString] &&
          !model[secondComponentString].truthValue
        ) {
          handleInconsistency();
        } else {
          model[secondComponentString] = { truthValue: true };
        }
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }
  }

  function handleOr() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === false
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleTrueUndef();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        addTrueTrue();
        handleUndefTrue();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }
    }

    function handleNodeFalse() {
      if (
        firstComponentValueInModel === true ||
        secondComponentValueInModel === true
      ) {
        handleInconsistency();
      } else {
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: false };
      }
    }

    function handleTrueUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([true, false]);
        model[nodeString].snapshot = merge({}, model);
        model[secondComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[secondComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefTrue() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, true]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([true, false]);
        nodeOpenPossibilities.push([false, true]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
        if (
          model[secondComponentString] &&
          model[secondComponentString].truthValue
        ) {
          handleInconsistency();
        } else {
          model[secondComponentString] = { truthValue: false };
        }
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
        if (
          model[secondComponentString] &&
          !model[secondComponentString].truthValue
        ) {
          handleInconsistency();
        } else {
          model[secondComponentString] = { truthValue: true };
        }
      } else {
        handleInconsistency();
      }
    }
  }

  function handleXor() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      handleNodeTrue();
    }

    function handleNodeFalse() {
      if (
        (firstComponentValueInModel === true &&
          secondComponentValueInModel === false) ||
        (firstComponentValueInModel === false &&
          secondComponentValueInModel === true)
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }

      function addTrueTrue() {
        if (!nodeOpenPossibilities) {
          model[nodeString].openPossibilities = [[true, true]];
          nodeOpenPossibilities = model[nodeString].openPossibilities;
        }
      }

      function handleUndefUndef() {
        if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [true, true])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            true,
            true,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          nodeOpenPossibilities.push([false, false]);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: true };
          model[secondComponentString] = { truthValue: true };
        } else if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [false, false])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            false,
            false,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: false };
          model[secondComponentString] = { truthValue: false };
        } else {
          handleInconsistency();
        }
      }
    }

    function handleNodeTrue() {
      if (
        (firstComponentValueInModel === true &&
          secondComponentValueInModel === true) ||
        (firstComponentValueInModel === false &&
          secondComponentValueInModel === false)
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueFalse();
        handleUndefUndef();
      }

      function addTrueFalse() {
        if (!nodeOpenPossibilities) {
          model[nodeString].openPossibilities = [[true, false]];
          nodeOpenPossibilities = model[nodeString].openPossibilities;
        }
      }

      function handleUndefUndef() {
        if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [true, false])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            true,
            false,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          nodeOpenPossibilities.push([false, true]);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: true };
          if (
            model[secondComponentString] &&
            model[secondComponentString].truthValue
          ) {
            handleInconsistency();
          } else {
            model[secondComponentString] = { truthValue: false };
          }
        } else if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [false, true])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            false,
            true,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: false };
          if (
            model[secondComponentString] &&
            !model[secondComponentString].truthValue
          ) {
            handleInconsistency();
          } else {
            model[secondComponentString] = { truthValue: true };
          }
        } else {
          handleInconsistency();
        }
      }
    }
  }
  function handleIff() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      handleNodeTrue();
    }

    function handleNodeFalse() {
      if (
        (firstComponentValueInModel === true &&
          secondComponentValueInModel === true) ||
        (firstComponentValueInModel === false &&
          secondComponentValueInModel === false)
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueFalse();
        handleUndefUndef();
      }

      function addTrueFalse() {
        if (!nodeOpenPossibilities) {
          model[nodeString].openPossibilities = [[true, false]];
          nodeOpenPossibilities = model[nodeString].openPossibilities;
        }
      }

      function handleUndefUndef() {
        if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [true, false])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            true,
            false,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          nodeOpenPossibilities.push([false, true]);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: true };
          if (
            model[secondComponentString] &&
            model[secondComponentString].truthValue
          ) {
            handleInconsistency();
          } else {
            model[secondComponentString] = { truthValue: false };
          }
        } else if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [false, true])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            false,
            true,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: false };
          if (
            model[secondComponentString] &&
            !model[secondComponentString].truthValue
          ) {
            handleInconsistency();
          } else {
            model[secondComponentString] = { truthValue: true };
          }
        } else {
          handleInconsistency();
        }
      }
    }

    function handleNodeTrue() {
      if (
        (firstComponentValueInModel === true &&
          secondComponentValueInModel === false) ||
        (firstComponentValueInModel === false &&
          secondComponentValueInModel === true)
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        model[firstComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }

      function addTrueTrue() {
        if (!nodeOpenPossibilities) {
          model[nodeString].openPossibilities = [[true, true]];
          nodeOpenPossibilities = model[nodeString].openPossibilities;
        }
      }

      function handleUndefUndef() {
        if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [true, true])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            true,
            true,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          nodeOpenPossibilities.push([false, false]);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: true };
          model[secondComponentString] = { truthValue: true };
        } else if (
          nodeOpenPossibilities &&
          arrayIncludesArray(nodeOpenPossibilities, [false, false])
        ) {
          let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
            false,
            false,
          ]);
          nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
          model[nodeString].snapshot = merge({}, model);
          model[firstComponentString] = { truthValue: false };
          model[secondComponentString] = { truthValue: false };
        } else {
          handleInconsistency();
        }
      }
    }
  }

  function handleIf() {
    firstComponentString = node.children[0].stringify();
    secondComponentString = node.children[1].stringify();
    firstComponentValueInModel = undefined;
    secondComponentValueInModel = undefined;
    if (model[firstComponentString] !== undefined) {
      firstComponentValueInModel = model[firstComponentString].truthValue;
    }
    if (model[secondComponentString] !== undefined) {
      secondComponentValueInModel = model[secondComponentString].truthValue;
    }
    if (model[nodeString] !== undefined) {
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
    if (!nodeValueInModel) {
      handleNodeFalse();
    } else {
      if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === false
      ) {
        handleInconsistency();
      } else if (
        firstComponentValueInModel === false &&
        secondComponentValueInModel === undefined
      ) {
        addFalseTrue();
        handleFalseUndef();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === false
      ) {
        model[firstComponentString] = { truthValue: false };
      } else if (
        firstComponentValueInModel === true &&
        secondComponentValueInModel === undefined
      ) {
        model[secondComponentString] = { truthValue: true };
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === true
      ) {
        addTrueTrue();
        handleUndefTrue();
      } else if (
        firstComponentValueInModel === undefined &&
        secondComponentValueInModel === undefined
      ) {
        addTrueTrue();
        handleUndefUndef();
      }
    }

    function handleNodeFalse() {
      if (
        firstComponentValueInModel === false ||
        secondComponentValueInModel === true
      ) {
        handleInconsistency();
      } else {
        model[firstComponentString] = { truthValue: true };
        if (
          model[secondComponentString] &&
          model[secondComponentString].truthValue
        ) {
          handleInconsistency();
        } else {
          model[secondComponentString] = { truthValue: false };
        }
      }
    }

    function handleFalseUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[secondComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[secondComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefTrue() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, true]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }

    function handleUndefUndef() {
      if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [true, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          true,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        nodeOpenPossibilities.push([false, true]);
        nodeOpenPossibilities.push([false, false]);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: true };
        model[secondComponentString] = { truthValue: true };
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, true])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          true,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
        if (
          model[secondComponentString] &&
          !model[secondComponentString].truthValue
        ) {
          handleInconsistency();
        } else {
          model[secondComponentString] = { truthValue: true };
        }
      } else if (
        nodeOpenPossibilities &&
        arrayIncludesArray(nodeOpenPossibilities, [false, false])
      ) {
        let currentPossibilityIdx = indexOfArray(nodeOpenPossibilities, [
          false,
          false,
        ]);
        nodeOpenPossibilities.splice(currentPossibilityIdx, 1);
        model[nodeString].snapshot = merge({}, model);
        model[firstComponentString] = { truthValue: false };
        model[secondComponentString] = { truthValue: false };
      } else {
        handleInconsistency();
      }
    }
  }

  function findClosestNodeAndIdxWithOpenPossibilities() {
    for (let j = i; j >= 0; j--) {
      let current = wff.nthNode(j);
      if (['O', 'X', 'B', 'A', 'T'].includes(current.value)) {
        let currentString = current.stringify();
        let currentValueInModel = model[currentString];
        if (
          currentValueInModel &&
          currentValueInModel.openPossibilities &&
          currentValueInModel.openPossibilities.length > 0
        ) {
          return { node: current, idx: j };
        }
      }
    }
  }

  function handleInconsistency() {
    const closest = findClosestNodeAndIdxWithOpenPossibilities();
    if (!closest) {
      model.busted = true;
    } else {
      i = closest.idx - 1;
      const closestString = closest.node.stringify();
      model = model[closestString].snapshot;
    }
  }

  function addTrueTrue() {
    if (!nodeOpenPossibilities) {
      model[nodeString].openPossibilities = [[true, true]];
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
  }

  function addTrueFalse() {
    if (!nodeOpenPossibilities) {
      model[nodeString].openPossibilities = [[true, false]];
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
  }

  function addFalseTrue() {
    if (!nodeOpenPossibilities) {
      model[nodeString].openPossibilities = [[false, true]];
      nodeOpenPossibilities = model[nodeString].openPossibilities;
    }
  }
};

function arrayIncludesArray(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arrayEqualsArray(arr1[i], arr2)) {
      return true;
    }
  }
  return false;
}

function indexOfArray(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arrayEqualsArray(arr1[i], arr2)) {
      return i;
    }
  }
}

function arrayEqualsArray(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}

Logic.isTrue = function(wff, model) {
  const parsed = Logic._parse(wff);
  if (!parsed) {
    return;
  }
  return parsed.isTrue(model);
};

Logic.isSat = function(wffs, returnModel, bruteForce) {
  if (wffs instanceof Array) {
    wffs = wffs.join('A');
  }

  const parsedWff = Logic._parse(wffs);
  if (!parsedWff) {
    return;
  }
  if (bruteForce) {
    const models = this._generateModels(wffs);
    return this._checkModels(parsedWff, models, returnModel);
  } else {
    const model = parsedWff.supposeTrue();
    if (model) {
      if (returnModel) {
        return model;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
};

Logic.isValid = function(argument, bruteForce) {
  argument = this._validateArgument(argument);
  if (!argument) return;
  return !this.isSat(`N${argument}`, false, bruteForce);
};

Logic.counterModel = function(argument, bruteForce) {
  argument = this._validateArgument(argument);
  if (!argument) return;
  return this.isSat(`N${argument}`, true, bruteForce);
};

Logic.normalize = function(wff) {
  const parsed = Logic._parse(wff);
  if (!parsed) {
    return;
  }
  const normalizedString = parsed.stringify();
  if (typeof wff === 'string') {
    return normalizedString;
  } else if (wff instanceof Array) {
    return this._parseString(normalizedString);
  }
};

Logic.reduce = function(wff) {
  const parsed = Logic._parse(wff);
  if (!parsed) {
    return;
  }
  const reducedString = parsed.reduce().stringify();
  if (typeof wff === 'string') {
    return reducedString;
  } else if (wff instanceof Array) {
    return this._parseString(reducedString);
  }
};
