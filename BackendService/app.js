var createError = require('http-errors');
var express = require('express');
var path = require('path');
const cors = require('cors');

var vacancyRouter = require('./routes/vacancy');

var app = express();
const PORT = process.env.PORT || 3001;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/vacancy', vacancyRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, console.log(`Server starts at port ${PORT}`));

module.exports = app;
