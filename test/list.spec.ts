import { expect } from 'chai';
import Redis from 'ioredis';
import { RedisObjects } from '../src';

const redis = new Redis();
const server = new RedisObjects(redis);

describe('RedisObjects', function() {
  describe('List', function() {
    const myList = server.getList<number>('some-list');
    beforeEach(async () => {
      await myList.delete();
    });

    describe('#push', () => {
      it('Should add a list value', async function() {
        await myList.push(100);

        expect(await myList.length()).to.eq(1);

        const value = await myList.at(0);
        expect(value).to.eql(100);
      });
    });

    describe('#map', () => {
      it('should double each object in the list', async () => {
        await myList.push([10, 20, 30, 40]);

        const resultList = await myList.map(x => x * 2);

        const actual = await resultList.items();

        expect(actual).to.eql([20, 40, 60, 80]);
      });

      it('should create an object from each number in the list', async () => {
        await myList.push([10, 20, 30, 40]);

        const resultList = await myList.map(x => ({ x }));

        const actual = await resultList.items();

        expect(actual).to.eql([{ x: 10 }, { x: 20 }, { x: 30 }, { x: 40 }]);
      });

      it('should double each object in the list', async () => {
        await myList.push([10, 20, 30, 40]);

        const resultList = await myList.map(x => x * 2);

        const actual = await resultList.items();

        expect(actual).to.eql([20, 40, 60, 80]);
      });
    });
  });
});
