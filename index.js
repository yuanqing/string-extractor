'use strict';

var SPECIAL_CHARS = /[$()*+.?[\\\]^{|}]/g;

// Eg: foo. => foo\.
var escapeSpecialChars = function(str) {
  return str.replace(SPECIAL_CHARS, '\\$&');
};

var WILDCARD = /\*+/g;

// Eg: x*y**z => x\w{1,}y\w{2,}z
var compileWildcard = function(str) {
  return str.replace(WILDCARD, function(match) {
    return '\\w{' + match.length + ',}';
  });
};

// Eg: x*y**z... => x\w{1,}y\w{2,}z\.\.\.
var compileWildcardAndSpecialChars = function(regexp, str) {
  return str.replace(regexp, function(str) {
    if (str[0] === '*') {
      return compileWildcard(str);
    }
    return escapeSpecialChars(str);
  });
};

var NON_GROUPS = /([^{}()]+)([})])?/g;
var NON_GROUP = /\*+|[^\*]+/g;

// A non-group means any character that isn't inside a capturing group
// or option group.
// Eg: {{ x }}foo.((y|z)) => {{ x }}foo\.((y|z))
var compileNonGroups = function(str) {
  return str.replace(NON_GROUPS, function(match, str, closingBracket) {
    // Something was captured for ([})])?, suggesting that we are in a
    // capturing group or option group. So we simply return what was matched.
    if (closingBracket) {
      return match;
    }
    return compileWildcardAndSpecialChars(NON_GROUP, str);
  });
};

var OPTION_GROUPS = /\(\(\s*([^)]+)\s*\)\)/g;
var OPTION_GROUP = /\*+|[^\*|]+/g; // similar to `NON_GROUP`; has additional '|'

// Eg: ((x|*y|**z)) => (?:x|\w{1,}y|\w{2,}z)
var compileOptionGroups = function(str) {
  return str.replace(OPTION_GROUPS, function(match, optionGroup) {
    return '(?:' + compileWildcardAndSpecialChars(OPTION_GROUP, optionGroup) + ')';
  });
};

var CAPTURE_GROUPS = /{{\s*(\w+)(?:\s*:\s*%?(\d+)?(s|d)?)?\s*}}/g;
var TYPES = {
  's': '(?:.|[\\r\\n])',
  'd': '\\d'
};

// Compile the capturing groups in `str`, and also add the group names to the
// `keys` array
// Eg: {{ foo: 2d }} => (\d{2,}), with keys = ['foo']
var compileCaptureGroups = function(str, keys) {
  return str.replace(CAPTURE_GROUPS, function(match, key, len, type) {
    keys.push(key);
    return '(' + TYPES[type || 's'] + '{' + (len || '1,') + '})';
  });
};

module.exports = function(pattern, opts) {
  var flags = opts && opts.ignoreCase ? 'i' : '';
  var keys = [];
  pattern = compileNonGroups(pattern);
  pattern = compileOptionGroups(pattern);
  pattern = compileCaptureGroups(pattern, keys);
  var regexp = new RegExp('^' + pattern + '$', flags);
  var len = keys.length;
  return function(str) {
    if (len === 0) { // no capturing groups
      return regexp.test(str);
    }
    var matches = str.match(regexp);
    if (matches === null) {
      return false;
    }
    var result = {};
    var i = -1;
    while (++i < len) {
      result[keys[i]] = matches[i+1];
    }
    return result;
  };
};
