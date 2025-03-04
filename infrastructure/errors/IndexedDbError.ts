export class IndexedDbError extends Error {
  constructor(
    message: string,
    public readonly index?: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = "IndexedDbError";
  }
}
