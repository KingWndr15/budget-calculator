<template>
    <div>
        <div class="top mb-2">
            <h2 class="font-size-20">Transaction History</h2>
            <button @click="downloadCSV" class="download">
                Download CSV <img src="@/assets/icons/download.svg" alt="">
            </button>
        </div>
        <table v-if="entries && entries.length" class="transaction-table">
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
                <tr v-for="entry in entries" :key="entry.id">
                    <td>
                        <input v-if="editingEntry === entry.id" type="date" v-model="entry.date" class="editable-input">
                        <span v-else>{{ formatDate(entry.date) }}</span>
                    </td>
                    <td>
                        <input v-if="editingEntry === entry.id" type="text" v-model="entry.description"
                            class="editable-input">
                        <span v-else>{{ entry.description }}</span>
                    </td>
                    <td>
                        <input v-if="editingEntry === entry.id" type="number" v-model="entry.amount" step="0.01"
                            class="editable-input">
                        <span v-else>{{ formatCurrency(entry.amount) }}</span>
                    </td>
                    <td>{{ entry.type }}</td>
                    <td>
                        <input v-if="editingEntry === entry.id" type="text" v-model="entry.category"
                            class="editable-input">
                        <span v-else>{{ entry.category }}</span>
                    </td>
                    <td>
                        <button v-if="editingEntry === entry.id" @click="saveEdit(entry)"
                            class="action-button save">Save</button>
                        <button v-if="editingEntry === entry.id" @click="cancelEdit"
                            class="action-button cancel">Cancel</button>
                        <button v-else @click="startEdit(entry)" class="action-button edit">Edit</button>
                        <button @click="deleteEntry(entry.id)" class="action-button delete">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <p v-else>No entries to display.</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFinanceStore } from '~/store/finance'

const props = defineProps({
    entries: {
        type: Array,
        default: () => []
    }
})

const financeStore = useFinanceStore()

const editingEntry = ref(null)

const startEdit = (entry) => {
    editingEntry.value = entry.id
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

const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

const deleteEntry = (id) => {
    if (confirm('Are you sure you want to delete this entry?')) {
        financeStore.deleteEntry(id)
        emit('entryDeleted')
    }
}

const downloadCSV = () => {
    if (!props.entries || props.entries.length === 0) {
        alert('No data to download');
        return;
    }

    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category']
    const csvContent = [
        headers.join(','),
        ...props.entries.map(entry =>
            [
                formatDate(entry.date),
                `"${entry.description}"`,
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
</script>


<style scoped>
.transaction-table {
    max-width: 1000px;
    border-collapse: collapse;

    @media ( width < 1200px ) {
        width: 100%;
    }
}

.transaction-table th,
.transaction-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.transaction-table td {
    max-width: 200px;
    overflow-y: auto;
}

.transaction-table th {
    background-color: #f4f4f4;
    font-weight: 600;
}

.transaction-table tbody tr:hover {
    background-color: #f1f1f1;
}

.editable-input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.action-button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    margin-right: 4px;
}

.action-button.save {
    background-color: #28a745;
    color: white;
}

.action-button.cancel {
    background-color: #dc3545;
    color: white;
}

.action-button.edit {
    background-color: #007bff;
    color: white;
}

.action-button.delete {
    background-color: #dc3545;
    color: white;
}

.download {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: transparent;
    outline: 0;
    border: 0;
    cursor: pointer;
    font-weight: 500;
}

.top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 50px;
    max-width: 1200px;
}
</style>
