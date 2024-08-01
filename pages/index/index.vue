<!-- App.vue -->
<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Finance Tracker</h1>

    <!-- File upload -->
    <input type="file" @change="handleFileUpload" accept=".csv,.xlsx,.xls" class="mb-4" />

    <!-- Summary -->
    <div v-if="totalIncome !== null && totalExpense !== null" class="mb-4">
      <p>Total Income: ${{ totalIncome.toFixed(2) }}</p>
      <p>Total Expense: ${{ totalExpense.toFixed(2) }}</p>
    </div>

    <!-- Pie Chart -->
    <div v-if="chartData.labels.length" class="w-full h-64">
      <Pie :data="chartData" :options="chartOptions" />
    </div>

    <!-- Timeline Table -->
    <table v-if="entries.length" class="w-full mb-4">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in sortedEntries" :key="entry.id">
          <td>{{ entry.date }}</td>
          <td>{{ entry.description }}</td>
          <td>{{ entry.amount.toFixed(2) }}</td>
          <td>{{ entry.type }}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFinanceStore } from '~/store/finance'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const financeStore = useFinanceStore()
const { entries, totalIncome, totalExpense } = storeToRefs(financeStore)

const sortedEntries = computed(() => {
  return [...entries.value].sort((a, b) => new Date(a.date) - new Date(b.date))
})

const chartData = computed(() => {
  const expensesByCategory = {}
  entries.value.forEach(entry => {
    if (entry.type === 'expense') {
      expensesByCategory[entry.category] = (expensesByCategory[entry.category] || 0) + entry.amount
    }
  })

  return {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    await financeStore.processFile(file)
  }
}
</script>