<template>
    <!-- Master --><!-- ถ้าค่าที่อยู่ใน Cookie กับ CusId ไม่ตรงกันแสดงว่าไม่ใช้ผู้ซื้อไม่มีสิทธิอ่าน -->
    <div v-if="memEmail == cusId">
        <div v-for="(ct, cartId) in cart" :key="cartId" class="mt-5">
            <Card class="bg-light">
                <template #title>
                    <h4 class="text-primary opacity-75">คำสั่งซื้อเลขที่ {{ ct.cartId }}</h4>
                </template>
                <template #content>
                    <h5 class="mt-2 text-muted">สั่งซื้อวันที่ {{ formattedDate(ct.cartDate) }}</h5>
                    <div class="text-danger text-end">จำนวนสินค้า {{ ct.sqty }} ชิ้น, ยอดเงิน {{ (ct.sprice ?? 0).toLocaleString() }} บาท</div>
                    <hr />
                    <div class="d-flex justify-content-between">
                        <Button icon="pi pi-trash" label="ลบตะกร้าสินค้า" severity="danger" raised @click="confirmDelete(ct.cartId)" />
                        <Button icon="pi pi-dollar" label="ยืนยันสั่งสินค้า" severity="success" raised @click="confirmOrder(ct.cartId)" />
                    </div>
                </template>
            </Card>
        </div>
        <!---v for  -->

        <!-- Detail -->
        <DataTable :value="cartDtl" stripedRows tableStyle="min-width: 50rem" class="table mt-5">
            <Column field="row_number" header="No."></Column>
            <Column field="pdId" header="รหัสสินค้า"></Column>
            <Column field="pdName" header="สินค้า"></Column>
            <Column field="price" header="ราคาต่อหน่วย">
                <template #body="slotProps">
                    {{ slotProps.data.price.toLocaleString() }}
                </template>
            </Column>
            <Column field="qty" header="จำนวน"></Column>
            <Column field="totalPrice" header="เป็นเงิน">
                <template #body="slotProps">
                    {{ (slotProps.data.price * slotProps.data.qty ?? 0).toLocaleString() }}
                </template>
            </Column>
        </DataTable>
    </div>
    <!--v-if-->
    <div v-else>
        <Message severity="error" class="mt-5">คุณไม่มีสิทธิ์ดูรายการนี้</Message>
    </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie'; //imporo js-cookie มาใช้งาน
import { jwtDecode } from 'jwt-decode'; //ใช้แทน jsonwebtoken เพราะ jsonwebtoken ไม่เข้ากับ Vue.js
axios.defaults.withCredentials = true;

export default {
    name: 'CartShow',
    data() {
        return {
            cart: [], //รับข้อมูล Master
            cartDtl: [], //รับข้อมูล Detail
            cartId: null,
            memEmail: null,
            decodedToken: null,
            cusId: null
        };
    },
    async mounted() {
        // ตรวจสอบว่าเป็นเจ้าของตะกร้าหรือไม่
        this.getCookie();
        this.cartId = this.$route.params.cartId;
        await this.getCart();
        await this.getCartDtl();
    },
    methods: {
        // แปลงรูปแบบวันที่
        formattedDate(dateStr) {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มต้นที่ 0, จึงต้อง +1
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        async getCart() {
            console.log('Get Cart');
            await axios
                .get(`http://localhost:3000/carts/getcart/${this.cartId}`)
                .then((res) => {
                    console.log('Cart \n' + res.data);
                    this.cart = res.data;
                    this.cusId = res.data[0].cusId;
                })
                .catch((err) => {
                    console.error(err);
                });
        },
        async getCartDtl() {
            console.log('Get CartCartDtl');
            await axios
                .get(`http://localhost:3000/carts/getcartdtl/${this.cartId}`)
                .then((res) => {
                    console.log('CartDtl \n' + res.data);
                    this.cartDtl = res.data;
                })
                .catch((err) => {
                    console.error(err);
                });
        },
        getCookie() {
            try {
                this.token = Cookies.get('token');
                this.decodedToken = jwtDecode(this.token);
                this.memEmail = this.decodedToken.memEmail;
            } catch (err) {
                console.error(`fail decode token ${err}`);
                this.decodedToken = null;
            }
        }
    }
};
</script>
<style></style>
