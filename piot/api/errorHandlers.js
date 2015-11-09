"use strict";

var winston = require('winston');

var writeFullError = function (err, res) {
    res.status(err.status).json({
        message: err.message,
        stack: err.stack
    });
    winston.log('error', 'Error returned to user', err);
};

exports.std = function (err, req, res, next) {
    if (!err)
        return;
    if (!err.status)
        err.status = 500;
    writeFullError(err, res);    
};

exports.notFound = function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    if (next)
        next(err);
    else
        writeFullError(err, res);
};

exports.badRequest = function (message, res) {
    if (res == null)
        throw new Error('Required function parameter "res" not provided');
    if (message == null)
        throw new Error('Required function parameter "message" not provided');
    var err = new Error(message);
    err.status = 400;
    writeFullError(err, res);
}