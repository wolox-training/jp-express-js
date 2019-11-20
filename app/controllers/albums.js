const { getAlbums, getPhotosByAlbum } = require('../services/albums');

exports.getAlbums = (_, res, next) => {
  getAlbums()
    .then(albums => res.send({ albums }))
    .catch(next);
};

exports.getAlbumPhotos = (req, res, next) => {
  getPhotosByAlbum(req.params.albumId)
    .then(albums => res.send({ albums }))
    .catch(next);
};
