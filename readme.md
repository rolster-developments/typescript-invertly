# Rolster Invertly

Invertly is a package that allows you to implement class mapping to identify and inject their dependencies.

## Installation

```
npm i @rolster/invertly
```

## Configuration

You must install the `@rolster/types` to define package data types, which are configured by adding them to the `files` property of the `tsconfig.json` file. Decorators require the `emitDecoratorMetadata` and `experimentalDecorators` compiler options.

```json
{
  "compilerOptions": {
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "files": ["node_modules/@rolster/types/index.d.ts"]
}
```

## Overview

Invertly is a lightweight **dependency injection** container. You mark classes
as injectable, and Invertly builds them for you — resolving each constructor
argument automatically from TypeScript's emitted type metadata. It supports
three instance lifetimes, binding abstractions to implementations, per-request
contexts, and fully isolated containers.

> Import `reflect-metadata` once at your application entry point, before any
> decorated class is loaded.

## Declaring injectables

Decorate a class with `@Injectable()` to register it. Constructor dependencies
are resolved by their declared type — no extra wiring needed for concrete
classes:

```typescript
import 'reflect-metadata';
import { Injectable, invertly } from '@rolster/invertly';

@Injectable()
class Logger {
  log(message: string): void {
    console.log(message);
  }
}

@Injectable({ singleton: true })
class UserService {
  constructor(private readonly logger: Logger) {}

  create(name: string): void {
    this.logger.log(`User created: ${name}`);
  }
}

// Resolve the whole dependency tree
const service = invertly(UserService);
service.create('Daniel'); // "User created: Daniel"
```

`@Injectable(options?)` accepts:

| Option        | Default | Meaning                                                  |
| ------------- | ------- | -------------------------------------------------------- |
| `singleton`   | `false` | A single instance shared across the whole container.     |
| `scopeable`   | `false` | A single instance shared within one resolution tree.     |

When neither is set, a brand-new instance is created on every resolution.

## Resolving instances

| Function                              | Use                                                       |
| ------------------------------------- | --------------------------------------------------------- |
| `invertly(token, container?)`         | Resolve an injectable by token.                           |
| `createFromInvertly({ token, context? }, container?)` | Resolve, optionally passing a `Context`.  |

```typescript
const service = invertly(UserService);
```

## Injection lifetimes per parameter

When you need to control the lifetime of a *specific* dependency (or inject by a
token that isn't its concrete type), use the parameter decorators:

```typescript
import { Injectable, Singleton, Scope, Factory } from '@rolster/invertly';

@Injectable()
class OrderController {
  constructor(
    @Singleton(Database) private readonly db: Database, // shared everywhere
    @Scope(UnitOfWork) private readonly uow: UnitOfWork, // shared per request
    @Factory(Clock) private readonly clock: Clock // new every time
  ) {}
}
```

| Decorator            | Lifetime                                              |
| -------------------- | ----------------------------------------------------- |
| `@Singleton(token)`  | One instance for the entire container.                |
| `@Scope(token)`      | One instance per resolution tree (request scope).     |
| `@Factory(token)`    | A fresh instance for each injection.                  |

## Binding abstractions to implementations

The **locator** maps an abstract token (an abstract class, string or symbol) to
a concrete `useClass`. This lets you depend on an abstraction and swap the
implementation in one place:

```typescript
import { Injectable, saveInLocator, invertly } from '@rolster/invertly';

abstract class UserRepository {
  abstract findAll(): User[];
}

@Injectable()
class SqlUserRepository extends UserRepository {
  findAll(): User[] {
    return [];
  }
}

// Bind the abstraction to its implementation (as a singleton)
saveInLocator([
  { token: UserRepository, useClass: SqlUserRepository, singleton: true }
]);

@Injectable({ singleton: true })
class UserService {
  // Resolves to SqlUserRepository through the locator
  constructor(private readonly repository: UserRepository) {}
}

invertly(UserService);
```

Helpers: `saveInLocator(options[])` registers several bindings at once,
`pushInLocator(token, useClass)` adds a single one, and `findInLocator(token)`
looks one up. A `LocatorOptions` is `{ token, useClass, scopeable?, singleton? }`.

## Per-request context

`Context` is a key/value bag you can hand to the resolver and have injected into
any constructor. It's the basis for per-request state in server frameworks
(e.g. `@rolster/coopplins-server`, `@rolster/messenger-service`).

```typescript
import { Injectable, Context, createFromInvertly } from '@rolster/invertly';

@Injectable()
class RequestHandler {
  constructor(private readonly context: Context) {}

  currentUser(): string {
    return this.context.findByKey('userId');
  }
}

const context = new Context();
context.save('userId', '42');

const handler = createFromInvertly({ token: RequestHandler, context });
handler.currentUser(); // '42'
```

`Context` API: `save(key, value)`, `findByKey(key)`, `findOrNullByKey(key)`,
`contain(key)`.

## Isolated containers

By default everything lives in a global container. Create an `InvertlyContainer`
to get a fully isolated registry (useful for tests or multi-tenant setups):

```typescript
import { InvertlyContainer, invertly } from '@rolster/invertly';

const container = new InvertlyContainer();

container.registerInjectable({
  token: UserService,
  singleton: true,
  scopeable: false
});

const service = container.createInjectable({ token: UserService });
// or: invertly(UserService, container);
```

## Programmatic registration

When you can't (or don't want to) use decorators, register everything by hand:

```typescript
import { registerDependency } from '@rolster/invertly';

registerDependency(UserService, {
  singleton: true,
  injects: [{ token: Logger }] // constructor dependencies, in order
});
```

Lower-level primitives `registerInjectable(options, container?)` and
`registerInject(options, container?)` are also exported (they back both the
decorators and `registerDependency`).

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
