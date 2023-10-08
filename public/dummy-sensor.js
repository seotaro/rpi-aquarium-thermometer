'use strict';

// ランダム値を返すダミーのセンサー

exports.name = () => 'Dummy';

exports.initialize = () => {
    return new Promise(function (resolve, reject) {
        resolve();
    })
}

exports.read = () => {
    return new Promise(function (resolve, reject) {
        const datetime = new Date();

        const DEVICES = [
            'dymmy-0001',
            'dymmy-0002',
            'dymmy-0003',
        ];

        const MIN = 20.0;
        const MAX = 30.0;

        const records = [];
        DEVICES.forEach(device => {
            const record = {
                datetime,
                device,
                values: { temperature: Math.random() * (MAX - MIN) + MIN }
            };
            records.push(record);
        });

        resolve(records);
    });
};
