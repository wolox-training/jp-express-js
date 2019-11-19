const http = require('request-promise');
const { externalServiceUrl } = require('../../config').common.api;
const { externalServiceError } = require('../errors');

const albumsRequest = request =>
  request.then().catch(requestError => {
    throw externalServiceError(requestError.message);
  });

exports.getAlbums = () => albumsRequest(http(`${externalServiceUrl}/albums`, { json: true }));
exports.getPhotos = () => albumsRequest(http(`${externalServiceUrl}/photos`, { json: true }));
exports.getPhotosByAlbum = albumId =>
  albumsRequest(http(`${externalServiceUrl}/photos?albumId=${albumId}`, { json: true }));
