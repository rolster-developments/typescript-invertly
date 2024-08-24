import 'reflect-metadata';
import {
  Context,
  InjectStore,
  InjectableStore,
  ScopeStore,
  requestInLocator
} from '../stores';
import {
  AbstractContext,
  Constructable,
  InjectOptions,
  InjectableOptions,
  InjectableToken,
  InjectionOptions
} from '../types';

type Tokens = Undefined<InjectableToken[]>;

interface DependencyOptions {
  warehouse: Warehouse;
  context?: AbstractContext;
}

interface InstanceOptions<T> {
  token: InjectableToken<T>;
  scopeable?: boolean;
  singleton?: boolean;
}

interface ScopeOptions<T> {
  token: InjectableToken<T>;
  scope: ScopeStore;
  context?: AbstractContext;
}

interface ReflectOptions<T> {
  token: InjectableToken<T>;
  tokens: InjectableToken[];
}

class Warehouse {
  public readonly scope: ScopeStore;

  public readonly injectables: InjectableStore;

  public readonly injects: InjectStore;

  constructor() {
    this.scope = new ScopeStore();
    this.injectables = new InjectableStore();
    this.injects = new InjectStore();
  }
}

class Dependency {
  private warehouse: Warehouse;

  private scope: ScopeStore;

  private context?: AbstractContext;

  constructor({ warehouse, context }: DependencyOptions) {
    this.warehouse = warehouse;
    this.context = context;

    this.scope = new ScopeStore();
  }

  public build<T = any>(injectable: InjectableToken<T>): T {
    const config = this.warehouse.injectables.request(injectable);

    if (!config) {
      throw Error(
        `Class ${injectable.toString()} is not found in the collection`
      );
    }

    const { scopeable, singleton, token } = config;

    return this.createInstance({ token, scopeable, singleton });
  }

  private createObject<T = any>(token: InjectableToken<T>): T {
    const Constructor = token as any as Constructable<T>;

    const tokens = this.reflectTokens(Constructor);

    const params = tokens
      ? this.createReflectArgs({ token, tokens })
      : this.createTokenArgs(token);

    return new Constructor(...params);
  }

  private reflectTokens<T>(reference: Constructable<T>): Tokens {
    return Reflect.getMetadata('design:paramtypes', reference);
  }

  private createFromScope<T = any>({ token, scope }: ScopeOptions<T>): T {
    const instance = scope.request<T>(token);

    if (instance) {
      return instance;
    }

    const object = this.createObject<T>(token);

    scope.push(token, object);

    return object;
  }

  private createFromContainer<T = any>(token: InjectableToken<T>): T {
    const {
      warehouse: { scope }
    } = this;

    return this.createFromScope({ token, scope });
  }

  private createInstance<T = any>(props: InstanceOptions<T>): T {
    const { token, scopeable, singleton } = props;
    const { scope } = this;

    if (singleton) {
      return this.createFromContainer(token);
    }

    if (scopeable) {
      return this.createFromScope({ token, scope });
    }

    return this.createObject(token);
  }

  private createFromDecorator<T = any>(inject: InjectOptions<T>): T {
    const { token, scopeable, singleton } = inject;

    const locator = requestInLocator(token);

    if (locator) {
      const { useClass: token } = locator;

      return this.createInstance({ token, scopeable, singleton });
    }

    return this.createInstance({ token, scopeable, singleton });
  }

  private createReflectArgs<T>({ tokens, token }: ReflectOptions<T>): any[] {
    const { warehouse, context } = this;

    const injects = warehouse.injects.request(token);

    return tokens.map((token, index) => {
      const inject = injects[index];

      if (inject) {
        return this.createFromDecorator(inject);
      }

      const locator = requestInLocator(token);

      if (locator) {
        const { useClass: token, scopeable, singleton } = locator;

        return this.createInstance({ token, scopeable, singleton });
      }

      if (token === Context) {
        return context;
      }

      return this.createObject(token);
    });
  }

  private createTokenArgs<T>(token: InjectableToken<T>): any[] {
    const injects = this.warehouse.injects.request(token);

    return injects.reduce((objects, { index, scopeable, singleton, token }) => {
      objects[index] = this.createInstance({ token, scopeable, singleton });

      return objects;
    }, [] as any[]);
  }
}

export class Container {
  private readonly warehouse: Warehouse;

  constructor() {
    this.warehouse = new Warehouse();
  }

  public registerInjectable(options: InjectableOptions): void {
    this.warehouse.injectables.push(options);
  }

  public registerInject(options: InjectOptions): void {
    this.warehouse.injects.push(options);
  }

  public createInjectable<T = any>(options: InjectionOptions<T>): T {
    const { token, context } = options;
    const { warehouse } = this;

    const dependency = new Dependency({ warehouse, context });

    return dependency.build(token);
  }
}
