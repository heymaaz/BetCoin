<template>
    <div class="flex flex-col w-full min-h-screen bg-gray-50">
        <main class="flex flex-1 flex-col p-4 md:p-8 lg:p-12">
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div 
                v-for="crypto in cryptos" 
                :key="crypto.symbol" 
                class="transform transition duration-300 ease-in-out hover:-translate-y-2 cursor-pointer rounded-xl border bg-white shadow-lg hover:shadow-2xl" 
                @click.prevent="changeCryptoSymbol(crypto.symbol)">
                <div class="p-4 md:p-6">
                    <h3 class="text-lg md:text-xl font-semibold text-gray-800">{{ crypto.Name }}</h3>
                    <div class="text-3xl font-bold text-gray-900 mt-2">{{ crypto.price }}</div>
                </div>
            </div>
        </div>
    </main>
    
    <div class="relative">
        <button v-if="showGeneratePredictions" class="lg:inline-block py-2 px-6 bg-blue-500 hover:bg-blue-600 text-sm text-white font-bold rounded-xl transition duration-200" @click="generatePredictions">Generate Predictions</button>
        <div id="tester" class="text-3xl font-bold leading-none flex items-center">
            <!-- Plotly chart will be drawn inside this DIV -->
        </div>
        <div id = "myDiv"class="text-3xl font-bold leading-none flex items-center flex-grow">
            <!-- Plotly sentiment chart will be drawn inside this DIV -->
        </div>
    </div>
</div>

</template>
<script setup>

import { ref, onMounted, inject, watch } from 'vue';

// Inject the setCryptoSymbol method
const setCryptoSymbol = inject('setCryptoSymbol');

// Example method to change the crypto symbol
const changeCryptoSymbol = (symbol) => {
    setCryptoSymbol(symbol);
};

const tester = ref('tester');

let startDate;
let targetValues;

let lastDate;
let last100Date;

// WebSocket connection
let socket;

const cryptoSymbol = inject('cryptoSymbol');

let cryptos = inject('cryptos');

let showGeneratePredictions = ref(false);

watch(cryptoSymbol, (newValue) => {
    console.log('Crypto symbol changed to:', newValue);
    // Send a message to server to request initial data
    requestInitialData();
    getSentiment();
});

onMounted(() => {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        initializeWebSocket();
    }
});

function initializeWebSocket() {
    if (!socket || socket.readyState === WebSocket.CLOSED) {
        //socket = new WebSocket("wss://0glkdb0fh8.execute-api.us-east-1.amazonaws.com/production");
        socket = new WebSocket("wss://yg2nt6n6cj.execute-api.eu-west-2.amazonaws.com/production");
    }
    
    socket.onopen = () => {
        console.log('WebSocket Connected');
        requestLatestRates();
    };
    
    socket.onmessage = handleWebSocketMessage;
    
    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };
    
    socket.onclose = (event) => {
        console.log('WebSocket Closed:', event);
        // Reconnect after 3 seconds
        setTimeout(initializeWebSocket, 3000);
    };
}

function requestLatestRates() {
    let getLatestCryptoRates = JSON.stringify({ 
        action: 'getLatestCryptoRates'
    });
    socket.send(getLatestCryptoRates);
    console.log('Requesting getLatestCryptoRates: ', getLatestCryptoRates);
}

function requestInitialData() {
    let requestInitialData = JSON.stringify({ 
        action: 'requestInitialData',
        data: cryptoSymbol._value
    });
    socket.send(requestInitialData);
    console.log('Requesting initial data: ', requestInitialData);
}

function handleWebSocketMessage(event) {
    const data = JSON.parse(event.data);
    console.log('Message received:', data);
    if (data.type) {
        if (data.type === 'initialData') {
            startDate = data.startDate;
            targetValues = data.targetValues;
            plotInitialData();
        } else if (data.type === 'predictionData') {
            updateChartWithPredictions(data.predictions);
        } else if (data.type === 'SentimentData') {
            plotSentimentGraph(data);
        } else if (data.type === 'LatestCryptoRates') {
            const updatedCryptos = cryptos.value.map(crypto => {
                const newPrice = data.latestRates[crypto.symbol];
                if (newPrice) {
                    const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(newPrice);
                    return { ...crypto, price: formattedPrice };
                }
                return crypto;
            });
            
            
            cryptos.value = updatedCryptos;
        }
        
    }
}



