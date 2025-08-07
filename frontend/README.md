# EComerce

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.3.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Documentation

This project uses [Compodoc](https://compodoc.app/) for generating documentation.

### Generate documentation:
```bash
npm run compodoc:build
```

### Generate and serve documentation with hot-reload:
```bash
npm run compodoc:serve
```

### Generate and serve documentation (one-time):
```bash
npm run compodoc
```

### Alternative direct commands:
```bash
# Generate documentation only
npx @compodoc/compodoc -p tsconfig.json

# Generate and serve documentation
npx @compodoc/compodoc -p tsconfig.json -s

# Generate with coverage test
npx @compodoc/compodoc -p tsconfig.json --coverageTest

# Generate with custom theme (material, stripe, vagrant, etc.)
npx @compodoc/compodoc -p tsconfig.json -t material
```

The documentation will be available at `http://localhost:8080/` when served.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.