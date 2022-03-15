require('dotenv').config();

const fs = require('fs');
const pool = require('./connect');

const sqlQuery = fs.readFileSync('./db/build.sql', 'utf-8');

pool.query(sqlQuery, (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Database built successfully');
  }
});

pool.end();
