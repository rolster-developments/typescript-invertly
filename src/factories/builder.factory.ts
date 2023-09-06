import 'reflect-metadata';
import {
  Context,
  InjectStore,
  InjectableStore,
  ScopeStore,
  fetchInLocator
} from '../stores';
import {
  Constructable,
  InjectConfig,
  InjectableConfig,
  InjectableToken,
  InjectionConfig
} from '../types';

type Tokens = Undefined<InjectableToken[]>;

interface InjectableProps {
  container: Container;
  context?: Context;
}

interface InstanceProps<T> {
  token: InjectableToken<T>;
  scopeable?: boolean;
  singleton?: boolean;
}

interface ScopeProps<T> {
  token: InjectableToken<T>;
  scope: ScopeStore;
  context?: Context;
}

interface ReflectProps<T> {
  token: InjectableToken<T>;
  tokens: InjectableToken[];
}

class Handler {
  private container: Container;

  private scope: ScopeStore;

  private context?: Context;

  constructor({ container, context }: InjectableProps) {
    this.container = container;
    this.context = context;

    this.scope = new ScopeStore();
  }

  public build<T = unknown>(injectable: InjectableToken<T>): T {
    const config = this.container.injectables.fetch(injectable);

    if (!config) {
      throw Error(`Class ${injectable.toString()} is not found in the collection`);
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
      container: { scope }
    } = this;

    return this.createFromScope({ token, scope });
  }

  private createInstance<T = unknown>(props: InstanceProps<T>): T {
    const { token, scopeable, singleton } = props;

    if (singleton) {
      return this.createFromContainer(token);
    }

    if (scopeable) {
      return this.createFromScope({ token, scope: this.scope });
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
    const { container, context } = this;

    const injects = container.injects.fetch(token);

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
    const injects = this.container.injects.fetch(token);

    return injects.reduce((objects: unknown[], { token }, index) => {
      objects[index] = this.createObject(token);

      return objects;
    }, []);
  }
}

class Container {
  public readonly scope: ScopeStore;

  public readonly injectables: InjectableStore;

  public readonly injects: InjectStore;

  constructor() {
    this.scope = new ScopeStore();
    this.injectables = new InjectableStore();
    this.injects = new InjectStore();
  }
}

export class Builder {
  private readonly container: Container;

  constructor() {
    this.container = new Container();
  }

  public registerInjectable(config: InjectableConfig): void {
    this.container.injectables.push(config);
  }

  public registerInject(config: InjectConfig): void {
    this.container.injects.push(config);
  }

  public createInjectable<T = unknown>(config: InjectionConfig<T>): T {
    const { token, context } = config;
    const { container } = this;

    const injectable = new Handler({ container, context });

    return injectable.build(token);
  }
}
