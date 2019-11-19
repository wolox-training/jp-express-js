const { getAlbums } = require('../services/albums');

exports.getAlbums = (_, res, next) => {
  getAlbums()
    .then(albums => res.send({ albums }))
    .catch(next);
};
