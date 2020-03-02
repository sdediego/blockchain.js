/**
 * Block utilities.
 *
 * @file Defines blockchain utilities functions.
 */

import sha256 from 'crypto-js/sha256';

/**
 * Return UTC current epoch datetime in milliseconds.
 *
 * @access private
 * @member {Function} Block
 *
 * @function
 * @return {String} Current datetime timestamp.
 */
let getUTCNowTimestamp = () => {
  return new Date().getTime();
};

/**
 * Create a unique 256-bit hash value (64 characters length) from the rest
 * of the block attributes values with sha256 cryptographic hash function.
 *
 * @access private
 * @member {Function} Block
 *
 * @function
 * @param  {Number} index Block number in the blockchain.
 * @param  {Number} timestamp Block creation UTC epoch datetime in milliseconds.
 * @param  {Number} nonce Arbitrary number for cryptographic security.
 * @param  {Number} difficulty Block mining difficulty according to mining rate.
 * @param  {String} previousHash Previous block hash to link the blockchain.
 * @param  {Array}  data Transactions between the nodes in the network.
 * @return {String} Block unique hash attribute.
 */
let hashBlock = ({ index, timestamp, nonce, difficulty, previousHash, data }) => {
  const hash = sha256(`${index}${timestamp}${nonce}${difficulty}${previousHash}${data}`);
  return hash.toString();
};

/**
 * Create a unique 256-bit hash value (64 characters length) from the rest
 * of the block attributes values with sha256 cryptographic hash function.
 *
 * @access private
 * @member {Function} Block
 *
 * @function
 * @param  {String} hash Block data unique hash to prevent fraud.
 * @return {String} Converted hexadecimal hash string to binary.
 */
let hexToBinary = hash => {
  return parseInt(hash, 16).toString(2);
};
 
export { getUTCNowTimestamp, hashBlock, hexToBinary };
