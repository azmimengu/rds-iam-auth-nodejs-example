'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const AWS = require('aws-sdk');
const mysql = require('mysql2');

let sequelize;

const region = config.aws_region;
const hostname = config.host;
const port = config.port;
const username = config.username;
const database = config.database;

const signer = new AWS.RDS.Signer();
signer.getAuthToken({
  region,
  hostname,
  port,
  username,
}, (err, token) => {
  sequelize = new Sequelize({
    host: hostname,
    database,
    username,
    password: token,
    port,
    dialect: 'mysql',
    dialectOptions: {
      connectTimeout: 5000,
      ssl: 'Amazon RDS',
      authPlugins: {
        mysql_clear_password: () => () => {
          return signer.getAuthToken({
            region,
            hostname,
            port,
            username
          });
        }
      },
    },
  });

  sequelize.authenticate().then(() => {
    console.log('DB is authenticated!');
  }).catch((err) => {
      console.log('DB is cannot authenticated!', err);
  });
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
