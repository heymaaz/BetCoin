<template>
    <div>
        <nav class="relative px-4 py-4 flex items-center bg-white">
            <div class="lg:hidden">
                <button class="navbar-burger flex items-center text-blue-600 p-3" @click="toggleMenu">
                    <svg class="block h-4 w-4 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <title>Mobile menu</title>
                        <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"></path>
                    </svg>
                </button>
            </div>
            <a class="text-3xl font-bold leading-none flex items-center" href="#">
                <img class="h-10" src="../images/Bitcoin_46999.ico">
                <span class="text-xl">BET-COIN.com</span>
            </a>
            
            <ul class="hidden absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:w-auto lg:space-x-6">
                <li v-for="crypto in cryptos" :key="crypto.symbol">
                    <a @click.prevent="changeCryptoSymbol(crypto.symbol)" class="text-sm text-gray-400 hover:text-gray-500" href="#">{{ crypto.symbol }}</a>
                </li>
            </ul>
        </nav>
        <div class="navbar-menu relative z-50" :class="{ 'hidden': !isMenuOpen }">
            <!-- Menu content here -->
            <button class="navbar-close" @click="toggleMenu">Close</button>
            <div class="navbar-backdrop fixed inset-0 bg-gray-800 opacity-25" @click="toggleMenu" v-if="isMenuOpen"></div>
            <nav class="fixed top-0 left-0 bottom-0 flex flex-col w-5/6 max-w-sm py-6 px-6 bg-white border-r overflow-y-auto">
                <div class="flex items-center mb-8">
                    <a class="mr-auto text-3xl font-bold leading-none" href="#">
                        <img class="h-10" src="../images/Bitcoin_46999.ico">
                    </a>
                    <button class="navbar-close" @click="toggleMenu">
                        <svg class="h-6 w-6 text-gray-400 cursor-pointer hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div>
                    <ul>
                        <li v-for="crypto in cryptos" :key="crypto.symbol">
                            <a @click.prevent="changeCryptoSymbol(crypto.symbol)" class="block p-4 text-sm font-semibold text-gray-400 hover:bg-blue-50 hover:text-blue-600 rounded" href="#">{{ crypto.symbol }}</a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { ref, inject } from 'vue';

// Inject the setCryptoSymbol method
const setCryptoSymbol = inject('setCryptoSymbol');

let cryptos = inject('cryptos');

// method to change the crypto symbol
const changeCryptoSymbol = (symbol) => {
    if (isMenuOpen.value) {
        toggleMenu();
    }
    setCryptoSymbol(symbol);
};

const isMenuOpen = ref(false);

function toggleMenu() {
    isMenuOpen.value = !isMenuOpen.value;
}

defineExpose({
    isMenuOpen,
    toggleMenu
});
</script>
