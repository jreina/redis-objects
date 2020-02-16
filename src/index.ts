import { Redis } from "ioredis";
import { Hash } from "./hash";

export class RedisObjects {
    constructor(private _redis: Redis) {

    }

    /**
     * Set the database.
     * @param db 
     */
    database(db: number): Promise<string> {
        return this._redis.select(db);
    }

    /**
     * Creates a new hash object for the given key.
     * @param key 
     */
    getHash(key: string): Hash {
        return new Hash(this._redis, key);
    }
}