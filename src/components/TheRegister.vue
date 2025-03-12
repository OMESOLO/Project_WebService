<template>
    <div class="row d-flex justify-content-center">
        <div class="col-lg-6 col-md-8 col-sm-12">
            <Toast />
            <form @submit.prevent="handleSubmit()">
                <div class="card row mt-5" style="background-color: #eeffee">
                    <div class="card-body">
                        <h1 class="card-title text-secondary">ลงทะเบียนสมาชิกใหม่</h1>
                        <div class="col-lg-12 mb-3">
                            <div class="form-floating mb-3">
                                <IftaLabel>
                                    <InputText type="text" class="form-control" id="memEmail" autocomplete="off" v-model.trim="memEmail" />
                                    <label for="memEmail">Email</label>
                                </IftaLabel>
                            </div>
                        </div>
                        <div class="col-lg-12 mb-3">
                            <div class="form-floating mb-3">
                                <IftaLabel>
                                    <InputText type="text" class="form-control" id="memName" autocomplete="off" v-model.trim="memName" />
                                    <label for="memName">Name</label>
                                </IftaLabel>
                            </div>
                        </div>
                        <div class="col-lg-12 mb-3">
                            <div class="form-floating mb-3">
                                <IftaLabel>
                                    <Password id="password" v-model.trim="password" toggleMask style="width: 100%" inputClass="w-100" />
                                    <label for="password">Password</label>
                                </IftaLabel>
                            </div>
                        </div>
                        <div class="col-sm-12">
                            <Button type="submit" label="ลงทะเบียน" icon="pi pi-check" class="p-button-primary float-end" />
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
            regist: null, //อ่านค่าว่าลงทะเบียนสำเร็จหรือไม่
            backendmessage: null //อ่านข้อความที่ส่งมาจาก Backend
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
