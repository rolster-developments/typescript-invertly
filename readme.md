# Rolster Typescript Invertly

Invertly is a package that allows you to implement class mapping to identify and inject their dependencies.

## Installation

```
npm i @rolster/typescript-invertly
```

## Configuration

You must install the `@rolster/typescript-types` to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file.

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "files": ["node_modules/@rolster/typescript-types/index.d.ts"]
}
```

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
