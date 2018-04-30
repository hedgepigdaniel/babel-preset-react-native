/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const defaultPlugins = [
  [require('@babel/plugin-transform-block-scoping').default],
  // the flow strip types plugin must go BEFORE class properties!
  // there'll be a test case that fails if you don't.
  [require('@babel/plugin-transform-flow-strip-types').default],
  [
    require('@babel/plugin-proposal-class-properties').default,
    // use `this.foo = bar` instead of `this.defineProperty('foo', ...)`
    {loose: true},
  ],
  [require('@babel/plugin-transform-computed-properties').default],
  [require('@babel/plugin-transform-destructuring').default],
  [require('@babel/plugin-transform-function-name').default],
  [require('@babel/plugin-transform-literals').default],
  [require('@babel/plugin-transform-parameters').default],
  [require('@babel/plugin-transform-shorthand-properties').default],
  [require('@babel/plugin-transform-react-jsx').default],
  [require('@babel/plugin-transform-regenerator').default],
  [require('@babel/plugin-transform-sticky-regex').default],
  [require('@babel/plugin-transform-unicode-regex').default],
];

const es2015Modules = [
  require('@babel/plugin-transform-modules-commonjs').default,
  {
    strict: false,
    strictMode : false, // prevent "use strict" injections
    allowTopLevelThis: true, // dont rewrite global `this` -> `undefined`
  },
];
const es2015ArrowFunctions = [
  require('@babel/plugin-transform-arrow-functions').default,
];
const es2015Classes = [require('@babel/plugin-transform-classes').default];
const es2015ForOf = [require('@babel/plugin-transform-for-of').default, {loose: true}];
const es2015Spread = [require('@babel/plugin-transform-spread').default];
const es2015TemplateLiterals = [
  require('@babel/plugin-transform-template-literals').default,
  {loose: true}, // dont 'a'.concat('b'), just use 'a'+'b'
];
const exponentiationOperator = [
  require('@babel/plugin-transform-exponentiation-operator').default,
];
const objectAssign = [require('@babel/plugin-transform-object-assign').default];
const objectRestSpread = [require('@babel/plugin-proposal-object-rest-spread').default];
const reactDisplayName = [
  require('@babel/plugin-transform-react-display-name').default,
];
const reactJsxSource = [require('@babel/plugin-transform-react-jsx-source').default];
const symbolMember = [require('../transforms/transform-symbol-member')];

const getPreset = (src, options) => {
  const isNull = src === null || src === undefined;
  const hasClass = isNull || src.indexOf('class') !== -1;
  const hasForOf =
    isNull || (src.indexOf('for') !== -1 && src.indexOf('of') !== -1);

  const extraPlugins = [];

  if (options.modules === 'commonjs') {
    plugins.push(es2015Modules);
  }
  if (hasClass) {
    extraPlugins.push(es2015Classes);
  }
  if (isNull || src.indexOf('=>') !== -1) {
    extraPlugins.push(es2015ArrowFunctions);
  }
  if (isNull || hasClass || src.indexOf('...') !== -1) {
    extraPlugins.push(es2015Spread);
    extraPlugins.push(objectRestSpread);
  }
  if (isNull || src.indexOf('`') !== -1) {
    extraPlugins.push(es2015TemplateLiterals);
  }
  if (isNull || src.indexOf('**') !== -1) {
    extraPlugins.push(exponentiationOperator);
  }
  if (isNull || src.indexOf('Object.assign') !== -1) {
    extraPlugins.push(objectAssign);
  }
  if (hasForOf) {
    extraPlugins.push(es2015ForOf);
  }
  if (hasForOf || src.indexOf('Symbol') !== -1) {
    extraPlugins.push(symbolMember);
  }
  if (
    isNull ||
    src.indexOf('React.createClass') !== -1 ||
    src.indexOf('createReactClass') !== -1
  ) {
    extraPlugins.push(reactDisplayName);
  }

  if (options.dev) {
    extraPlugins.push(reactJsxSource);
  }

  return {
    comments: false,
    compact: true,
    plugins: defaultPlugins.concat(extraPlugins),
  };
};

module.exports = (api, options = {}) => {
  let presetOptions = {
    dev: false,
    modules: 'commonjs',
  };
  if (api.withDevTools == null) {
    const env = process.env.BABEL_ENV || process.env.NODE_ENV;
    if (!env || env === 'development') {
      presetOptions.dev = true;
    }
  }
  if (options.modules === false) {
    presetOptions.modules = false;
  }
  return getPreset(null, presetOptions);
};

module.exports.getPreset = getPreset;
