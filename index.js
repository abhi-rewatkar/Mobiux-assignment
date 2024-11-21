const fs = require('fs');

// Read the data from the CSV file
let data = fs.readFileSync('./data.csv', 'utf-8').trim().split('\n');

// Parse the CSV data into an array of objects
const headers = data[0].split(',');
const rows = data.slice(1).map(row => {
    const values = row.split(',');
    return headers.reduce((acc, header, index) => {
        acc[header.trim()] = isNaN(values[index]) ? values[index].trim() : Number(values[index]);
        return acc;
    }, {});
});

// Function to calculate total sales
function totalSales(data) {
    return data.reduce((sum, row) => sum + row['Total Price'], 0);
}

// Function to calculate month-wise sales totals
function monthWiseSales(data) {
    const salesByMonth = {};
    data.forEach(row => {
        const month = row['Date'].slice(0, 7); // Extract year and month
        salesByMonth[month] = (salesByMonth[month] || 0) + row['Total Price'];
    });
    return salesByMonth;
}

// Function to find the most popular item by quantity in each month
function mostPopularItem(data) {
    const popularItemsByMonth = {};
    data.forEach(row => {
        const month = row['Date'].slice(0, 7);
        if (!popularItemsByMonth[month]) popularItemsByMonth[month] = {};
        const item = row['SKU'];
        popularItemsByMonth[month][item] = (popularItemsByMonth[month][item] || 0) + row['Quantity'];
    });

    const result = {};
    for (const month in popularItemsByMonth) {
        const items = popularItemsByMonth[month];
        const mostPopular = Object.entries(items).reduce((max, entry) => (entry[1] > max[1] ? entry : max));
        result[month] = { item: mostPopular[0], quantity: mostPopular[1] };
    }
    return result;
}

// Function to find the item generating the most revenue in each month
function mostRevenueItem(data) {
    const revenueByMonth = {};
    data.forEach(row => {
        const month = row['Date'].slice(0, 7);
        if (!revenueByMonth[month]) revenueByMonth[month] = {};
        const item = row['SKU'];
        revenueByMonth[month][item] = (revenueByMonth[month][item] || 0) + row['Total Price'];
    });

    const result = {};
    for (const month in revenueByMonth) {
        const items = revenueByMonth[month];
        const mostRevenue = Object.entries(items).reduce((max, entry) => (entry[1] > max[1] ? entry : max));
        result[month] = { item: mostRevenue[0], revenue: mostRevenue[1] };
    }
    return result;
}

// Function to calculate min, max, and average orders for the most popular item in each month
function ordersStatsForPopularItem(data) {
    const popularItems = mostPopularItem(data);
    const statsByMonth = {};

    for (const month in popularItems) {
        const item = popularItems[month].item;
        const filteredData = data.filter(row => row['Date'].startsWith(month) && row['SKU'] === item);
        const quantities = filteredData.map(row => row['Quantity']);
        const min = Math.min(...quantities);
        const max = Math.max(...quantities);
        const avg = quantities.reduce((sum, qty) => sum + qty, 0) / quantities.length;
        statsByMonth[month] = { item, min, max, avg: avg.toFixed(2) };
    }

    return statsByMonth;
}

// Results
console.log("Total Sales:", totalSales(rows));
console.log("Month-wise Sales Totals:", monthWiseSales(rows));
console.log("Most Popular Item Each Month:", mostPopularItem(rows));
console.log("Items Generating Most Revenue Each Month:", mostRevenueItem(rows));
console.log("Order Stats for Most Popular Item Each Month:", ordersStatsForPopularItem(rows));
