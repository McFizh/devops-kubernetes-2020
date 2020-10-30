const Uuid = require('uuid');

const str = Uuid.v4();

const output_str = () => {
    const date = new Date();
    console.log(`${date.toISOString()}: ${str}`);
}

output_str();

setInterval( () => {
    output_str();
}, 5000);
