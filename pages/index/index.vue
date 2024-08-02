<!-- App.vue -->
<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Finance Tracker</h1>

    <!-- File upload -->
    <input type="file" @change="handleFileUpload" accept=".csv,.xlsx,.xls" class="mb-4" />

    <!-- Date range selection -->
    <div class="mb-4">
      <label for="start-date" class="mr-2">Start Date:</label>
      <input type="date" id="start-date" v-model="startDate" @change="updateDateRange" class="mr-4" />

      <label for="end-date" class="mr-2">End Date:</label>
      <input type="date" id="end-date" v-model="endDate" @change="updateDateRange" />
    </div>

    <!-- Category selection -->
    <div v-if="categories.length" class="mb-4">
      <label for="category-select" class="mr-2">Category:</label>
      <select id="category-select" v-model="selectedCategory" @change="filterByCategory" class="mr-4">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <!-- Summary -->
    <div v-if="filteredTotalIncome !== null && filteredTotalExpense !== null" class="mb-4">
      <p>Total Income: ${{ filteredTotalIncome.toFixed(2) }}</p>
      <p>Total Expense: ${{ filteredTotalExpense.toFixed(2) }}</p>
      <p class="font-bold">Net Income: ${{ netIncome.toFixed(2) }}</p>
    </div>
    <!-- Pie Chart -->
    <div v-if="chartData.labels.length" class="w-full h-64">
      <Pie :data="chartData" :options="chartOptions" />
    </div>

    <!-- Add New Entry Form -->
    <div class="mb-4 p-4 border rounded">
      <h2 class="text-xl font-bold mb-2">Add New Entry</h2>
      <form @submit.prevent="addNewEntry" class="space-y-2">
        <div>
          <label for="new-date" class="block">Date:</label>
          <input type="date" id="new-date" v-model="newEntry.date" required class="w-full p-1 border rounded">
        </div>
        <div>
          <label for="new-description" class="block">Description:</label>
          <input type="text" id="new-description" v-model="newEntry.description" required
            class="w-full p-1 border rounded">
        </div>
        <div>
          <label for="new-amount" class="block">Amount:</label>
          <input type="number" id="new-amount" v-model="newEntry.amount" step="0.01" required
            class="w-full p-1 border rounded">
        </div>
        <div>
          <label for="new-category" class="block">Category:</label>
          <input type="text" id="new-category" v-model="newEntry.category" required class="w-full p-1 border rounded">
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Add Entry</button>
      </form>
    </div>

    <!-- Download CSV button -->
    <button @click="downloadCSV" class="bg-green-500 text-white px-4 py-2 rounded mb-4">Download CSV</button>

    <!-- Timeline Table -->
    <table v-if="displayedEntries.length" class="w-full mb-4">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Type</th>
          <th>Category</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in displayedEntries" :key="entry.id">
          <td>
            <input v-if="editingEntry === entry.id" type="date" v-model="entry.date" class="w-full p-1 border rounded">
            <span v-else>{{ entry.date }}</span>
          </td>
          <td>
            <input v-if="editingEntry === entry.id" type="text" v-model="entry.description"
              class="w-full p-1 border rounded">
            <span v-else>{{ entry.description }}</span>
          </td>
          <td>
            <input v-if="editingEntry === entry.id" type="number" v-model="entry.amount" step="0.01"
              class="w-full p-1 border rounded">
            <span v-else>{{ formatCurrency(entry.amount) }}</span>
          </td>
          <td>{{ entry.type }}</td>
          <td>
            <input v-if="editingEntry === entry.id" type="text" v-model="entry.category"
              class="w-full p-1 border rounded">
            <span v-else>{{ entry.category }}</span>
          </td>
          <td>
            <button v-if="editingEntry === entry.id" @click="saveEdit(entry)"
              class="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
            <button v-if="editingEntry === entry.id" @click="cancelEdit"
              class="bg-red-500 text-white px-2 py-1 rounded">Cancel</button>
            <button v-else @click="startEdit(entry)" class="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFinanceStore } from '~/store/finance'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const financeStore = useFinanceStore()
const { entries, filteredEntries, filteredTotalIncome, filteredTotalExpense, categories, netIncome } = storeToRefs(financeStore)

const startDate = ref('')
const endDate = ref('')
const selectedCategory = ref('')
// New entry form data
const newEntry = ref({
  date: '',
  description: '',
  amount: '',
  category: ''
})

const updateDateRange = () => {
  financeStore.setDateRange(startDate.value, endDate.value)
}

watch(entries, () => {
  if (entries.value.length > 0) {
    startDate.value = entries.value[0].date
    endDate.value = entries.value[entries.value.length - 1].date
    updateDateRange()
  }
})

const displayedEntries = computed(() => {
  if (selectedCategory.value) {
    return filteredEntries.value.filter(entry => entry.category === selectedCategory.value)
  }
  return filteredEntries.value
})

const filterByCategory = () => {
  // This function is called when the category selection changes
  // The filtering is handled by the displayedEntries computed property
}

// Editing functionality
const editingEntry = ref(null)
const editedEntry = ref({})

const addNewEntry = () => {
  const entry = {
    id: Date.now(), // Simple way to generate a unique ID
    ...newEntry.value,
    amount: parseFloat(newEntry.value.amount),
    type: newEntry.value.amount >= 0 ? 'income' : 'expense'
  }
  financeStore.addEntry(entry)
  // Reset form
  newEntry.value = { date: '', description: '', amount: '', category: '' }
}

const startEdit = (entry) => {
  editingEntry.value = entry.id
  editedEntry.value = { ...entry }
}

const saveEdit = (entry) => {
  const updatedEntry = {
    ...entry,
    amount: parseFloat(entry.amount),
    type: entry.amount >= 0 ? 'income' : 'expense'
  }
  financeStore.updateEntry(updatedEntry)
  editingEntry.value = null
}

const cancelEdit = () => {
  editingEntry.value = null
}

const formatCurrency = (amount) => {
  const absAmount = Math.abs(amount);
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(absAmount);

  return amount < 0 ? `-${formattedAmount}` : formattedAmount;
}


// Function to download CSV
const downloadCSV = () => {
  const headers = ['Date', 'Description', 'Amount', 'Type', 'Category']
  const csvContent = [
    headers.join(','),
    ...displayedEntries.value.map(entry =>
      [
        entry.date,
        `"${entry.description}"`, // Wrap description in quotes to handle commas
        entry.amount,
        entry.type,
        entry.category
      ].join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'finance_data.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

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
  displayedEntries.value.forEach(entry => {
    if (entry.type === 'expense') {
      expensesByCategory[entry.category] = (expensesByCategory[entry.category] || 0) + Math.abs(entry.amount)
    }
  })

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

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    await financeStore.processFile(file)
    selectedCategory.value = ''
  }
}
</script>