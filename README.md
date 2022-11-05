# Redis Objects

_Interact with Redis structures as local objects_

## Installing

```bash
npm i @johnny.reina/redis-objects
```

## Usage

```typescript
const { RedisObjects } = require('@johnny.reina/redis-objects');
const Redis = require('ioredis');

interface Person {
    name: string;
    age: number;
}

const redis = new Redis();
const factory = new RedisObjects(redis);

const list = factory.getList<Person>('people');
```
