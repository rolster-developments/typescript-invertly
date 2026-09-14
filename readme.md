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

| Option      | Default | Meaning                                              |
| ----------- | ------- | ---------------------------------------------------- |
| `singleton` | `false` | A single instance shared across the whole container. |
| `scopeable` | `false` | A single instance shared within one resolution tree. |

When neither is set, a brand-new instance is created on every resolution.

## Resolving instances

| Function                                              | Use                                      |
| ----------------------------------------------------- | ---------------------------------------- |
| `invertly(token, container?)`                         | Resolve an injectable by token.          |
| `createFromInvertly({ token, context? }, container?)` | Resolve, optionally passing a `Context`. |

```typescript
const service = invertly(UserService);
```

## Injection lifetimes per parameter

When you need to control the lifetime of a _specific_ dependency (or inject by a
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

| Decorator           | Lifetime                                          |
| ------------------- | ------------------------------------------------- |
| `@Singleton(token)` | One instance for the entire container.            |
| `@Scope(token)`     | One instance per resolution tree (request scope). |
| `@Factory(token)`   | A fresh instance for each injection.              |

## Binding abstractions to implementations

The **locator** maps a token (an abstract class, string or symbol — any
`InjectToken`) either to a concrete `useClass` to instantiate, or to a fixed
`useValue` to hand back as is. This lets you depend on an abstraction and swap
the implementation in one place:

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

A `useValue` binding resolves to the given value without instantiating
anything. Inject it into a constructor through one of the parameter decorators
(the reflected type of a primitive is not enough to look it up):

```typescript
import {
  Factory,
  Injectable,
  invertly,
  saveInLocator
} from '@rolster/invertly';

const API_URL = Symbol('API_URL');

saveInLocator([{ token: API_URL, useValue: 'https://api.rolster.com' }]);

@Injectable()
class ApiClient {
  constructor(@Factory(API_URL) readonly baseUrl: string) {}
}

invertly(API_URL); // 'https://api.rolster.com'
invertly(ApiClient).baseUrl; // 'https://api.rolster.com'
```

A `LocatorOptions` is either a `LocatorClassOptions`
(`{ token, useClass, scopeable?, singleton? }`) or a `LocatorValueOptions`
(`{ token, useValue }`). Helpers: `saveInLocator(options[])` registers several
bindings at once, `pushInLocator(reference, token?)` adds a single one and
`findInLocator(token)` looks one up. `pushInLocator` accepts either a
`LocatorOptions` object, or a string/symbol `reference` plus the class to
instantiate for it:

```typescript
import { pushInLocator } from '@rolster/invertly';

pushInLocator({ token: UserRepository, useClass: SqlUserRepository });
pushInLocator('UserRepository', SqlUserRepository);
```

The locator is global: its bindings are visible from every container.

## Per-request context

`Context` is a key/value bag you can hand to the resolver and have injected into
any constructor. It's the basis for per-request state in server frameworks
(e.g. `@rolster/coopplins-server`, `@rolster/signals`).

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

The decorators (`@Injectable`, `@Singleton`, `@Scope`, `@Factory`) always
register into the global container, so an isolated container only knows the
classes you register on it manually (or via `registerDependency` with the
`container` option).

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
decorators and `registerDependency`). Their option shapes are not exported as
types: `registerInjectable` takes `{ token, singleton, scopeable }` (the class
and its lifetime flags) and `registerInject` takes
`{ parent, index, token, singleton, scopeable }` (the class being built, the
constructor parameter position, and the token to inject there with its
lifetime flags).

## Types

| Type                     | Description                                                                     |
| ------------------------ | ------------------------------------------------------------------------------- |
| `Constructable<T>`       | `new (...args: any[]) => T` — a concrete class.                                 |
| `InjectableToken<T>`     | A class (or object/function) that can be registered and instantiated.           |
| `InjectToken<T>`         | `InjectableToken<T> \| string \| symbol` — anything you can resolve or bind.    |
| `LocatorClassOptions<T>` | `{ token: InjectToken; useClass: InjectableToken<T>; scopeable?; singleton? }`. |
| `LocatorValueOptions<T>` | `{ token: InjectToken; useValue: T }`.                                          |
| `LocatorOptions<T>`      | `LocatorClassOptions<T> \| LocatorValueOptions<T>`.                             |

## Contributing

- Daniel Andrés Castillo Pedroza :rocket:
