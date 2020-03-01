/**
 * Block schema class.
 *
 * @file Defines block schema for validations.
 */

import assert from 'assert';
import { Schema, ValidationError } from 'validate';
import getLogger from '../../utils/logger';
import { hexToBinary, hashBlock } from '../utils';

const logger = getLogger(__filename);

/**
 * Validate positive integer value.
 *
 * @access private
 * @member {Function} blockSchema
 *
 * @function
 * @param  {Number} value Provided integer value.
 * @param  {Object} block Provided object to validate.
 * @param  {String} field Field name to validate its value.
 * @return {Number} Validated integer value.
 * @throws {ValidationError}
 */
let validateNumber = (value, block, field) => {
  try {
    assert(field === 'difficulty' ? value > 0 : value >= 0);
  } catch (error) {
    const message = `Invalid ${ field } field. ${error.message}.`;
    logger.error(`[BlockSchema] Validation error. ${ message }`);
    throw new ValidationError(message);
  }
  return value;
};

/**
 * Validate timestamp value.
 *
 * @access private
 * @member {Function} blockSchema
 *
 * @function
 * @param  {Number} value Provided timestamp value.
 * @return {Number} Validated timestamp value.
 * @throws {ValidationError}
 */
let validateTimestamp = value => {
  try {
    assert(Math.floor(Math.log10(value) + 1) === config.BLOCK_TIMESTAMP_LENGTH);
  } catch (error) {
    const message = `Invalid timestamp. ${ error.message }.`;
    logger.error(`[BlockSchema] Validation error. ${ message }`);
    throw new ValidationError(message);
  }
  return value;
};

/**
 * Validate hash value.
 *
 * @access private
 * @member {Function} blockSchema
 *
 * @function
 * @param  {Number} value Provided hash value.
 * @param  {Object} block Provided object to validate.
 * @param  {String} field Field name to validate its value.
 * @return {Number} Validated hash value.
 * @throws {ValidationError}
 */
let validateHash = (value, block, field) => {
  const match = value.match(/[a-f0-9]{64}/);
  if (value.length != config.BLOCK_HASH_LENGTH || !match) {
    const message = `Invalid pattern for ${ field } value: ${ value }.`;
    logger.error(`[BlockSchema] Validation error. ${ message }`);
    throw new ValidationError(message);
  }
  if (field === 'hash') {
    try {
      assert(hexToBinary(value).startsWith('0'.repeat(block.difficulty)));
      assert(value === hashBlock(block));
    } catch (error) {
      const message = `Invalid hash value: ${ value }.`;
      logger.error(`[BlockSchema] Validation error. ${ message }`);
      throw new ValidationError(message);
    }
  }
  return value;
};

/**
 * Validate data value.
 *
 * @access private
 * @member {Function} blockSchema
 *
 * @function
 * @param  {Array} value Provided transaction data value.
 * @return {Array} Validated transaction data value.
 * @throws {ValidationError}
 */
let validateData = value => {
  // TODO
  return value;
};

/**
 * Schema for definition and validation of block properties.
 */
const blockSchema = new Schema({
  index: {
    type: Number,
    required: true,
    message: 'Index is required.',
    use: { validateNumber }
  },
  timestamp: {
    type: Number,
    required: true,
    message: 'Timestamp is required.',
    use: { validateTimestamp }
  },
  nonce: {
    type: Number,
    required: true,
    message: 'Nonce is required.',
    use: { validateNumber }
  },
  difficulty: {
    type: Number,
    required: true,
    message: 'Difficulty is required.',
    use: { validateNumber }
  },
  previousHash: {
    type: String,
    required: true,
    message: 'Previous hash is required.',
    use: { validateHash }
  },
  hash: {
    type: String,
    required: true,
    message: 'Hash is required.',
    use: { validateHash }
  },
  data: {
    type: Array,
    required: true,
    message: 'Data is required.',
    use: { validateData }
  }
});

export default blockSchema;
