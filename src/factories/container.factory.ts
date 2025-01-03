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
  private scope: ScopeStore;

  constructor(
    private warehouse: Warehouse,
    private context?: AbstractContext
  ) {
    this.scope = new ScopeStore();
  }

  public build<T = any>(injectable: InjectableToken<T>): T {
    const options = this.warehouse.injectables.request(injectable);

    if (!options) {
      throw Error(
        `Class ${injectable.toString()} is not found in the collection`
      );
    }

    const { scopeable, singleton, token } = options;

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

  private reflectTokens<T>(constructable: Constructable<T>): Tokens {
    return Reflect.getMetadata('design:paramtypes', constructable);
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
    return this.createFromScope({ token, scope: this.warehouse.scope });
  }

  private createInstance<T = any>(options: InstanceOptions<T>): T {
    const { token, scopeable, singleton } = options;

    if (singleton) {
      return this.createFromContainer(token);
    }

    if (scopeable) {
      return this.createFromScope({ token, scope: this.scope });
    }

    return this.createObject(token);
  }

  private createFromDecorator<T = any>(inject: InjectOptions<T>): T {
    const { token, scopeable, singleton } = inject;

    const locator = requestInLocator(token);

    return this.createInstance({
      token: locator?.useClass ?? token,
      scopeable,
      singleton
    });
  }

  private createReflectArgs<T>({ tokens, token }: ReflectOptions<T>): any[] {
    const injects = this.warehouse.injects.request(token);

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
        return this.context;
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
    return new Dependency(this.warehouse, options.context).build(options.token);
  }
}
