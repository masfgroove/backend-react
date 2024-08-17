const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('railway', 'postgres', 'YMDCapmVxXCQYnKrtyhSOpRddhwJSWml', {
  host: 'monorail.proxy.rlwy.net',
  port: 28308,
  dialect: 'postgres',
});

module.exports = sequelize;
