export interface IRepository<T> {
  findAll(): T[];
  findById(id: string): T | undefined;
  save(item: T): void;
  delete(id: string): void;
}
