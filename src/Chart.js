import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import HighchartMore from 'highcharts/highcharts-more';

HighchartMore(Highcharts);
Highcharts.setOptions({
  global: { useUTC: false },
  colors: ["#7cb5ec", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"]
});

// グラフ
export const Chart = ({ values, devices, sensor, range }) => {
  const series = (() => {
    if (!values) return [];

    return Object.keys(values).map(deviceId => {
      const valuesByDevice = values[deviceId];
      const data = Object.keys(valuesByDevice).map(t => [Number(t), valuesByDevice[t]]);

      return {
        type: 'line',
        name: devices[deviceId] ? devices[deviceId] : deviceId,
        data,
        tooltip: {
          headerFormat: '{series.name}<br>',
          pointFormat: `{point.x:%Y/%m/%d %H:%M:%S} <b>{point.y:.2f}[${sensor.unit}]`
        },
      }
    });
  })();

  const options = {
    series: series,
    title: {
      text: '',
    },
    chart: {
      zoomType: 'x',
    },
    xAxis: {
      title: {
        text: '時刻'
      },
      type: 'datetime',
      dateTimeLabelFormats: {
        millisecond: '%H:%M:%S',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%m/%d',
        week: '%m/%d',
        month: '%Y/%m',
        year: '%Y',
      },
    },
    yAxis: {
      title: { text: `${sensor.name} [${sensor.unit}]` },
      opposite: true,
      offset: 0,
      min: range.lower,
      max: range.upper,
    },

    exporting: {
      enabled: false
    },
    plotOptions: {
      series: {
        animation: false,
        marker: {
          enabled: false,
        }
      },
      area: {
        fillColor: false,
        lineWidth: 1,
        threshold: null
      }
    },
    scrollbar: {
      enabled: true
    },
    navigator: {
      enabled: true
    },
    rangeSelector: {
      enabled: true
    },
    legend: {
      enabled: true
    },
  }

  return (
    <HighchartsReact
      containerProps={{ style: { height: "100%" } }}
      allowChartUpdate={true}
      highcharts={Highcharts}
      options={options}
    />
  )
}
