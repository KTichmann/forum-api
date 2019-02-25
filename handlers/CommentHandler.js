const md5        = require('md5');
const jwt        = require('jsonwebtoken');
const { Client } = require('pg');
const { DATABASE_URL, SECRET } = process.env;

const client = new Client({
    connectionString: DATABASE_URL
});

class CommentHandler{
    constructor(){
        //Connect to the database
        client.connect().catch(err => console.log(err.toString()));

        this.createComment = this.createComment.bind(this);
    }

    listComments(req, res){
        const postId = req.params.id;
    }

    createComment(req, res){
        const username = this.getUsername(req);
        const comment = req.body.comment;
        const post = req.body.post_id;

        const postIdQuery = {
            text: 'SELECT post_id FROM posts WHERE post_id = $1',
            values: [post]
        }

        const commentQuery = {
            text: 'INSERT INTO comments (post_id, comment, username) VALUES ($1, $2, $3)',
            values: [post, comment, username]
        }

        //Check if post exists
        client.query(postIdQuery)
            .then(result => {
                if(result.rows[0] !== undefined){
                    client.query(commentQuery)
                        .then(result => {
                            res.json({
                                success: true,
                                message: 'comment added successfully'
                            })
                        })
                        .catch(error => res.json({
                            success: false,
                            message: 'error adding comment'
                        }))
                } else {
                    res.json({
                        success: false,
                        message: 'post not found'
                    })
                }

            })
            .catch(error => res.json({success: false, message: 'error selecting post'}))
    }

    getUsername(req){
        let token = req.headers['x-access-token'] || req.headers['authorization'];

        if (token.startsWith('Bearer ')){
            //remove bearer from string
            token = token.slice(7, token.length);
        }

        const username = jwt.verify(token, SECRET, (err, decoded) => {
            return decoded.username;
        });

        return username;
    }
};

const commentHandler = new CommentHandler()
module.exports = {
    commentHandler: commentHandler
}