<template>
    <div class="card p-4">
        <form @submit.prevent="searchProduct" class="row align-items-center mb-3">
            <div class="col-md-6">
                <h1 class="text-primary">ผลิตภัณฑ์ของเรา</h1>
            </div>
            <div class="col-md-4 col-sm-6">
                <InputText v-model="stext" placeholder="ค้นหาสินค้า..." class="w-100 p-inputtext-lg form-control" />
            </div>
            <div class="col d-flex gap-2">
                <Button icon="pi pi-search" label="ค้นหา" severity="success" @click="searchProduct" />
                <Button icon="pi pi-filter-slash" label="ล้าง" variant="outlined" @click="clearSearch" />
            </div>
        </form>

        <DataView :value="products" paginator :rows="5">
            <template #list="slotProps">
                <div class="container">
                    <div v-for="(item, index) in slotProps.items" :key="index">
                        <div class="row align-items-center border-bottom py-3">
                            <div class="col-md-2">
                                <div class="position-relative">
                                    <Image :src="`http://localhost:3000/img_pd/${item.pdId}.jpg`" :alt="item.pdName" class="rounded w-100 shadow-sm" preview style="max-width: 80px; height: 80px; object-fit: cover" />
                                </div>
                            </div>

                            <div class="col-md-6">
                                <span class="text-muted text-xs">{{ item.brand?.brandName }}</span>
                                <div class="text-sm font-weight-bold mt-1">{{ item.pdName }}</div>
                                <div class="d-flex align-items-center mt-1">
                                    <span class="text-xs font-weight-bold">{{ item.rating }}</span>
                                    <i class="pi pi-star-fill text-warning ml-1"></i>
                                </div>
                            </div>

                            <div class="col-md-4 text-end">
                                <span class="text-sm font-weight-bold text-success">{{ item.pdPrice }} บาท</span>
                                <div class="d-flex justify-content-end gap-2 mt-2">
                                    <router-link :to="{ name: 'ProductShow', params: { pdId: item.pdId } }" class="btn btn-primary btn-sm"> <i class="pi pi-eye"></i> ดูรายละเอียดสินค้า </router-link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </DataView>
    </div>
</template>

<script setup>
import axios from 'axios';
import { onMounted, ref, watch } from 'vue';

const products = ref([]);
const stext = ref('');

onMounted(() => {
    fetchProducts();
});

const fetchProducts = async () => {
    try {
        const res = await axios.get('http://localhost:3000/products/ten');
        products.value = res.data;
    } catch (err) {
        console.error('Error loading products:', err);
    }
};

const searchProduct = async () => {
    if (!stext.value.trim()) {
        fetchProducts();
        return;
    }
    try {
        const res = await axios.get(`http://localhost:3000/products/search/${stext.value}`);
        products.value = res.data;
    } catch (err) {
        console.error('Error searching products:', err);
    }
};

const clearSearch = () => {
    stext.value = '';
    fetchProducts();
};

watch(stext, (newVal) => {
    if (!newVal.trim()) {
        fetchProducts();
    }
});
</script>

<style>
.pi-star-fill {
    font-size: 0.75rem;
}
</style>
