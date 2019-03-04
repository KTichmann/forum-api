const jwt        = require('jsonwebtoken');
const { Client } = require('pg');
const { DATABASE_URL, SECRET } = process.env;

const client = new Client({
    connectionString: DATABASE_URL
});

class LikeHandler{
    constructor(){
        //Connect to the database
        client.connect().catch(err => console.log(err.toString()));

        this.addLike = this.addLike.bind(this);
        this.removeLike = this.removeLike.bind(this);
    }

    addLike(req, res){
        let username = req.decoded;
        let type = req.body.type;
        let id = req.body.id;
        let testQuery;
        let testUserQuery = {
            text: 'SELECT * FROM likes WHERE username = $1 and id = $2 and type = $3',
            values: [username, id, type]
        }
        let query = {
            text: 'INSERT INTO likes(username, type, id) VALUES ($1, $2, $3)',
            values: [username, type, id]
        };

        this.checkParams(res, type, id);

        if(type === 'post'){
            testQuery = {
                text: 'SELECT * FROM posts WHERE post_id = $1',
                values: [id]
            }
        } else if (type === 'comment'){
            testQuery = {
                text: 'SELECT * FROM comments WHERE comment_id = $1',
                values: [id]
            }
        } else{
            res.json({
                success: false,
                message: 'invalid type'
            })
        }

        client.query(testQuery)
            .then(result => {
                if(result.rows[0]){
                    client.query(testUserQuery)
                    .then(result => {
                        if(!result.rows[0]){
                            client.query(query)
                            .then(result => {
                                res.json({
                                    success: true,
                                    message: 'like added'
                                })
                            })
                            .catch(result => res.json({
                                success: false,
                                message: 'error adding like'
                            }))
                        } else {
                            res.json({success: false, message: 'one like per user'})
                        }
                    })
                    .catch(error => res.json({
                        success: false,
                        message: 'error validating like'
                    }))
                } else{
                    res.json({
                        success: false,
                        message: `No ${type} found with that id`,
                    })
                }
            })
            .catch(error => res.json({
                success: false,
                message: 'error validating id',
                data: error
            }))
    }

    removeLike(req, res){
        const username = req.decoded;
        const id = req.body.id;
        const type = req.body.type;

        this.checkParams(res, type, id);
        
        const query = {
            text: 'DELETE FROM likes WHERE type=$1 and id=$2 and username=$3',
            values: [type, id, username]
        }

        client.query(query)
        .then(result => {
            if(result.rowCount){
                res.json({success: true, message: 'like removed'})
            } else {
                res.json({success: false, message: 'error removing like'})
            }
        })
        .catch(error => res.json({
            success: false,
            message: 'error removing like'
        }))
    }

    countLikes(req, res, type){
        let query;
        if(req.params.id){
            query = {
                text: 'SELECT id, COUNT (username) FROM likes WHERE type = $1 and id=$2',
                values: [type, req.params.id]
            }
        } else{
            query = {
                text: 'SELECT id, COUNT (username) FROM likes WHERE type = $1 GROUP BY id',
                values: [type]
            }
        }

        client.query(query)
        .then(result => res.json({
            success: true,
            message: 'likes retrieved successfully',
            data: result.rows
        }))
        .catch(error => res.json({
            success: false,
            message: 'error retrieving likes',
            data: error
        }))
    }

    checkParams(res, type, id){
        if(!type || !id){
            let message;
            if(!type){
             message = 'type cannot be empty'
            } else if (!id){
                message = 'id cannot be empty'
            }
            res.json({
                success: false,
                message: message
            })
        }
    }
}

const likeHandler = new LikeHandler()
module.exports = {
    likeHandler: likeHandler
}