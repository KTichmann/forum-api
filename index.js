const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const PORT = process.env.PORT || 5000

const handleExports = require('./handlers');
const handlers = handleExports.handlers;
const middleware = require('./middleware');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.get('/', middleware.checkToken, handlers.index)

app.post('/sign-up', handlers.signUp)

app.post('/authenticate', handlers.authenticate)

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