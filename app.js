var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var engine = require('ejs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


var server = require('http').Server(app);
var io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
server.listen(9898);
var os = require( 'os' );

var networkInterfaces = os.networkInterfaces();

clients = {};
io.on('connection', function (socket) {
  // if (networkInterfaces['vEthernet (WSL)'] && networkInterfaces['vEthernet (WSL)'].length > 0) {
  //   console.log(networkInterfaces['vEthernet (WSL)'][networkInterfaces['vEthernet (WSL)'].length - 1]);
  // }
  // adding creating with the login user name and adding same users to that particular room
  socket.on('joinroom', data => {
    if (Object.keys(socket.rooms).includes(data.user)) {
      io.sockets.connected[socket.id].join(room);
    } else {
      socket.join(data.user);
    }
    io.to(data.user).emit('joinroommessage', {message: `socket initialized for ${data.user}`, socket: socket.id});
    console.log(socket.rooms, '53');
  });
  
  // removing user from the room while logout
  socket.on('leaveroom', data => {
    socket.leave(data.user)
    io.to(data.user).emit('leaveroommessage', {message: `socket removed for ${data.user}`, socket: socket.id});
    console.log(socket.rooms, '53');
  });

  socket.on('login', (data) => {
    clients[socket.id] = data.user;
    if (!clients[data.user]) {
      clients[data.user] = [socket.id];
    } else {
      clients[data.user].push(socket.id);
    }
    if (clients[data.user]) {
      clients[data.user].forEach( client => {
        io.to(client).emit('message', {message: `socket initialized for ${data.user}`, socket: socket.id});
      });
      console.log(clients, 'in login event');
    }
  });

  socket.on('logout', (data) => {
    // delete clients[socket.id];
    if (clients[data.user]) {
      clients[data.user].forEach((e, i) => {
        if (e === socket.id) {
          clients[data.user].splice(i, 0);
        }
      });
    }
    socket.emit('message', {message: `socket cleared for ${data.user}`, socket: socket.id});
    console.log(clients, 'in logout event');
  });

  socket.on('testsocket', data => {
    socket.emit('message', {number: data.randomNumber, user: data.user});
    // socket.emit('loginuser', {number: data.randomNumber, user: data.user});
    if (clients[data.user]) {
      io.to(clients[data.user]).emit("loginuser", "socket working for login user only");
    }
    console.log(clients, 'testsocket');
  });

  socket.on('broadcast', data => {
    socket.broadcast.emit('broadcast', {number: data.randomNumber, message: 'broadcast to all clients'});
    console.log(clients, 'testsocket');
  });

  socket.on('disconnect', disconnectClient => {
    console.log(disconnectClient, '70');
    console.log(clients, '71');
  });
  
});

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

module.exports = app;
