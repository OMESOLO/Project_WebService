<template>
    <MainMenu />
    <div class="container">
        <router-view />
    </div>
</template>

<script>
import MainMenu from './components/MainMenu.vue';
export default {
    name: 'App',
    components: {
        MainMenu
    }
};
</script>

<style scoped></style>
