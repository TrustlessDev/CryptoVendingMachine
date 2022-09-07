const Gpio = require('onoff').Gpio;
const qrcodeScanner = new Gpio(23, 'out');

initScanner();
startScan();

function initScanner() {
    qrcodeScanner.writeSync(1);
}

async function startScan() {
    return new Promise((resolve, reject) => {
        qrcodeScanner.writeSync(0);
        setTimeout(() => {
            qrcodeScanner.writeSync(1);
            resolve();
        }, 3000);
    });
}