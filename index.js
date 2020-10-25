// const Sequelize = require('sequelize');
const express = require('express');
const { sequelize } = require('./models');

const app = express();
const APP_PORT = 3000;

app.use('/health-check', async (req, res) => {
    res.json({
        message: new Date(),
    });
});

app.listen(APP_PORT, () => {
    console.log(`app is listening on port ${APP_PORT}`);
})
