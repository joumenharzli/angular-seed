<img src='http://www.hostingpics.net/thumbs/80/51/80/mini_805180logoplug.png' alt='logo'>
# Angular Plug n Play Seed
Maven-like seed for angular projects featuring rxjs, ngrx, systemjs, rollup, lodash, karma, gulp, yarn and more ready for development and production mode

[![Dependency Status](https://david-dm.org/joumenharzli/angular-seed.svg)](https://david-dm.org/joumenharzli/angular-seed)
[![devDependency Status](https://david-dm.org/joumenharzli/angular-seed/dev-status.svg)](https://david-dm.org/joumenharzli/angular-seed#info=devDependencies)

# How to start

```bash
# download the project
git clone https://github.com/joumenharzli/angular-seed.git
cd angular-seed/

# install gulp ( as administrator )
npm install -g gulp

# install yarn ( as administrator )
npm install -g yarn

# install seed dependencies
yarn

# start developing
npm run serve:dev
```

# Features

- Rollup module bundler
- SystemJS for module loading
- Can be used in Production and Developing mode
- Included library: RxJS, ngrx, lodash
- Supports less and sass including autoprefixer and linting
- Automatic injection and minification of CSS & JS files
- You can test with karma and jasmin and generate blank spec
- Gulp for tasks running
- Yarn for dependency management
- Html minification

# Comming Soon

- protactor
- optimized building with aot
- version control
- change log generator 

# Notes

- Add underscore ( _ ) to less and sass partials

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

# linting ts files
npm run lint:app

# linting less files
npm run lint:less

# linting sass files
npm run lint:sass

# runing server
npm run serve

# build for development mode
npm run build:dev

# build for production mode with SystemJS
npm run build:prod

# build for production mode with Rollup
npm run build:rollup
```

# License
MIT
