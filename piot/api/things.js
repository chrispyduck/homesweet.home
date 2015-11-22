"use strict";

var Thing = require('../model/Thing.js');
var errorHandlers = require('./errorHandlers.js');
var gpio = require('../gpio.js');
var winston = require('winston');

exports.getAll = function (req, res) {
    Thing.findAll().then(function (results) {
        res.status(200).json(results);
    }, function (error) { errorHandlers.std(error, req, res); });
};

exports.getOne = function (req, res) {
    if (req.params.id == null) {
        errorHandlers.badRequest('The "ID" parameter is required', res);
        return;
    }
    winston.log('getOne("%s")', req.params.id);
    var err = function (e) {
        errorHandlers.std(e, req, res);
    };
    var thing, pin;
    Thing.findById(req.params.id)
    .then(function (t) {
        if (t == null)
            throw new Error("The specified thing was not found");
        thing = t.dataValues;
        return gpio.fromThing(thing);
    }).then(function (p) {
        pin = p;
        return pin.getValue();
    }).then(function (v) {
        thing.currentValue = v;
        res.status(200).json(thing);
    }).catch(function (error) {
        errorHandlers.std(error, req, res);
    }).done();
};

exports.putOne = function (req, res) {
    Thing.create(req.body).then(function (result) {
        res.json(result);
    }, function (error) { errorHandlers.std(error, req, res); });
};

exports.deleteOne = function (req, res) {
    if (req.params.id == null) {
        errorHandlers.badRequest('The "ID" parameter is required', res);
        return;
    }

    Thing.findById(req.params.id)
    .then(function (thing) {
        if (!thing)
            errorHandlers.notFound(req, res);
        else
            return thing.destroy();
    }).then(function () {
        res.status(200).json('ok');
    }).catch(function (error) {
        errorHandlers.std(error, req, res);
    });
};

var updateOneSetValue = function (req, res, thing, value) {
    gpio.fromThing(thing)
    .then(function (pin) {
        return pin.setValue(value);
    }).then(function () {
        res.status(200).json('ok');
    }).catch(function (error) {
        errorHandlers.std(error, req, res);
    })
};

exports.updateOne = function (req, res) {
    if (req.params.id == null) {
        errorHandlers.badRequest('The "ID" parameter is required', res);
        return;
    }

    var operation = typeof req.body.operation !== "undefined" ? req.body.operation : req.params.operation;
    var value = typeof req.body.value !== "undefined" ? req.body.value : req.params.value;
    
    Thing.findById(req.params.id)
    .then(function (thing) {
        if (!thing)
            errorHandlers.notFound(req, res);
        else {
            if (operation == 'set') {
                if (value == 'true')
                    value = true;
                else if (value == 'false')
                    value = false;

                if (typeof value === 'boolean')
                    updateOneSetValue(req, res, thing, value);
                else
                    errorHandlers.badRequest('The "value" parameter was invalid or missing', res);
            }
            else
                errorHandlers.badRequest('The specified operation "' + operation + '" is invalid or unsupported', res);
        }
    }).catch(function (error) {
        errorHandlers.std(error, req, res);
    });
};

exports.configureOne = function (req, res) {
    if (req.params.id == null) {
        errorHandlers.badRequest('The "ID" parameter is required', res);
        return;
    }
    
    var thing;
    Thing.findById(req.params.id)
    .then(function (t) {
        if (t == null)
            throw new Error("The specified thing was not found");
        thing = t;

        if (req.body.name)
            thing.name = req.body.name;
        if (req.body.type)
            thing.type = req.body.type;
        if (req.body.gpioDirection)
            thing.gpioDirection = req.body.gpioDirection;
        if (req.body.gpioPin)
            thing.gpioPin = req.body.gpioPin;
        return thing.save();
    })
    .then(function() {
        res.status(200).json(thing);
    })
    .catch(function (e) {
        errorHandlers.std(error, req, res);        
    });
};
