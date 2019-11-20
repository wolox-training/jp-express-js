const request = require('request-promise');
const { externalServiceUrl } = require('../../config').common.api;
const { externalServiceError } = require('../errors');

const albumsRequest = req =>
  req.then().catch(requestError => {
    throw externalServiceError(requestError.message);
  });

exports.getAlbums = () => albumsRequest(request(`${externalServiceUrl}/albums`, { json: true }));
exports.getPhotosByAlbum = albumId =>
  albumsRequest(request(`${externalServiceUrl}/photos?albumId=${albumId}`, { json: true }));
