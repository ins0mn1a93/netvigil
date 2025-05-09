<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import "echarts";
import "echarts-gl";
import VChart from "vue-echarts";
import { dayjs, ElStatistic } from "element-plus";

const stats = ref<any[]>([]);
const sevenDayThreatPieChart = ref<{ name: string; value: number }[]>([]);
const geoLocationFrequency = ref<
  Array<{
    name: string;
    longitude: number;
    latitude: number;
    count: number;
  }>
>([]);
const ticFrequency = ref<Record<string, number>>({});
const suspiciousAboveFrequency = ref<Record<number, number>>({});

const time = ref(dayjs());

const mainOption = computed(() => {
  const beijingCoord = [116.4074, 39.9042];

  const linesData = geoLocationFrequency.value.map((location) => {
    const targetCoord = [location.longitude, location.latitude];
    return {
      coords: [targetCoord, beijingCoord],
      value: location.count,
      lineStyle: {
        width: Math.min(Math.log(location.count), 10),
        opacity: 1,
      },
    };
  });

  return {
    dataset: {
      source: stats.value,
    },
    color: ["#5470c6", "#91cc75", "#73c0de", "#fac858", "#ee6666"],
    legend: {},
    series: [
      {
        type: "lines3D",
        coordinateSystem: "globe",
        blendMode: "lighter",
        effect: {
          show: true,
          period: 3,
        },
        data: linesData,
      },
    ],
    globe: {
      baseTexture: "/assets/earth.webp",
      heightTexture: "/assets/height.webp",
      // environment: '/assets/starfield.webp',
      top: "10%",
      globeRadius: 60,
      displacementScale: 0.1,
      shading: "lambert",
      layers: [
        {
          type: "blend",
          blendTo: "emission",
          texture: "/assets/night.webp",
        },
        {
          type: "overlay",
          texture: "/assets/clouds.webp",
          shading: "lambert",
          distance: 5,
        },
      ],
    },
  };
});

onMounted(async () => {
  try {
    const response = await fetch("/api/stats");
    if (!response.ok) {
      throw new Error("Failed to fetch stats data");
    }
    const data = await response.json();

    sevenDayThreatPieChart.value = data.sevenDayThreatPieChart;
    geoLocationFrequency.value = data.geoLocationFrequency;
    ticFrequency.value = data.ticFrequency;
    suspiciousAboveFrequency.value = data.suspiciousAboveFrequency;
  } catch (error) {
    console.error("Error fetching stats data:", error);
  }

  setInterval(() => {
    time.value = dayjs();
  }, 1000);
});

