<template>
    <div class="container py-5">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <Card class="p-4 shadow-sm">
                    <template #content>
                        <Toast />
                        <h2 class="text-center text-primary mb-4">เพิ่มสินค้าใหม่</h2>

                        <form @submit.prevent="submitProduct">
                            <div class="mb-3">
                                <label class="form-label">ชื่อสินค้า</label>
                                <InputText v-model="product.pdName" class="form-control" placeholder="กรอกชื่อสินค้า" required />
                            </div>

                            <div class="mb-3">
                                <label class="form-label">ประเภทสินค้า</label>
                                <Select v-model="product.pdTypeId" :options="pdTypes" optionLabel="pdTypeName" optionValue="pdTypeId" placeholder="เลือกประเภทสินค้า" class="w-100" />
                            </div>

                            <div class="mb-3">
                                <label class="form-label">แบรนด์สินค้า</label>
                                <Select v-model="product.brandId" :options="brands" optionLabel="brandName" optionValue="brandId" placeholder="เลือกแบรนด์" class="w-100" />
                            </div>

                            <div class="mb-3">
                                <label class="form-label">ราคา (บาท)</label>
                                <InputNumber v-model="product.pdPrice" mode="currency" currency="THB" locale="th-TH" class="w-100" :min="0" />
                            </div>

                            <div class="mb-3">
                                <label class="form-label">รายละเอียด</label>
                                <Textarea v-model="product.pdRemark" autoResize rows="3" class="form-control" placeholder="รายละเอียดสินค้า" />
                            </div>

                            <div class="mb-3">
                                <label class="form-label">รูปภาพสินค้า</label>
                                <FileUpload ref="fileUploader" name="image" :auto="false" :multiple="false" accept="image/*" :maxFileSize="1000000" @select="onImageSelect">
                                    <template #empty>
                                        <span>ลากรูปหรือกดเพื่อเลือกไฟล์</span>
                                    </template>
                                </FileUpload>
                            </div>

                            <Button type="submit" label="บันทึกสินค้า" icon="pi pi-save" class="float-end mt-2" />
                        </form>
                    </template>
                </Card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { EventBus } from '../event-bus';
import axios from 'axios';


const router = useRouter();
const toast = useToast();

const product = ref({
    pdName: '',
    pdPrice: null,
    pdRemark: '',
    pdTypeId: '',
    brandId: ''
});

const pdTypes = ref([]);
const brands = ref([]);
const imageFile = ref(null);
const imagePreview = ref(null);

onMounted(() => {
    loadDropdownData();
});

const onImageSelect = (e) => {
    const file = e.files?.[0];
    if (file) {
        imageFile.value = file;
        imagePreview.value = URL.createObjectURL(file);
    }
};

const loadDropdownData = async () => {
    try {
        const [pdTypeRes, brandRes] = await Promise.all([
            axios.get('http://localhost:3000/pdTypes'),
            axios.get('http://localhost:3000/brands')
        ]);

        pdTypes.value = pdTypeRes.data;
        brands.value = brandRes.data;
    } catch (err) {
        console.error('โหลดข้อมูล dropdown ไม่สำเร็จ', err);
    }
};

const submitProduct = async () => {
    try {
        const formData = new FormData();
        formData.append('pdName', product.value.pdName);
        formData.append('pdPrice', product.value.pdPrice);
        formData.append('pdRemark', product.value.pdRemark);
        formData.append('pdTypeId', product.value.pdTypeId);
        formData.append('brandId', product.value.brandId);
        if (imageFile.value) {
            formData.append('image', imageFile.value);
        }

        const res = await fetch('http://localhost:3000/products', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) throw new Error('Failed to add product');

        toast.add({
            severity: 'success',
            summary: 'สำเร็จ',
            detail: 'เพิ่มสินค้าสำเร็จ!',
            life: 3000
        });

        // แจ้งหน้าอื่นให้โหลดใหม่ (ถ้ามี EventBus ใช้งานอยู่)
        EventBus.emit('productAdded');

        router.push('/');
    } catch (err) {
        console.error(err);
        toast.add({
            severity: 'error',
            summary: 'ล้มเหลว',
            detail: 'ไม่สามารถเพิ่มสินค้าได้',
            life: 3000
        });
    }
};
</script>

<style scoped>
.form-label {
    font-weight: 600;
}
</style>
