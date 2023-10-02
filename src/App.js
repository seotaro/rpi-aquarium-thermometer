import { useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import moment from 'moment';

import { Chart } from './Chart';
import { SPANS, SENSORS, useSocketService } from './service';

const SENSOR = 'temperature';
const SPAN = '3600000'; // 1 hour
const TICKS = [10, 15, 20, 25, 30, 35].map(v => ({ value: v, label: `${v}` }));  // スライダーの温度目盛り [℃]

function App() {
  const [values, lastUpdated, initialize] = useSocketService();
  const [span, setSpan] = useState(SPAN);
  const [range, setRange] = useState({ lower: 20, upper: 30 });
  const [devices, setDevices] = useState(null);
  const sensor = SENSOR;

  useEffect(() => {
    window.electronAPI.getDeviceConfig()
      .then(devices => {
        setDevices(devices);
      })
      .catch(err => {
        console.error(`getDeviceConfig error: ${err}`);
      });
  }, []);

  useEffect(() => {
    initialize(sensor, span);
  }, [sensor, span]);

  const onChangeRange = (event, newValue, activeThumb) => {
    const LOWER_THUMB = 0;
    const UPPER_THUMB = 1;
    const MIN_RANGE = 2;  // 最小レンジ [℃]

    let lower = newValue[0];
    let upper = newValue[1];
    switch (activeThumb) {
      case LOWER_THUMB:
        if (MIN_RANGE < (upper - lower)) {

        } else {
          lower = upper - MIN_RANGE;
        }
        break;

      case UPPER_THUMB:
        if (MIN_RANGE < (upper - lower)) {

        } else {
          upper = lower + MIN_RANGE;
        }
        break;
    }

    setRange({ lower, upper });
  };

  return (
    <Box sx={{ width: '100vw', height: '100vh' }}>
      <Grid sx={{ height: 60 }} container justify={'flex-start'} rowSpacing={0} columnSpacing={{ xs: 0 }} alignItems="center">
        <Grid item xs={'auto'}>
          <FormControl variant="standard" sx={{ m: 2, minWidth: 80 }}>
            <Select
              labelId="select-span-label"
              id="select-span"
              value={span}
              label="時間"
              autoWidth
              onChange={e => setSpan(e.target.value)}
            >
              {Object.keys(SPANS).map((k, i) => {
                return (<MenuItem key={i} value={k}>{SPANS[k]}</MenuItem>)
              })}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} >
          <Slider
            sx={{ mx: 2 }}
            value={[range.lower, range.upper]}
            onChange={onChangeRange}
            min={TICKS[0].value}
            max={TICKS[TICKS.length - 1].value}
            step={1}
            marks={TICKS}
            aria-labelledby="level-range-slider"
            valueLabelDisplay="off"
            disableSwap
          />
        </Grid>
      </Grid>

      <LastUpdated lastUpdated={lastUpdated} />

      <Box sx={{ width: '100%', height: 'calc(100% - 60px)' }}>
        <Chart
          values={values}
          devices={devices}
          sensor={SENSORS[sensor]}
          range={range}
        />
      </Box>
    </Box>
  );
}

export default App;

// 更新時刻
const LastUpdated = ({ lastUpdated }) => {
  return (
    <Box style={{ position: "absolute", top: 0, right: 5, }}>
      <Typography variant="subtitle1" sx={{ color: 'grey' }} >
        {lastUpdated ? `last update: ${moment(lastUpdated).format("YYYY-MM-DD HH:mm:ss")}` : null}
      </Typography>
    </Box>
  )
}