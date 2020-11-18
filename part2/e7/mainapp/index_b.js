const fs = require('fs');
const Uuid = require('uuid');
const express = require('express');
const pg = require('pg');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const str = Uuid.v4();

let prevStamp = '';

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
    return 1;
  } catch(err) {
    if(err.code === 'ECONNREFUSED') {
      client.end();
      delete client;
      return 0;
    }
    return -1;
  }
}

if(pgpwd) {
  (async() => {
    if(await setupDb() === 0) {
      console.log('Unable to connect to db.. Reattempting connection in 10s..')
      setTimeout(async () => {
        console.log('Attempting to reconnect')
        const rsp = await setupDb();
        if(rsp !== 1) {
          console.log('Unable to connect to db');
          process.exit(-1);
        }
        console.log('Connected..')
      }, 10000);
    }
  })();
}


const readStamp = () => {

  if(fs.existsSync('/shared/timestamp.txt')) {
    fs.readFile('/shared/timestamp.txt', 'ascii', (err, data) => {
      if(data !== prevStamp) {
        console.log(`${data} ${str}`);
        prevStamp = data;
      }
    })
  }

}


app.get('/', async (req, res) => {
  let count = 0;

  if(pgpwd) {
    const rsp = await client.query(`select value from appvalues where name='count'`);
    if(rsp.rows.length === 1) {
      count = rsp.rows[0].value;
    }
  }

  let page = `
${prevStamp} ${str}
Ping / Pongs: ${count}
`;

  const message = process.env.MESSAGE;
  if(message) {
    page = `
${message}
${page}
`;
  }

  res.send(page);
});

app.listen(port, () => {
  readStamp();
  setInterval( () => {
    readStamp();
  }, 2000);
});

