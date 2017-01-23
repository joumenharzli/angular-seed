<img src='http://www.hostingpics.net/thumbs/80/51/80/mini_805180logoplug.png' alt='logo'>
# Angular Plug n Play Seed
Maven-like seed for angular projects featuring rxjs, ngrx, AOT, systemjs, rollup, less, sass, lodash, karma, protractor, gulp, yarn and more ready for development and production mode

[![Build Status](https://travis-ci.org/joumenharzli/angular-seed.svg?branch=master)](https://travis-ci.org/joumenharzli/angular-seed)
[![Dependency Status](https://david-dm.org/joumenharzli/angular-seed.svg)](https://david-dm.org/joumenharzli/angular-seed)
[![devDependency Status](https://david-dm.org/joumenharzli/angular-seed/dev-status.svg)](https://david-dm.org/joumenharzli/angular-seed?type=dev)

# How to start

```bash
# download the project
git clone https://github.com/joumenharzli/angular-seed.git
cd angular-seed/

# install yarn ( as administrator )
npm install -g yarn

# install seed dependencies
yarn

# start developing
npm run serve:dev
```

# Features

- Supports Ahead-Of-Time compilation ( AOT )
- Rollup module bundler
- SystemJS for module loading / bundling
- Can be used in Production and Developing mode
- Included library: RxJS, ngrx, lodash
- Supports less and sass including autoprefixer and linting
- Supports styleUrls ( including less/sass/css into ts files )
- Automatic injection and minification of CSS & JS files
- You can test with karma, protractor, jasmin and generate blank spec
- Automatic changelog generation and version control
- Test coverage ( remapped to TS )
- Gulp for tasks running
- Yarn for dependency management
- Html minification

# Notes

- Add underscore ( _ ) to less and sass partials
- use angular commit message guidelines when commiting changes. It will be used when generating the changelog
    see: https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines

# How to use

```bash
# clean dist directory
npm run clean

# compile less files ( add :watch for watch mode )
npm run compile:less

# compile scss files ( add :watch for watch mode )
npm run compile:sass

# compile application ( add :watch for watch mode )
npm run compile:app

# compile tests ( add :watch for watch mode )
npm run compile:test

# generating blank tests
npm run test:generatespec

# runing tests ( add :watch for watch mode )
npm run test:unit

# test coverage
npm run test:coverage

# e2e
npm run test:e2e

# linting app ts files
npm run lint:app

# linting test ts files
npm run lint:test

# linting less files
npm run lint:less

# linting sass files
npm run lint:sass

# linting css files
npm run lint:css

# runing server
npm run serve

# build for development mode
npm run build:dev

# build for production mode with SystemJS
npm run build:prod

# build for production mode with Rollup
npm run build:rollup

# build for production mode with Rollup and AOT
npm run build:aot

# releasing and tagging with git ( you can replace patch with minor or major )
npm run release:patch
```

# License
MIT
