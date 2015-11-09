"use strict";

var winston = require('winston');
winston.log('info', 'Application starting...');

var Q = require('q');
Q.longStackSupport = true;

var express = require('express');
var app = express();
app.use(require('morgan')('combined'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function (req, res) {
	res.json([
		'/things',
		'/things/:id'
	]);
});

var things = require('./api/things.js');
app.get('/things', things.getAll);
app.put('/things', things.putOne);
app.get('/things/:id', things.getOne);
app.post('/things/:id', things.updateOne);

var errorHandlers = require('./api/errorHandlers.js');
app.use(errorHandlers.notFound);
app.use(errorHandlers.std);

module.exports = app;

winston.log('info', 'Application started');