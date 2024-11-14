const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

let users = [];
let exercises = {};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const userId = (users.length + 1).toString();
  const newUser = { username, _id: userId };
  users.push(newUser);
  exercises[userId] = [];
  res.json(newUser);
});

// Retrieve all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const user = users.find((u) => u._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const description = req.body.description;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? new Date(req.body.date) : new Date();

  const exercise = {
    description,
    duration,
    date: date.toDateString(),
  };

  exercises[_id].push(exercise);

  res.json({
    username: user.username,
    description,
    duration,
    date: exercise.date,
    _id,
  });
});

// Retrieve user's exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const user = users.find((u) => u._id === _id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let log = exercises[_id].map((ex) => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date,
  }));

  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = parseInt(req.query.limit);

  if (from || to) {
    log = log.filter((ex) => {
      const logDate = new Date(ex.date);
      return (!from || logDate >= from) && (!to || logDate <= to);
    });
  }

  if (limit) {
    log = log.slice(0, limit);
  }

  res.json({
    username: user.username,
    count: log.length,
    _id,
    log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
