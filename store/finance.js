// store/finance.js
import { defineStore } from "pinia";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export const useFinanceStore = defineStore("finance", {
  state: () => ({
    entries: [],
    filteredEntries: [],
    filteredTotalIncome: null,
    filteredTotalExpense: null,
    netIncome: null,
    startDate: null,
    endDate: null,
    categories: [],
  }),

  actions: {
    async processFile(file) {
      let data;
      if (file.name.endsWith(".csv")) {
        data = await this.parseCSV(file);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        data = await this.parseExcel(file);
      } else {
        throw new Error("Unsupported file type");
      }

      // Normalize headers to lowercase
      const normalizedData = data.map((row) => {
        const normalizedRow = {};
        Object.keys(row).forEach((key) => {
          normalizedRow[key.toLowerCase()] = row[key];
        });
        return normalizedRow;
      });

      this.categories = Array.from(
        new Set(normalizedData.map((row) => row.category).filter(Boolean))
      );

      this.entries = normalizedData
        .map((row, index) => ({
          id: index,
          date: row.date,
          description: row.description || row.comment, // Use description if available, otherwise use comment
          amount: parseFloat(row.amount),
          type: parseFloat(row.amount) >= 0 ? "income" : "expense",
          category: row.category || "Uncategorized",
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      this.filterEntries();
      this.calculateNetIncome();
    },

    updateEntry(updatedEntry) {
      const index = this.entries.findIndex((e) => e.id === updatedEntry.id);
      if (index !== -1) {
        this.entries[index] = updatedEntry;
        this.filterEntries();
        this.calculateNetIncome();
      }
    },

    async parseCSV(file) {
      return new Promise((resolve) => {
        Papa.parse(file, {
          complete: (results) => {
            // Normalize headers to lowercase
            const headers = results.meta.fields.map((header) =>
              header.toLowerCase()
            );
            const data = results.data.map((row) => {
              const normalizedRow = {};
              headers.forEach((header, index) => {
                normalizedRow[header] = row[results.meta.fields[index]];
              });
              return normalizedRow;
            });
            resolve(data);
          },
          header: true,
        });
      });
    },

    async parseExcel(file) {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Normalize headers to lowercase
      return jsonData.map((row) => {
        const normalizedRow = {};
        Object.keys(row).forEach((key) => {
          normalizedRow[key.toLowerCase()] = row[key];
        });
        return normalizedRow;
      });
    },

    setDateRange(start, end) {
      this.startDate = start;
      this.endDate = end;
      this.filterEntries();
    },

    calculateNetIncome() {
      this.netIncome = this.entries.reduce(
        (sum, entry) => sum + entry.amount,
        0
      );
    },

    filterEntries() {
      if (this.startDate && this.endDate) {
        this.filteredEntries = this.entries.filter(
          (entry) => entry.date >= this.startDate && entry.date <= this.endDate
        );
      } else {
        this.filteredEntries = this.entries;
      }
      this.calculateFilteredTotals();
      this.calculateNetIncome();
    },

    calculateFilteredTotals() {
      this.filteredTotalIncome = this.filteredEntries.reduce(
        (sum, entry) => (entry.type === "income" ? sum + entry.amount : sum),
        0
      );
      this.filteredTotalExpense = Math.abs(
        this.filteredEntries.reduce(
          (sum, entry) => (entry.type === "expense" ? sum + entry.amount : sum),
          0
        )
      );
    },
  },
});
