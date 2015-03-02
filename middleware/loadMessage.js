//загрузка сообщений из базы непосредственно перед роутом
var Message = require('models/message').Message;

//функция для поиска сообщений
module.exports = function(req, res, next) {
    //если юзера нет после выхода, то надо, чтобы переменная все равно существовала с null
    req.user = res.locals.user = null;

    if (!req.session.user) return next(); //если сессии нет, то выходим отсюда,т.к. нам не надо искать его в базе

    //ищем юзера из сессии
    Message.find({}, function(err, messages) {
        if (err) return next(err);
        console.log(messages);
        //req.message = res.locals.user = user; //даем знать о юзере всем шаблонам
        next();
    });
};