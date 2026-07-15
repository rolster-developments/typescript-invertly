import { Context } from '../stores/context.store';
import { InjectStore } from '../stores/inject.store';
import { InjectableStore } from '../stores/injectable.store';
import { findInLocator } from '../stores/locator.store';
import { ScopeStore } from '../stores/scope.store';
import { Constructable } from '../types/constructable.type';
import { AbstractContext } from '../types/context.type';
import {
  InjectableOptions,
  InjectableToken,
  InjectionOptions,
  InjectOptions,
  InjectToken
} from '../types/injectable.type';

import 'reflect-metadata';

type Tokens = Undefined<InjectableToken[]>;

interface InstanceOptions<T> {
  token: InjectToken<T>;
  scopeable?: boolean;
  singleton?: boolean;
}

interface ScopeOptions<T> {
  scope: ScopeStore;
  token: InjectToken<T>;
  context?: AbstractContext;
}

interface ReflectOptions<T> {
  token: InjectToken<T>;
  tokens: InjectableToken[];
}

class DataCenter {
  public readonly scope = new ScopeStore();

  public readonly injectables = new InjectableStore();

  public readonly injects = new InjectStore();
}

class InjectableFactory {
  private readonly scope = new ScopeStore();

  constructor(
    private dataCenter: DataCenter,
    private context?: AbstractContext
  ) {}

  public build<T = any>(token: InjectToken<T>): T {
    const locator = findInLocator(token);

    if (locator && 'useValue' in locator) {
      return locator.useValue;
    }

    const injectable = locator?.useClass ?? (token as InjectableToken<T>);

    const options = this.dataCenter.injectables.request(injectable);

    if (options) {
      return this.createInstance(options);
    }

    if (locator) {
      return this.createInstance({ ...locator, token: injectable });
    }

    throw Error(`Token ${String(token)} is not found in the collection`);
  }

  private createObject<T = any>(token: InjectToken<T>): T {
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
    let instance = scope.request<T>(token);

    if (!instance) {
      instance = this.createObject<T>(token);
      scope.push(token, instance);
    }

    return instance;
  }

  private createFromContainer<T = any>(token: InjectToken<T>): T {
    return this.createFromScope({ token, scope: this.dataCenter.scope });
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

    const locator = findInLocator(token);

    if (locator && 'useValue' in locator) {
      return locator.useValue;
    }

    return this.createInstance({
      token: locator?.useClass ?? token,
      scopeable,
      singleton
    });
  }

  private createReflectArgs<T>({ tokens, token }: ReflectOptions<T>): any[] {
    const injects = this.dataCenter.injects.request(token);

    return tokens.map((token, index) => {
      const inject = injects[index];

      if (inject) {
        return this.createFromDecorator(inject);
      }

      const locator = findInLocator(token);

      if (locator) {
        return 'useValue' in locator
          ? locator.useValue
          : this.createInstance({ ...locator, token: locator.useClass });
      }

      if (token === Context) {
        return this.context;
      }

      return this.createObject(token);
    });
  }

  private createTokenArgs<T>(token: InjectToken<T>): any[] {
    const injects = this.dataCenter.injects.request(token);

    return injects.reduce((objects, options) => {
      objects[options.index] = this.createInstance({ ...options });

      return objects;
    }, [] as any[]);
  }
}

export class InvertlyContainer {
  private readonly dataCenter = new DataCenter();

  public registerInjectable(options: InjectableOptions): void {
    this.dataCenter.injectables.push(options);
  }

  public registerInject(options: InjectOptions): void {
    this.dataCenter.injects.push(options);
  }

  public createInjectable<T = any>(options: InjectionOptions<T>): T {
    return new InjectableFactory(this.dataCenter, options.context).build(
      options.token
    );
  }
}
