const express = require('express');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;
let count = 0;

app.get('/', (req, res) => {
  res.send(`pong ${count}`);
  count++;
});

app.listen(port);