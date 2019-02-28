const express = require('express');
const postHandlerExports = require('../handlers/PostHandler');
const postHandler = postHandlerExports.postHandler;
const middleware = require('../middleware');

const postRouter = express.Router();

postRouter.get('/', postHandler.listPosts);

postRouter.get('/:id', postHandler.listPosts);

postRouter.post('/create', middleware.checkToken, postHandler.createPost);

postRouter.post('/edit', middleware.checkToken, postHandler.editPost);

postRouter.delete('/delete', middleware.checkToken, postHandler.deletePost);

module.exports = postRouter;