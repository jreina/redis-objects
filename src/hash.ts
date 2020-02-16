import { Redis, ValueType, KeyType, BooleanResponse } from "ioredis";
import { isArray } from "util";

export class Hash {
  constructor(private _redis: Redis, private _key: string) {}

  /**
   * Delete one or more fields from the hash.
   * @param fields
   */
  public async delete(...fields: Array<string>): Promise<number> {
    return this._redis.hdel(this._key, ...fields);
  }

  /**
   * Determine whether or not the given field exists in the hash.
   * @param field
   */
  public async exists(field: string): Promise<boolean> {
    const response = await this._redis.hexists(this._key, field);
    return response === 1;
  }

  /**
   * Set the hash to expire in the given number of seconds.
   * @param seconds
   */
  public async expire(seconds: number): Promise<boolean> {
    const response = await this._redis.expire(this._key, seconds);
    return response === 1;
  }

  /**
   * Get a value from the field in the hash.
   * @param field
   */
  public async get(field: string): Promise<string | null> {
    return this._redis.hget(this._key, field);
  }

  /**
   * Get all fields and values from the hash.
   */
  public async getAll(): Promise<Record<string, string>> {
    return this._redis.hgetall(this._key);
  }

  /**
   * Increment a field in the hash by 1.
   * @param field
   */
  public async increment(field: string): Promise<number> {
    return this._redis.hincrby(this._key, field, 1);
  }

  /**
   * Increment a field in the hash by some integral value.
   * @param field
   * @param value
   */
  public async incrementBy(field: string, value: number): Promise<number> {
    return this._redis.hincrby(this._key, field, value);
  }
  /**
   * Increment a field in the hash by some floating value.
   * @param field
   * @param value
   */
  public async incrementByFloat(field: string, value: number): Promise<number> {
    return this._redis.hincrbyfloat(this._key, field, value);
  }

  /**
   * Get all keys from the hash.
   */
  public async keys(): Promise<Array<string>> {
    return this._redis.hkeys(this._key);
  }

  /**
   * Return the number of fields in the hash.
   */
  public async length(): Promise<number> {
    return this._redis.hlen(this._key);
  }

  /**
   * Get the values from the specified fields in the hash.
   * @param fields
   */
  public async mget(...fields: Array<string>): Promise<Array<string | null>> {
    return this._redis.hmget(this._key, ...fields);
  }

  public async mset(key: KeyType, ...args: Array<ValueType>): Promise<boolean>;
  public async mset(
    key: KeyType,
    data: object | Map<string, ValueType>
  ): Promise<boolean>;
  public async mset(
    key: KeyType,
    ...args: Array<object | Map<string, ValueType> | ValueType>
  ): Promise<boolean> {
    let result: BooleanResponse;
    if (args.length === 1) {
      result = await this._redis.hmset(this._key, args);
    }
    result = await this._redis.hmset(this._key, ...(args as Array<ValueType>));

    return result === 1;
  }

  /**
   * Set a field on the hash.
   * @param field
   * @param value
   */
  public async set<T extends ValueType>(
    field: string,
    value: T
  ): Promise<boolean> {
    const response = await this._redis.hset(this._key, field, value);
    return response === 1;
	}
}
