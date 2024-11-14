const { Pool } = require('pg');

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'postgres',
//     password: '88321656',
//     port: 5432,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'locadora',
    password: '88321656',
    port: 5432

});



const query = (text, param) => {
    return pool.query(text, param);
}

module.exports = {
    query
}

