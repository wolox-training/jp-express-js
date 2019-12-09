const { findUserByEmail, signUp, findAll } = require('../../app/services/users');
const { User } = require('../../app/models');
const { factory } = require('../factory/user');
const { DATABASE_ERROR } = require('../../app/errors');

describe('findUserByEmail', () => {
  it('returns a User if  there is a user created with the email requested', async () => {
    const sampleUser = await factory.attrs('user');
    await User.create(sampleUser);
    const expectedUser = await findUserByEmail(sampleUser.email);
    expect(expectedUser).not.toBe(null);
    expect(expectedUser).toBeInstanceOf(User);
    expect(expectedUser.firstName).toBe(sampleUser.firstName);
    expect(expectedUser.lastName).toBe(sampleUser.lastName);
  });

  it('returns null if a user with the email requested doesnt exists', async () => {
    const expectedUser = await findUserByEmail('test_email@wolox.co');
    expect(expectedUser).toBe(null);
  });
});

describe('signUp', () => {
  it('creates a new user in the database if the data sent meets all the criteria', async () => {
    const sampleUser = await factory.attrs('user');
    await signUp(sampleUser.firstName, sampleUser.lastName, sampleUser.email, sampleUser.password);
    const users_count = await User.count();
    expect(users_count).toBeGreaterThan(0);
  });

  it('doesnt creates a new user in the database when the user already exists', async () => {
    const sampleUser = await factory.attrs('user');
    await User.create(sampleUser);
    try {
      await signUp(sampleUser.firstName, sampleUser.lastName, sampleUser.email, sampleUser.password);
    } catch (err) {
      const users_count = await User.count();
      expect(err).not.toBe(null);
      expect(err.internalCode).toEqual(DATABASE_ERROR);
      expect(users_count).toEqual(1);
    }
  });

  it('doesnt creates a new user in the database when a required param is missing', async () => {
    const sampleUser = await factory.attrs('user');
    try {
      await signUp(sampleUser.firstName, undefined, sampleUser.email, sampleUser.password);
    } catch (err) {
      const users_count = await User.count();
      expect(err).not.toBe(null);
      expect(err.internalCode).toEqual(DATABASE_ERROR);
      expect(users_count).toEqual(0);
    }
  });
});

describe('findAll', () => {
  it('returns all the users if pagination params were not sent', async () => {
    await factory.createMany('user', 10);
    expect((await findAll()).length).toBe(10);
  });

  it('returns the correct users if pagination params were sent', async () => {
    await factory.createMany('user', 10);
    const expectedUsers = await User.findAll({
      limit: 2,
      attributes: ['id', 'firstName', 'lastName', 'email']
    });
    const obtainedUsers = await findAll(1, 2);
    expect(obtainedUsers.length).toBe(2);
    expect(expectedUsers).toStrictEqual(obtainedUsers);
  });

  it('returns database_error if page param sent is invalid', async () => {
    let obtainedUsers = null;
    try {
      await factory.createMany('user', 10);
      obtainedUsers = await findAll(-1, 2);
    } catch (err) {
      expect(err).not.toBe(null);
      expect(err.internalCode).toEqual(DATABASE_ERROR);
      expect(err.message).toEqual(expect.stringContaining('must not be negative'));
      expect(obtainedUsers).toBe(null);
    }
  });

  it('returns database_error if limit param sent is invalid', async () => {
    let obtainedUsers = null;
    try {
      await factory.createMany('user', 10);
      obtainedUsers = await findAll(1, -1);
    } catch (err) {
      expect(err).not.toBe(null);
      expect(err.internalCode).toEqual(DATABASE_ERROR);
      expect(err.message).toEqual(expect.stringContaining('must not be negative'));
      expect(obtainedUsers).toBe(null);
    }
  });

  it('returns an empty list if an empty page was requested', async () => {
    await factory.createMany('user', 10);
    expect((await findAll(99, 10)).length).toBe(0);
  });
});
