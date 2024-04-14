<script setup>
// Import ref and provide from Vue
import { ref, provide } from 'vue';

// Setup a reactive reference for the crypto symbol
const cryptoSymbol = ref('BTC'); // Default value
let cryptos = ref([
{ Name: 'Bitcoin', symbol: 'BTC', price: '$45,231.89' },
{ Name: 'Ethereum', symbol: 'ETH', price: '$3,123.45' },
{ Name: 'Ripple', symbol: 'XRP', price: '$0.75' },
{ Name: 'Litecoin', symbol: 'LTC', price: '$123.45' },
{ Name: 'Solana', symbol: 'SOL', price: '$123.45' }
]);

// Provide the cryptoSymbol and cryptos so it can be injected in descendants
provide('cryptoSymbol', cryptoSymbol);
provide('cryptos', cryptos);

// Provide a method to update cryptoSymbol
const setCryptoSymbol = (symbol) => {
    cryptoSymbol.value = symbol;
};
provide('setCryptoSymbol', setCryptoSymbol);

import NavbarComponent from './components/NavbarComponent.vue';
import MainComponent from './components/MainComponent.vue';
import FooterComponent from './components/FooterComponent.vue';


</script>

<template>
  <NavbarComponent />
  <MainComponent />
  <FooterComponent />
</template>

