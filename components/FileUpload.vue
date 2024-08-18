<template>
    <div>
        <input id="file" type="file" @change="handleFileUpload" accept=".csv,.xlsx,.xls" class="mb-4" />
        <div class="file mt-1">
            <img src="@/assets/icons/cloud.svg" alt="">
            <h2 class="mt-1 weight-5 font-size-16">Drag a file here or chose the files you want to upload from your
                computer. </h2>
            <p>Should not be more than <span>5mb</span>, Must be a <span>.csv</span> file.</p>
            <label class="mt-1" for="file">Upload a file</label>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '~/store/finance'

const financeStore = useFinanceStore()

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
        await financeStore.processFile(file)
    }
}

</script>


<style scoped>
input[type="file"] {
    display: none;
}

.file {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 70px;
    width: 100%;
    border: 1.5px dashed black;
    border-radius: 4px;

    @media (width < 800px) {
        border-radius: 4px;
        padding: 35px;
    }
}

.file h2 {

    @media (width < 800px) {
        font-size: 14px;
        text-align: center;
    }
}

.file p {
    color: #191D23;

    @media (width < 800px) {
        font-size: 14px;
        text-align: center;
    }
}

.file p span {
    color: #000000;
    font-weight: 500;
}

label {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000000;
    padding: 6px 10px;
    color: #fff;
    border-radius: 4px;
    font-weight: 500;
    border: 0px;
    cursor: pointer;

    @media (width < 800px) {
        padding: 4px 6px;
        font-size: 14px;
    }
}

.second {
    width: 500px;
}
</style>