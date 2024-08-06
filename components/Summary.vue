<template>
  <div v-if="filteredTotalIncome !== null && filteredTotalExpense !== null" class="summary-container">
    <p class="net-income">Net Income: ${{ netIncome.toFixed(2) }}</p>
    <p class="total-income">Total Income: ${{ filteredTotalIncome.toFixed(2) }}</p>
    <p class="total-expense">Total Expense: -${{ filteredTotalExpense.toFixed(2) }}</p>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useFinanceStore } from '~/store/finance'

const financeStore = useFinanceStore()
const { filteredTotalIncome, filteredTotalExpense, netIncome } = storeToRefs(financeStore)
</script>

<style scoped>
.summary-container {
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  /* Light background color */
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Soft shadow */
  font-family: 'Inter', sans-serif;
  /* Use the Inter font or similar */
}

.summary-container p {
  margin: 8px 0;
  font-size: 16px;
  color: #333;
  /* Default text color */
}

.net-income {
  font-weight: 700;
  /* Bold for net income */
  color: #1a202c;
  /* Darker color for emphasis */
}

.total-income {
  font-weight: 500;
  /* Semi-bold for total income */
  color: #38a169;
  /* Green color for positive values */
}

.total-expense {
  font-weight: 500;
  /* Semi-bold for total expense */
  color: #e53e3e;
  /* Red color for negative values */
}
</style>
