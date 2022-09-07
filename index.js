const Gpio = require('onoff').Gpio;
const qrcodeScanner = new Gpio(23, 'out');
const SerialPort = require('serialport').SerialPort;
const Printer = require('thermalprinter');

const serialPort = new SerialPort({
    path: '/dev/serial0',
    baudRate: 9600
});

serialPort.on('open',function() {
	var printer = new Printer(serialPort);
	printer.on('ready', function() {
		printer
			.indent(5)
			.horizontalLine(16)
			.bold(true)
			.indent(10)
			.printLine('first line')
			.bold(false)
			.inverse(true)
			.big(true)
			.right()
			.printLine('second line')
			.print(function() {
				console.log('done');

                initScanner();
                startScan();

				process.exit();
			});
	});
});

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