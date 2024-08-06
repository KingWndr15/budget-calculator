<template>
    <div v-if="categories.length" class="categories">
        <label for="category-select" class="">Category:</label>
        <div @click="toggleDropdown" class="weight-5 selected ">
            <span>{{ selectedCategoryLocal || 'All' }}</span>
            <img src="@/assets/icons/arrow_drop_down.svg" alt="">
        </div>
        <div v-if="isOpen" class="dropdown">
            <div @click="selectCategory('')" class="p-1 item"
                :class="{ 'grey': selectedCategoryLocal === '' }">All
            </div>
            <div v-for="category in categories" :key="category" @click="selectCategory(category)"
                class="p-1 item"
                :class="{ 'grey': selectedCategoryLocal === category }">
                {{ category }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFinanceStore } from '~/store/finance'
import { onClickOutside } from '@vueuse/core'

const props = defineProps({
    selectedCategory: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:selectedCategory'])

const financeStore = useFinanceStore()
const { categories } = storeToRefs(financeStore)

const selectedCategoryLocal = ref(props.selectedCategory)
const isOpen = ref(false)

const dropdownRef = ref(null)

onClickOutside(dropdownRef, () => {
    isOpen.value = false
})

watch(() => props.selectedCategory, (newValue) => {
    selectedCategoryLocal.value = newValue
})

const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const selectCategory = (category) => {
    selectedCategoryLocal.value = category
    emit('update:selectedCategory', category)
    isOpen.value = false
}
</script>

<style>
.categories {
    display: flex;
    align-items: center;
    gap: 5px;
}

.selected {
    display: flex;
    align-items: center;
    gap: 5px;
}

.dropdown {
    position: absolute;
    top: 20vh;
    left: 10vh;
    background-color: white;
    padding: 5px;
    border-radius: 4px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 100;
    max-height: 150px;
    overflow-x: auto;
}

.dropdown .item:hover {
    cursor: pointer;
    background-color: #f2f2f2;
}
</style>