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

// Create a New User
app.post('/api/users', (req, res) => {
  const uname = req.body.username;
  const userId = users.length + 1;
  const newUser = { username: uname, _id: userId.toString() };
  users.push(newUser);
  res.json(newUser);
});

// Get All Users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add Exercise to User
app.post('/api/users/:_id/exercises', (req, res) => {
  const id = req.params._id;
  const user = users.find((user) => user._id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { description, duration } = req.body;
  const date = req.body.date ? new Date(req.body.date) : new Date();

  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: date.toDateString(),
    _id: id
  };

  logs.push({
    username: user.username,
    _id: id,
    exercise: newExercise
  });

  res.json(newExercise);
});

// Get Exercise Logs with Filters
app.get('/api/users/:_id/logs', (req, res) => {
  const id = req.params._id;
  const user = users.find((user) => user._id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { from, to, limit } = req.query;
  let userLogs = logs
    .filter((log) => log._id === id)
    .map((log) => log.exercise);

  // Apply date filters
  if (from) {
    const fromDate = new Date(from);
    userLogs = userLogs.filter((log) => new Date(log.date) >= fromDate);
  }
  if (to) {
    const toDate = new Date(to);
    userLogs = userLogs.filter((log) => new Date(log.date) <= toDate);
  }

  // Apply limit filter
  if (limit) {
    userLogs = userLogs.slice(0, parseInt(limit));
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
