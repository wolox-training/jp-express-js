const http = require('request-promise');
const { externalServiceUrl } = require('../../config').common.api;
const { externalServiceError } = require('../errors');

const formatData = response => response.data

const albumsRequest = request =>
  request.then().catch(requestError => {
    console.log("ERROOOOORRRR!!!!!!!!")
    throw externalServiceError(requestError.message);
  });

exports.getAlbums = () => albumsRequest(http(`${externalServiceUrl}/albums`));
exports.getPhotosByAlbum = (albumId) => albumsRequest(http(`${externalServiceUrl}/photos?albumId=${albumId}`));