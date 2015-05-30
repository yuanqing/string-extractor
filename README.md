# string-extractor.js [![npm Version](http://img.shields.io/npm/v/string-extractor.svg?style=flat)](https://www.npmjs.org/package/string-extractor) [![Build Status](https://img.shields.io/travis/yuanqing/string-extractor.svg?style=flat)](https://travis-ci.org/yuanqing/string-extractor) [![Coverage Status](https://img.shields.io/coveralls/yuanqing/string-extractor.svg?style=flat)](https://coveralls.io/r/yuanqing/string-extractor)

> Regular expression sugar for getting data out of strings.

## Usage

```js
var stringExtractor = require('string-extractor');

var pattern = '*/{{ year: 4d }}-{{ month: d }}-{{ slug }}.((txt|m*))';
var extract = stringExtractor(pattern);

extract('foo/2014-01-bar.txt');      //=> { year: '2014', month: '01', slug: 'bar' }
extract('foo/2014-01-bar.md');       //=> { year: '2014', month: '01', slug: 'bar' }
extract('foo/2014-01-bar.markdown'); //=> { year: '2014', month: '01', slug: 'bar' }
extract('foo'); //=> false
```

1. A `*` represents a **wildcard**, which matches one or more characters. We can have consecutive wildcards. For example, `***` represents a sequence of three or more characters.

2. Enclose **option groups** in `((` brackets `))`. An option group matches any one of the specified strings separated by a pipe `|`. Each string can contain wildcards. As in our example, `((m*|txt))` matches `txt`, `md`, and `markdown`.

3. Enclose **capturing groups** in `{{` curly braces `}}`. A capturing group comprises a name and an optional `printf`-like &ldquo;formatter&rdquo;. If specified, the formatter must be preceded by a colon `:`. Each formatter comprises a length and a &ldquo;type&rdquo;. A `d` type means one or more digits, while an `s` type means one or more characters (including digits). Some examples of valid formatters:

    - Type only &mdash; `d`, `s`
    - Length only &mdash; `4`
    - Both &mdash; `4d`, `4s`

4. If the given pattern *does not contain any capturing groups*, matching it with a `str` will return:

    - `true` if `str` matches the pattern, and
    - `false` otherwise.

   If the given pattern *contains at least one capturing group*, matching it with a `str` will return:

     - an object literal of values extracted from the `str` if `str` matches the pattern, and
     - `false` otherwise.

5. Matching is *case-sensitive*. Set `opts.ignoreCase` to `true` to enable case-insensitive matching:

    ```js
    var pattern = '{{ title }}.jpg';
    var opts = { ignoreCase: true };
    var extract = stringExtractor(pattern, opts);

    extract('foo.jpg'); //=> { title: 'foo' }
    extract('foo.JPG'); //=> { title: 'foo' }
    ```

Read [the tests](test/index.js) for more usage examples.

## API

```js
var stringExtractor = require('string-extractor');
```

### var extract = stringExtractor(pattern [, opts])

Compiles the specified string `pattern` into a regular expression. `opts` is an object literal; set `opts.ignoreCase` to `true` to enable case-insensitive matching.

### var results = extract(str)

`extract` is a function that uses the compiled regular expression to extract values from the specified `str`. It returns an object literal, with the extracted values keyed to the names of the capturing groups.

## Installation

Install via [npm](https://npmjs.com/):

```
$ npm i --save string-extractor
```

## Changelog

- 0.0.1
  - Initial release

## License

[MIT](LICENSE)
