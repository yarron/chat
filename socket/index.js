//подключаемые модули
var log = require('lib/log')(module); //модуль логов
var config = require('config'); //конфиг
var async = require('async'); //библиотека async
var cookie = require('cookie'); //куки
var cookieParser = require('cookie-parser'); //модуль парсинга куков
var sessionStore = require('lib/sessionStore'); //модуль хранения куков в базе
var HttpError = require('error').HttpError; //наш обработчик ошибок
var User = require('models/user').User; //наша модель
var Message = require('models/message').Message; //наша модель

//функция загружает сессию из базы
function loadSession(sid, callback) {
    // sessionStore callback is not quite async-style!
    sessionStore.load(sid, function(err, session) {
        if (arguments.length == 0)
            return callback(null, null); // no arguments => no session
         else
            return callback(null, session);
    });

}

//функция загружает юзера из базы по id сессии
function loadUser(session, callback) {
    if (!session.user) {
        log.debug("Session %s is anonymous", session.id);
        return callback(null, null);
    }

    User.findById(session.user, function(err, user) {
        if (err) return callback(err);
        if (!user) return callback(null, null);
        callback(null, user);
    });
}


module.exports = function(server) {
    //инициализируем сокет и слушаем сервер
    var io = require('socket.io')({
      origins: 'localhost:*', //домен и порт
      logger: log //логирование
    }).listen(server);

    io.set('authorization', function(handshake, callback) {
        async.waterfall([
            function(callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || ''); // сделать handshakeData.cookies - объектом с cookie
                var sidCookie = handshake.cookies[config.get('session:key')];  //извлекаем sid cookie с подписью
                var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret')); //убираем подпись, чтобы получить чистый sid
                loadSession(sid, callback); //возвращаем обертку сессии, если она есть, иначе null
            },
            function(session, callback) {
                if (!session) callback(new HttpError(401, "No session")); //если нет сессии, то ошибка
                handshake.session = session; //объекту handshake (сокета) присваеваем сессию
                loadUser(session, callback); //загружаем юзера
            },
            function(user, callback) {
                if (!user) callback(new HttpError(403, "Anonymous session may not connect")); //если нет юзера, то ошибка
                handshake.user = user; //объекту handshake (сокета) присваеваем юзера
                callback(null);
            }
        ], function(err) {
            if (!err) return callback(null, true);
            if (err instanceof HttpError) return callback(null, false);
            callback(err);
        });
    });

    //перезагрузка сессии, если пользователь выходил из аккаунта
    io.sockets.on('session:reload', function(sid) {
        var clients = io.sockets.clients(); //ищем всех подключенных клиентов

        clients.forEach(function(client) { //перебираем каждого
            if (client.handshake.session.id != sid) return; //если не нашел, выход

            loadSession(sid, function(err, session) {//если id сессии найден в сокете, то пробуем его загрузить
                if (err) { //если ошибка загрузки, то в сокете его рубим
                    client.emit("error", "server error");
                    client.disconnect();
                    return;
                }

                if (!session) { //если сессии нет, то тоже вырубаем его
                    client.emit("logout");
                    client.disconnect();
                    return;
                }

                client.handshake.session = session; //иначе записываем заново сессию в сокет
            });
        });
    });

    //если соединение на сокете установлено
    io.sockets.on('connection', function(socket) {

        var username = socket.request.user.username; //запоминаем логин
        var id = socket.request.user._id; //запоминаем id

        socket.broadcast.emit('join', username); //всем сообщаем, кто подсоединился

        socket.on('message', function(text, cb) { //если кто-то отправил сообщение
            //сохраняем его в базе
            console.log(id);
            async.waterfall([
                function(id, callback) {

                   /* var message = new Message({user_id: id, text: "+++"});
                    message.save(function(err) {
                        console.log(err);
                        if (err) return callback(err);
                        callback(null, message);
                    });*/
                }
            ], function(err) {
                if (!err) return callback(null, true);
                if (err instanceof HttpError) return callback(null, false);
                callback(err);
            });

            //console.log(id);
            socket.broadcast.emit('message', username, text); //отображаем его остальным
            cb && cb();
        });

        socket.on('disconnect', function() { //если кто-то покидает чат, то сообщаем остальным
            socket.broadcast.emit('leave', username);
        });

    });

    return io;
};
