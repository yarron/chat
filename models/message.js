//подключаемые модули
var async = require('async'), //модуль для асинхронного вызова
    //util = require('util'), //модуль утилит
    mongoose = require('lib/mongoose'), //подключение к mongodb
    Schema = mongoose.Schema;

//создание схемы для базы, как поля в mysql
var schema = new Schema({
    user_id: { type: String,  required: true },
    text: { type: String, required: true },
    created: { type: Date, default: Date.now }
});

//функция авторизации пользователя (статичная)
/*schema.saveMessage = function(username, password, callback) {
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
};*/

//даем  USER всем извне
exports.Message = mongoose.model('Message', schema);