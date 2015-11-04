var Sequelize = require('sequelize');
module.exports = new Sequelize(null, null, null, {
    dialect: 'sqlite',
    storage: 'db.sqlite'
});