<img src='http://www.hostingpics.net/thumbs/80/51/80/mini_805180logoplug.png' alt='logo'>
# Angular Plug n Play Seed
Maven-like seed for angular projects featuring rxjs, ngrx, karma, gulp, yarn and more ready for development and production mode

[![Dependency Status](https://david-dm.org/joumenharzli/angular-seed.svg)](https://david-dm.org/joumenharzli/angular-seed)
[![devDependency Status](https://david-dm.org/joumenharzli/angular-seed/dev-status.svg)](https://david-dm.org/joumenharzli/angular-seed#info=devDependencies)

# How to start

```bash
# download the project
git clone https://github.com/joumenharzli/angular-seed.git

# install gulp
npm install -g gulp

# install yarn
npm install -g yarn

# install seed dependencies
yarn

# start developing
npm run serve
```

# Features

- SystemJS for module loading
- Supports Production and Developing mode
- Included library: RxJS, ngrx
- You can test with karma and jasmin and generate blank spec
- Gulp for tasks running
- Yarn for dependency management

# Comming Soon

- support for less and sass
- optimized building with rollup and aot
- including ImmutableJS and lodash
- protactor
- version control
- change log generator 

# How to use

```bash
# clean dist directory
npm run clean

# compile application
npm run compile

# compile tests
npm run test:compile

# generating blank tests
npm run test:generatespec

# runing tests
npm run test

# linting
npm run lint

# runing server
npm run serve

# build for development mode
npm run build:dev

# build for production mode
npm run build:prod
```

# License
MIT
