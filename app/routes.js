const { healthCheck } = require('./controllers/healthCheck');
const { getAlbums, getAlbumPhotos } = require('./controllers/albums');
const { signUp, signIn, index, createAdmin } = require('./controllers/users');
const { validateCreateUserRequest } = require('./middlewares/validate_user_creation');
const { validateLoginUserRequest } = require('./middlewares/validate_user_login');
const { authenticate } = require('./middlewares/authentication');
const { validateCreateAdminRequest } = require('./middlewares/validate_admin_creation');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/albums', getAlbums);
  app.get('/albums/:albumId/photos', getAlbumPhotos);
  app.post('/users', validateCreateUserRequest, signUp);
  app.post('/users/sessions', validateLoginUserRequest, signIn);
  app.get('/users', authenticate, index);
  app.post('/admin/users', validateCreateAdminRequest, createAdmin);
};
