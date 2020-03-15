/**
 * Blockchain class.
 *
 * @file Defines blockchain structure.
 */

import assert from 'assert';
import Block from './block.model';
import getLogger from '../../utils/logger';
import { BlockchainError } from '../../utils/errors';

const logger = getLogger(__filename);

/**
 * Distributed inmutable ledger of blocks.
 *
 * @access public
 * @class
 */
class Blockchain {

  /**
   * Constructs an instance of Blockchain class.
   *
   * @access     public
   * @constructs Blockchain
   *
   * @constructor
   * @param  {Array}      chain chain of blocks.
   * @return {Blockchain} Class instance.
   */
  constructor(chain = null) {
    this.chain = chain || new Array(Block.genesis());
  }

  /**
   * Returns instance string representation.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @function
   * @return {String} Blockchain class instance string representation.
   */
  toString() {
    return `Blockchain: [${ this.chain.map(block => block.toString()).join(',\n ') }]`;
  }

  /**
   * Get the first block of the blockchain called genesis block.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @property {Function}
   * @return   {Block} First block of the blockchain.
   */
  get genesis() {
    return this.chain[0];
  }

  /**
   * Get the last block of the blockchain.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @property {Function}
   * @return   {Block} Last block of the blockchain.
   */
  get lastBlock() {
    return this.chain[this.length - 1];
  }

  /**
   * Get the blockchain chain length.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @property {Function}
   * @return   {Number} Chain length.
   */
  get length() {
    return this.chain.length;
  }

  /**
   * Initialize a new instance after performing attributes validations
   * and checking blockchain data integrity.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @function
   * @param  {Array}      chain chain of blocks.
   * @return {Blockchain} Validated class instance.
   * @throws {BlockchainError}
   */
  static create(chain) {
    Blockchain.isValidSchema(chain);
    return new this(chain);
  }

  /**
   * Perform blockchain attribute validation and check data integrity.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @function
   * @param  {Array} chain chain of blocks.
   * @throws {BlockchainError}
   */
  static isValidSchema(chain) {
    const genesis = chain[0];
  
    if (!(genesis instanceof Block) || !genesis.isEqual(Block.genesis())) {
      const message = `Invalid chain genesis block: ${ genesis }.`;
      logger.error(`[Blockchain] Schema error. ${ message }`);
      throw new BlockchainError(message);
    }

    let lastBlock = genesis;
    for (let block of chain.slice(1)) {
      try {
        assert(block instanceof Block);
        Block.isValid(lastBlock, block);
      } catch (error) {
        const message = `Block validation error: ${ error.message }.`;
        logger.error(`[Blockchain] Schema error. ${ message }`);
        throw new BlockchainError(message);
      }
      lastBlock = block;
    }
  }

  /**
   * Mine new block and add it to the local blockchain. If new block
   * is mined the candidate blockchain will be send over the network
   * to be validated for the rest of the nodes.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @function
   * @param  {Array} data Transactions data to be added to the next block.
   * @return {Block} New mined block.
   */
  addBlock(data) {
    const block = Block.mineBlock(this.lastBlock, data);
    this.chain.push(block);
    return block;
  }

  /**
   * Set locally the valid chain among the network nodes.
   * The valid chain is the longest one between all the properly formatted chains.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @function
   * @param  {Array} chain Candidate chain to become the valid one.
   * @throws {BlockchainError}
   */
  setValidChain(chain) {
    try {
      assert(chain.length > this.length);
      Blockchain.isValid(chain)
    } catch (error) {
      const message = `Invalid incoming chain: ${ error.message }.`;
      logger.error(`[Blockchain] Replace error. ${ message }`);
      throw new BlockchainError(message);
    }

    this.chain = chain;
    const message = `Blockchain length: ${ this.length }. Last block: ${ this.lastBlock }.`;
    logger.info(`[Blockchain] Replace successfull. ${ message }`);
  }

  /**
   * Perform checks to candidate blockchain. If the chain is validated
   * will become the new distributed chain over the network for all the
   * nodes by consensus.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @function
   * @param {Array} chain Candidate chain to become the distributed chain.
   * @throws {BlockchainError}
   */
  static isValid(chain) {
    Blockchain.isValidSchema(chain);
  }

  /**
   * Stringify the blocks in the chain.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @function
   * @return {String} Stringified chain of blocks.
   * @throws {BlockchainError}
   */
  serialize() {
    try {
      return JSON.stringify(this.chain.map(block => block.serialize()));
    } catch (error) {
      const message = `Could not encode blockchain: ${ error.message }.`;
      logger.error(`[Blockchain] Serialization error. ${ message }`);
      throw new BlockchainError(message);
    }
  }

  /**
   * Create a new Blockchain instance from the provided serialized chain.
   *
   * @access   public
   * @memberof Blockchain
   *
   * @function
   * @param  {Array}  chain Serialized chain of blocks.
   * @return {String} Blockchain created from provided stringified chain.
   * @throws {BlockchainError}
   */
  static deserialize(chain) {
    try {
      chain = (Array.isArray(chain)
        ? chain
        : JSON.parse(chain)
      ).map(block => Block.deserialize(block));
    } catch (error) {
      const message = `Could not decode blockchain: ${ error.message }.`;
      logger.error(`[Blockchain] Deserialization error. ${ message }`);
      throw new BlockchainError(message);
    }
    return new this(chain);
  }
}

export default Blockchain;
