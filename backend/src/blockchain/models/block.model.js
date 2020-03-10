/**
 * Block class.
 *
 * @file Defines blockchain block unit.
 */

import blockSchema from '../schemas/block.schema';
import config from '../../config/config.json';
import getLogger from '../../utils/logger';
import { BlockError } from '../../utils/errors';
import { getUTCNowTimestamp, hashBlock } from '../utils';

const logger = getLogger(__filename);

/**
 * Constructs an instance of Block class.
 *
 * Storage unit of transactions between the nodes of the network.
 * The blocks are linked sequencially creating an inmutable distributed
 * ledger called blockchain.
 *
 * @access public
 * @class
 */
class Block {

  /**
   * Constructs an instance of Block class.
   *
   * @access     public
   * @constructs Block
   *
   * @constructor
   * @param  {Number} index Block number in the blockchain.
   * @param  {Number} timestamp Block creation UTC epoch datetime in milliseconds.
   * @param  {Number} nonce Arbitrary number for cryptographic security.
   * @param  {Number} difficulty Block mining difficulty according to mining rate.
   * @param  {String} previousHash Previous block hash to link the blockchain.
   * @param  {String} hash Block data unique hash to prevent fraud.
   * @param  {Array}  data Transactions between the nodes in the network.
   * @return {Block}  Class instance.
   */
  constructor({index, timestamp, nonce, difficulty, previousHash, hash, data}) {
    this.index = index;
    this.timestamp = timestamp;
    this.nonce = nonce;
    this.difficulty = difficulty;
    this.previousHash = previousHash;
    this.hash = hash;
    this.data = data;
  }

  /**
   * Returns instance string representation.
   *
   * @access   public
   * @memberof Block
   *
   * @function
   * @return {String} Block class instance string representation.
   */
  toString() {
    return `Block -
      Index        : ${ this.index },
      Timestamp    : ${ this.timestamp },
      Nonce        : ${ this.nonce },
      Difficulty   : ${ this.difficulty },
      PreviousHash : ${ this.previousHash },
      Hash         : ${ this.hash },
      Data         : ${ this.data }.`;
  }

  /**
   * Initialize a new class instance after performing attributes validations
   * and checking block data integrity.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @param  {Number} index Block number in the blockchain.
   * @param  {Number} timestamp Block creation UTC epoch datetime in milliseconds.
   * @param  {Number} nonce Arbitrary number for cryptographic security.
   * @param  {Number} difficulty Block mining difficulty according to mining rate.
   * @param  {String} previousHash Previous block hash to link the blockchain.
   * @param  {String} hash Block data unique hash to prevent fraud.
   * @param  {Array}  data Transactions between the nodes in the network.
   * @return {Block}  Class instance.
   * @throws {BlockError}
   */
  static create({index, timestamp, nonce, difficulty, previousHash, hash, data}) {
    const block = { index, timestamp, nonce, difficulty, previousHash, hash, data };
    
    Block.isValidSchema(block);
    return new this(block);
  }

  /**
   * Perform block attributes validations and check block data integrity.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @param  {Object} block Block properties.
   * @throws {BlockError}
   */
  static isValidSchema(block) {
    try {
      blockSchema.validate(block);
    } catch (error) {
      const message = `Block schema validation error: ${ error }.`;
      logger.error(`[Block] Validation error. ${ message }`);
      throw new BlockError(message);
    }
  }

  /**
   * Create the first block for the blockchain called the genesis block.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @returns {Block} First block (genesis) in the blockchain.
   */
  static genesis() {
    const genesisBlock = config.GENESIS_BLOCK;
    genesisBlock.hash = hashBlock(genesisBlock);
    return new this(genesisBlock);
  }

