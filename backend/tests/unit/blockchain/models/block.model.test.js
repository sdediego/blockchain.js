/**
 * Blockc model tests.
 *
 * @file Defines block tests.
 */

import Block from '../../../../src/blockchain/models/block.model';
import config from '../../../../src/config/config.json';
import { BlockError } from '../../../../src/utils/errors';
import { getUTCNowTimestamp, hashBlock } from '../../../../src/blockchain/utils';

let generateRandomInteger = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

let generateBlock = () => {
  const previousBlock = Block.genesis();
  const data = ['data'];
  return Block.mineBlock(previousBlock, data);
};

describe('Block', () => {
  let properties, genesis, block;

  beforeEach(() => {
    genesis = Block.genesis();
    block = generateBlock();
    properties = Object.keys(block);
  });

  it('represents block instance in string format', () => {
    properties = properties.map(property => property.replace(/(?:^|\s)\S/g, letter => letter.toUpperCase()));
    const blockString = block.toString();
    expect(typeof blockString).toBe('string');
    expect(properties.every(property => blockString.includes(property))).toBe(true);
  });

  it('creates a new block instance', () => {
    block = Block.create(block);
    expect(block).toBeInstanceOf(Block);
    expect(Object.keys(block).every(property => properties.includes(property))).toBeTruthy();
  });

  it('throws block error for invalid block properties', () => {
    const randomProperty = properties[properties.length * Math.random() << 0];
    delete block[randomProperty]
    expect(() => Block.create(block)).toThrow(BlockError);
  });
 
  it('validates a valid block schema', () => {
    Block.isValidSchema(block);
  });
  
  it('throws block error for invalid block schema', () => {
    const randomProperty = properties[properties.length * Math.random() << 0];
    delete block[randomProperty]
    expect(() => Block.isValidSchema(block)).toThrow(BlockError);
  });

  it('generates the blockchain genesis block', () => {
    const genesis = Block.genesis();
    expect(genesis).toBeInstanceOf(Block);
    expect(genesis.hash).toEqual(hashBlock(genesis));
  });

  it('creates a new block through mining process', () => {
    const data = new Array('data');
    const block = Block.mineBlock(genesis, data);
    expect(block).toBeInstanceOf(Block);
    expect(block.hash).toEqual(hashBlock(block));
  });
  
  it('generates a block valid hash through proof of work consensus', () => {
    properties = {
      index: block.index + 1,
      timestamp: getUTCNowTimestamp(),
      nonce: 1,
      difficulty: 1,
      previousHash: block.hash,
      data: new Array('data')
    };
    const newBlock = Block.proofOfWork(genesis, block);
    expect(Object.keys(newBlock)).toEqual(expect.arrayContaining(Object.keys(block)));
    expect(newBlock.hash).toEqual(hashBlock(newBlock));
  });

  it('adjusts difficulty increase if block mining time takes less than mining rate', () => {
    const timestamp = block.timestamp - config.BLOCK_MINIG_RATE;
    const difficulty = Block.adjustDifficulty(block, timestamp);
    expect(typeof difficulty).toBe('number');
    expect(difficulty).toEqual(block.difficulty + 1);
  });

  it('adjusts difficulty decrease if block mining time takes more than mining rate', () => {
    block.difficulty = generateRandomInteger(5, 10);
    const timestamp = block.timestamp + config.BLOCK_MINIG_RATE + generateRandomInteger(1, 1000);
    const difficulty = Block.adjustDifficulty(block, timestamp);
    expect(typeof difficulty).toBe('number');
    expect(difficulty).toEqual(block.difficulty - 1);
  });

  it('adjusts difficulty to one if difficulty cannot be decrease', () => {
    block.difficulty = 1;
    const timestamp = block.timestamp + config.BLOCK_MINIG_RATE + generateRandomInteger(1, 1000);
    const difficulty = Block.adjustDifficulty(block, timestamp);
    expect(typeof difficulty).toBe('number');
    expect(difficulty).toEqual(1);
  });

  it('validates a valid block', () => {
    const data = ['data'];
    const newBlock = Block.mineBlock(block, data);
    Block.isValid(block, newBlock);
  });

  it('throws block error for invalid hashes between consecutive chained blocks', () => {
    const data = ['data'];
    const newBlock = Block.mineBlock(block, data);
    newBlock.previousHash = 'invalidHash';
    expect(() => Block.isValid(block, newBlock)).toThrow(BlockError);
  });

  it('throws error for difficulty increase between blocks greater than one', () => {
    const data = ['data'];
    const newBlock = Block.mineBlock(block, data);
    newBlock.difficulty = block.difficulty + generateRandomInteger(5, 10);
    expect(() => Block.isValid(block, newBlock)).toThrow(BlockError);
  });

  it('returns true if two blocks are the same block', () => {
    properties = Object.assign({}, block);
    const newBlock = new Block(properties);
    const isEqual = newBlock.isEqual(block);
    expect(typeof isEqual).toBe('boolean');
    expect(isEqual).toEqual(true);
  });

  it('returns false if two blocks are different', () => {
    properties = Object.assign({}, block);
    const newBlock = new Block(properties);
    const randomProperty = properties[properties.length * Math.random() << 0];
    newBlock[randomProperty] = generateRandomInteger(1, 1000);
    const isEqual = newBlock.isEqual(block);
    expect(typeof isEqual).toBe('boolean');
    expect(isEqual).toEqual(false);
  });

  it('stringifies the block into its properties', () => {
    const stringified = block.serialize();
    expect(typeof stringified).toBe('string');
    expect(properties.every(property => stringified.includes(property))).toBe(true);
  });

  it('throws block error for stringify blocks errors', () => {
    const invalidBlock = block;
    invalidBlock.block = invalidBlock;
    expect(() => invalidBlock.serialize()).toThrow(BlockError);
  });

  it('deserializes stringified block and returns block instance', () => {
    const stringified = block.serialize();
    const newBlock = Block.deserialize(stringified);
    expect(newBlock).toBeInstanceOf(Block);
    expect(properties.every(property => stringified.includes(property))).toBe(true);
  });

  it('throws block error for stringified block parsing error', () => {
    const invalidStringified = '{"index": 1, "timestamp":1,}';
    expect(() => Block.deserialize(invalidStringified)).toThrow(BlockError);
  });
});
