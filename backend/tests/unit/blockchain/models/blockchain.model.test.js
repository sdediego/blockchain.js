/**
 * Blockc model tests.
 *
 * @file Defines block tests.
 */

import Block from '../../../../src/blockchain/models/block.model';
import Blockchain from '../../../../src/blockchain/models/blockchain.model';
import { BlockchainError } from '../../../../src/utils/errors';
import { config } from 'winston';

let generateRandomInteger = (min, max) => {
  return Math.round(Math.random() * (max - min) + min);
};

let generateGenesis = () => {
  return Block.genesis();
};

let generateBlock = previousBlock => {
  const data = ['data'];
  return Block.mineBlock(previousBlock, data);
};

let generateChain = length => {
  const genesis = generateGenesis();
  const chain = new Array(genesis);
  let previousBlock = genesis;

  for (let index = 1; index < length; index++) {
    let block = generateBlock(previousBlock);
    chain.push(block);
    previousBlock = block;
  }
  return chain;
};

describe('Blockchain', () => {
  let length, chain, blockchain;

  beforeEach(() => {
    length = generateRandomInteger(2, 4);
    chain = generateChain(length);
    blockchain = new Blockchain(chain);
  });

  it('represents block instance in string format', () => {
    const blockchainString = blockchain.toString();
    expect(typeof blockchainString).toBe('string');
    expect(blockchainString.includes('Blockchain')).toBe(true);
    expect(blockchainString.includes('Block')).toBe(true);
  });

  it('returns the genesis block from the blockchain', () => {
    const genesis = blockchain.genesis;
    expect(genesis).toBeInstanceOf(Block);
    expect(genesis).toEqual(Block.genesis());
  });

  it('returns the last block from the blockchain', () => {
    const lastBlock = blockchain.lastBlock;
    expect(lastBlock).toBeInstanceOf(Block);
    expect(lastBlock).toEqual(blockchain.chain[blockchain.chain.length - 1]);
  });

  it('returns the chain length from the blockchain', () => {
    const length = blockchain.length;
    expect(typeof length).toBe('number');
    expect(length).toEqual(blockchain.chain.length);
  });

  it('creates a new blockchain instance', () => {
    blockchain = Blockchain.create(chain);
    expect(blockchain).toBeInstanceOf(Blockchain);
    expect(blockchain.hasOwnProperty('chain')).toBe(true);
  });

  it('validates a valid blockchain schema', () => {
    Blockchain.isValidSchema(chain);
  });

  it('throws blockchain error on blockchain schema validation for invalid genesis block', () => {
    const fakeGenesis = [new Object(), new Block({ ...config.GENESIS_BLOCK, hash: 'hash' })];
    blockchain.chain[0] = fakeGenesis[Math.floor(Math.random() * fakeGenesis.length)];
    expect(() => Blockchain.isValidSchema(chain)).toThrow(BlockchainError);
  });

  it('throws blockchain error on blockchain schema validation for invalid block in the chain', () => {
    const randomBlock = blockchain.chain.slice(1)[Math.floor(Math.random() * (blockchain.length - 1))];
    const fakeBlocks = [new Object(), Object.assign(randomBlock, { previousHash: 'previousHash' })];
    blockchain.chain[randomBlock.index] = fakeBlocks[Math.floor(Math.random() * fakeBlocks.length)];
    expect(() => Blockchain.isValidSchema(blockchain.chain)).toThrow(BlockchainError);
  });

  it('adds a new mined block to the blockchain', () => {
    const data = ['new data'];
    const newBlock = blockchain.addBlock(data);
    expect(newBlock).toBeInstanceOf(Block);
    expect(newBlock.isEqual(blockchain.lastBlock)).toBe(true);
    expect(newBlock.data).toEqual(expect.arrayContaining(data));
  });

  it('replaces chain if incoming chain is valid', () => {
    const newChain = generateChain(5);
    expect(blockchain.length).toEqual(chain.length);
    blockchain.setValidChain(newChain);
    expect(blockchain.length).toEqual(newChain.length);
  });

  it('throws blockchain error if incoming chain is no longer than local chain', () => {
    const shortChain = generateChain(2);
    expect(blockchain.length).toEqual(chain.length);
    expect(() => blockchain.setValidChain(shortChain)).toThrow(BlockchainError);
    expect(blockchain.length).toBeGreaterThanOrEqual(shortChain.length);
  });

  it('throws blockchain error if incoming chain is invalid', () => {
    const invalidChain = chain.push(generateGenesis());
    expect(() => blockchain.setValidChain(invalidChain)).toThrow(BlockchainError);
    expect(blockchain.length).toEqual(chain.length);
  });

  it('validates a valid chain', () => {
    Blockchain.isValid(chain);
  });

  it('throws blockchain error on invalid chain', () => {
    const randomBlock = blockchain.chain.slice(1)[Math.floor(Math.random() * (blockchain.length - 1))];
    const fakeBlocks = [new Object(), Object.assign(randomBlock, { previousHash: 'previousHash' })];
    blockchain.chain[randomBlock.index] = fakeBlocks[Math.floor(Math.random() * fakeBlocks.length)];
    expect(() => Blockchain.isValidSchema(blockchain.chain)).toThrow(BlockchainError);
  });

  it('stringifies the blockchain into string of blocks', () => {
    const stringified = blockchain.serialize();
    expect(typeof stringified).toBe('string');
  });

  it('throws blockchain error for stringify blockchain errors', () => {
    const invalidBlockchain = blockchain;
    invalidBlockchain.chain = invalidBlockchain;
    expect(() => invalidBlockchain.serialize()).toThrow(BlockchainError);
  });

  it('deserializes stringified blockchain and returns blockchain instance', () => {
    const stringified = blockchain.serialize();
    const newBlockchain = Blockchain.deserialize(stringified);
    expect(newBlockchain).toBeInstanceOf(Blockchain);
    expect(newBlockchain.hasOwnProperty('chain')).toBe(true);
  });

  it('throws blockchain error for stringified blockchain parsing error', () => {
    const invalidStringified = '[{"index": 1, "timestamp":1,}]';
    expect(() => Blockchain.deserialize(invalidStringified)).toThrow(BlockchainError);
  });
});