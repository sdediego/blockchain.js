/**
 * API tests.
 *
 * @file Defines blockchain backend API tests.
 */

import http from 'http';
import request from 'supertest';
import app from '../../../src/app/api';
 
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
});
