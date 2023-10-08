# rpi-aquarium-thermometer

アクアリウム用の水温ロガー。計測とグラフ表示を行う。

- Raspberry Pi
- 1-Wire インターフェイスの複数センサー
- Electron + React + Sqlite
- ローカルデータベース

<img width="50%" src="https://github.com/seotaro/rpi-aquarium-thermometer/assets/46148606/61ef6065-8a79-4e20-ab30-1cba1e4fd7ce"/>

## センサー

1-Wire インターフェイスの DS18B20 が手軽に精度良く使え、水中用途に加工されたものが安価に入手できるのでおすすめ。

<img width="50%" src="https://github.com/seotaro/rpi-aquarium-thermometer/assets/46148606/8c4c2781-dd82-425f-8f91-0d6ef2453f3e"/>

センサーとラズパイは次のように接続する。センサー側コードの色は要確認のこと。複数のセンサーがある場合は並列に接続していく。DQ にはプルアップ抵抗 4.7[kΩ]を接続する。

|       センサー       |    ラズパイ     |
| -------------------- | --------------- |
| V<sub>DD</sub>（赤） | 3V3 or 5V power |
| DQ （黄）            | GPIO 4          |
| GND（黒）            | Ground          |

### 【参考】

- [DS18B20 Datasheet](https://github.com/seotaro/rpi-aquarium-thermometer/files/12840952/2812.pdf)
- [GPIO and the 40-pin Header](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)

## Raspberry Pi のセットアップ

Raspberry Pi OS with desktop をセットアップする.
ここでは 'pi' ユーザーであるものとして進めていく。

<img width="50%" src="https://github.com/seotaro/rpi-aquarium-thermometer/assets/46148606/23678573-d958-4fd1-b8ab-7823ba4e57eb"/>

Github のリポジトリをローカルにコピーする。

```bash
git clone https://github.com/seotaro/rpi-aquarium-thermometer.git
cd rpi-aquarium-thermometer
```

Node.js をセットアップする。

```bash
make setup-node
```

1-Wire インターフェイスを有効にする。

```bash
make enable-1-wire
```

リブートして、1-Wire デバイスを確認する。
名称が`28-xxxxxxxxxxxx`形式のフォルダーが接続されたデバイスで、デバイスの数だけある。

```bash
ls /sys/bus/w1/devices/
```

## 実行

コマンドはデスクトップモードで実行する.

```bash
cd {'rpi-aquarium-thermometer'}
yarn
yarn start
```

### 各種ファイル

データベースファイル
`/home/pi/.config/rpi-aquarium-thermometer/database.db`

設定ファイル
`/home/pi/.config/rpi-aquarium-thermometer/config.json`

```json
{
    "READ_SENSOR_INTERVAL": 10000,          // センサーの読み取り間隔 [ms]
    "DELETE_DATABASE_INTERVAL": 3600000,    // データベースを削除する間隔 [ms]
    "DS18B20": "on",                        // DS18B20 を有効にする

    // センサー名称の定義例）
    "DEVICES": {
      "id": "name",
      "28-xxxxxxxxxxxx": "90cm tank",
      "28-yyyyyyyyyyyy": "45cm tank-1",
      "28-zzzzzzzzzzzz": "45cm tank-2"
    }
}
```

## ラズパイ起動で実行

ビルドする。

```bash
cd {'rpi-aquarium-thermometer'}
yarn
yarn build
mv dist/rpi-aquarium-thermometer-0.1.0-armv7l.AppImage /home/pi
```

ラズパイ起動時に自動で実行されるよう設定する。
ログは`/home/pi/.cache/lxsession/LXDE-pi/run.log`に出力される。

```bash
make enable-autostart
```

リブートする。

自動で実行しないようにするには下記を実行する。

```bash
make disable-autostart
```

## 他のマシンでビルドして実行

メモリが少ないモデル（Raspberry Pi 3A+ など）はメモリ不足でビルドができないことがある。スペックの高いラズパイでビルドして使用することができる。Electron なので Mac や Windows でクロスビルドできるはずなのだが、うまくいっていない。

Node.js のセットアップは不要であるが、1-Wire インターフェイスはあらかじめ有効にしておくこと。
ビルドした AppImage を実行するラズパイに保存して、下記のようにデスクトップモードで実行する。

```bash
chmod +x rpi-aquarium-thermometer-0.1.0-armv7l.AppImage
./rpi-aquarium-thermometer-0.1.0-armv7l.AppImage
```
