<template>
  <main class="container mx-auto">
    <h1>Finance Tracker</h1>

    <DateRangeSelector />
    <CategorySelector v-model:selectedCategory="selectedCategory" />
    <FileUpload />
    <PieChart :entries="displayedEntries" />
    <div class="bottom mt-4">
      <div class="summary">
        <Summary />
        <NewEntryForm />
      </div>
      <TimelineTable :entries="displayedEntries" @entryDeleted="refreshEntries" />
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFinanceStore } from '~/store/finance'
import FileUpload from '~/components/FileUpload.vue'
import DateRangeSelector from '~/components/DateRangeSelector.vue'
import CategorySelector from '~/components/CategorySelector.vue'
import Summary from '~/components/Summary.vue'
import PieChart from '~/components/PieChart.vue'
import NewEntryForm from '~/components/NewEntryForm.vue'
import TimelineTable from '~/components/TimelineTable.vue'

const financeStore = useFinanceStore()
const { filteredEntries } = storeToRefs(financeStore)

const selectedCategory = ref('')

const displayedEntries = computed(() => {
  if (selectedCategory.value && selectedCategory.value !== '') {
    return filteredEntries.value.filter(entry => entry.category === selectedCategory.value)
  }
  return filteredEntries.value || []
})

const refreshEntries = () => {
  filteredEntries.value = [...filteredEntries.value]
}
</script>

<style>

main {

  @media (width < 1000px) {
    padding: 20px;
  }

  @media (width < 800px) {
    padding: 15px;
  }
}

.bottom {
  display: flex;
  justify-content: space-between;
  gap: 20px;

  @media (width < 1200px) {
    flex-direction: column;
  }
}

.summary {
  display: flex;
  gap: 20px;
  flex-direction: column;
}
</style>