<template>
  <div v-if="showForm" class="form border rounded">
    <div class="container">
      <div class="top">
        <h2 class="text-xl font-size-20">Add New Entry</h2>
        <p @click="toggleForm"><img src="@/assets/icons/close_small.svg" alt=""></p>
      </div>
      <form @submit.prevent="addNewEntry" class="space-y-2">
        <div>
          <label for="new-amount" class="block mt-2">Amount:</label>
          <input type="number" id="new-amount" v-model="newEntry.amount" step="0.01" required class="mt-1 mb-2 p-1">
        </div>
        <div>
          <label for="new-type" class="block">Entry type:</label>
          <select id="new-type" v-model="newEntry.type" required class="mt-1 mb-2 p-1">
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label for="new-date" class="block">Date:</label>
          <input type="date" id="new-date" v-model="newEntry.date" required class="mt-1 mb-2 p-1">
        </div>
        <div>
          <label for="new-description" class="block">Description:</label>
          <input type="text" id="new-description" v-model="newEntry.description" class="mt-1 mb-2 p-1">
        </div>
        <div>
          <label for="new-category" class="block">Category:</label>
          <input type="text" id="new-category" v-model="newEntry.category" required class="mt-1 mb-2 p-1">
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">Add Entry</button>
      </form>
    </div>
  </div>

  <button @click="toggleForm" class="toggle">Add Entry</button>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFinanceStore } from '~/store/finance'

const financeStore = useFinanceStore()

const showForm = ref(false) 

const newEntry = ref({
  date: '',
  description: '',
  type: 'income',
  amount: '',
  category: ''
})

const addNewEntry = () => {
  const entry = {
    id: Date.now(),
    ...newEntry.value,
    amount: parseFloat(newEntry.value.amount) * (newEntry.value.type === 'expense' ? -1 : 1)
  }
  financeStore.addEntry(entry)
  newEntry.value = { date: '', description: '', type: 'income', amount: '', category: '' }
  toggleForm()
}

const toggleForm = () => {
  showForm.value = !showForm.value
}

// Watcher to update body overflow style when showForm changes
watch(showForm, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.form {
  position: fixed;
  height: 100vh;
  width: 100%;
  top: 0vh;
  left: 0px;
  display: flex;
  align-items: center;
  /* justify-content: stretch;  */
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
}

.form form div {
  display: flex;
  flex-direction: column;
}

.form form div input,
.form form div select {
  padding: 8px;
  height: 40px;
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #D0D5DD;
  outline: 0px;
  font-weight: 500 !important;
}

.top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 50px;
  width: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  width: 350px;
  background-color: #fff;
  padding: 24px;
  border-radius: 4px;

  @media (width < 700px) {
    width: 90%;
  }
}

.form form div label {
  font-weight: 500;
  color: #191D23;
}

.form form button {
  padding: 8px 16px;
  border: 0px;
  background-color: #000;
  color: #fff;
  font-weight: 500;
  border-radius: 4px;
  width: 100%;
}

.toggle {
  padding: 8px 16px;
  border: 0px;
  background-color: #000;
  color: #fff;
  font-weight: 500;
  border-radius: 4px;
}
</style>