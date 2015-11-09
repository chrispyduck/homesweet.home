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
        var pin = pins[thing];
        if (!pin) {
            pin = new Pin(thing.gpioPin, thing.gpioDirection);
            pins[thing] = pin;
        } else if (pin.id != thing.gpioPin || pin.direction != thing.gpioDirection) {
            winston.log('info', 'reopening gpio pin %s due to reconfiguration', thing.gpioPin);
            return pin.reopen();
        }
        return pin;
    };

    this.fromThing = function (thing) {
        return Q.fcall(fromThingSync, thing);
    };
};
module.exports = new PinManager();

var Pin = function (id, direction) {
    this.id = id;
    this.direction = direction;
    
    var X = this;

    this.open = function () {
        winston.log('info', 'opening gpio pin %s as "%s"', X.id, X.direction);
        return gpio.open(X.id, X.direction);
    };
    this.close = function () {
        winston.log('info', 'closing gpio pin %s', X.id, X.direction);
        return gpio.close(X.id);
    };
    this.reopen = function () {
        return X.close().then(X.open);
    };
    this.getValue = function () {
        return gpio.read(X.id);
    };
    this.setValue = function (value) {
        return gpio.write(X.id, value);
    };

    this.open();
};