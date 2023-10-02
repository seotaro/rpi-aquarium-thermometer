import { useState, useEffect, useRef } from 'react';

// key: [ms]
export const SPANS = {
  "900000": "15分間",
  "1800000": "30分間",
  "3600000": "1時間",
  "7200000": "2時間",
  "21600000": "6時間",
  "43200000": "12時間",
  "86400000": "24時間",
};

export const SENSORS = {
  'temperature': { table: 'temperature', name: '温度', unit: '℃', range: { min: 10.0, max: 40.0 } },
};

export const useSocketService = () => {
  const [sensor, setSensor] = useState(Object.keys(SENSORS)[0]);
  const [span, setSpan] = useState(Object.keys(SPANS)[0]);
  const [values, setValues] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // のイベント内で参照するのに ref を使う
  const valuesRef = useRef(null);
  const spanRef = useRef(null);
  valuesRef.current = values;
  spanRef.current = span;

  // 時間範囲内のものだけ返す。
  // span: [ms]
  const normalizeInterval = (src, span) => {
    const dest = {};
    const now = (new Date()).getTime();

    Object.keys(src).forEach(x => {
      const device = src[x];
      dest[x] = {};
      Object.keys(device)
        .filter(t => ((now - span) < Number(t)))
        .forEach(t => {
          dest[x][t] = device[t];
        });
    });

    return dest;
  }

  useEffect(() => {
    const removeListener = window.electronAPI.handleUpdateSensorValues((event, records) => {
      if (!valuesRef.current) return;
      if (!spanRef.current) return;

      console.log('main → renderer', event, records);

      // 後ろに追加していく
      const values = valuesRef.current;
      records.forEach(record => {
        if (!values[record.device]) {
          values[record.device] = {};
        }
        values[record.device][record.datetime.getTime()] = record.values[sensor];
      });

      const normalized = normalizeInterval(values, spanRef.current);
      setValues(normalized);
      setLastUpdated(new Date());
    });

    return () => {
      removeListener();
    };
  }, []);

  const initialize = (sensor, span) => {
    console.log('initialize', sensor, span);
    setValues(null);
    setSensor(sensor);
    setSpan(span);

    window.electronAPI.loadSensorValues(span / 1000.0)
      .then((values) => {
        console.log('loadSensorValues');
        setValues(values);
      })
  }

  return [values, lastUpdated, initialize];
}