function plotInitialData() {
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    // Convert the start date to a Date object
    const startDateObj = new Date(startDate);
    
    // Generate dates for the x-axis
    const dates = targetValues.map((_, index) => {
        return addDays(startDateObj, index).toISOString().split('T')[0];
    });
    
    //store the last date in the variable
    lastDate = dates[dates.length - 1];
    last100Date = dates[dates.length - 100];
    
    // Define the data for the plot
    const data = [{
        x: dates,
        y: targetValues,
        type: 'scatter' 
    }];
    
    // Layout configuration
    const layout = {
        title: `${cryptoSymbol._value} Price Tracker`,
        autosize: true,
        xaxis: {
            title: 'Date',
        },
        yaxis: {
            title: 'Price',
        }
    };
    const config = {
        responsive: true // Make the plot responsive
    };
    // Plot the graph
    Plotly.newPlot(tester.value, data, layout, config);
    showGeneratePredictions.value = true;
}

function generatePredictions() {
    // Send last 100 days of data to the prediction model to get the next 50 days of predictions
    const last100 = targetValues.slice(-100)
    let data = {
        "startDate":last100Date,
        "targetValues":last100,
        "cryptoSymbol":cryptoSymbol._value
    };
    
    let msgObject = {
        action: "generatePredictions",
        data: data
    };
    
    //Send message
    socket.send(JSON.stringify(msgObject));
    
    //Log result
    console.log("Message sent: " + JSON.stringify(msgObject));
}

function updateChartWithPredictions(predictions) {
    
    console.log('Predictions received:', predictions);
    
    // Update the chart and add the predictions in a different color
    let mean = predictions.predictions[0].mean;
    let quantiles = predictions.predictions[0].quantiles;
    
    // Helper function to add days to a date
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    
    // Convert the start date to a Date object
    const startDateObj = new Date(lastDate);
    
    // Generate dates for the x-axis
    const dates = targetValues.map((_, index) => {
        return addDays(startDateObj, index).toISOString().split('T')[0];
    });
    
    
    // Update the chart with the predictions
    const data_mean = [{
        x: dates,
        y: mean,
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'red'
        }
    }];
    
    const data_9 = [{
        x: dates,
        y: quantiles["0.9"],
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'green'
        }
    }];
    
    const data_1 = [{
        x: dates,
        y: quantiles["0.1"],
        type: 'scatter',
        mode: 'lines',
        line: {
            color: 'blue'
        }
    }];
    
    //Name the new trace as 'Mean', 'Upper Bound' and 'Lower Bound
    data_mean[0].name = 'Mean';
    data_9[0].name = 'Upper Bound';
    data_1[0].name = 'Lower Bound';
    Plotly.addTraces(tester.value, data_mean);
    Plotly.addTraces(tester.value, data_9);
    Plotly.addTraces(tester.value, data_1);
    
    // Update trace 0 to "Actual"
    Plotly.restyle(tester.value, {name: 'Actual'}, 0);
    
}

function getSentiment() {
    let getSentiment = JSON.stringify({
        action: 'getSentiment'
    });
    // Send a message to the server to request sentiment data
    socket.send(getSentiment);
    console.log('Requesting sentiment data: ', getSentiment);
}


function plotSentimentGraph(sentimentData) {
    let traces = [];
    
    Object.keys(sentimentData.data).forEach(symbol => {
        if(symbol === cryptoSymbol._value) {
            let trace = {
                x: sentimentData.data[symbol].map(entry => new Date(entry.timestamp)), // Convert timestamps to Date objects
                y: sentimentData.data[symbol].map(entry => entry.sentiment),
                mode: 'lines',
                name: symbol
            };
            traces.push(trace);
        }
    });
    
    let layout = {
        title: `${cryptoSymbol._value} Sentiment Over Time`,
        autosize: true,
        xaxis: {
            title: 'Time'
        },
        yaxis: {
            title: 'Sentiment'
        }
    };
    const config = {
        responsive: true // Make the plot responsive
    };
    Plotly.newPlot('myDiv', traces, layout, config);
}

</script>
