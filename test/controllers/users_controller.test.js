/* eslint max-lines: ["error", 400]*/
'use strict';
const request = require('supertest')(require('../../app'));
const { factory } = require('../factory/user');
const album_factory = require('../factory/album');
const {
  USER_VALIDATION_ERROR,
  MISSING_REQUIRED_PARAMS,
  DATABASE_ERROR,
  UNAUTHORIZED,
  FORBIDDEN
} = require('../../app/errors');
const { generateToken, decodeToken } = require('../../app/helpers/authentication');
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
  it('responds with an access_token and expires_at when email and password sent match the ones stored in database', async () => {
    const userCredentials = { email: 'success.user@wolox.co', password: 'successpassword123' };
    await signUp(await factory.attrs('user', userCredentials));
    const response = await request.post('/users/sessions').send(userCredentials);
    expect(response.statusCode).toBe(200);
    expect(response.body.access_token).not.toBe(null);
    expect(response.body.expires_at).not.toBe(null);
  });

  it('responds with error status code and internal_code when the email sent doesnt exists', async () => {
    const userCredentials = { email: 'non-existent@wolox.co', password: 'idontknow' };
    const response = await request.post('/users/sessions').send(userCredentials);
    expect(response.statusCode).toBe(500);
    expect(response.body.internal_code).toEqual(USER_VALIDATION_ERROR);
    expect(response.text).toEqual(expect.stringContaining('There is no user'));
  });

  it('responds with error status code and internal_code when the password sent doesnt match with the record', async () => {
    const userCredentials = { email: 'existent.user@wolox.co', password: 'passwordMatch' };
    await signUp(await factory.attrs('user', userCredentials));
    const response = await request
      .post('/users/sessions')
      .send({ email: userCredentials.email, password: 'passwordWontMatch' });
    expect(response.statusCode).toBe(500);
    expect(response.body.internal_code).toEqual(USER_VALIDATION_ERROR);
    expect(response.text).toEqual(expect.stringContaining('password is invalid'));
  });
});

const sleep = miliSeconds => new Promise(resolve => setTimeout(resolve, miliSeconds));

