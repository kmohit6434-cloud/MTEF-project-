require('./server.js'); 
const localtunnel = require('localtunnel');

setTimeout(async () => {
    try {
        const tunnel = await localtunnel({ port: 3000 });
        console.log('\n=============================================');
        console.log('🌟 YOUR LIVE MTEF LINK: ' + tunnel.url);
        console.log('=============================================\n');
    } catch (err) {
        console.log('Tunnel Error: ', err);
    }
}, 2000);
