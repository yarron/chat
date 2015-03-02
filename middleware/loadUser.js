//загрузка юзера из базы непосредственно перед роутом
var User = require('models/user').User;

//функция для поиска юзера
module.exports = function(req, res, next) {
  //если юзера нет после выхода, то надо, чтобы переменная все равно существовала с null
  req.user = res.locals.user = null;

  if (!req.session.user) return next(); //если сессии нет, то выходим отсюда,т.к. нам не надо искать его в базе

    //ищем юзера из сессии
  User.findById(req.session.user, function(err, user) {
    if (err) return next(err);

    req.user = res.locals.user = user; //даем знать о юзере всем шаблонам
    next();
  });
};