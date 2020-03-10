/**
 * Blockc model tests.
 *
 * @file Defines block tests.
 */

import { ValidationError } from 'validate';
import Block from '../../../../src/blockchain/models/block.model';
import blockSchema from '../../../../src/blockchain/schemas/block.schema';

let generateBlock = () => {
  const genesis = Block.genesis();
  const data = ['data'];
  return Block.mineBlock(genesis, data);
};

describe('Block Schema', () => {
  let block, properties;

  beforeEach(() => {
    block = generateBlock();
    properties = Object.keys(block);
  });

  it('validates the correct block schema properties types', () => {
    const errors = blockSchema.validate(block);
    expect(errors).toHaveLength(0);
  });

  it('throws error for incorrect block schema properties types', () => {
    const randomProperty = properties[properties.length * Math.random() << 0];
    block[randomProperty] = false;
    expect(() => blockSchema.validate(block)).toThrow(ValidationError);
  });

  it('throws error for incorrect block schema properties values', () => {
    delete properties.data;
    const randomProperty = properties[properties.length * Math.random() << 0];
    block[randomProperty] = typeof randomProperty === 'number' ? -1 : 'string';
    expect(() => blockSchema.validate(block)).toThrow(ValidationError);
  });
});
