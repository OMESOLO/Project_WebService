<template>
    <div v-for="(pd, pdId) in products" :key="pdId" class="mt-5">
        <div class="row">
            <div class="col-md-3 col-sm-11">
                <Card class="mx-auto mb-3" style="width: 16rem">
                    <template #content>
                        <Image :src="`http://localhost:3000/img_pd/${pd.pdId}.jpg`" alt="Product Image" width="220" />
                    </template>
                </Card>
            </div>

            <div class="col-md-9 col-sm-12">
                <Card>
                    <template #content>
                        <DataTable
                            v-model:editingRows="editingRows"
                            :value="[pd]"
                            editMode="row"
                            dataKey="pdId"
                            @row-edit-save="onRowEditSave"
                            tableStyle="min-width: 30rem"
                            :pt="{
                                table: { style: 'min-width: 50rem' },
                                column: {
                                    bodycell: ({ state }) => ({
                                        style: state['d_editing'] && 'padding-top: 0.75rem; padding-bottom: 0.75rem'
                                    })
                                }
                            }"
                        >
                            <Column field="pdId" header="รหัสสินค้า"></Column>
                            <Column field="pdName" header="ชื่อสินค้า">
                                <template #editor="{ data, field }">
                                    <InputText v-model="data[field]" />
                                </template>
                            </Column>
                            <Column field="pdPrice" header="ราคา">
                                <template #body="{ data, field }">
                                    {{ formatCurrency(data[field]) }}
                                </template>
                                <template #editor="{ data, field }">
                                    <InputNumber v-model="data[field]" mode="currency" currency="THB" locale="th-TH" />
                                </template>
                            </Column>
                            <Column field="brand.brandName" header="ยี่ห้อ">
                                <template #body="slotProps">
                                    {{ slotProps.data.brand ? slotProps.data.brand.brandName : '-' }}
                                </template>
                            </Column>
                            <Column field="pdRemark" header="รายละเอียด">
                                <template #editor="{ data, field }">
                                    <InputText v-model="data[field]" />
                                </template>
                            </Column>
                            <Column :rowEditor="true" style="width: 10%; min-width: 8rem" bodyStyle="text-align:center"> </Column>
                        </DataTable>
                    </template>
                </Card>

                <div class="mt-3">
                    <Button label="ใส่ตะกร้า" icon="pi pi-shopping-cart" class="p-button-primary" @click="chkLogin()" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { EventBus } from '../event-bus';

const toast = useToast();
const products = ref([]);
const id = ref(null);
const token = ref('');
const decodedToken = ref(null);
const memEmail = ref(null);
const cartId = ref(null);
const editingRows = ref([]);

onMounted(async () => {
    id.value = window.location.pathname.split('/').pop();
    try {
        const res = await axios.get(`http://localhost:3000/products/${id.value}`);
        if (Array.isArray(res.data)) {
            products.value = res.data;
        } else if (res.data) {
            products.value = [res.data];
        } else {
            products.value = [];
        }
    } catch (err) {
        console.error('Error fetching product:', err);
        products.value = [];
    }
});

const getCookie = async () => {
    try {
        token.value = await Cookies.get('token');
        decodedToken.value = jwtDecode(token.value);
        memEmail.value = decodedToken.value.memEmail;
    } catch (err) {
        console.error(`fail decode token ${err}`);
    }
};

const chkLogin = async () => {
    console.log('chkLogin');
    await getCookie();
    if (!memEmail.value) {
        alert('ต้อง Login เข้าระบบก่อน');
        return;
    }
    console.log('login แล้ว');
    await chkCart();
    if (!cartId.value) {
        await addCart();
    }
    addCartDtl();
};

const chkCart = async () => {
    console.log('chkCart');
    try {
        const response = await axios.post(`http://localhost:3000/carts/chkcart`, { memEmail: memEmail.value });
        cartId.value = response.data.cartId;
    } catch (err) {
        console.log(err);
    }
};

const addCart = async () => {
    console.log('addCart');
    try {
        const response = await axios.post(`http://localhost:3000/carts/addcart`, { cusId: memEmail.value });
        cartId.value = response.data.messageAddCart;
    } catch (err) {
        console.log(err);
    }
};

const addCartDtl = async () => {
    console.log('addCartDtl');
    if (!products.value.length) {
        console.error('No products found!');
        return;
    }
    try {
        await axios.post(`http://localhost:3000/carts/addcartdtl`, {
            cartId: cartId.value,
            pdId: id.value,
            pdPrice: products.value[0]?.pdPrice ?? 0
        });

        EventBus.emit('cartdtlOK', { id: cartId.value });
        EventBus.emit('cart_updated');
    } catch (err) {
        console.log(err);
    }
};

const updateProduct = async (updatedProduct) => {
    try {
        const payload = {
            pdId: updatedProduct.pdId,
            pdName: updatedProduct.pdName,
            pdPrice: updatedProduct.pdPrice,
            pdRemark: updatedProduct.pdRemark,
            pdTypeId: updatedProduct.pdTypeId || null,
            brandId: updatedProduct.brand?.brandId || null
        };

        await axios.put(`http://localhost:3000/products/${updatedProduct.pdId}`, payload);
        console.log('Product updated successfully:', payload);
        toast.add({
            severity: 'success',
            summary: 'อัปเดตสำเร็จ',
            detail: `แก้ไขข้อมูลสินค้าสำเร็จ!`,
            life: 3000
        });
    } catch (err) {
        console.error('Error updating product:', err);
        toast.add({
            severity: 'error',
            summary: 'อัปเดตไม่สำเร็จ',
            detail: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
            life: 3000
        });
    }
};

const onRowEditSave = (event) => {
    let { newData, index } = event;
    products.value[index] = newData;
    updateProduct(newData);
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
};
</script>

<style></style>
