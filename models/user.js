//подключаемые модули
var crypto = require('crypto'), //модуль шифрации пароля
    async = require('async'), //модуль для асинхронного вызова
    util = require('util'), //модуль утилит
    mongoose = require('lib/mongoose'), //подключение к mongodb
    Schema = mongoose.Schema;

//создание схемы для базы, как поля в mysql
var schema = new Schema({
  username: { type: String, unique: true, required: true },
  hashedPassword: { type: String, required: true },
  salt: { type: String, required: true },
  created: { type: Date, default: Date.now }
});

//функция шифрования паролей
schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

//создаем виртуальное поле пароля с сеттером и геттером
schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });

//функция проверки пароля на совпадение
schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

//функция авторизации пользователя (статичная)
schema.statics.authorize = function(username, password, callback) {
  var User = this;
    //цепочка вызовов функций
  async.waterfall([
    function(callback) {
      User.findOne({username: username}, callback);
    },
    function(user, callback) {
      if (user) {
        if (user.checkPassword(password)) callback(null, user);
        else callback(new AuthError("Пароль неверен"));
      } else {
        var user = new User({username: username, password: password});
        user.save(function(err) {
          if (err) return callback(err);
          callback(null, user);
        });
      }
    }
  ], callback);
};

//даем  USER всем извне
exports.User = mongoose.model('User', schema);

//создаем функцию для ошибок авторизации
function AuthError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.message = message;
}
//наследуем её от Error
util.inherits(AuthError, Error);

//даем её имя
AuthError.prototype.name = 'AuthError';

//делаем её доступной извне
exports.AuthError = AuthError;


