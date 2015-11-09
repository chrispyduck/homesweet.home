"use strict";

var Sequelize = require('sequelize');
var model = require('./model.js');

var Thing = model.define('Thing', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    type: {
        type: Sequelize.ENUM,
        values: ['GPIO'],
        allowNull: false
    },
    gpioDirection: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    gpioPin: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});
Thing._getOne = function (id, callback) {
    Thing.findById(id).then(
        function (results) { callback(null, results); },
        function (error) { callback(error); });
};
Thing.sync();

module.exports = Thing;