require("dotenv").config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const cors = require('cors');
const app = express();
const compression = require('compression');
const cookieParser = require('cookie-parser');
const http = require('http');
const bodyParser = require('body-parser'); // parser middleware
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);
const ioHandler = require('./io');
const { verifyToken } = require('./utils');

app.disabled('x-powered-by');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());

app.disabled('x-powered-by');

app.use(cookieParser());
app.use(compression());

app.use('/api/users/', require('./routes/api/users'));
app.use('/api/posts/', require('./routes/api/posts'));
app.use('/api/explore/', require('./routes/api/explore'));
app.use('/api/profile',  require('./routes/api/profile'));

// Serve static assets in content
if (process.env.NODE_ENV === 'content') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}


io.use(async (socket, next) => {
  const token = socket.request.headers.cookie.match(/(?<=token=)(.*?)(?=;)/)[0];

  try {
    const decoded = await verifyToken(token);
    // eslint-disable-next-line no-param-reassign
    socket.decoded = decoded;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
}).on('connection', ioHandler(io));


app.use('/uploads/images/', express.static(path.resolve(__dirname, './uploads/images')));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
