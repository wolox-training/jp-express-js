const { findUserByEmail, signUp } = require('../../app/services/users');
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
