<template>
    <div class="row mt-5">
        <div class="col-sm-12 col-md-6 col-lg-6 mb-5">
            <img src="../assets/LogoSRC.png" alt="" width="80%" />
        </div>
        <div class="col-sm-12 col-md-6 col-lg-6 mb3">
            <form @submit.prevent="handleSubmit()">
                <div class="col-sm-12 col-md-10 col-lg-8">
                    <div class="form-floating mb-3">
                        <IftaLabel>
                            <InputText id="loginname" v-model="loginname" style="width: 100%" variant="filled" />
                            <label for="loginname">Email</label>
                        </IftaLabel>
                    </div>
                </div>
                <div class="col-sm-12 col-md-10 col-lg-8">
                    <div class="form-floating mb-3">
                        <IftaLabel>
                            <Password id="password" v-model="password" toggleMask style="width: 100%" inputClass="w-100" />
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
    <!-- ส่วนแสดงสถานะ จากการตอบกลับของ Backend -->
    <p v-if="backendMessage == 'success'" class="alert alert-success">เข้าระบบสำเร็จ {{ backendMessage }}</p>
    <p v-else-if="backendMessage == 'fail'" class="alert alert-danger">เข้าระบบผิดพลาด {{ backendMessage }}</p>
</template>

<script>
import axios from 'axios'; //import axios มาใช้งาน
import Cookies from 'js-cookie'; //imporo js-cookie มาใช้งาน
import { jwtDecode } from 'jwt-decode';
import { EventBus } from '../event-bus'; //import event-bus มาใช้งาน
axios.defaults.withCredentials = true;
export default {
    name: 'TheLogin',
    data() {
        return {
            //กำหนดตัวแปรที่ใช้งานกับ Template และค่าเริ่มต้น
            loginname: null,
            password: null,
            login: null,
            // กำหนดอ่าน Token
            token: null,
            decodedToken: null,
            backendMessage: null // กำหนดตัวแปรสำหรับอ่านสถานะการตอบกลับจา�� Backend
        };
    },
    mounted() {
        this.getCookie(); //เมื่อเริ่ม Component ให้เรียก methods getCookie()
    },
    methods: {
        async handleSubmit() {
            // Function
            let members = {
                // กำหนดค่า
                loginname: this.loginname,
                password: this.password
            };
            try {
                // Request POST Method
                const response = await axios.post(`http://localhost:3000/members/login`, members);
                this.login = response.data.login;
                this.backendMessage = this.login ? 'success' : 'fail';
                // ย้ายหน้าถ้า login สำเร็จ
                if (this.login) {
                    // event bus เมื่อ Login สำเร็จส่งสัญญานชื่อ login_ok วิ่งไปตาม bus
                    EventBus.emit('login_ok');
                    await this.chkCart();
                    this.$router.push('/pagemember');
                }
            } catch (err) {
                console.log(err);
                this.backendMessage = 'fail';
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
                if (this.decodedToken != null) this.$router.push('/pagemember');
            } catch (err) {
                console.error(`fail decode token ${err}`);
            }
        },

        async chkCart() {
            //เมื่อ Login สำเร็จให้ตรวจสอบว่ามีตะกร้าค้างอยู่หรือเปล่า
            console.log('chkCart');
            let members = {
                // กำหนดค่า
                memEmail: this.loginname
            };
            try {
                // Request POST Method
                const response = await axios.post(`http://localhost:3000/carts/chkcart`, members);
                let cartId = response.data.cartId;
                // ส่งสัญญานหลังติดต่อ Backend
                EventBus.emit('cartdtlOK', { id: cartId });
                console.log(cartId);
            } catch (err) {
                console.log(err);
            }
        }
    }
};
</script>

<style scoped></style>
