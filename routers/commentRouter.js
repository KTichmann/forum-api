const express = require('express');
const commentHandlerExports = require('../handlers/CommentHandler');
const commentHandler = commentHandlerExports.commentHandler;
const middleware = require('../middleware');

const commentRouter = express.Router();

commentRouter.get('/', commentHandler.listAllComments);

commentRouter.get('/:id', commentHandler.listComments);

commentRouter.post('/create', middleware.checkToken, commentHandler.createComment);

commentRouter.post('/edit', middleware.checkToken, commentHandler.editComment);

commentRouter.delete('/delete', middleware.checkToken, commentHandler.deleteComment);

module.exports = commentRouter;