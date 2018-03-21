/******/ (function(modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/ var installedModules = {}; // The require function
  /******/
  /******/ /******/ function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/ if (installedModules[moduleId]) {
      /******/ return installedModules[moduleId].exports;
      /******/
    } // Create a new module (and put it into the cache)
    /******/ /******/ var module = (installedModules[moduleId] = {
      /******/ i: moduleId,
      /******/ l: false,
      /******/ exports: {},
      /******/
    }); // Execute the module function
    /******/
    /******/ /******/ modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    ); // Flag the module as loaded
    /******/
    /******/ /******/ module.l = true; // Return the exports of the module
    /******/
    /******/ /******/ return module.exports;
    /******/
  } // expose the modules object (__webpack_modules__)
  /******/
  /******/
  /******/ /******/ __webpack_require__.m = modules; // expose the module cache
  /******/
  /******/ /******/ __webpack_require__.c = installedModules; // define getter function for harmony exports
  /******/
  /******/ /******/ __webpack_require__.d = function(exports, name, getter) {
    /******/ if (!__webpack_require__.o(exports, name)) {
      /******/ Object.defineProperty(exports, name, {
        /******/ configurable: false,
        /******/ enumerable: true,
        /******/ get: getter,
        /******/
      });
      /******/
    }
    /******/
  }; // getDefaultExport function for compatibility with non-harmony modules
  /******/
  /******/ /******/ __webpack_require__.n = function(module) {
    /******/ var getter =
      module && module.__esModule
        ? /******/ function getDefault() {
            return module['default'];
          }
        : /******/ function getModuleExports() {
            return module;
          };
    /******/ __webpack_require__.d(getter, 'a', getter);
    /******/ return getter;
    /******/
  }; // Object.prototype.hasOwnProperty.call
  /******/
  /******/ /******/ __webpack_require__.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }; // __webpack_public_path__
  /******/
  /******/ /******/ __webpack_require__.p = ''; // Load entry module and return exports
  /******/
  /******/ /******/ return __webpack_require__((__webpack_require__.s = 0));
  /******/
})(
  /************************************************************************/
  /******/ [
    /* 0 */
    /***/ function(module, exports, __webpack_require__) {
      'use strict';

      Object.defineProperty(exports, '__esModule', {
        value: true,
      });
      exports.generateWff = exports.generateWffNotDistinct = exports.generateWffWithOnes = exports.benchmark = undefined;

      var _booleanLogic = __webpack_require__(1);

      var _booleanLogic2 = _interopRequireDefault(_booleanLogic);

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      var benchmark = (exports.benchmark = function benchmark(wff, resultDiv) {
        var beforeParseDate = new Date();
        var beforeParseTime = beforeParseDate.getTime();
        var parsedWff = _booleanLogic2.default._parse(wff, true);
        var afterParseDate = new Date();
        var afterParseTime = afterParseDate.getTime();
        var parseDuration = afterParseTime - beforeParseTime;

        var beforeGenerateModelsDate = new Date();
        var beforeGenerateModelsTime = beforeGenerateModelsDate.getTime();
        if (!parsedWff) {
          return;
        }
        var models = _booleanLogic2.default._generateModels(wff);
        var afterGenerateModelsDate = new Date();
        var afterGenerateModelsTime = afterGenerateModelsDate.getTime();
        var generateModelsDuration =
          afterGenerateModelsTime - beforeGenerateModelsTime;

        var beforeCheckDate = new Date();
        var beforeCheckTime = beforeCheckDate.getTime();
        var result = _booleanLogic2.default._checkModels(
          parsedWff,
          models,
          true
        );
        var afterCheckDate = new Date();
        var afterCheckTime = afterCheckDate.getTime();
        var checkDuration = afterCheckTime - beforeCheckTime;

        if (Boolean(result)) {
          var resultString = '';
          for (var key in result) {
            resultString =
              resultString + '<br />&nbsp;&nbsp;' + key + ': ' + result[key];
          }
          resultDiv.innerHTML =
            '\n      <p>The formula is satisfiable.</p>\n      <p>The first model found was:</p>\n      <p>{' +
            resultString +
            '<br />}</p>\n      <p>It took ' +
            parseDuration +
            ' milliseconds to parse the wff.</p>\n      <p>\n        It took ' +
            generateModelsDuration +
            ' milliseconds to generate all models of this wff.</p>\n      <p>It took ' +
            checkDuration +
            ' milliseconds to find the above model.</p>\n      <p>It took ' +
            (generateModelsDuration + checkDuration) +
            ' milliseconds to generate all models of this wff and to find the above model.</p>\n      <p>It took ' +
            (parseDuration + generateModelsDuration + checkDuration) +
            ' milliseconds to do everything.</p>\n    ';
        } else {
          resultDiv.innerHTML =
            "\n      <p>The formula isn't satisfiable</p>\n      <p>It took " +
            parseDuration +
            ' milliseconds to parse the wff.</p>\n      <p>It took ' +
            generateModelsDuration +
            ' milliseconds to generate all models of this wff.</p>\n      <p>It took ' +
            checkDuration +
            ' milliseconds to check every model.</p>\n      <p>It took ' +
            (generateModelsDuration + checkDuration) +
            ' milliseconds to generate all models of this wff and to check all of them.</p>\n      <p>It took ' +
            (parseDuration + generateModelsDuration + checkDuration) +
            ' milliseconds to do everything.</p>\n    ';
        }
      });

      var generateWffWithOnes = (exports.generateWffWithOnes = function generateWffWithOnes(
        numAtoms
      ) {
        var connectives = ['N', 'A', 'O', 'X', 'T', 'B'];
        if (numAtoms === 1) {
          var addNegation = Math.floor(Math.random()) > 0.5 ? true : false;
          if (addNegation) {
            return '(N1)';
          } else {
            return '1';
          }
        } else if (numAtoms === 2) {
          var connIdx = Math.floor(Math.random() * 5) + 1;
          return '(1' + connectives[connIdx] + '1)';
        } else {
          var _connIdx = Math.floor(Math.random() * 6);
          if (_connIdx > 0) {
            var firstNumAtoms = Math.floor(Math.random() * (numAtoms - 1)) + 1;
            var secondNumAtoms = numAtoms - firstNumAtoms;
            var firstWff = generateWffWithOnes(firstNumAtoms);
            var secondWff = generateWffWithOnes(secondNumAtoms);
            return '(' + firstWff + connectives[_connIdx] + secondWff + ')';
          } else {
            var negatumWff = generateWffWithOnes(numAtoms);
            return '(N' + negatumWff + ')';
          }
        }
      });

      var generateWffNotDistinct = (exports.generateWffNotDistinct = function generateWffNotDistinct(
        numAtoms
      ) {
        var wff = generateWffWithOnes(numAtoms);
        var wffArray = wff.split('');
        for (var i = 0; i < wffArray.length; i++) {
          if (wffArray[i] === '1') {
            wffArray[i] = Math.floor(Math.random() * numAtoms) + 1;
          }
        }
        return wffArray.join('');
      });

      var generateWff = (exports.generateWff = function generateWff(numAtoms) {
        var numNotDistinct = Math.floor(Math.random() * numAtoms * 10) + 1;
        var wff = generateWffNotDistinct(numNotDistinct);
        while (_booleanLogic2.default._atomics(wff).length !== numAtoms) {
          numNotDistinct = Math.floor(Math.random() * numAtoms * 10) + 1;
          wff = generateWffNotDistinct(numNotDistinct);
        }
        var negationProbability = Math.random();
        if (negationProbability < 0.5) {
          return wff;
        } else {
          return '(N' + wff + ')';
        }
      });

      document.addEventListener('DOMContentLoaded', function() {
        var generateButton = document.getElementById('generateButton');
        var submitButton = document.getElementById('submitButton');
        var wffTextarea = document.getElementById('wffTextarea');
        var wffLengthInput = document.getElementById('wffLength');
        var resultDiv = document.getElementById('result');
        generateButton.addEventListener('click', function(e) {
          e.preventDefault();
          var wffLength = parseInt(wffLengthInput.value);
          var wff = generateWff(wffLength);
          wffTextarea.value = wff;
        });

        submitButton.addEventListener('click', function(e) {
          e.preventDefault();
          var result = benchmark(wffTextarea.value, resultDiv);
        });
      });

      // const wff = generateWff(15);
      // console.log(`Testing this formula: '${wff}'`);
      // benchmark(wff);

      // window.generateWff = generateWff;
      // window.generateWffWithOnes = generateWffWithOnes;
      // window.benchmark = benchmark;

      /***/
    },
    /* 1 */
    /***/ function(module, __webpack_exports__, __webpack_require__) {
      'use strict';
      Object.defineProperty(__webpack_exports__, '__esModule', { value: true });
      class Logic {
        constructor(value) {
          this.value = value;
          this.parent = null;
          this.children = [];
        }

        setParent(parent) {
          if (this.parent === parent) {
            return;
          }

          if (this.parent) {
            const children = this.parent.children;
            children._remove(this);
          }

          this.parent = parent;

          if (this.parent) {
            this.parent.children.push(this);
          }
        }

        addChild(child) {
          child.setParent(this);
        }

        removeChild(child) {
          if (this.children.includes(child)) child.setParent(null);
        }

        atomic() {
          return this.children.length === 0 && Logic._isAtomic(this.value);
        }

        wff() {
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
        }

        isTrue(model) {
          model = model || {};
          const modelValues = Object.keys(model).map(key => model[key]);
          for (let i = 0; i < modelValues.length; i++) {
            if (modelValues[i] !== true && modelValues[i] !== false) {
              return;
            }
          }

          const fullModel = Object.assign(
            {},
            model || {},
            this.constructor._booleans
          );
          if (!this.wff()) {
            return;
          } else if (this.atomic()) {
            return fullModel[this.value];
          } else {
            const childOne = this.children[0].isTrue(model);
            let childTwo;
            if (this.children[1]) childTwo = this.children[1].isTrue(model);
            const connective = this.constructor._connectives[this.value];
            return connective(childOne, childTwo);
          }
        }
      }

      Logic.isTrue = function(wff, model) {
        const parsed = Logic._parse(wff);
        if (!parsed) {
          return;
        }
        return parsed.isTrue(model);
      };

      Logic.isSat = function(wff, returnModel) {
        const parsedWff = Logic._parse(wff);
        if (!parsedWff) {
          return;
        }
        const models = this._generateModels(wff);
        return this._checkModels(parsedWff, models, returnModel);
      };

      Logic._checkModels = function(parsedWff, models, returnModel) {
        for (let i = 0; i < models.length; i++) {
          if (parsedWff.isTrue(models[i])) {
            return returnModel ? models[i] : true;
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
          throw 'Argument must be either a string or an array';
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
            return (
              this._mainConnectiveIdx(sentArr.slice(1, sentArr.length - 1)) + 1
            );
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
        } else if (
          sentArr[0] === 'N' &&
          this._mainConnectiveIdx(sentArr.slice(1))
        ) {
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
          const matchingClosingParensIdx = this._matchingClosingParensIdx(
            sentArr,
            0
          );
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
            this._matchingClosingParensIdx(
              sentArr,
              matchingClosingParensIdx + 2
            ) ===
              sentArr.length - 1
          ) {
            return matchingClosingParensIdx + 1;
          } else {
            const secondMainConnIdx =
              this._mainConnectiveIdx(
                sentArr.slice(matchingClosingParensIdx + 2)
              ) +
              matchingClosingParensIdx +
              2;
            if (
              sentArr[secondMainConnIdx] ===
              sentArr[matchingClosingParensIdx + 1]
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
            throw "Argument can only contain 'N', 'A', 'O', 'T', 'B', 'X', '(', ')', 't', 'f', and numerals (strings of integers)";
          }
        }
      };

      const isTrue = Logic.isTrue.bind(Logic);
      /* harmony export (immutable) */ __webpack_exports__['isTrue'] = isTrue;

      const isSat = Logic.isSat.bind(Logic);
      /* harmony export (immutable) */ __webpack_exports__['isSat'] = isSat;

      /* harmony default export */ __webpack_exports__['default'] = Logic;

      /***/
    },
    /******/
  ]
);
//# sourceMappingURL=script.js.map
