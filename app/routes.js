const { healthCheck } = require('./controllers/healthCheck');
const { getAlbums, getAlbumPhotos, purchaseAlbum } = require('./controllers/albums');
const { signUp, signIn, getAllUsers, createAdmin, getPurchasedAlbums } = require('./controllers/users');
const { validateCreateUserRequest } = require('./middlewares/validate_user_creation');
const { validateLoginUserRequest } = require('./middlewares/validate_user_login');
const { authenticate } = require('./middlewares/authentication');
const { validateCreateAdminRequest } = require('./middlewares/validate_admin_creation');
const { validateAlbumsPurchase } = require('./middlewares/validate_albums_purchase');
const { validateGetPurchasedAlbums } = require('./middlewares/validate_get_purchased_albums');

exports.init = app => {
  app.get('/health', healthCheck);
  app.get('/albums', getAlbums);
  app.get('/albums/:albumId/photos', getAlbumPhotos);
  app.post('/users', validateCreateUserRequest, signUp);
  app.post('/users/sessions', validateLoginUserRequest, signIn);
  app.get('/users', authenticate, getAllUsers);
  app.post('/admin/users', validateCreateAdminRequest, createAdmin);
  app.post('/albums/:albumId', validateAlbumsPurchase, purchaseAlbum);
  app.get('/users/:userId/albums', validateGetPurchasedAlbums, getPurchasedAlbums);
};
