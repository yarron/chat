//наш модуль ошибок http
module.exports = function(req, res, next) {

  res.sendHttpError = function(error) {

    res.status(error.status);
    if (res.req.headers['x-requested-with'] == 'XMLHttpRequest') { //если запрос на ajax, то ошибку отдаем в json
      res.json(error);
    } else { //иначе просто отдаем ошибку
      res.render("error", {error: error});
    }
  };

  next();

};