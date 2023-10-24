import 'reflect-metadata';
import {
  Context,
  InjectStore,
  InjectableStore,
  ScopeStore,
  fetchInLocator
} from '../stores';
import {
  AbstractContext,
  Constructable,
  InjectConfig,
  InjectableConfig,
  InjectableToken,
  InjectionConfig
} from '../types';

type Tokens = Undefined<InjectableToken[]>;

interface InjectableProps {
  warehouse: Warehouse;
  context?: AbstractContext;
}

interface InstanceProps<T> {
  token: InjectableToken<T>;
  scopeable?: boolean;
  singleton?: boolean;
}

interface ScopeProps<T> {
  token: InjectableToken<T>;
  scope: ScopeStore;
  context?: AbstractContext;
}

interface ReflectProps<T> {
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

  constructor({ warehouse, context }: InjectableProps) {
    this.warehouse = warehouse;
    this.context = context;

    this.scope = new ScopeStore();
  }

  public build<T = unknown>(injectable: InjectableToken<T>): T {
    const config = this.warehouse.injectables.fetch(injectable);

    if (!config) {
      throw Error(
        `Class ${injectable.toString()} is not found in the collection`
      );
    }

    const { scopeable, singleton, token } = config;

    return this.createInstance({ token, scopeable, singleton });
  }

  private createObject<T = unknown>(token: InjectableToken<T>): T {
    const Constructor = token as unknown as Constructable<T>;

    const tokens = this.reflectTokens(Constructor);

    const params = tokens
      ? this.createReflectArgs({ token, tokens })
      : this.createTokenArgs(token);

    return new Constructor(...params);
  }

  private reflectTokens<T>(reference: Constructable<T>): Tokens {
    return Reflect.getMetadata('design:paramtypes', reference);
  }

  private createFromScope<T = unknown>({ token, scope }: ScopeProps<T>): T {
    const instance = scope.fetch<T>(token);

    if (instance) {
      return instance;
    }

    const object = this.createObject<T>(token);

    scope.push(token, object);

    return object;
  }

  private createFromContainer<T = unknown>(token: InjectableToken<T>): T {
    const {
      warehouse: { scope }
    } = this;

    return this.createFromScope({ token, scope });
  }

  private createInstance<T = unknown>(props: InstanceProps<T>): T {
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

  private createFromDecorator<T = unknown>(inject: InjectConfig<T>): T {
    const { token, scopeable, singleton } = inject;

    const locator = fetchInLocator(token);

    if (locator) {
      const { useClass: token } = locator;

      return this.createInstance({ token, scopeable, singleton });
    }

    return this.createInstance({ token, scopeable, singleton });
  }

  private createReflectArgs<T>({ tokens, token }: ReflectProps<T>): unknown[] {
    const { warehouse, context } = this;

    const injects = warehouse.injects.fetch(token);

    return tokens.map((token, index) => {
      const inject = injects[index];

      if (inject) {
        return this.createFromDecorator(inject);
      }

      const locator = fetchInLocator(token);

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

  private createTokenArgs<T>(token: InjectableToken<T>): unknown[] {
    const injects = this.warehouse.injects.fetch(token);

    return injects.reduce((objects, { index, scopeable, singleton, token }) => {
      objects[index] = this.createInstance({ token, scopeable, singleton });

      return objects;
    }, [] as unknown[]);
  }
}

export class Container {
  private readonly warehouse: Warehouse;

  constructor() {
    this.warehouse = new Warehouse();
  }

  public registerInjectable(config: InjectableConfig): void {
    this.warehouse.injectables.push(config);
  }

  public registerInject(config: InjectConfig): void {
    this.warehouse.injects.push(config);
  }

  public createInjectable<T = unknown>(config: InjectionConfig<T>): T {
    const { token, context } = config;
    const { warehouse } = this;

    const dependency = new Dependency({ warehouse, context });

    return dependency.build(token);
  }
}
