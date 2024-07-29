![workflow](https://github.com/do-/node-require-sliced/actions/workflows/main.yml/badge.svg)
![Jest coverage](./badges/coverage-jest%20coverage.svg)

`require-sliced` is a node.js library implementing tools for working with [modules](https://nodejs.org/api/modules.html) whose source code may be partitioned across multiple eponymous files located in different directories.

Consider a large application with the business logic implemented as a set of modules organized in topical directories, say `/crm`, `/hr` and so on. It may be convenient to have a common `users` module with some methods and properties defined in `/crm/users.js` and others in `/hr/users.js`. `require-sliced` lets developers do just that: it features the [ModuleMap](https://github.com/do-/node-require-sliced/wiki/ModuleMap) class designed to act as a registry of modules given as sets of partial source files to be assembled with [subclassable-object-merger](https://github.com/do-/node-subclassable-object-merger/wiki).

[ModuleMap](https://github.com/do-/node-require-sliced/wiki/ModuleMap) tracks files' modification times and can clean up the [require.cache](https://nodejs.org/api/modules.html#requirecache) to always yield the last version, which is handy for development environments, but can be turned off with the `watch` option to avoid the related performance overhead.

# Installation
```sh
npm i require-sliced
```

# Usage
```js
const {ModuleMap} = require ('require-sliced')

const codeRegistry = new ModuleMap ({
  dir: {           // see https://www.npmjs.com/package/fs-iterators
    root: ['/opt/myProject'], 
//    filter: (str, arr) => arr.at (-1) === 'API', // **/API/*
//    live: false,
  },
// ext: '.js',
// watch: false,   // uncomment to suppress checking for modifications
// merger: new myObjectMerger (someOptions)
})

codeRegistry.load () 
  // all at once: makes sense when watch === false

const module = codeRegistry.get ('users') 
  // merge from all `require ('/opt/myProject/**/API/users.js')`

module.selectUsers () // for example
```
