const fs = require('fs');
const express = require('express');
const app = express();
const pg = require('pg');

require('dotenv').config();

// Setup database
const pgpwd = process.env.POSTGRES_PASSWORD;
const pghost = process.env.POSTGRES_HOST;
let client = null;

const setupDb = async () => {
  client = new pg.Client({
    user: 'postgres',
    host: pghost || 'localhost',
    password: pgpwd,
    database: 'postgres'
  });

  try {
    await client.connect();
    await client.query('create table IF NOT EXISTS appvalues (name varchar, value int);');
    await client.query('truncate appvalues;');
    await client.query('insert into appvalues (name, value) values (\'count\',0);');
    return 1;
  } catch(err) {
    if(err.code === 'ECONNREFUSED') {
      client.end();
      delete client;
      return 0;
    }
    console.log(err);
    return -1;
  }
}

if(pgpwd) {
  (async() => {
    const rspCode = await setupDb();
    if(rspCode === 0) {
      console.log('Unable to connect to db.. Reattempting connection in 10s..')
      setTimeout(async () => {
        console.log('Attempting to reconnect');
        const rsp = await setupDb();
        if(rsp !== 1) {
          console.log('Unable to connect to db');
          process.exit(-1);
        }
        console.log('Connected..');
      }, 10000);
    } else if(rspCode === 1) {
      console.log('Connected.');
    }
  })();
}

//
const port = process.env.PORT || 3000;
let count = 0;

app.get('/', async (req, res) => {
  if(pgpwd) {
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
  console.log(`Pong app listening on ${app.port}`);
});