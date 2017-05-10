'use strict';
const supertest = require('supertest');
const chai = require('chai');
const api = supertest('http://localhost:3000');

describe('test', function () {
  it('test login path', function (done) {
    api.get('/')
      .expect(200, done)
      .expect(function (res) {
        //console.log(res.body);
        //console.log(res.text);
        done();
      });
  });
});
