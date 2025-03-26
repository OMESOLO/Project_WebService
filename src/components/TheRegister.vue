<template>
    <div class="register-wrapper d-flex justify-content-center mt-4">
        <div class="col-lg-6 col-md-8 col-sm-12">
            <Toast />
            <form @submit.prevent="handleSubmit()">
                <div class="card shadow-lg rounded-4 border-0 p-4 bg-white">
                    <div class="card-body">
                        <h2 class="text-center text-primary mb-4">ลงทะเบียนสมาชิกใหม่</h2>

                        <div class="mb-3">
                            <label for="memEmail" class="form-label fw-semibold">Email</label>
                            <div class="input-group">
                                <InputText type="text" class="form-control" id="memEmail" autocomplete="off" v-model.trim="memEmail" />
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="memName" class="form-label fw-semibold">Name</label>
                            <div class="input-group">
                                <InputText type="text" class="form-control" id="memName" autocomplete="off" v-model.trim="memName" />
                            </div>
                        </div>

                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold">Password</label>
                            <div class="input-group">
                                <Password id="password" v-model.trim="password" toggleMask inputClass="form-control" class="w-100" :feedback="(ti = true)" />
                            </div>
                        </div>

                        <div class="text-end">
                            <Button type="submit" label="ลงทะเบียน" icon="pi pi-check" severity="success" />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: 'TheRegister',
    data() {
        return {
            memEmail: null,
            memName: null,
            password: null,
            regist: null, 
            backendmessage: null 
        };
    },
    methods: {
        async handleSubmit() {
            let members = {
                memEmail: this.memEmail,
                memName: this.memName,
                password: this.password
            };
            try {
                const response = await axios.post(`http://localhost:3000/members`, members);
                this.regist = response.data.regist;
                if (this.regist) {
                    this.$toast.add({
                        severity: 'success',
                        summary: 'สำเร็จ',
                        detail: 'ลงทะเบียนสำเร็จ',
                        life: 3000
                    });
                } else {
                    this.$toast.add({
                        severity: 'error',
                        summary: 'ผิดพลาด',
                        detail: response.data.message || 'ลงทะเบียนผิดพลาด',
                        life: 3000
                    });
                }
            } catch (err) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'ผิดพลาด',
                    detail: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
                    life: 3000
                });
            }
        }
    }
};
</script>

<style scoped></style>
