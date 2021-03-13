# express-mongoose-template

This project was bootstrapped with [express-mongoose-template](https://github.com/Dramloc/express-mongoose-template), a simple template based on [Express](https://expressjs.com/) and [Mongoose](https://mongoosejs.com/) that helps you build flexible and simple REST APIs.

## Usage

- [Use this template](https://github.com/Dramloc/express-mongoose-template) to create a new repository
- Clone the generated repository
- Install dependencies:
  ```shell
  yarn
  ```
- Run project:
  ```shell
  yarn dev
  ```

## Available Scripts

In the project directory, you can run:

### `yarn dev`

Runs the project in the development mode.\
API will be served on [http://localhost:8080](http://localhost:8080).

The project will reload with `nodemon` if you make edits.\
You will also see any `babel` compilation error in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
This will run tests using `jest` and lint files using `eslint`.

### `yarn coverage`

Collects test coverage with `jest`.\
Coverage report will be reported in the console and in the `coverage` folder.

### `yarn lint`

Lints project files using `eslint`.\
You can run `yarn lint --fix` to autofix fixable issues.

### `yarn build`

Builds the project with `babel` to make it ready for production. The output will be generated in the `dist` folder.\
This should be run before launching `yarn start`.

### `yarn start`

Runs the project in production mode.\
Make sure you run `yarn build` before this script.

## Configuration

Application configuration is provided by environment variables and accessed in code with `process.env.VARIABLE_NAME`.

Environments variables are loaded using the definitions in the `.env.defaults` file.
If you need to override some of them, you can create a `.env` file with your overrides.

> If new environment variables are required by the app, they can be added to the `.env.defaults` to document them.
