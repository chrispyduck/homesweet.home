"use strict";

var Thing = require('../model/Thing.js');
var errorHandlers = require('./errorHandlers.js');
var gpio = require('../gpio.js');
var Step = require('step');

exports.getAll = function (req, res) {
    Thing.findAll().then(function (results) {
        res.status(200).json(results);
    }, function (error) { errorHandlers.std(error, req, res); });
};

exports.getOne = function (req, res) {
    if (req.params.id == null) {
        res.status(400).json('error', { message: 'ID is required' });
        return;
    }
    Step(
        Step.fn(Thing._getOne, req.params.id),
        function (error, results) {
            if (error)
                errorHandlers.std({
                    status: 500,
                    message: error
                }, req, res);
            else
                gpio.queryValue(results, this);
        },
        function (error, results) {
            if (error)
                errorHandlers.std({
                    status: 500,
                    message: error
                }, req, res);
            else
                res.status(200).json(results);
        }
    );
};

exports.putOne = function (req, res) {
    Thing.create(req.body).then(function (result) {
        res.json(result);
    }, function (error) { errorHandlers.std(error, req, res); });
};

exports.updateOne = function (req, res) {
    Thing.findById(req.params.id).then(function (result) {
        var thing = result;

    }, function (error) { errorHandlers.std(error, req, res); });
};