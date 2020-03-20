/**
 * API tests.
 *
 * @file Defines blockchain backend API tests.
 */

import http from 'http';
import request from 'supertest';
import app from '../../../src/app/api';
import Blockchain from '../../../src/blockchain/models/blockchain.model';
import Block from '../../../src/blockchain/models/block.model';
 
describe('Backend API', () => {
  let server;

  beforeEach(() => {
    const port = 5000;
    app.set('port', port);
    app.set('env', 'test');
    server = http.createServer(app);
    server.listen(port);
  });

  afterEach(() => {
    server.close();
  });

  it('returns json response with home data', done => {
    request(server)
      .get('/')
      .expect('Content-Type', /json/)
      .expect(200, {
        status: {
          code: 200,
          msg: 'OK'
        },
        data: 'Welcome to Blockchain'
      }, done);
  });

  it('returns json response with blockchain data', done => {
    request(server)
      .get('/blockchain')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const chain = res.body.data.chain;
        const blockchain = Blockchain.deserialize(chain);
        expect(blockchain instanceof Blockchain).toBe(true);
        return done();
      })
  });

  it('returns json response with block data', done => {
    request(server)
      .get('/mine')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(res => {
        const stringified = res.body.data;
        const block = Block.deserialize(stringified);
        expect(block instanceof Block).toBe(true);
        return done();
      });
  });
});
