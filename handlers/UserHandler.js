const md5        = require('md5');
const jwt        = require('jsonwebtoken');
const { Client } = require('pg');
const { DATABASE_URL, SECRET } = process.env;

const client = new Client({
    connectionString: DATABASE_URL
});

class UserHandler {
    constructor(){
        client.connect().catch(err => console.log(err.toString()))
    }
    //REMOVE
    index(req, res){
        let test = jwt.verify(req.headers['x-access-token'], SECRET, (err, decoded) => {
            return decoded;
        });

        res.send(test);
    }

    signUp(req, res) {
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
                        res.json({
                            success: false,
                            message: 'username taken'
                        })
                    } else {
                        //Hash password
                        const hashedPass = md5(req.body.password);
                        //Add password and username to database
                        const query = {
                            text: 'INSERT INTO users(username, password) VALUES ($1, $2)',
                            values: [username, hashedPass]
                        }
                        client.query(query)
                            .then(() => {
                                res.json({
                                    success: true,
                                    message: 'User successfully signed up'
                                })
                            })
                            .catch((error) => res.json({
                                success: false,
                                message: 'Unidentified error'
                            }))
                    }
                })
                .catch(error => res.send(error.toString()))
    }
    authenticate(req, res) {
        //Check if username/password are in the database - if not, throw an error
        const username = req.body.username
        //check if username is in database
        const query = {
            text: 'SELECT * FROM users WHERE username=$1',
            values: [username]
        };
        client.query(query)
            .then(result => {
                const password = result.rows[0].password;
                const row = result.rows[0];
                if(row === undefined){
                    res.json({
                        success: false,
                        message: 'authentication unsuccessful',
                    })
                } else {
                    //Check if password is correct
                    if(password === md5(req.body.password)){
                        //password is correct
                        //create a jwt token, and send it back in response
                        const payload = {
                            username: username
                        };
                    
                        const token = jwt.sign(payload, SECRET, {
                            expiresIn: '24h'
                        });
                    
                        res.json({
                            success: true,
                            message: 'Authentication Successful',
                            token: token
                        })
                    } else {
                        //send an error message
                        res.json({
                            success: false,
                            message: 'authentication unsuccessful'
                        })
                    }
                    res.send("username exists")
                }
            })
            .catch(err => res.send(err))
    }
}



const userHandler = new UserHandler()
module.exports = {
    userHandler: userHandler
}