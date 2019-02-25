const express = require('express');
const bodyParser = require('body-parser')
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 5000

const userHandleExports = require('./handlers/UserHandler');
const userHandler = userHandleExports.userHandler;

const postHandlerExports = require('./handlers/PostHandler');
const postHandler = postHandlerExports.postHandler;

const commentHandlerExports = require('./handlers/CommentHandler');
const commentHandler = commentHandlerExports.commentHandler;

const middleware = require('./middleware');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(cors());

app.get('/', middleware.checkToken, userHandler.index);

//User-related routes
app.post('/user/sign-up', userHandler.signUp);

app.post('/user/authenticate', userHandler.authenticate);

//Post-related routes
app.get('/posts', postHandler.listPosts);

app.get('/posts/:id', postHandler.listPosts);

app.post('/posts/create', middleware.checkToken, postHandler.createPost);

app.post('/posts/edit', middleware.checkToken, postHandler.editPost);

app.delete('/posts/delete', middleware.checkToken, postHandler.deletePost);

//Comment-related routes
app.get('/comments/:id', commentHandler.listComments);

app.post('/comments/create', middleware.checkToken, commentHandler.createComment);

app.post('/comments/edit', middleware.checkToken, commentHandler.editComment);

app.delete('/comments/delete', middleware.checkToken, commentHandler.deleteComment);

//Spin up the server
app.listen(process.env.PORT, () => {
    console.log(`running at port: ${PORT}`)
})