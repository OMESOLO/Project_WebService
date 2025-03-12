<template>
    <div class="row mt-5">
        <Toast />
        <div class="col-sm-12 col-md-6 col-lg-6 mb-5">
            <Image src="https://primefaces.org/cdn/primevue/images/galleria/galleria10.jpg" alt="Image" width="250" />
        </div>
        <div class="col-sm-12 col-md-6 col-lg-6 mb3">
            <form @submit.prevent="handleSubmit()">
                <div class="col-sm-12 col-md-10 col-lg-8">
                    <div class="form-floating mb-3">
                        <IftaLabel>
                            <InputText id="loginname" v-model="loginname" style="width: 105%" variant="filled" />
                            <label for="loginname">Email</label>
                        </IftaLabel>
                    </div>
                </div>
                <div class="col-sm-12 col-md-10 col-lg-8">
                    <div class="form-floating mb-3">
                        <IftaLabel>
                            <Password id="password" v-model="password" toggleMask :feedback="false" style="width: 105%" inputClass="w-100" />
                            <label for="password">Password</label>
                        </IftaLabel>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12 col-md-6 mb-3">
                        <router-link to="/register" style="text-decoration: none">
                            <Button label="สมัครสมาชิก" icon="pi pi-user-plus" severity="danger" outlined />
                        </router-link>
                    </div>
                    <div class="col-sm-12 col-md-6">
                        <Button label="เข้าสู่ระบบ" icon="pi pi-sign-in" type="submit" class="w-24" />
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { useToast } from 'primevue/usetoast';
import { EventBus } from '../event-bus';
axios.defaults.withCredentials = true;

export default {
    name: 'TheLogin',
    data() {
        return {
            loginname: null,
            password: null,
            login: null,
            token: null,
            decodedToken: null,
            toast: null
        };
    },
    mounted() {
        this.getCookie();
        this.toast = useToast();
    },
    methods: {
        async handleSubmit() {
            let members = {
                loginname: this.loginname,
                password: this.password
            };

            try {
                const response = await axios.post(`http://localhost:3000/members/login`, members);
                this.login = response.data.login;

                if (this.login) {
                    EventBus.emit('login_ok');
                    await this.chkCart();
                    this.$router.push('/pagemember');

                    this.toast.add({
                        severity: 'success',
                        summary: 'เข้าสู่ระบบสำเร็จ',
                        detail: 'คุณเข้าสู่ระบบเรียบร้อยแล้ว',
                        life: 3000
                    });
                } else {
                    this.toast.add({
                        severity: 'error',
                        summary: 'เข้าสู่ระบบล้มเหลว',
                        detail: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
                        life: 3000
                    });
                }
            } catch (err) {
                console.log(err);

                // ✅ Toast แจ้งเตือนเมื่อเกิดข้อผิดพลาด
                this.toast.add({
                    severity: 'error',
                    summary: 'เกิดข้อผิดพลาด',
                    detail: 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง',
                    life: 3000
                });
            }
        },
        getCookie() {
            try {
                this.token = Cookies.get('token');
                if (!this.token) {
                    console.error('No token found in cookies');
                    return;
                }
                this.decodedToken = jwtDecode(this.token);
                if (this.decodedToken) this.$router.push('/pagemember');
            } catch (err) {
                console.error(`fail decode token ${err}`);
            }
        },
        async chkCart() {
            try {
                const response = await axios.post(`http://localhost:3000/carts/chkcart`, { memEmail: this.loginname });
                EventBus.emit('cartdtlOK', { id: response.data.cartId });
            } catch (err) {
                console.log(err);
            }
        }
    }
};
</script>

<style scoped></style>
