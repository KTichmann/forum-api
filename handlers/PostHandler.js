const md5        = require('md5');
const jwt        = require('jsonwebtoken');
const { Client } = require('pg');
const { DATABASE_URL, SECRET } = process.env;

const client = new Client({
    connectionString: DATABASE_URL
});

class PostHandler{
    constructor(){
        //Connect to the database
        client.connect().catch(err => console.log(err.toString()));

        this.createPost = this.createPost.bind(this);
    }
    listPosts(req, res){
        client.query('SELECT * FROM posts')
            .then(result => {
                res.json({
                    success:true,
                    message: result.rows
                })
            })
            .catch(error => {
                res.json({
                    success: false,
                    message: error
                })
            })
    }

    createPost(req, res){
        if(!req.body.post){
            res.json({
                success: false,
                message: 'post cannot be empty'
            })
        } 
        if(!req.body.title){
            res.json({
                success: false,
                message: 'title cannot be empty'
            })
        }
        const username = this.getUsername(req);
        const post = req.body.post;
        const title = req.body.title;
        //Make sure the username is in the users table
        const userQuery = {
            text: 'SELECT username FROM users WHERE username=$1',
            values: [username]
        }

        const createPostQuery = {
            text: 'INSERT INTO posts (username, post, title) VALUES ($1, $2, $3)',
            values: [username, post, title]
        }
        client.query(userQuery)
            .then(result => {
                if(result.rows[0] == undefined){
                    res.json({
                        success: false,
                        message: 'username not found'
                    })
                } else {
                    //Add the post to the database
                    client.query(createPostQuery)
                        .then(result => {
                            res.json({
                                success: true,
                                message: 'Post Saved'
                            })
                        })
                        .catch(error => res.json({
                            success: false,
                            message: error
                        }))
                }
            })
            .catch(error => res.json({
                success: false,
                message: error
            }))
    }

    editPost(req, res){
        const username = getUsername(req);
        const post = req.body.post;
        const postID = req.body.id;

        const updatePostQuery = {
            text: 'UPDATE posts SET post=$1 WHERE post_id = $2',
            values: [post, postID]
        };

        //Look up post id in the database
        const postIDQuery = {
            text: 'SELECT username FROM posts WHERE post_id = $1',
            values: [req.body.id] 
        }
        //Check if username is the same as the current user
        client.query(postIDQuery)
            .then(result => {
                if(result.rows[0] != username) {
                    res.json({
                        success: false,
                        message: "current user can't update post"
                    })
                } else {
                    //Update post in the database
                    client.query(updatePostQuery)
                        .then(result => {
                            res.json({
                                success: true,
                                message: "post updated successfully"
                            })
                        })
                        //TODO: CATCH BLOCK
                }
            })
            //TODO: CATCH BLOCK
        //Update post in db
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
    //posts --> post_id & username & post & created_at

    //Logged out users should be able to: 
    //Get a list of all the posts
    //Logged in Users should be able to:
    //1. Make a new post
    //2. Edit their own post
};

const postHandler = new PostHandler()
module.exports = {
    postHandler: postHandler
}