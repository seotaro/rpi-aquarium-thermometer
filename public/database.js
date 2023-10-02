'use strict';

require('dotenv').config();
const { app } = require('electron');

const sqlite3 = require("sqlite3");

const path = require('path');
const databasePath = path.join(app.getPath('userData'), 'database.db')
console.log('database path', databasePath);
const db = new sqlite3.Database(databasePath);

// データベース クライアント
module.exports = class database {
  constructor(props) {
  }

  // 初期化する。
  initialize() {
    console.log('database initialize');
    db.run(`CREATE TABLE IF NOT EXISTS temperature(id INTEGER PRIMARY KEY AUTOINCREMENT, device TEXT, value REAL, datetime TEXT)`);
  }

  insert(records) {
    const stmt = db.prepare('INSERT INTO temperature (datetime, device, value) VALUES (?, ?, ?)');

    records.forEach(record => {
      const datetime = record.datetime;
      const device = record.device;
      Object.keys(record.values).forEach(type => {
        if (type !== 'temperature') {
          throw new Error(`Invalid type='${type}'`);
        }

        const value = record.values[type];
        stmt.run(datetime.toISOString(), device, value);
      })
    })
  }

  // 経過秒よりも新しいレコードを返す。
  // span: [sec]
  select(span) {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM temperature WHERE datetime(datetime) > datetime("now", ?)`, `${span * -1} seconds`, (error, rows) => {
        if (error) {
          reject(error);
        } else {
          const values = {};
          rows.forEach(row => {
            if (!values[row.device]) {
              values[row.device] = {};
            }
            const t = (new Date(row.datetime)).getTime();
            values[row.device][t] = row.value;
          });
          resolve(values);
        }
      });
    });
  };

  // 経過秒よりも古いレコードを削除する。
  // span: [sec] 
  delete(span) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM temperature WHERE datetime(datetime) < datetime("now", ?)`, `${span * -1} seconds`, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };
}
