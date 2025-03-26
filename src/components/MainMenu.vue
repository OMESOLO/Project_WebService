<template>
    <Toast />
    <ConfirmDialog group="mainMenuDialog" />
    <Menubar>
        <template #start>
            <span class="menubar-label">Shoes Store</span>
            <router-link to="/" class="p-menubar-item-link">
                <Button label="Home" text icon="pi pi-home" />
            </router-link>
            <router-link v-if="isAuthenticated" to="/pagemember" class="p-menubar-item-link">
                <Button :label="memName" icon="pi pi-user" text />
            </router-link>
        </template>
        <template #end>
            <div class="d-flex align-items-center">
                <router-link v-if="isAdmin" to="/product/create" class="p-menubar-item-link">
                    <Button label="เพิ่มสินค้า" icon="pi pi-plus" text severity="info" />
                </router-link>
                <router-link v-if="isAuthenticated" to="/cartlist" class="p-menubar-item-link">
                    <Button label="ShowCart" icon="pi pi-shopping-cart" text :badge="cartQty > 0 ? cartQty.toString() : null" badgeClass="p-badge-success" />
                </router-link>
                
                <Button v-if="isAuthenticated" label="ลงชื่อออก" icon="pi pi-sign-out" text severity="danger" @click="confirmLogout" />
                <router-link v-else to="/login" class="p-menubar-item-link">
                    <Button label="Login" icon="pi pi-sign-in" text />
                </router-link>
            </div>
        </template>
    </Menubar>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { EventBus } from '../event-bus';

export default {
    name: 'MainMenu',
    components: { Toast, ConfirmDialog },
    setup() {
        const confirm = useConfirm();
        const toast = useToast();
        const router = useRouter();
        const cartQty = ref(0);
        const token = ref(Cookies.get('token') || '');
        const decodedToken = ref(null);
        const isAuthenticated = computed(() => decodedToken.value !== null);
        const memName = ref('');
        const dutyId = ref('');
        const isAdmin = computed(() => decodedToken.value?.dutyId === 'admin');

        const loadToken = () => {
            try {
                token.value = Cookies.get('token') || '';
                if (token.value) {
                    decodedToken.value = jwtDecode(token.value);
                    memName.value = decodedToken.value.memName;
                    dutyId.value = decodedToken.value.dutyId;
                }
            } catch (err) {
                console.error(`Failed to decode token: ${err}`);
                decodedToken.value = null;
            }
        };

        const confirmLogout = () => {
            confirm.require({
                group: 'mainMenuDialog',
                message: 'คุณต้องการออกจากระบบหรือไม่?',
                header: 'ยืนยันการออกจากระบบ',
                icon: 'pi pi-exclamation-triangle',
                rejectProps: { label: 'ยกเลิก', severity: 'secondary', outlined: true },
                acceptProps: { label: 'ออกจากระบบ', severity: 'danger' },
                accept: logout
            });
        };

        const logout = async () => {
            try {
                await axios.get('http://localhost:3000/members/logout');
                Cookies.remove('token');
                token.value = '';
                decodedToken.value = null;
                EventBus.emit('memlogout');
                router.push('/');
                toast.add({ severity: 'info', summary: 'ออกจากระบบสำเร็จ', detail: 'คุณได้ออกจากระบบแล้ว', life: 3000 });
            } catch (err) {
                console.error('Logout error:', err);
            }
        };

        const checkCart = async () => {
            if (!decodedToken.value?.memEmail) return;
            try {
                const response = await axios.post('http://localhost:3000/carts/chkcart', { memEmail: decodedToken.value.memEmail });
                // EventBus.emit('cartdtlOK', { id: response.data.cartId });
                const cartId = response.data.cartId;
                if (cartId) {
                    const sumRes = await axios.get(`http://localhost:3000/carts/sumcart/${cartId}`);
                    cartQty.value = sumRes.data.qty;
                }
            } catch (err) {
                console.error('Check cart error:', err);
            }
        };

        onMounted(() => {
            loadToken();
            checkCart();

            EventBus.on('updateMemName', (newName) => {
                console.log('ชื่อที่ได้รับจาก EventBus:', newName);
                memName.value = newName;
            });

            EventBus.on('login_ok', () => {
                loadToken();
                checkCart();
            });

            EventBus.on('cart_updated', () => {
                checkCart();
            });

            EventBus.on('cart_cleared', () => {
                cartQty.value = 0;
            });
        });

        watch(() => decodedToken.value?.memEmail, checkCart);

        return { confirmLogout, isAuthenticated, memName, cartQty, isAdmin };
    }
};
</script>

<style scoped>
.nav-link {
    text-decoration: none;
}
</style>
