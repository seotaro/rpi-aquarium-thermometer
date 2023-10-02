'use strict';

const os = require('os');
const sensor = require('ds18b20-raspi');

exports.name = () => 'DS18B20';

exports.initialize = () => {
    return new Promise(function (resolve, reject) {
        resolve();
    })
}

exports.read = () => {
    return new Promise(function (resolve, reject) {
        sensor.readAllC((err, temps) => {
            if (err) {
                reject(err);
            } else {
                resolve(temps);
            }
        });
    })
        .then(res => {
            const datetime = new Date();

            const records = [];
            for (const device of res) {
                const record = {
                    datetime,
                    device: device.id,
                    values: { temperature: device.t }
                };
                records.push(record);
            }
            return records;
        });
};
