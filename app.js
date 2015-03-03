//подключаемые модули
var express = require('express'); //модуль express
var config = require('config'); //наш конфиг
var mongoose = require('lib/mongoose'); //модуль для надстройки над mongodb
var path = require('path'); //модуль путей
var log = require('lib/log')(module); //модуль логов
var logger = require('morgan'); //наш модуль для логирования в файл
var HttpError = require('error').HttpError; //наш модуль ошибок
var favicon = require('serve-favicon'); //модуль для иконки
var bodyParser = require('body-parser'); //модуль парсинга присылаемых данных
var cookieParser = require('cookie-parser'); //модуль парсинга куков
var session = require('express-session'); //модуль сессий
var errorHandler = require('errorhandler'); //модуль ошибок

//инициализация express
var app = express();

//инициализация шаблона ejs
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');

//установка пути для favicon
app.use(favicon(__dirname + '/public/favicon.ico'));

//проверка переменной env
if (app.get('env') == 'development') app.use(logger('dev'));
else app.use(logger('default'));

//использование библиотек парсинга запросов и куков
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//подключаем MongoStore для хранения сессий в mongodb
var sessionStore = require('lib/sessionStore');

//использование сессий, инициализация настроек
app.use(session({
    secret: config.get('session:secret'), //секретное слово для шифрации подписи сессии
    key: config.get('session:key'), //секретный ключ
    cookie: config.get('session:cookie'), //использование куков для хранения сессии
    store: sessionStore, //использование модуля MongoStore для хранения сессий в mongodb
    resave: true, //сессия всегда сохраняется, даже если она не изменяется
    saveUninitialized: true //сохранение неинициализированных сессий
}));

//все наши созданные middleware должны идти после сессии и перед роутами
app.use(require('middleware/sendHttpError')); //наш собственный обработчик ошибок
app.use(require('middleware/loadUser')); //наш обработчик загрузки пользователя
app.use(require('middleware/loadMessage')); //наш обработчик загрузки сохраненных сообщений


//подключение маршрутов
require('routes')(app);

//инициализация папок для храннения файлов public
app.use(express.static(path.join(__dirname, 'public')));

//отлов ошибок
app.use(function(err, req, res, next) {
    if (typeof err == 'number') { // next(404);
        err = new HttpError(err);
    }
    if (err instanceof HttpError) {
        res.sendHttpError(err);
    } else {
        if (app.get('env') == 'development') {
            app.use(errorHandler()); //выводим лог
        } else {
            log.error(err);
            err = new HttpError(500);
            res.sendHttpError(err);
        }
    }
});
//экспорт модуля app наружу
module.exports = app;


