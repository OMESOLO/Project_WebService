<template>
    <div class="container">
        <div class="row justify-content-center align-items-center gap-3">
            <div class="col-md-5 col-sm-12 d-flex justify-content-center">
                <Card class="mt-5 shadow-lg text-center p-4" style="width: 24rem; border-radius: 15px">
                    <template #title> โปรไฟล์ของฉัน </template>
                    <template #content>
                        <div class="d-flex flex-column align-items-center">
                            <div class="position-relative">
                                <img :src="imageUrl" :alt="memEmail" class="rounded-circle shadow-sm profile-img" />
                                <div class="edit-icon" @click="triggerFileInput">
                                    <i class="pi pi-pencil"></i>
                                </div>
                                <input type="file" ref="fileInput" class="d-none" accept="image/*" @change="onFileChange" />
                            </div>

                            <div class="mt-3 w-100">
                                <div class="mb-3 text-start">
                                    <label for="email" class="form-label">Email</label>
                                    <InputText id="email" v-model="memEmail" class="form-control" disabled />
                                </div>
                                <div class="mb-3 text-start">
                                    <label for="name" class="form-label">Name</label>
                                    <InputText id="name" v-model="memName" class="form-control" disabled />
                                </div>
                            </div>
                        </div>
                    </template>
                </Card>
            </div>
        </div>
        <Toast />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';

const toast = useToast();
const fileInput = ref(null);
const memEmail = ref(null);
const memName = ref(null);
const imageTimestamp = ref(Date.now());

const imageUrl = ref(`http://localhost:3000/img_mem/default.jpg`);

onMounted(() => {
    getCookie();
});

const getCookie = () => {
    try {
        const token = Cookies.get('token');
        const decodedToken = jwtDecode(token);
        memEmail.value = decodedToken.memEmail;
        memName.value = decodedToken.memName;
        imageUrl.value = `http://localhost:3000/img_mem/${memEmail.value}.jpg?timestamp=${imageTimestamp.value}`;
    } catch (err) {
        console.error(`Fail to decode token: ${err}`);
    }
};

const triggerFileInput = () => {
    if (fileInput.value) {
        fileInput.value.click();
    }
};

const onFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('memEmail', memEmail.value);
    formData.append('file', file);

    try {
        await axios.post('http://localhost:3000/members/uploadImg', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        imageTimestamp.value = Date.now();
        imageUrl.value = `http://localhost:3000/img_mem/${memEmail.value}.jpg?timestamp=${imageTimestamp.value}`;

        toast.add({ severity: 'success', summary: 'อัปโหลดสำเร็จ', life: 3000 });
    } catch (err) {
        toast.add({ severity: 'error', summary: 'อัปโหลดล้มเหลว', life: 3000 });
    }
};
</script>

<style>
.profile-img {
    width: 140px;
    height: 140px;
    object-fit: cover;
    border: 5px solid #ddd;
}

.edit-icon {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background: #007bff;
    color: white;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: background 0.3s ease;
}

.edit-icon:hover {
    background: #0056b3;
}
</style>
