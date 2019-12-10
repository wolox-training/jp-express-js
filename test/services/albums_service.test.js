const { findAlbumsByUser } = require('../../app/services/albums');
const { Album } = require('../../app/models');
const { factory } = require('../factory/user');
const album_factory = require('../factory/album');

describe('findAlbumsByUser', () => {
  it('returns Albums if there is an album created with the userId requested', async () => {
    const sampleUser = (await factory.create('user')).dataValues;
    await album_factory.createMany('album', 5, { userId: sampleUser.id });
    const expectedAlbums = await findAlbumsByUser(sampleUser.id);
    expect(expectedAlbums).not.toBe(null);
    expect(expectedAlbums).toBeInstanceOf(Array);
    expect(expectedAlbums.length).toBe(5);
    expect(expectedAlbums[0]).toBeInstanceOf(Album);
    expect(expectedAlbums[0].dataValues.userId).toBe(sampleUser.id);
  });

  it('returns an empty list there is no album created with the userId requested', async () => {
    const expectedAlbums = await findAlbumsByUser(1);
    expect(expectedAlbums).toBeInstanceOf(Array);
    expect(expectedAlbums.length).toBe(0);
  });
});
