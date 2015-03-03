//подключенные модули для авторизации
var User = require('models/user').User;
var HttpError = require('error').HttpError;
var AuthError = require('models/user').AuthError;
var async = require('async');


//если по роуту мы попали сюда запросом GET, выводим шаблон
exports.get = function(req, res) {
  res.render('login');
};

//если POST, то обрабатываем данные
exports.post = function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  //вызываем функцию авторизации
  User.authorize(username, password, function(err, user) {
    if (err) { //обрабатываем найденные ошибки
      if (err instanceof AuthError) { //если ошибка авторизации, то показываем нашу ошибку в шаблон
        return next(new HttpError(403, err.message));
      } else { //иначе передаем её дальше
        return next(err);
      }
    }

    req.session.user = user._id; //присваеваем id сессии user
    res.send({});

  });

};