// 近七日威胁度
const sevenDaysThreatOption = computed(() => {
  return {
    color: ["#5470c6", "#91cc75", "#73c0de", "#fac858", "#ee6666"],
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    series: [
      {
        name: "近七日威胁度",
        type: "pie",
        radius: "55%",
        center: ["50%", "50%"],
        data: sevenDayThreatPieChart.value, // 绑定后端数据
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});

// 情报来源占比
const ticProportionOption = computed(() => {
  const data = Object.keys(ticFrequency.value).map((key) => {
    const value = ticFrequency.value[key];
    return {
      name: key,
      value: value,
    };
  });

  return {
    color: ["#5470c6", "#91cc75", "#73c0de", "#fac858", "#ee6666"],
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    series: [
      {
        name: "情报来源占比",
        type: "pie",
        radius: "55%",
        center: ["50%", "50%"],
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
});

const apiTrendOption = computed(() => {
  return {
    dataset: {
      source: stats.value,
    },
    tooltip: {},
    xAxis: {
      type: "category",
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "line",
      },
    ],
  };
});

// 可疑及以上威胁度的频率
const threatFrequencyOption = computed(() => {
  const sortedData = Object.entries(suspiciousAboveFrequency.value)
    .map(([timeStr, value]) => ({
      time: dayjs(parseInt(timeStr) * 1000).format("YYYY-MM-DD"),
      suspiciousAboveFrequency: value,
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return {
    dataset: {
      source: sortedData,
    },
    color: ["#73c0de", "#fac858", "#ee6666"],
    tooltip: {},
    xAxis: { type: "category" },
    yAxis: { type: "value" },
    series: [
      {
        type: "bar",
        encode: { x: "time", y: "suspiciousAboveFrequency" },
      },
    ],
  };
});

// 地理位置排名
const geoRankOption = computed(() => {
  const geoData = geoLocationFrequency.value
    .sort((a, b) => a.count - b.count)
    .map((item) => [item.name, item.count]);

  return {
    dataset: {
      source: [["地理位置", "频率"], ...geoData],
    },
    color: ["#91cc75"],
    tooltip: {},
    xAxis: { type: "category" },
    yAxis: { type: "value" },
    series: [
      {
        type: "bar",
        encode: { x: 0, y: 1 },
      },
    ],
  };
});

// 威胁度走势
const threatTrendOption = computed(() => {
  return {
    dataset: {
      source: stats.value,
    },
    color: ["#5470c6"],
    tooltip: {},
    xAxis: { type: "category" },
    yAxis: { type: "value" },
    series: [
      {
        type: "line",
        encode: { x: 0, y: 8 }, // 使用趋势数据列
      },
    ],
  };
});
</script>

<template>
  <div class="panel">
    <VChart class="main-chart" :option="mainOption" theme="dark" autoresize />
    <div class="panel-title">
      <h2>全球威胁态势</h2>
    </div>
    <div class="panel-stats">
      <ElStatistic title="当前时间" :value="time" format />
    </div>
    <div class="subviews">
      <div class="subview-chart">
        <h3>近七日威胁度</h3>
        <VChart :option="sevenDaysThreatOption" theme="dark" autoresize />
      </div>
      <div class="subview-chart">
        <h3>情报来源占比</h3>
        <VChart :option="ticProportionOption" theme="dark" autoresize />
      </div>
      <div class="subview-chart">
        <h3>可疑威胁度频率</h3>
        <VChart :option="threatFrequencyOption" theme="dark" autoresize />
      </div>
      <div class="subview-chart">
        <h3>网络流量来源排名</h3>
        <VChart :option="geoRankOption" theme="dark" autoresize />
      </div>
      <div class="subview-chart">
        <h3>威胁度走势</h3>
        <VChart :option="threatTrendOption" theme="dark" autoresize />
      </div>
      <div class="subview-chart">
        <h3>API请求量走势</h3>
        <VChart :option="apiTrendOption" theme="dark" autoresize />
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  position: relative;
  height: 100vh;
}

.panel-title {
  position: absolute;
  top: 0;
  width: 100%;
  height: 10%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  user-select: none;
}

.panel-title h2 {
  font-size: 1.5rem;
}

.panel-stats {
  position: absolute;
  top: 10%;
  left: 28%;
  right: 28%;
  height: 100px;
  margin: 0 10px;
  padding: 10px;
  color: gold;
  border: #4992f14d 1px solid;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.el-statistic {
  text-align: center;

  --el-statistic-title-color: white;
  --el-statistic-content-color: white;
}

.main-chart {
  position: absolute;
  top: 0;
  height: 100%;
}

.subviews {
  position: absolute;
  top: 10%;
  width: 100%;
  height: 90%;
  display: grid;
  grid-template-columns: repeat(2, 28%);
  grid-template-rows: repeat(3, 30%);
  justify-content: space-between;
  gap: 20px;
  pointer-events: none;
}

.subview-chart {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-image: radial-gradient(#4482c99c, transparent);
  border: #4992f14d 1px solid;
  pointer-events: auto;
}

.subview-chart h3 {
  margin: 0;
  padding: 10px 0;
  color: white;
  text-shadow: 0 1px 2px black;
  font-size: 16px;
  text-align: center;
  font-weight: normal;
  user-select: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
}

table th,
table td {
  padding: 8px 12px;
  text-align: center;
  border: 1px solid #ddd;
}

table th {
  background-color: #2a2a2a;
  color: white;
}

table td {
  background-color: #333;
  color: white;
}

table tr:nth-child(even) {
  background-color: #444;
}
</style>
