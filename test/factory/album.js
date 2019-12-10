const album_factory = require('factory-girl');
const faker = require('faker');
const { Album } = require('../../app/models');
const { factory } = require('./user');

album_factory.factory.define('album', Album, async () => ({
  userId: (await factory.create('user')).dataValues.id,
  albumId: faker.random.number(99) + 1
}));

module.exports = album_factory.factory;
