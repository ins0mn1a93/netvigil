<script setup lang="tsx">
import { ElAutoResizer, ElTableV2, ElTooltip } from 'element-plus'
import { netstats } from '../utils'
import { computed } from 'vue'
import dayjs from 'dayjs'

// const netstats = ref([])
const columns = [{
  key: 'id',
  title: 'ID',
  dataKey: 'id',
  width: 100
}, {
  key: 'time',
  title: '记录时间',
  dataKey: 'time',
  width: 200
}, {
  key: 'src',
  title: '本地地址',
  dataKey: 'src',
  width: 200
}, {
  key: 'dst',
  title: '远程地址',
  dataKey: 'dst',
  width: 200
}, {
  key: 'location',
  title: '位置',
  dataKey: 'location',
  width: 300
}, {
  key: 'executable',
  title: '发起程序',
  dataKey: 'executable',
  width: 300,
  cellRenderer: ({ cellData: executable }: { cellData: string }) => {
    const match = executable.match(/([^\\\/]+)$/)
    return <ElTooltip content={executable}>{match ? match[0] : executable}</ElTooltip>
  }
}]

const data = computed(() => netstats.value.map(n => {
  return {
    ...n,
    time: n.time ? dayjs(n.time).format('YYYY-MM-DD HH:mm:ss') : '未知时间',
    src: n.srcIP && n.srcPort ? `${n.srcIP}:${n.srcPort}` : '未知地址',
    dst: n.dstIP && n.dstPort ? `${n.dstIP}:${n.dstPort}` : '未知地址',
    location: n.location || '未知位置',
    executable: n.executable || '未知程序'
  }
}))
</script>

<template>
  <ElAutoResizer>
    <template #default="{ height, width }">
      <ElTableV2 :columns :data="data || []" :height :width />
    </template>
  </ElAutoResizer>
</template>