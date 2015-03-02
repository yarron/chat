//подключаем необходимые модули
var mongoose = require('mongoose');
var session = require('express-session'); //модуль сессий
var MongoStore = require('connect-mongo')(session); //модуль для хранения сессий в mongodb

//создаем объект для хранения сессий в базе
var sessionStore = new MongoStore({mongooseConnection: mongoose.connection});

//делаем его доступным извне
module.exports = sessionStore;