'use strict';

var test = require('tape');
var fn = require('..');

test('is a function', function(t) {
  t.plan(1);
  t.true(typeof fn === 'function');
});

test('no capturing groups or option groups', function(t) {
  t.test('no wildcard', function(t) {
    t.plan(3);
    var extract = fn('foo');
    t.true(extract('foo'));
    t.false(extract(''));
    t.false(extract('bar'));
  });
  t.test('with wildcard', function(t) {
    t.plan(4);
    var extract;
    extract = fn('ba*');
    t.true(extract('bar'));
    t.true(extract('bars'));
    extract = fn('ba**');
    t.false(extract('bar'));
    t.true(extract('bars'));
  });
});

test('single capturing group', function(t) {
  t.test('single string', function(t) {
    t.plan(8);
    [ '{{foo}}',
      '{{ foo }}',
      '{{foo:4}}',
      '{{foo:s}}',
      '{{foo:4s}}',
      '{{foo:%4s}}',
      '{{ foo : %4s }}'
    ].forEach(function(pattern) {
      t.looseEqual(fn(pattern)('bar\n'), { foo: 'bar\n' });
    });
    t.false(fn('{{ x }}')(''));
  });
  t.test('single number', function(t) {
    t.plan(9);
    [ '{{x}}',
      '{{ x }}',
      '{{x:2}}',
      '{{x:d}}',
      '{{x:2d}}',
      '{{x:%2d}}',
      '{{ x : %2d }}'
    ].forEach(function(pattern) {
      t.looseEqual(fn(pattern)('42'), { x: '42' });
    });
    var extract = fn('{{ x : 2d }}');
    t.false(extract('ab'));
    t.false(extract('420'));
  });
});

test('multiple capturing groups', function(t) {
  t.plan(3);
  var extract = fn('{{ foo : 4s }}{{ bar : 2d }}');
  t.looseEqual(extract('baz\n42'), { foo: 'baz\n', bar: '42' });
  t.false(extract('bazz\n42'));
  t.false(extract('baz\n420'));
});

test('ignore case', function(t) {
  t.plan(2);
  var pattern = '{{ foo }}.jpg';
  t.false(fn(pattern)('bar.JPG'));
  t.looseEqual(fn(pattern, { ignoreCase: true })('bar.JPG'), { foo: 'bar' });
});

test('single option group', function(t) {
  t.test('no wildcard', function(t) {
    t.plan(4);
    var extract = fn('((foo|baz))');
    t.true(extract('foo'));
    t.true(extract('baz'));
    t.false(extract(''));
    t.false(extract('x'));
  });
  t.test('with wildcard', function(t) {
    t.plan(8);
    var extract = fn('((fo*|**z))');
    [ 'foo',
      'fore',
      'baz',
      'baaz'
    ].forEach(function(str) {
      t.true(extract(str));
    });
    [ '',
      'fo',
      'z',
      'yz'
    ].forEach(function(str) {
      t.false(extract(str));
    });
  });
});

test('multiple option groups', function(t) {
  t.plan(8);
  var extract = fn('((foo|x))((y|bar))');
  [ 'fooy',
    'foobar',
    'xy',
    'xbar'
  ].forEach(function(str) {
    t.true(extract(str));
  });
  [ '',
    'foo',
    'y',
    'fooxyobar'
  ].forEach(function(str) {
    t.false(extract(str), str);
  });
});

test('complex combination', function(t) {
  t.plan(7);
  var extract = fn('**/{{ year: 4d }}/{{ slug }}.((md|t*))');
  [ 'posts/2015/foo.md',
    'posts/2015/foo.txt'
  ].forEach(function(str) {
    t.looseEqual(extract(str), { year: '2015', slug: 'foo' });
  });
  [ 'x/2015/foo.md',
    'posts/42/foo.md',
    'posts/abcd/foo.md',
    'posts/2015/.md',
    'posts/2015/foo.'
  ].forEach(function(str) {
    t.false(extract(str));
  });
});
