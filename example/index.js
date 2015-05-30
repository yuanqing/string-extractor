'use strict';

var stringExtractor = require('..');

var pattern = '*/{{ year: 4d }}-{{ month: d }}-{{ slug }}.((txt|m*))';
var extract = stringExtractor(pattern);

extract('foo/2014-01-bar.txt');      //=> { year: '2014', month: '01', slug: 'bar' }
extract('foo/2014-01-bar.md');       //=> { year: '2014', month: '01', slug: 'bar' }
extract('foo/2014-01-bar.markdown'); //=> { year: '2014', month: '01', slug: 'bar' }
extract('foo'); //=> false

var pattern = '{{ title }}.jpg';
var opts = { ignoreCase: true };
var extract = stringExtractor(pattern, opts);

extract('foo.jpg'); //=> { title: 'foo' }
extract('foo.JPG'); //=> { title: 'foo' }
