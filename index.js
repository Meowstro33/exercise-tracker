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

// Create a new user
app.post('/api/users', function (req, res) {
  const uname = req.body.username;
  const userId = users.length.toString(); // Sequential ID based on array length
  const newUser = { username: uname, _id: userId };
  users.push(newUser);
  res.json(newUser);
});

// Retrieve all users
app.get('/api/users', function (req, res) {
  res.json(users);
});

// Add exercise to a user
app.post('/api/users/:_id/exercises', function (req, res) {
  const id = req.params._id;
  const user = users.find((user) => user._id === id);

  if (!user) {
    return res.status(404).send('User not found');
  }

  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? new Date(req.body.date) : new Date();

  const exercise = {
    description,
    duration,
    date: date.toDateString()
  };

  logs.push({ username: user.username, _id: id, exercise });

  res.json({
    username: user.username,
    description,
    duration,
    date: exercise.date,
    _id: id
  });
});

// Retrieve user's exercise log
app.get('/api/users/:_id/logs', function (req, res) {
  const id = req.params._id;
  const user = users.find((user) => user._id === id);

  if (!user) {
    return res.status(404).send('User not found');
  }

  let userLogs = logs
    .filter((log) => log._id === id)
    .map((log) => ({
      description: log.exercise.description,
      duration: log.exercise.duration,
      date: log.exercise.date
    }));

  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = parseInt(req.query.limit);

  if (from || to) {
    userLogs = userLogs.filter((log) => {
      const logDate = new Date(log.date);
      return (!from || logDate >= from) && (!to || logDate <= to);
    });
  }

  if (limit) {
    userLogs = userLogs.slice(0, limit);
  }

  res.json({
    username: user.username,
    count: userLogs.length,
    _id: id,
    log: userLogs
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
