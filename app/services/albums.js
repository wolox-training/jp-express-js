const request = require('request-promise');
const { externalServiceUrl } = require('../../config').common.api;
const { externalServiceError, databaseError, conflict } = require('../errors');
const { Album } = require('../models');
const logger = require('../logger/index');

const albumsRequest = req =>
  req.then().catch(requestError => {
    throw externalServiceError(requestError.message);
  });

exports.getAlbums = id => {
  if (id) return albumsRequest(request(`${externalServiceUrl}/albums?id=${id}`, { json: true }));

  return albumsRequest(request(`${externalServiceUrl}/albums`, { json: true }));
};

exports.getPhotosByAlbum = albumId =>
  albumsRequest(request(`${externalServiceUrl}/photos?albumId=${albumId}`, { json: true }));

exports.findByUserAndAlbum = (userId, albumId) =>
  Album.findOne({ attributes: ['id'], where: { userId, albumId } }).catch(error => {
    logger.error(error.message);
    throw databaseError(error.message);
  });

exports.purchaseAlbum = async (userId, albumId) => {
  const album = await this.getAlbums(albumId);
  if (album && album.length) {
    if (await this.findByUserAndAlbum(userId, albumId)) {
      logger.error('A user cannot purchase the same album twice');
      throw conflict('You cannot purchase the same album twice');
    }
    try {
      return await Album.create({ userId, albumId });
    } catch (err) {
      logger.error(err.message);
      throw databaseError(err.message);
    }
  }

  logger.error('Invalid album id');
  throw databaseError('Invalid album id');
};
