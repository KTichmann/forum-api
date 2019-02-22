const http = require('http');
const { Client } = require('pg');

const PORT = process.env.PORT || 5000
const { DATABASE_URL } = process.env;
const server = http.createServer((req, res) => {
  const client = new Client({
    connectionString: DATABASE_URL,
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  client.connect()
    .then(() => {
        const query = {
            text: 'INSERT INTO hellotable (name) VALUES ($1)',
            values: ['Inserting into the db works!']
        }

        return client.query(query)
    })
    .then(() => client.query('SELECT * FROM hellotable'))
    .then((result) => {
      res.end(`${result.rows[1].name}\n`);
      client.end();
    })
    .catch((err) => {
      res.end(err.toString());
      client.end();
    });
});
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}/n`);
});