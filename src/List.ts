import { Redis } from 'ioredis';
import { v4 as uuid } from 'uuid';

/**
 * Maintains a list of JSON objects in a Redis list.
 */
export class List<T> {
  private deserializer: (item: string) => T;
  private serializer: (item: T) => string;
  constructor(
    private redis: Redis,
    private key: string,
    deserializer?: (item: string) => T,
    serializer?: (item: T) => string
  ) {
    if (deserializer) this.deserializer = deserializer;
    else this.deserializer = x => JSON.parse(x) as T;

    if (serializer) this.serializer = serializer;
    else this.serializer = x => JSON.stringify(x);
  }

  length(): Promise<number> {
    return this.redis.llen(this.key);
  }

  /**
   * Get an item at the specified index.
   */
  at(index: number): Promise<T> {
    return this.redis.lindex(this.key, index).then(this.deserializer);
  }

  /**
   * Set the deserializer factory used to deserialize objects from Redis.
   * @param deserializer
   */
  setDeserializer(deserializer: (item: string) => T) {
    this.deserializer = deserializer;
    return this;
  }

  /**
   * Set the serializer factory user to serialize objects into Redis.
   * @param serializer
   */
  setSerializer(serializer: (item: T) => string) {
    this.serializer = serializer;
    return this;
  }

  /**
   * Push an item or an array of items to the list.
   * @param item
   */
  push(item: Array<T>): Promise<void>;
  push(item: T): Promise<void>;
  async push(item: T | Array<T>): Promise<void> {
    if (!Array.isArray(item)) {
      item = [item];
    }
    await this.redis.lpush(this.key, ...item.map(this.serializer));
  }

  /**
   * Delete the list.
   */
  async delete(): Promise<void> {
    await this.redis.del(this.key);
  }

  /**
   * Get all items in the list.
   */
  async items(): Promise<Array<T>> {
    const strItems = await this.redis.lrange(this.key, 0, -1);
    const items = strItems.map<T>(this.deserializer);
    return items;
  }

  /**
   * Replaces the existing list by applying a transform function to every element in the list.
   * @param xform
   * @param mode
   */
  async map<U>(xform: (x: T, index: number, arr: Array<T>) => U): Promise<List<U>> {
    const items = (await this.items()).map(xform);

    const tmpKey = this._getTempKey();
    const tmpList = new List<U>(this.redis, tmpKey);
    await tmpList.push(items);
    await this.delete(); // only delete after the temp list has been populated
    await tmpList.redis.rename(tmpKey, this.key);
    tmpList.key = this.key;

    return tmpList; // could also just return this
  }

  /**
   * Creates a new list by applying a transform function to every element in the list.
   * @param xform
   * @param mode
   */
  async mapCopy<U>(xform: (x: T, index: number, arr: Array<T>) => U): Promise<List<U>> {
    const items = (await this.items()).map(xform);
    const newKey = this._getTempKey();
    const newList = new List<U>(this.redis, newKey);
    await newList.push(items);
    return newList;
  }

  async filter(predicate: (x: T, index: number, arr: Array<T>) => boolean): Promise<List<T>> {
    const items = (await this.items()).filter(predicate);

    const newList = new List<T>(this.redis, this._getTempKey());
    newList.push(items);

    return newList;
  }

  async filterCopy(predicate: (x: T, index: number, arr: Array<T>) => boolean): Promise<List<T>> {
    const items = (await this.items()).filter(predicate);

    const newList = new List<T>(this.redis, this._getTempKey());
    newList.push(items);

    await this.delete();
    await this.redis.rename(newList.key, this.key);

    return newList;
  }

  async reduce(predicate: (x: T, index: number, arr: Array<T>) => boolean): Promise<Array<T>> {
    const items = (await this.items()).filter(predicate);
    return items;
  }

  private _getTempKey() {
    return `${this.key}_${uuid()}`;
  }
}
