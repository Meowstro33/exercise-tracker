const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

let users = [];
let logs = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/users', function (req, res) {
  const uname = req.body.username;
  const userId = users.length > 0 ? users[users.length - 1]._id + 1 : 1;
  const usernameObj = { username: uname, _id: userId };
  users.push(usernameObj);
  res.send(usernameObj);
});

app.get('/api/users', function (req, res) {
  res.send(users);
});

app.post('/api/users/:_id/exercises', function (req, res) {
  const id = parseInt(req.params._id);
  const user = users.find((u) => u._id === id);
  
  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }

  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? new Date(req.body.date) : new Date();
  
  const exerciseEntry = {
    description,
    duration,
    date: date.toDateString(),
  };
  
  logs.push({
    username: user.username,
    _id: id,
    exercise: exerciseEntry,
  });

  res.send({
    username: user.username,
    description,
    duration,
    date: date.toDateString(),
    _id: id,
  });
});

app.get('/api/users/:_id/logs', function (req, res) {
  const id = parseInt(req.params._id);
  const user = users.find((u) => u._id === id);
  
  if (!user) {
    return res.status(404).send({ error: 'User not found' });
  }

  let userLogs = logs
    .filter((log) => log._id === id)
    .map((log) => log.exercise);

  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : userLogs.length;

  if (from) {
    userLogs = userLogs.filter((log) => new Date(log.date) >= from);
  }
  if (to) {
    userLogs = userLogs.filter((log) => new Date(log.date) <= to);
  }
  
  userLogs = userLogs.slice(0, limit);

  res.send({
    username: user.username,
    count: userLogs.length,
    _id: id,
    log: userLogs,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
