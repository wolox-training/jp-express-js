const { healthCheck } = require('./controllers/healthCheck');
const { getAlbums } = require('./controllers/albums');
const { getPhotos } = require('./controllers/photos');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/albums', getAlbums);
  app.get('/photos', getPhotos);
};
