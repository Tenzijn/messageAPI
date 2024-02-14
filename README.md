# Note:

When testing the API with jest and supertest, `"type": "module"` should be removed from the package.json file. This is because jest does not support ES6 modules.

- Other babel configurations are already in place to support ES6 modules.
- jest.config.js is already configured to support ES6 modules.

# NodeJS Exam application starter code

This project contains a template for creating the REST API required in the exam.

The project has three sections:

- **index.js** - The entry point of the application
- **Routes** - Defining the supported HTTP methods and paths. Routes do not contain any logic.
- **Controllers** - Contain the logic of the application. They handle the request and send back the correct response.
- **Tests** - Contains Unit tests

You are free to modify this project as you wish.

## Setup instructions

Please run `npm install`

## Run instructions

`node index.js`
