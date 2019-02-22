// const http = require('http');
const { Client } = require('pg');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const md5 = require('md5');

const PORT = process.env.PORT || 5000
const { DATABASE_URL } = process.env;

const client = new Client({
    connectionString: DATABASE_URL
});

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

client.connect().catch(err => console.log(err.toString()))

app.get('/', (req, res) => {
    client.query('SELECT * FROM hellotable')
    .then((result) => {
      res.send(`${result.rows[1].name}\n`);
    })
    .catch((err) => {
      res.send(err.toString());
    });
})

app.post('/sign-up', (req, res) => {
    //Check if username is unique
    const username = req.body.username;
    const usernameQuery = {
        text: 'SELECT username FROM users WHERE username = $1',
        values: [username]
    }
    client.query(usernameQuery)
        .then(result => {
            if(result.rows[0] != undefined){
                //TODO: send proper response with error code etc.
                res.send('username taken')
            }
        })
        .catch(error => res.send(error.toString()))
    //Hash password
    const hashedPass = md5(req.body.password);
    //Add password and username to database
    const query = {
        text: 'INSERT INTO users(username, password) VALUES ($1, $2)',
        values: [username, hashedPass]
    }
    client.query(query)
        .then(() => {
            res.send(`name: ${username}, pass: ${req.body.password}`);
        })
        .catch((error) => res.send(error.toString()))
})

app.listen(process.env.PORT, () => {
    console.log(`running at port: ${PORT}`)
})

// const server = http.createServer((req, res) => {
//   const client = new Client({
//     connectionString: DATABASE_URL,
//   });
  
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'text/plain');
//   client.connect()
//     .then(() => {
//         const query = {
//             text: 'INSERT INTO hellotable (name) VALUES ($1)',
//             values: ['Inserting into the db works!']
//         }

//         return client.query(query)
//     })
//     .then(() => client.query('SELECT * FROM hellotable'))
//     .then((result) => {
//       res.end(`${result.rows[1].name}\n`);
//       client.end();
//     })
//     .catch((err) => {
//       res.end(err.toString());
//       client.end();
//     });
// });
// server.listen(PORT, () => {
//   console.log(`Server running on ${PORT}`);
// });