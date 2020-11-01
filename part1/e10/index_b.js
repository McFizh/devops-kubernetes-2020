const fs = require('fs');
const Uuid = require('uuid');

const str = Uuid.v4();
let prevStamp = '';

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

setInterval( () => {
  readStamp();
}, 2000);

readStamp();