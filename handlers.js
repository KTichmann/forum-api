// const http = require('http');
const { Client } = require('pg');
const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const md5 = require('md5');
const jwt    = require('jsonwebtoken');
const PORT = process.env.PORT || 5000
const { DATABASE_URL, SECRET } = process.env;
const middleware = require('./middleware')
const client = new Client({
    connectionString: DATABASE_URL
});

class HandlerGenerator {
    index(){

    }
}

module.exports = {
    Handlers: Handlers
}