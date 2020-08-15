# CEP UI

Web User Interface for 3beca CEP service.

[![CodeFactor](https://www.codefactor.io/repository/github/3beca/cep-ui/badge)](https://www.codefactor.io/repository/github/3beca/cep-ui)
![Node.js CI](https://github.com/3beca/cep-ui/workflows/Node.js%20CI/badge.svg?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=3beca/cep-ui)](https://dependabot.com)
[![codecov](https://codecov.io/gh/3beca/cep-ui/branch/master/graph/badge.svg)](https://codecov.io/gh/3beca/cep-ui)

## Introduction

This project provides a web user interface for the Admin Http API of [CEP](https://github.com/3beca/cep).

It is implemented with react-create-app and material ui.

## Getting Started

Install the [NodeJs](https://nodejs.org) runtime. Latest LTS is recommended.

Clone the repo. Install dependencies:

```
npm ci
```

Now, run the application in watch mode prompting the following command:

```
npm start
```

To create a production bundle:

```
npm run build
```

You can then serve all static files using for instance nginx. You can see the Dockerfile as reference.

## Test

Run the test suite with the following command:

```
npm test
```

## License

MIT
