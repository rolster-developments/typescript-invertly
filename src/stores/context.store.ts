export class Context extends Map<string, unknown> {
  public getValue<T = unknown>(key: string): Undefined<T> {
    return this.has(key) ? (this.get(key) as T) : undefined;
  }
}
