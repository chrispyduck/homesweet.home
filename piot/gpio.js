"use strict";

var gpio;
if (process.arch == 'arm')
    gpio = require('pi-gpio');
else
    gpio = {
        open: function (pin, callback) { callback(); },
        close: function (pin, direction, callback) { callback(); },
        read: function (pin, callback) { callback(null, true); }
    };

var winston = require('winston');
var Step = require('step');

var state = {};
var getConfiguredPin = function (thing, callback) {
    var configured = state[thing.gpioPin];
    
    // if we need to reconfigure the pin, close it first
    if (configured && configured != thing.gpioDirection) {
        winston.log('info', 'closing gpio pin %s due to reconfiguration', thing.gpioPin);
        gpio.close(thing.gpioPin, function (error) {
            state[thing.gpioPin] = false;
            getConfiguredPin(thing, callback);
        })
        return;
    }
    
    // if the pin isn't open, open it
    if (!configured) {
        winston.log('info', 'opening gpio pin %s as "%s"', thing.gpioPin, thing.gpioDirection);
        gpio.open(thing.gpioPin, thing.gpioDirection, function (error) {
            if (!error)
                state[thing.gpioPin] = thing.gpioDirection;
            else
                state[thing.gpioPin] = false;
            callback(error);
        });
    }
    else
        callback(null);
};

exports.queryValue = function (thing, callback) {
    Step(
        Step.fn(getConfiguredPin, thing, this),
        function (error) {
            if (error)
                callback('Error opening GPIO pin: ' + error);
            gpio.read(thing.gpioPin, this);
        },
        function (error, value) {
            if (error)
                callback('Error reading GPIO value: ' + error);
            thing.currentValue = value;
            callback(null);
        }
    );
};