describe('GET /users', () => {
  it('responds ok with all users if user is logged and there are no pagination params', async () => {
    await factory.createMany('user', 9);
    const session = await generateToken((await factory.create('user')).dataValues);
    const response = await request.get('/users').set('accesstoken', session.access_token);
    expect(response.statusCode).toBe(200);
    expect(response.body.users.length).toBe(10);
  });

  it('responds ok with all users if user is logged and there are pagination params', async () => {
    await factory.createMany('user', 9);
    const session = await generateToken((await factory.create('user')).dataValues);
    const response = await request.get('/users?page=1&limit=2').set('accesstoken', session.access_token);
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

  it('responds with unauthorized status if the token sent is expired', async () => {
    await factory.createMany('user', 9);
    const expired_data = { value: 3, unit: 's' };
    const session = await generateToken((await factory.create('user')).dataValues, expired_data);
    await sleep(4000);
    const response = await request.get('/users').set('accesstoken', session.access_token);
    expect(response.statusCode).toBe(401);
    expect(response.body.internal_code).toEqual(UNAUTHORIZED);
    expect(response.body.message).toEqual(expect.stringContaining('Invalid token'));
  });
});

describe('POST /users/admin', () => {
  it('responds with a created status code when admin logged and data sent meets all the criteria', async () => {
    const adminParams = await factory.attrs('user', { role: 'admin' });
    const adminUser = await factory.create('user', adminParams);
    const session = await generateToken(adminUser.dataValues);
    const response = await request
      .post('/users/admin')
      .set('accesstoken', session.access_token)
      .send(await factory.attrs('user'));
    expect(response.statusCode).toBe(201);
    expect(response.created).toBe(true);
  });

  it('responds with a forbidden status code when a user not admin is logged and performs the action', async () => {
    const adminParams = await factory.attrs('user', { role: 'user' });
    const adminUser = await factory.create('user', adminParams);
    const session = await generateToken(adminUser.dataValues);
    const response = await request
      .post('/users/admin')
      .set('accesstoken', session.access_token)
      .send(await factory.attrs('user'));
    expect(response.statusCode).toBe(403);
    expect(response.forbidden).toBe(true);
    expect(response.body.internal_code).toBe(FORBIDDEN);
  });

  it('responds with an unauthorized status code if the token sent is invalid', async () => {
    const response = await request
      .post('/users/admin')
      .set('accesstoken', 'not-a-valid-token')
      .send(await factory.attrs('user'));
    expect(response.statusCode).toBe(401);
    expect(response.body.internal_code).toBe(UNAUTHORIZED);
    expect(response.unauthorized).toBe(true);
  });

  it('responds with error status code when admin logged and the password param sent is too short', async () => {
    const adminParams = await factory.attrs('user', { role: 'admin' });
    const adminUser = await factory.create('user', adminParams);
    const session = await generateToken(adminUser.dataValues);
    const response = await request
      .post('/users/admin')
      .set('accesstoken', session.access_token)
      .send(await factory.attrs('user', { password: 'abc123' }));
    expect(response.statusCode).toBe(500);
    expect(response.body.internal_code).toBe(USER_VALIDATION_ERROR);
  });

  it('responds with error status code when admin logged and the email is not from Wolox domain', async () => {
    const adminParams = await factory.attrs('user', { role: 'admin' });
    const adminUser = await factory.create('user', adminParams);
    const session = await generateToken(adminUser.dataValues);
    const response = await request
      .post('/users/admin')
      .set('accesstoken', session.access_token)
      .send(await factory.attrs('user', { email: 'test@notawesomedomain.com' }));
    expect(response.statusCode).toBe(500);
    expect(response.body.internal_code).toBe(USER_VALIDATION_ERROR);
  });

  it('responds with error status code when there is one of the required params missing', async () => {
    const emptyParam = {};
    const params = ['firstName', 'lastName', 'email', 'password'];
    const randomParam = params[Math.floor(Math.random() * params.length)];
    emptyParam[`${randomParam}`] = '';
    const adminParams = await factory.attrs('user', { role: 'admin' });
    const adminUser = await factory.create('user', adminParams);
    const session = await generateToken(adminUser.dataValues);
    const response = await request
      .post('/users/admin')
      .set('accesstoken', session.access_token)
      .send(await factory.attrs('user', emptyParam));
    expect(response.statusCode).toBe(422);
    expect(response.body.internal_code).toBe(MISSING_REQUIRED_PARAMS);
    expect(response.unprocessableEntity).toBe(true);
  });
});

describe('GET /users/:userId/albums', () => {
  describe('when admin user is logged', () => {
    it('responds with ok status code and a list of albums purchased if userId requested is his', async () => {
      const adminUser = (await factory.create('user', { role: 'admin' })).dataValues;
      await album_factory.createMany('album', 5, { userId: adminUser.id });
      const token = (await generateToken(adminUser)).access_token;
      const response = await request.get(`/users/${adminUser.id}/albums`).set('accesstoken', token);
      expect(response.statusCode).toBe(200);
      expect(response.body.albums.length).toBe(5);
      expect(response.ok).toBe(true);
    });

    it('responds with ok status code and a list of albums purchased if userId requested is others`', async () => {
      const otherUser = (await factory.create('user')).dataValues;
      const adminUser = (await factory.create('user', { role: 'admin' })).dataValues;
      await album_factory.createMany('album', 5, { userId: otherUser.id });
      const token = (await generateToken(adminUser)).access_token;
      const response = await request.get(`/users/${otherUser.id}/albums`).set('accesstoken', token);
      expect(response.statusCode).toBe(200);
      expect(response.body.albums.length).toBe(5);
      expect(response.ok).toBe(true);
    });
  });

  describe('when regular user is logged', () => {
    it('responds with ok status code and a list of albums purchased if userId requested is his', async () => {
      const regularUser = (await factory.create('user')).dataValues;
      await album_factory.createMany('album', 5, { userId: regularUser.id });
      const token = (await generateToken(regularUser)).access_token;
      const response = await request.get(`/users/${regularUser.id}/albums`).set('accesstoken', token);
      expect(response.statusCode).toBe(200);
      expect(response.body.albums.length).toBe(5);
      expect(response.ok).toBe(true);
    });

    it('responds with forbidden status code when userId requested is others`', async () => {
      const otherUser = (await factory.create('user')).dataValues;
      const regularUser = (await factory.create('user')).dataValues;
      await album_factory.createMany('album', 5, { userId: otherUser.id });
      const token = (await generateToken(regularUser)).access_token;
      const response = await request.get(`/users/${otherUser.id}/albums`).set('accesstoken', token);
      expect(response.statusCode).toBe(403);
      expect(response.forbidden).toBe(true);
      expect(response.body.internal_code).toBe(FORBIDDEN);
    });
  });

  describe('when the user is not properly logged', () => {
    it('responds with an unauthorized status code if the token sent is invalid', async () => {
      const regularUser = (await factory.create('user')).dataValues;
      const response = await request
        .get(`/users/${regularUser.id}/albums`)
        .set('accesstoken', 'not-a-valid-token');
      expect(response.statusCode).toBe(401);
      expect(response.body.internal_code).toBe(UNAUTHORIZED);
      expect(response.unauthorized).toBe(true);
    });

    it('responds with an unauthorized status code if there wasn`t any token sent', async () => {
      const regularUser = (await factory.create('user')).dataValues;
      const response = await request.get(`/users/${regularUser.id}/albums`);
      expect(response.statusCode).toBe(401);
      expect(response.body.internal_code).toBe(UNAUTHORIZED);
      expect(response.unauthorized).toBe(true);
    });
  });
});

describe('POST /users/sessions/invalidate_all', () => {
  it('invalidates user session, and doesn`t allow the user to perform an action that requires authentication', async () => {
    const regularUser = (await factory.create('user')).dataValues;
    const token = (await generateToken(regularUser)).access_token;
    const response = await request.post('/users/sessions/invalidate_all').set('accesstoken', token);
    expect(response.statusCode).toBe(200);
    expect(response.ok).toBe(true);
    try {
      await decodeToken(token);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
    const getAlbumsResponse = await request.get(`/users/${regularUser.id}/albums`).set('accesstoken', token);
    expect(getAlbumsResponse.statusCode).toBe(401);
    expect(getAlbumsResponse.body.internal_code).toBe(UNAUTHORIZED);
    expect(getAlbumsResponse.unauthorized).toBe(true);
  });

  it('responds with an unauthorized status code if the token sent is invalid', async () => {
    const response = await request
      .post('/users/sessions/invalidate_all')
      .set('accesstoken', 'not-a-valid-token');
    expect(response.statusCode).toBe(401);
    expect(response.body.internal_code).toBe(UNAUTHORIZED);
    expect(response.unauthorized).toBe(true);
  });
});
