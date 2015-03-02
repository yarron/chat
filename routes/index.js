var checkAuth = require('middleware/checkAuth');

//подключенные роуты нашего приложения GET и POST
module.exports = function(app) {

  app.get('/', require('./frontpage').get);

  app.get('/login', require('./login').get);
  app.post('/login', require('./login').post);

  app.post('/logout', require('./logout').post);

  //вставляем наш middleware checkAuth только на chat
  app.get('/chat', checkAuth, require('./chat').get);

};
