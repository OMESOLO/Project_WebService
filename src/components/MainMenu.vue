<template>
    <Toast />
    <ConfirmDialog />
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
                <router-link v-if="isAuthenticated" to="/cartlist" class="p-menubar-item-link">
                    <Button label="ShowCart" icon="pi pi-shopping-cart" text />
                </router-link>

                <div v-if="isAuthenticated" class="p-menubar-end-item pe-3">
                    <Cartinfo />
                </div>
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
import Cartinfo from './Cartinfo.vue';

export default {
    name: 'MainMenu',
    components: { Cartinfo, Toast, ConfirmDialog },
    setup() {
        const confirm = useConfirm();
        const toast = useToast();
        const router = useRouter();

        const token = ref(Cookies.get('token') || '');
        const decodedToken = computed(() => {
            try {
                return token.value ? jwtDecode(token.value) : null;
            } catch (err) {
                console.error(`Failed to decode token: ${err}`);
                return null;
            }
        });

        const isAuthenticated = computed(() => decodedToken.value !== null);
        const memName = computed(() => decodedToken.value?.memName || '');
        const memEmail = computed(() => decodedToken.value?.memEmail || '');

        const confirmLogout = () => {
            confirm.require({
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
                EventBus.emit('memlogout');
                router.push('/');
                toast.add({ severity: 'info', summary: 'ออกจากระบบสำเร็จ', detail: 'คุณได้ออกจากระบบแล้ว', life: 3000 });
            } catch (err) {
                console.error('Logout error:', err);
            }
        };

        const checkCart = async () => {
            if (!memEmail.value) return;
            try {
                const response = await axios.post('http://localhost:3000/carts/chkcart', { memEmail: memEmail.value });
                EventBus.emit('cartdtlOK', { id: response.data.cartId });
            } catch (err) {
                console.error('Check cart error:', err);
            }
        };

        onMounted(() => {
            EventBus.on('login_ok', () => {
                token.value = Cookies.get('token') || '';
            });
            checkCart();
        });

        watch(memEmail, checkCart);

        return { confirmLogout, isAuthenticated, memName };
    }
};
</script>

<style scoped>
.nav-link {
    text-decoration: none;
}
</style>
