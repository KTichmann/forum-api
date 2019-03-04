const express = require('express');
const likeHandlerExports = require('../handlers/LikeHandler');
const likeHandler = likeHandlerExports.likeHandler;
const middleware = require('../middleware');

const likeRouter = express.Router();

likeRouter.get('/posts', (req, res) => likeHandler.countLikes(req, res, 'post'));

likeRouter.get('/comments', (req, res) => likeHandler.countLikes(req, res, 'comment'));

likeRouter.get('/comments/:id', (req, res) => likeHandler.countLikes(req, res, 'comment'));

likeRouter.post('/add', middleware.checkToken, likeHandler.addLike);

likeRouter.post('/remove', middleware.checkToken, likeHandler.removeLike);

module.exports = likeRouter;