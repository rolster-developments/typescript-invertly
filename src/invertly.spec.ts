import createFromInvertly, {
  registerInject,
  registerInjectable
} from './factories';

class PersistentUnit {
  public code = Math.random();

  public execute(): number {
    return this.code;
  }
}

class Builder {
  constructor(private persistentUnit: PersistentUnit) {}

  public execute(): number {
    return this.persistentUnit.execute();
  }
}

class Service {
  constructor(
    private persistentUnit: PersistentUnit,
    private builder: Builder
  ) {}

  public execute(): boolean {
    return this.persistentUnit.execute() === this.builder.execute();
  }
}

describe('Invertly', () => {
  it('Create service', () => {
    registerInjectable({
      token: PersistentUnit,
      scopeable: true,
      singleton: false
    });

    registerInjectable({
      token: Builder,
      scopeable: true,
      singleton: false
    });

    registerInject({
      token: PersistentUnit,
      index: 0,
      parent: Builder,
      scopeable: true,
      singleton: true
    });

    registerInjectable({
      token: Service,
      scopeable: true,
      singleton: false
    });

    registerInject({
      token: PersistentUnit,
      index: 0,
      parent: Service,
      scopeable: true,
      singleton: true
    });

    registerInject({
      token: Builder,
      index: 1,
      parent: Service,
      scopeable: true,
      singleton: true
    });

    const service = createFromInvertly({ token: Service });

    expect(service.execute()).toBe(true);
  });
});
