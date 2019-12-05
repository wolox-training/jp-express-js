'use strict';
const request = require('supertest')(require('../../app'));
const { factory } = require('../factory/user');
const {
  USER_VALIDATION_ERROR,
  MISSING_REQUIRED_PARAMS,
  DATABASE_ERROR,
  UNAUTHORIZED
} = require('../../app/errors');
const { generateToken } = require('../../app/helpers/authentication');
const { signUp } = require('../../app/services/users');
const { User } = require('../../app/models');

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

describe('POST /users/sessions', () => {
  it('responds with an accessToken when email and password sent match the ones stored in database', async () => {
    const userCredentials = { email: 'success.user@wolox.co', password: 'successpassword123' };
    const userParams = await factory.attrs('user', userCredentials);
    const storedUser = await signUp(
      userParams.firstName,
      userParams.lastName,
      userParams.email,
      userParams.password
    );
    const response = await request.post('/users/sessions').send(userCredentials);
    expect(response.statusCode).toBe(200);
    expect(response.body.accessToken).toEqual(expect.stringContaining(generateToken(storedUser)));
  });

  it('responds with error status code and internal_code when the email sent doesnt exists', async () => {
    const userCredentials = { email: 'non-existent@wolox.co', password: 'idontknow' };
    const response = await request.post('/users/sessions').send(userCredentials);
    expect(response.statusCode).toBe(500);
    expect(response.body.internal_code).toEqual(USER_VALIDATION_ERROR);
    expect(response.text).toEqual(expect.stringContaining('There is no user'));
  });

  it('responds with error status code and internal_code when the password sent doesnt matches with the record', async () => {
    const userCredentials = { email: 'existent.user@wolox.co', password: 'passwordMatch' };
    const userParams = await factory.attrs('user', userCredentials);
    await signUp(userParams.firstName, userParams.lastName, userParams.email, userParams.password);
    const response = await request
      .post('/users/sessions')
      .send({ email: userCredentials.email, password: 'passwordWontMatch' });
    expect(response.statusCode).toBe(500);
    expect(response.body.internal_code).toEqual(USER_VALIDATION_ERROR);
    expect(response.text).toEqual(expect.stringContaining('password is invalid'));
  });
});

describe('GET /users', () => {
  it('responds ok with all users if user is logged and there are no pagination params', async () => {
    await factory.createMany('user', 9);
    const token = generateToken((await factory.create('user')).dataValues);
    const response = await request.get('/users').set('accesstoken', token);
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBe(10);
  });

  it('responds ok with all users if user is logged and there are pagination params', async () => {
    await factory.createMany('user', 9);
    const token = generateToken((await factory.create('user')).dataValues);
    const response = await request.get('/users?page=1&limit=2').set('accesstoken', token);
    const askedUsers = await User.findAll({ limit: 2, attributes: ['id', 'firstName', 'lastName', 'email'] });
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBe(2);
    expect([askedUsers[0].dataValues, askedUsers[1].dataValues]).toStrictEqual(response.body.users);
  });

  it('responds with unauthorized status if the token sent is invalid', async () => {
    const response = await request.get('/users').set('accesstoken', 'not-a-valid-token');
    expect(response.statusCode).toBe(401);
    expect(response.body.internal_code).toEqual(UNAUTHORIZED);
    expect(response.body.message).toEqual(expect.stringContaining('Invalid token'));
  });

  it('responds with unauthorized status if the token is not present', async () => {
    const response = await request.get('/users');
    expect(response.statusCode).toBe(401);
    expect(response.body.internal_code).toEqual(UNAUTHORIZED);
    expect(response.body.message).toEqual(expect.stringContaining('Invalid token'));
  });
});
