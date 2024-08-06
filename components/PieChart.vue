<template>
  <div v-if="chartData.labels.length" class="w-full h-64">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  entries: {
    type: Array,
    default: () => []
  }
})

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const chartData = computed(() => {
  const expensesByCategory = {}
  if (props.entries && props.entries.length > 0) {
    props.entries.forEach(entry => {
      if (entry.type === 'expense') {
        expensesByCategory[entry.category] = (expensesByCategory[entry.category] || 0) + Math.abs(entry.amount)
      }
    })
  }

  const labels = Object.keys(expensesByCategory);
  const data = Object.values(expensesByCategory);
  const backgroundColor = labels.map(() => getRandomColor());

  return {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: backgroundColor
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed !== undefined) {
            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
          }
          return label;
        }
      }
    }
  }
}
</script>