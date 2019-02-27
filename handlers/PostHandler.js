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
        this.editPost = this.editPost.bind(this);
        this.deletePost = this.deletePost.bind(this);
    }
    listPosts(req, res){
        let query = 'SELECT * FROM posts';
        if(req.params.id){
            query = {
                text: 'SELECT * FROM posts WHERE post_id = $1',
                values: [req.params.id]
            }
        }
        client.query(query)
            .then(result => {
                res.json({
                    success:true,
                    message: 'Post retrieved successfully',
                    data: result.rows
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
            text: 'INSERT INTO posts (username, post, title) VALUES ($1, $2, $3) RETURNING post_id',
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
                                message: 'Post Saved',
                                data: result.rows[0]
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
        const username = this.getUsername(req);
        const post = req.body.post;
        const title = req.body.title;
        const postID = req.body.id;

        const updatePostQuery = {
            text: 'UPDATE posts SET post=$1, title=$2 WHERE post_id = $3',
            values: [post, title, postID]
        };

        //Look up post id in the database
        const postIDQuery = {
            text: 'SELECT username FROM posts WHERE post_id = $1',
            values: [postID] 
        }
        //Check if username is the same as the current user
        client.query(postIDQuery)
            .then(result => {
                if(result.rows[0].username != username) {
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
                                message: "post updated successfully",
                            })
                        })
                        .catch(error => {
                            res.json({
                                success: false,
                                message: "error updating post",
                                data: error
                            })
                        })
                }
            })
            .catch(error => {
                res.json({
                    success: false,
                    message: "error updating post",
                    data: error
                })
            })
    }

    deletePost(req,res) {
        const username = this.getUsername(req);
        const id = req.body.id;
        //Make sure that the user that created the post is the one trying to delete it
        const usernameQuery = {
            text: 'SELECT username FROM posts WHERE post_id = $1',
            values: [id]
        };

        const deleteQuery = {
            text: 'DELETE FROM posts WHERE post_id = $1',
            values: [id]
        }

        client.query(usernameQuery)
            .then(result => {
                if(result.rows[0].username === username){
                    //Delete the post
                    client.query(deleteQuery)
                    .then(result => {
                        res.json({
                            success: true,
                            message: 'post deleted successfully'
                        })
                    })
                    .catch(error => {
                        res.json({
                            success: false,
                            message: 'error deleting post'
                        })
                    })
                } else {
                    res.json({
                        success: false,
                        message: "current user can't delete post"
                    })
                }
            })
            .catch(error => {
                res.json({
                    success: false,
                    message: "error deleting post"
                })
            })
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
    //TODO: Add 'likes' - logged in users can like a post etc.
    //Users can only like a post once - maybe have a "likes" table --> post_id, number of likes, array of users who liked it...
};

const postHandler = new PostHandler()
module.exports = {
    postHandler: postHandler
}