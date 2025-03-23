<template>
    <div class="container mt-5">
        <Card class="shadow-lg p-4">
            <template #title> รายการตะกร้าสินค้า </template>
            <template #content>

                <!-- ✅ แสดง DataTable เฉพาะเมื่อมีข้อมูล -->
                <DataTable
                    v-if="cart.length > 0"
                    :value="cart"
                    tableStyle="min-width: 50rem"
                    responsiveLayout="scroll"
                >
                    <Column field="row_number" header="No." align="center">
                        <template #body="slotProps">
                            {{ slotProps.data.row_number }}
                        </template>
                    </Column>

                    <Column field="cartId" header="เลขที่" align="center">
                        <template #body="slotProps">
                            <router-link
                                :to="`/cartshow/${slotProps.data.cartId}`"
                                class="text-primary text-decoration-none"
                            >
                                {{ slotProps.data.cartId }}
                            </router-link>
                        </template>
                    </Column>

                    <Column field="cartDate" header="วันที่" align="center">
                        <template #body="slotProps">
                            {{ formattedDate(slotProps.data.cartDate) }}
                        </template>
                    </Column>

                    <Column field="sqty" header="จำนวน" align="center">
                        <template #body="slotProps">
                            {{ slotProps.data.sqty ?? 0 }}
                        </template>
                    </Column>

                    <Column field="sprice" header="ยอดเงิน" align="right">
                        <template #body="slotProps">
                            {{ (slotProps.data.sprice ?? 0).toLocaleString() }}
                        </template>
                    </Column>
                </DataTable>

                <!-- ✅ แสดงข้อความเมื่อไม่มีตะกร้า -->
                <Message v-else severity="info" class="text-center mt-4">
                    ยังไม่มีรายการตะกร้าสินค้า
                </Message>

            </template>
        </Card>
    </div>
</template>


<script>
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default {
    name: 'CartList',
    data() {
        return {
            memEmail: null,
            decodedToken: null,
            cart: []
        };
    },
    async mounted() {
        await this.getCookie();
        await this.getCartList();
    },
    methods: {
        formattedDate(dateStr) {
            const date = new Date(dateStr);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },
        async getCartList() {
            let customer = { id: this.memEmail };
            await axios
                .post(`http://localhost:3000/carts/getcartbycus`, customer)
                .then((res) => {
                    this.cart = res.data;
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
                console.error(`Fail to decode token: ${err}`);
                this.decodedToken = null;
            }
        }
    }
};
</script>

<style></style>
