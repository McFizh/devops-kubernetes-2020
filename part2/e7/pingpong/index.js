const fs = require('fs');
const express = require('express');
const app = express();
const pg = require('pg');

require('dotenv').config();

const { initDb, getClient } = require('./database');

// Setup database
initDb();

//
const port = process.env.PORT || 3000;
let count = 0;

app.get('/', async (req, res) => {
  const client = getClient();
  if(client) {
    try {
      await client.query(`update appvalues set value=${count} where name='count'`);
    } catch(err) {
      console.log(err);
    }
  }

  res.send(`pong ${count}\n`);
  count++;
});

app.get('/count', (req, res) => {
  res.send({ count });
});

app.listen(port, () => {
  console.log(`Pong app listening on ${port}`);
});