const { getPhotos, getPhotosByAlbum } = require('../services/albums');

exports.getPhotos = (req, res, next) => {
  const { albumId } = req.query;
  const callbackAction = albumId ? getPhotosByAlbum(albumId) : getPhotos();
  callbackAction.then(photos => res.send({ photos })).catch(next);
};
