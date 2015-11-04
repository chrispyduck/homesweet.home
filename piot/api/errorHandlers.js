"use strict";

var winston = require('winston');

exports.std = function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
    winston.log('error', 'Error returned to user', err);
};

exports.notFound = function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
    winston.log('error', 'Page not found', req);
};