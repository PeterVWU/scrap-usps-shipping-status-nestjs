const fetch = require('node-fetch');

const trackingNumbers = [
    '9400111105501248829119',
    '9405511105501272099215',
    '9400111105501671324205',
    '9400111105501617942395'
];

async function testTrackingAPI() {
    try {
        const response = await fetch('https://scrap-usps-shipping-status-nestjs.onrender.com/tracking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ trackingNumbers }),
        });

        const data = await response.json();
        console.log('Tracking Results:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

testTrackingAPI();
