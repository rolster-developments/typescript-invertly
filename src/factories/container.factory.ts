import 'reflect-metadata';
import { Context } from '../stores/context.store';
import { InjectStore } from '../stores/inject.store';
import { InjectableStore } from '../stores/injectable.store';
import { findInLocator } from '../stores/locator.store';
import { ScopeStore } from '../stores/scope.store';
import { AbstractContext } from '../types/context.type';
import { Constructable } from '../types/constructable.type';
import {
  InjectableOptions,
  InjectableToken,
  InjectionOptions
} from '../types/injectable.type';
import { InjectOptions } from '../types/inject.type';

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

  public build<T = any>(injectable: InjectableToken<T>): T {
    const options = this.dataCenter.injectables.request(injectable);

    if (!options) {
      throw Error(
        `Class ${injectable.toString()} is not found in the collection`
      );
    }

    return this.createInstance(options);
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
    let instance = scope.request<T>(token);

    if (!instance) {
      instance = this.createObject<T>(token);
      scope.push(token, instance);
    }

    return instance;
  }

  private createFromContainer<T = any>(token: InjectableToken<T>): T {
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
        return this.createInstance({
          ...locator,
          token: locator.useClass
        });
      }

      if (token === Context) {
        return this.context;
      }

      return this.createObject(token);
    });
  }

  private createTokenArgs<T>(token: InjectableToken<T>): any[] {
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
