import { Redis, ValueType, KeyType, BooleanResponse } from 'ioredis';
import { isArray } from 'util';
import { OperationMode } from './constant/OperationMode';
import uuid from 'uuid/v4';

export class JsonList<T> {
  constructor(private _redis: Redis, private _key: string) {}

  push(item: Array<T>): Promise<void>;
  push(item: T): Promise<void>;
  async push(item: T | Array<T>): Promise<void> {
    if (!Array.isArray(item)) {
      item = [item];
    }
    await this._redis.lpush(this._key, ...item.map(x => JSON.stringify(x)));
  }

  async delete() {
    await this._redis.del(this._key);
  }

  async map<U>(
    xform: (x: T, index: number, arr: Array<T>) => U,
    mode: OperationMode = OperationMode.Copy
  ): Promise<JsonList<U>> {
    const strItems = await this._redis.lrange(this._key, 0, -1);
    const items = strItems
      .map<T>(x => JSON.parse(x))
      .map(xform);
    if (mode === OperationMode.Copy) {
      const newList = new JsonList<U>(this._redis, `${this._key}_${uuid()}`);
      await newList.push(items);
      return newList;
    } else if (mode === OperationMode.Overwrite) {
      await this.delete();
      const newList = new JsonList<U>(this._redis, this._key);
      await newList.push(items);
      return newList;
    }
    throw new Error('OperationMode not valid: ' + mode);
  }
  async filter(predicate: (x: T, index: number, arr: Array<T>) => boolean): Promise<Array<T>> {
    const strItems = await this._redis.lrange(this._key, 0, -1);
    const items = strItems
      .map<T>(x => JSON.parse(x))
      .filter(predicate);
    return items;
  }
  async reduce(predicate: (x: T, index: number, arr: Array<T>) => boolean): Promise<Array<T>> {
    const strItems = await this._redis.lrange(this._key, 0, -1);
    const items = strItems
      .map<T>(x => JSON.parse(x))
      .filter(predicate);
    return items;
  }
}