  /**
   * Create a new Block instance to add to the blockchain.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @param   {Block} previousBlock Current last block of the blockchain.
   * @param   {Array} data Transactions between the nodes in the network.
   * @returns {Block} New block instance.
   */
  static mineBlock(previousBlock, data) {
    let { index, difficulty, hash } = previousBlock;
    let block = new Object();
    block.index = ++index;
    block.nonce = 0;
    block.difficulty = difficulty;
    block.previousHash = hash;
    block.data = data;

    block = Block.proofOfWork(previousBlock, block);
    return Block.create(block);
  }

  /**
   * Consensus protocol requiring certain computational effort to mine
   * a new block to be able to add it to the blockchain. The solution
   * is then verified by the entire network.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @param   {Block}  previousBlock Current last block of the blockchain.
   * @param   {Object} block Block properties except the unknown block hash.
   * @returns {Object} Block data for the next block in the blockchain.
   */
  static proofOfWork(previousBlock, block) {
    let hash;

    do {
      block.nonce++;
      block.timestamp = getUTCNowTimestamp();
      block.difficulty = Block.adjustDifficulty(previousBlock, block.timestamp);
      hash = hashBlock(block);
    } while (hash.substring(0, block.difficulty) !== '0'.repeat(block.difficulty));

    block.hash = hash;
    return block;
  }

  /**
   * Adjust new block mining difficulty to maintain stable mining rate.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @param   {Block}  previousBlock Current last block of the blockchain.
   * @param   {Number} timestamp New block creation UTC epoch datetime in milliseconds.
   * @returns {Number} Adjusted block difficulty.
   */
  static adjustDifficulty(previousBlock, timestamp) {
    if (previousBlock.timestamp + config.BLOCK_MINIG_RATE > timestamp) {
      return previousBlock.difficulty + 1;
    }
    return previousBlock.difficulty > 1 ? previousBlock.difficulty - 1 : 1;
  }

  /**
   * Perform checks to candidate block before adding it to the blockchain
   * to prevent fraudulent insertions into the blockchain. Block attributes
   * must fullfill certain conditions for the block to be valid.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @param  {Block} previousBlock Current last block of the blockchain.
   * @param  {Block} block Candidate block to add to the blockchain.
   * @throws {BlockError}
   */
  static isValid(previousBlock, block) {
    Block.isValidSchema(block);

    if (block.previousHash !== previousBlock.hash) {
      const message = `Block previousHash ${ block.previousHash } not equal to previousBlock hash ${ previousBlock.hash }.`;
      logger.error(`[Block] Validation error. ${ message }`);
      throw new BlockError(message);
    }

    const difficultyDelta = Math.abs(previousBlock.difficulty - block.difficulty);
    if ( difficultyDelta > 1) {
      const message = `Difficulty must differ as much by 1 between blocks: ${ difficultyDelta }.`;
      logger.error(`[Block] Validation error. ${ message }`);
      throw new BlockError(message);
    }
  }

  /**
   * Compare two Block instances to check wether if both are the same
   * block or not based on their unique hashes.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @param   {Block}   block Other block instance to compare with.
   * @returns {Boolean} true/false on block comparison.
   */
  isEqual(block) {
    return this.serialize() === block.serialize();
  }

  /**
   * Stringify the Block instance to be able to send the block over
   * the network to the rest of the peer nodes.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @returns {String} Block instance properties in string format.
   * @throws  {BlockError}
   */
  serialize() {
    try {
      return JSON.stringify(this);
    } catch (error) {
      const message = `Could not encode block: ${ error.message }.`;
      logger.error(`[Block] Serialization error. ${ message }`);
      throw new BlockError(message);
    }
  }

  /**
   * Create a new Block instance from the provided stringified block.
   *
   * @access     public
   * @constructs Block
   *
   * @function
   * @param   {String} block Stringified block.
   * @returns {Block}  Block instance created from provided attributes.
   * @throws  {BlockError}
   */
  static deserialize(block) {
    try {
      block = JSON.parse(block);
    } catch (error) {
      const message = `Could not decode block: ${ error.message }.`;
      logger.error(`[Block] Deserialization error. ${ message }`);
      throw new BlockError(message);
    }
    return new this(block);
  }
}

export default Block;
