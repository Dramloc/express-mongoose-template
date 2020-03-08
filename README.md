# express-mongoose-template

Simple template using express and mongoose for building REST APIs.

## Usage

- Install dependencies:
  ```shell
  yarn
  ```
- Copy `.env.example` and rename it to `.env` for a default configuration.
- Run project:
  ```shell
  yarn start
  ```

> The previous command will check the `NODE_ENV` environment variable and launch server in development or production mode.
> By default, development mode will be used.
>
> You can launch the following commands to choose the mode explicitly:
>
> ```shell
> yarn start:development
> # This will launch the server with nodemon. It will reload on every file change.
> ```
>
> ```shell
> yarn start:production
> # This will force the NODE_ENV environment variable to "production" and launch the server with node.
> ```

## Configuration

Application configuration is provided by environment variables and accessed in code with `process.env.VARIABLE_NAME`.

In order to share configurations, you can add a `.env` file at the root of the project.
You can copy `.env.example` and rename it to `.env` for a default configuration.

> If new environment variables are required by the app, they should be added to the `.env.example` to document them.

## Linting

Linting code with eslint

```shell
yarn lint
```

Autofixing eslint fixable linting issues

```shell
yarn lint --fix
```

Configuration is kept simple but can be changed by editing the `.eslintrc` file.

## Formatting

Formatting code with prettier

```shell
yarn format
```
