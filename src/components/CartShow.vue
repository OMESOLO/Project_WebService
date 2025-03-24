<template>
    <!-- Master --><!-- ถ้าค่าที่อยู่ใน Cookie กับ CusId ไม่ตรงกันแสดงว่าไม่ใช้ผู้ซื้อไม่มีสิทธิอ่าน -->
    <Toast />
    <ConfirmDialog group="cartShowDialog" />

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

        <div v-if="cartDtl.length > 0">
            <DataTable :value="cartDtl" stripedRows tableStyle="min-width: 50rem" class="table mt-5">
                <Column field="row_number" header="No." />
                <Column field="pdId" header="รหัสสินค้า" />
                <Column field="pdName" header="สินค้า" />
                <Column field="price" header="ราคาต่อหน่วย">
                    <template #body="slotProps">
                        {{ slotProps.data.price.toLocaleString() }}
                    </template>
                </Column>
                <Column field="qty" header="จำนวน" />
                <Column field="totalPrice" header="เป็นเงิน">
                    <template #body="slotProps">
                        {{ (slotProps.data.price * slotProps.data.qty ?? 0).toLocaleString() }}
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie'; //imporo js-cookie มาใช้งาน
import { jwtDecode } from 'jwt-decode'; //ใช้แทน jsonwebtoken เพราะ jsonwebtoken ไม่เข้ากับ Vue.js
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { EventBus } from '../event-bus';
axios.defaults.withCredentials = true;

export default {
    name: 'CartShow',
    components: {
        Toast,
        ConfirmDialog
    },
    setup() {
        const confirm = useConfirm();
        const toast = useToast();

        return {
            confirm,
            toast
        };
    },
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
                    this.noDataFound = true;
                });
        },
        async getCartDtl() {
            console.log('Get CartCartDtl');
            await axios
                .get(`http://localhost:3000/carts/getcartdtl/${this.cartId}`)
                .then((res) => {
                    console.log('CartDtl \n' + res.data);
                    this.cartDtl = Array.isArray(res.data) ? res.data : [];
                })
                .catch((err) => {
                    console.error(err);
                    this.cartDtl = [];
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
        },

        confirmDelete(cartId) {
            this.confirm.require({
                group: 'cartShowDialog',
                message: 'คุณต้องการลบตะกร้าสินค้านี้ใช่หรือไม่?',
                header: 'ยืนยันการลบ',
                icon: 'pi pi-exclamation-triangle',
                rejectProps: { label: 'ยกเลิก', severity: 'secondary', outlined: true },
                acceptProps: { label: 'ลบตะกร้า', severity: 'danger' },
                accept: () => this.deleteCart(cartId)
            });
        },

        async confirmOrder(cartId) {
            try {
                const response = await axios.put(`http://localhost:3000/carts/confirmorder/${cartId}`);
                this.toast.add({ severity: 'success', summary: 'ยืนยันคำสั่งซื้อแล้ว', detail: 'ระบบได้ยืนยันคำสั่งซื้อของคุณเรียบร้อย', life: 3000 });

                // อัปเดต UI หรือเปลี่ยนหน้าไปที่รายการคำสั่งซื้อ
                this.$router.push('/cartlist'); // หรือจะ reload cart ใหม่ก็ได้
            } catch (err) {
                console.error('ยืนยันคำสั่งซื้อไม่สำเร็จ', err);
                this.toast.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: 'ไม่สามารถยืนยันคำสั่งซื้อได้', life: 3000 });
            }
        },

        async deleteCart(cartId) {
            try {
                await axios.delete(`http://localhost:3000/carts/delete/${cartId}`);
                this.cart = this.cart.filter((ct) => ct.cartId !== cartId);
                this.cartDtl = [];
                EventBus.emit('cart_updated');
                EventBus.emit('cart_cleared');
                this.toast.add({ severity: 'success', summary: 'สำเร็จ', detail: 'ลบตะกร้าสินค้าเรียบร้อยแล้ว', life: 3000 });
                this.$router.push('/cartlist');
            } catch (err) {
                console.error('ลบตะกร้าไม่สำเร็จ', err);
                this.toast.add({ severity: 'error', summary: 'เกิดข้อผิดพลาด', detail: 'ไม่สามารถลบตะกร้าสินค้าได้', life: 3000 });
            }
        }
    }
};
</script>
<style></style>
