# rpi-aquarium-thermometer

アクアリウム用の水温ロガー。計測とグラフ表示を行う。

- Raspberry Pi
- 1-Wire インターフェイスの複数センサー
- Electron + React + Sqlite
- ローカルデータベース

## センサー

1-Wire インターフェイスの DS18B20 が精度も良く手軽に使え、水中用途に加工されたものが安価に入手できるのでおすすめ。

![image](https://github.com/seotaro/rpi-aquarium-thermometer/assets/46148606/6b31e91b-24c5-42be-8f83-0be1be4eddaf)

センサーとラズパイは次のように接続する。センサー側コードの色は要確認のこと。複数のセンサーがある場合は並列に接続していく。DQ はプルアップ抵抗 4.7[kΩ]を接続する。

| センサー  |    ラズパイ     |
| --------- | --------------- |
| VDD（赤） | 3V3 or 5V power |
| DQ （黄） | GPIO 4          |
| GND（黒） | Ground          |

[GPIO and the 40-pin Header](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html)

## Raspberry Pi のセットアップ

Raspberry Pi OS with desktop をセットアップする.

※ ここでは 'pi' ユーザーであるものとして進めていく。

![image](https://github.com/seotaro/rpi-aquarium-thermometer/assets/46148606/8dcb66fd-17d6-46c5-b309-436bd1638f3c)

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
make setup-1-wire
```

リブートして、1-Wire デバイスを確認する。
名称が'28-xxxxxxxxxxxx'形式のフォルダーが接続されたデバイスで、デバイスの数だけある。

```bash
ls /sys/bus/w1/devices/
```

## 実行

※ コマンドはデスクトップモードで実行する.

```bash
cd {'rpi-aquarium-thermometer'}
yarn start
```

## ラズパイ起動で実行

※ コマンドはデスクトップモードで実行する.

ビルドする。

```bash
cd {'rpi-aquarium-thermometer'}
yarn build
mv dist/rpi-aquarium-thermometer-0.1.0-armv7l.AppImage /home/pi
```

ラズパイ起動時に自動で実行されるよう設定する。

```bash
make setup-autostart
```

リブートする。
