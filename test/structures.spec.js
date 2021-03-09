const { RedisObjects } = require('../dist/index');
const Redis = require('ioredis');
const { expect } = require('chai');

const redis = new Redis();
const server = new RedisObjects(redis);

describe('RedisObjects', function() {
  describe('Hash', function() {
    const myHash = server.getHash('some-hash');

    it('Should set and increment a field value', async function() {
      await myHash.set('count', 0);
      expect(await myHash.get('count')).to.eq('0');
      await myHash.increment('count');
      expect(await myHash.get('count')).to.eq('1');
    });
  });
});
