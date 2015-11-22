"use strict";
var Q = require('q');

var gpio;
if (process.arch == 'arm')
    gpio = require('pi-gpio-promise');
else {
    gpio = {
        open: function () { return Q(0); },
        close: function () { return Q(0); },
        read: function () { return Q(true); },
        write: function () { return Q(0); }
    };
}

var winston = require('winston');


function PinManager() {
    var pins = {};

    var fromThingSync = function (thing) {
        var pin = pins[thing.id];
        if (!pin) {
            pin = new Pin(thing.gpioPin, thing.gpioDirection);
            pins[thing.id] = pin;
            return pin
                .open()
                .then(function() { return pin; });
        } else if (pin.id != thing.gpioPin || pin.direction != thing.gpioDirection) {
            winston.log('info', 'reopening gpio pin %s due to reconfiguration', thing.gpioPin);
            return pin
                .reopen()
                .then(function() { return pin; });
        }
        return Q.when(pin);
    };

    this.fromThing = function (thing) {
        return Q.fcall(fromThingSync, thing);
    };

    this.closeAll = function () {
        for (var pin in pins) {
            pins[pin].close();
        }
    };
};
var pinManager = new PinManager();
module.exports = pinManager;

var Pin = function (id, direction) {
    this.id = parseInt(id, 10);
    this.direction = direction;
    this.isOpen = false;
    
    var X = this;

    this.open = function () {
        winston.log('info', 'opening gpio pin %d as "%s"', X.id, X.direction);
        X.isOpen = true;
        return gpio.open(X.id, X.direction);
    };
    this.close = function () {
        winston.log('info', 'closing gpio pin %d', X.id, X.direction);
        X.isOpen = false;
        return gpio.close(X.id);
    };
    this.reopen = function () {
        return X.close().then(X.open);
    };
    this.getValue = function () {
        if (!X.isOpen)
            X.open();
	winston.log('info', 'reading value of gpio pin %d', X.id);
        return gpio.read(X.id);
    };
    this.setValue = function (value) {
        if (!X.isOpen)
            X.open();
	winston.log('info', 'writing value of gpio pin %d = %s', X.id, value);
        return gpio.write(X.id, value);
    };
};

process.on('exit', function() { 
    pinManager.closeAll();
});
