//функция для доступа к станицу авторизованным пользователям
var HttpError = require('error').HttpError;

module.exports = function(req, res, next) {
  //если сессии нет, то показываем нашу ошибку авторизации
  if (!req.session.user) {
    return next(new HttpError(401, "Вы не авторизованы"));
  }

  next();
};