// store/finance.js
import { defineStore } from 'pinia'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    entries: [],
    totalIncome: null,
    totalExpense: null,
  }),
  
  actions: {
    async processFile(file) {
      let data
      if (file.name.endsWith('.csv')) {
        data = await this.parseCSV(file)
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await this.parseExcel(file)
      } else {
        throw new Error('Unsupported file type')
      }
      
      this.entries = data.map((row, index) => ({
        id: index,
        date: row.Date,
        description: row.Description,
        amount: parseFloat(row.Amount),
        type: parseFloat(row.Amount) >= 0 ? 'income' : 'expense',
        category: row.Category || 'Uncategorized'
      }))
      
      this.calculateTotals()
    },
    
    async parseCSV(file) {
      return new Promise((resolve) => {
        Papa.parse(file, {
          complete: (results) => {
            resolve(results.data)
          },
          header: true
        })
      })
    },
    
    async parseExcel(file) {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      return XLSX.utils.sheet_to_json(worksheet)
    },
    
    calculateTotals() {
      this.totalIncome = this.entries.reduce((sum, entry) => entry.type === 'income' ? sum + entry.amount : sum, 0)
      this.totalExpense = Math.abs(this.entries.reduce((sum, entry) => entry.type === 'expense' ? sum + entry.amount : sum, 0))
    }
  }
})