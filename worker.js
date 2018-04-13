import Logic from 'boolean-logic';
import { merge } from 'lodash';

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
      version: '1.1.2',
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
      version: '1.1.2',
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
