/**
 * Blockchain utils tests.
 *
 * @file Defines blockchain utils tests.
 */

import config from '../../../src/config/config.json';
import { getUTCNowTimestamp, hashBlock } from '../../../src/blockchain/utils';

let generateRandomInteger = (min, max) => {
  return Math.random() * (max - min) + min;
};

let generateBlockProperties = () => {
  const index = generateRandomInteger(1, 100);
  const timestamp = generateRandomInteger(1.0e12, 1.9e12);
  const nonce = generateRandomInteger(1, 10);
  const difficulty = generateRandomInteger(1, 1000);
  const previousHash = 'previousHash';
  const data = new Array('data');
  return { index, timestamp, nonce, difficulty, previousHash, data };
};

describe('Blockchain utils', () => {
  it('generates a UTC timestamp in milliseconds', () => {
    const timestamp = getUTCNowTimestamp();
    expect(typeof timestamp).toBe('number');
    expect(timestamp.toString().length).toEqual(config.BLOCK_TIMESTAMP_LENGTH);
  });

  it('generates 256-bit hash value for block properties', () => {
    const properties = generateBlockProperties();
    const hash = hashBlock(properties);
    expect(hash).toEqual(expect.stringMatching(/^[a-f0-9]{64}/));
  });

  it('generates unique hash for different inputs', () => {
    const propertiesOne = generateBlockProperties();
    const propertiesTwo = generateBlockProperties();
    const hashOne = hashBlock(propertiesOne);
    const hashTwo = hashBlock(propertiesTwo);
    expect(hashOne).not.toEqual(hashTwo);
  });
});
