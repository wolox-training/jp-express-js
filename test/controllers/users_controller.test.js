'use strict';
const request = require('supertest')(require('../../app'));
const { factory } = require('../factory/user');
const { USER_VALIDATION_ERROR, MISSING_REQUIRED_PARAMS, DATABASE_ERROR } = require('../../app/errors');

describe('POST /users', () => {
  it('responds with a success status code and text when data sent meets all the criteria', async () => {
    const userParams = await factory.attrs('user');
    const response = await request.post('/users').send(userParams);
    expect(response.statusCode).toBe(201);
    expect(response.text).toEqual(expect.stringContaining(userParams.email));
  });

  it('responds with error status code and internal_code when the password is too short', async () => {
    const userParams = await factory.attrs('user', { password: 'abc123' });
    const response = await request.post('/users').send(userParams);
    expect(response.statusCode).toBe(500);
    expect(response.body.internal_code).toEqual(USER_VALIDATION_ERROR);
  });

  it('responds with expected error status code and internal_code when the email is not from Wolox domain', async () => {
    const userParams = await factory.attrs('user', { email: 'test@notawesomedomain.com' });
    const response = await request.post('/users').send(userParams);
    expect(response.statusCode).toBe(500);
    expect(response.body.internal_code).toEqual(USER_VALIDATION_ERROR);
  });

  it('responds with expected error status code and internal_code when there is an existing user with same email', async () => {
    await factory.create('user', { email: 'existing_user@wolox.co' });
    const userParams = await factory.attrs('user', { email: 'existing_user@wolox.co' });
    const response = await request.post('/users').send(userParams);
    expect(response.statusCode).toBe(422);
    expect(response.body.internal_code).toEqual(DATABASE_ERROR);
  });

  it('responds with expected error status code and internal_code when there is one of the required params missing', async () => {
    const emptyParam = {};
    const params = ['firstName', 'lastName', 'email', 'password'];
    const randomParam = params[Math.floor(Math.random() * params.length)];
    emptyParam[`${randomParam}`] = '';
    const userParams = await factory.attrs('user', emptyParam);
    const response = await request.post('/users').send(userParams);
    expect(response.statusCode).toBe(422);
    expect(response.body.internal_code).toEqual(MISSING_REQUIRED_PARAMS);
  });
});