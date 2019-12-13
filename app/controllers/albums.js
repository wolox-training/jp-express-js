const { getAlbums, getPhotosByAlbum, purchaseAlbum } = require('../services/albums');
const { decodeToken } = require('../helpers/authentication');

exports.getAlbums = (req, res, next) => {
  getAlbums(req.query.id)
    .then(albums => res.send({ albums }))
    .catch(next);
};

exports.getAlbumPhotos = (req, res, next) => {
  getPhotosByAlbum(req.params.albumId)
    .then(albums => res.send({ albums }))
    .catch(next);
};

exports.purchaseAlbum = async (req, res, next) => {
  const userInfo = decodeToken(req.headers.accesstoken);
  try {
    const album = await purchaseAlbum(userInfo.id, req.params.albumId);
    res.status(201).send({ album });
  } catch (err) {
    next(err);
  }
};
