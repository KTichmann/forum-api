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
        this.listComments = this.listComments.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
        this.editComment = this.editComment.bind(this);
    }

    listAllComments(req, res){
        client.query('SELECT * FROM comments')
            .then(result => res.json({
                success: true,
                message: 'comments fetched successfully',
                data: result.rows
            }))
            .catch(error => res.json({
                success: false,
                message: 'error fetching comments'
            }))
    }

    listComments(req, res){
        const postId = req.params.id;
        if(!postId){
            res.json({
                success: false,
                message: "No post_id to list comments from"
            })
        }
        const username = this.getUsername(req);
        let postQuery = {
            text: 'SELECT post_id FROM posts WHERE post_id = $1',
            values: [postId]
        }

        let commentQuery = {
            text: 'SELECT * FROM comments WHERE post_id = $1',
            values: [postId]
        }

        client.query(postQuery)
            .then(result => {
                if(result.rows[0] === undefined){
                    res.json({
                        success: false,
                        message: 'no post found with that id'
                    })
                } else {
                    client.query(commentQuery)
                        .then(result => res.json({
                            success: true,
                            message: 'comments retrieved successfully',
                            data: result.rows
                        }))
                        .catch(error => res.json({
                            success: false,
                            message: 'error retrieving comments',
                            data: error
                        }))
                }
            })
            .catch(error => res.json({
                success: false, 
                message: 'error retrieving comments',
                data: error 
            }))
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

    deleteComment (req, res) {
        const username = this.getUsername(req);
        const commentId = req.body.id;

        //Queries

        const usernameQuery = {
            text: 'SELECT username FROM comments WHERE comment_id = $1',
            values: [commentId]
        }

        const deleteQuery = {
            text: 'DELETE FROM comments WHERE comment_id = $1',
            values: [commentId]
        }

        client.query(usernameQuery)
            .then(result => {
                if(result.rows[0].username === username){
                    //Delete the comment
                    client.query(deleteQuery)
                        .then(result => {
                            res.json({
                                success: true,
                                message: 'comment successfully deleted'
                            })
                        })
                        .catch(error => res.json({
                            success: false,
                            message: 'error deleting comment',
                            data: error
                        }))
                } else {
                    res.json({
                        success: false,
                        message: "current user can't delete comment"
                    })
                }
            })
            .catch(error => res.json({
                success: false,
                message: 'error deleting comment',
                data: error
            }))

    }

    editComment (req, res) {
        const username = this.getUsername(req);
        const commentId = req.body.id;
        const comment = req.body.comment;

        const updateCommentQuery = {
            text: 'UPDATE comments SET comment=$1 WHERE comment_id = $2',
            values: [comment, commentId]
        }
        
        const commentIdQuery = {
            text: 'SELECT username FROM comments WHERE comment_id = $1',
            values: [commentId] 
        }

        //Check if current user created the comment
        client.query(commentIdQuery)
            .then(result => {
                if(result.rows[0].username != username) {
                    res.json({
                        success: false,
                        message: "current user can't update comment"
                    })
                } else {
                    //Update post in the database
                    client.query(updateCommentQuery)
                        .then(result => {
                            res.json({
                                success: true,
                                message: 'comment successfully updated'
                            })
                        })
                        .catch(error => res.json({
                            success: false,
                            message: 'error updating comment',
                            data: error
                        }))
                }
            })
            .catch(error => res.json({
                success: false, 
                message: 'error updating comment',
                data: error 
            }))
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