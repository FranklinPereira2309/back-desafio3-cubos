const { Pool } = require('pg');

const pool = new Pool({
    user: 'evtftrhqnbzzhj',
    host: 'ec2-54-211-255-161.compute-1.amazonaws.com',
    database: 'd8qa02dchcq6q5',
    password: 'b86b867e6492e4c734a6b4838b352038aa42dad68b7081b6c37ca7923b06861f',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});
// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'dindin',
//     password: '88321656',
//     port: 5432

// });



const query = (text, param) => {
    return pool.query(text, param);
}

module.exports = {
    query
}

