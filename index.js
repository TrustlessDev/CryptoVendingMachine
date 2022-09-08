const Gpio = require('onoff').Gpio;
const qrcodeScanner = new Gpio(23, 'out');
const { createCanvas, loadImage, Image } = require('canvas');
const fs = require('fs');
const QRCode = require('qrcode');

test();

async function test() {
	//initScanner();
	//await startScan();
	await printReceipt({
		type: 'TRON',
		receiptNo: 156456457,
		usdt: 99.7451116,
		fee: -1,
		ratio: 31.1425,
		totalUSDT: 98.7451116,
		twd: 3000,
		fromAddress: 'TRnWuee8JJj5RdznZKkinjbPA3PMn8a98m',
		toAddress: 'TUz5DVNk16pHav1sBxPp8eU58JtBHobZM9',
		hash: '922f8a02a57f2038f53dc3d279fefa5299c325fef0b32e14bbe3edaea7ee3075'
	});
	await startScan();
}

async function printReceipt(receipt) {
	const SerialPort = require('serialport').SerialPort;
	const Printer = require('thermalprinter');
	await makeReceipt(receipt, 'image.png');
	return new Promise((resolve, reject) => {
		const serialPort = new SerialPort({
			path: '/dev/serial0',
			baudRate: 9600
		});
		serialPort.on('open',function() {
			var printer = new Printer(serialPort, {
				maxPrintingDots: 6,
				heatingTime: 70,
				heatingInterval: 5,
				commandDelay: 4,
				chineseFirmware: true
			});
			printer.on('ready', function() {
				printer
					.printImage('image.png')
					.printLine(" ")
					.printLine(" ")
					.printLine(" ")
					.print(function() {
						resolve();
					});
			});
		});
	});
}

async function makeReceipt(info, filePath) {
    const canvas = createCanvas(384, 800);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 384, 850);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 30, 850);

    // Draw Logo
    let image = await loadImageAsync('dao-logo-nav.png');
    ctx.drawImage(image, 140, 15, 155, 65);
    ctx.font = '16px Impact'
    ctx.fillStyle = "white";
    ctx.translate(canvas.width/2,canvas.height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('“如果你關心自由，或是經濟自由，你應該盡你所能地在每天生活中使用虛擬貨幣“ — Roger Ver', -350, -170);
    ctx.rotate(Math.PI/2);
    ctx.translate(-canvas.width/2,-canvas.height/2);

    // Draw Title
    ctx.fillStyle = "black";
    ctx.font = 'bold 25px Helvetica';
    ctx.fillText('交易明細', 165, 115);

    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    ctx.lineTo(50, 132);
    ctx.lineTo(364, 132);
    ctx.stroke();

    ctx.font = '18px Helvetica';
    ctx.fillText('收據單號：', 60, 155);
    ctx.fillText(info.receiptNo, 160, 155);
    ctx.fillText('交易日期：', 60, 175);
    ctx.fillText(new Date().toLocaleString(), 160, 175);

    ctx.fillRect(50, 190, 30, 20);
    ctx.fillRect(82, 190, 180, 20);
    ctx.fillRect(264, 190, 100, 20);

    ctx.fillStyle = "white";
    ctx.fillText('No.', 50, 206);
    ctx.fillText('交易項目', 85, 206);
    ctx.fillText('數額', 265, 206);
    ctx.fillStyle = "black";

    ctx.fillText('1', 57, 230);

    let itemName = "";
    if(info.type == 'TRON') {
        itemName = 'USDT / TRC20'
    } else if(info.type == 'Ethereum') {
        itemName = 'USDT / ERC20'
    } else if(info.type == 'Polygon') {
        itemName = 'USDT / Polygon';
    }
    ctx.fillText(itemName, 85, 230);

    let usdtStr = (info.usdt + "");
    let len = usdtStr.length;
    usdtStr = len <= 6 ? info.usdt : usdtStr.substring(0,7);

    ctx.fillText(usdtStr, 265, 230);
    ctx.font = '10px Helvetica';
    ctx.fillText('USDT', 335, 230);

    ctx.font = '18px Helvetica';
    ctx.fillText('2', 57, 255);
    ctx.fillText('交易手續費', 85, 255);
    ctx.fillText(info.fee, 265, 255);
    ctx.font = '10px Helvetica';
    ctx.fillText('USDT', 335, 255);
    ctx.font = '18px Helvetica';

    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    ctx.lineTo(50, 265);
    ctx.lineTo(364, 265);
    ctx.stroke();

    ctx.fillText('合計', 57, 287);
    let totalUSDTStr = (info.totalUSDT + "");
    len = totalUSDTStr.length;
    totalUSDTStr = len <= 6 ? info.totalUSDT : totalUSDTStr.substring(0,7);
    ctx.fillText(totalUSDTStr, 265, 287);
    ctx.font = '10px Helvetica';
    ctx.fillText('USDT', 335, 287);
    ctx.font = '18px Helvetica';

    ctx.fillText('USDT/TWD 匯率', 57, 310);
    ctx.fillText('x', 250, 310);

    let ratioStr = info.ratio + "";
    len = ratioStr.length;
    ratioStr = len <= 6 ? info.ratio : ratioStr.substring(0,7);
    ctx.fillText(ratioStr, 265, 310);

    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    ctx.lineTo(50, 320);
    ctx.lineTo(364, 320);
    ctx.stroke();

    ctx.fillText('3,000', 285, 340);
    ctx.font = '10px Helvetica';
    ctx.fillText('TWD', 340, 340);
    ctx.font = '18px Helvetica';
    
    // Blockchain

    if(info.type == "TRON") {
        let tronscan = await loadImageAsync('tronscan.svg');
        ctx.drawImage(tronscan, 50, 370, 105, 30);
    } else if(info.type == "Polygon") {
        let polygon = await loadImageAsync('polygonscan.svg');
        ctx.drawImage(polygon, 50, 370, 165, 30);
    } else if(info.type == "Ethereum") {
        let polygon = await loadImageAsync('etherscan.svg');
        ctx.drawImage(polygon, 50, 370, 125, 30);
    }
    
    ctx.font = 'bold 18px Helvetica';
    ctx.fillText('區塊鏈交易明細', 227, 390);

    ctx.font = 'bold 15px Helvetica';
    ctx.fillText('發送人地址', 50, 425);
    if(info.type == "TRON") {
        ctx.font = '15px Helvetica';
        ctx.fillText(info.fromAddress, 70, 445);
    } else if(info.type == "Polygon") {
        ctx.font = '12px Helvetica';
        ctx.fillText(info.fromAddress, 70, 445);
    } else if(info.type == "Ethereum") {
        ctx.font = '12px Helvetica';
        ctx.fillText(info.fromAddress, 70, 445);
    }
    ctx.font = 'bold 15px Helvetica';
    ctx.fillText('接收人地址', 50, 465);
    if(info.type == "TRON") {
        ctx.font = '15px Helvetica';
        ctx.fillText(info.toAddress, 70, 485);
    } else if(info.type == "Polygon") {
        ctx.font = '12px Helvetica';
        ctx.fillText(info.toAddress, 70, 485);
    } else if(info.type == "Ethereum") {
        ctx.font = '12px Helvetica';
        ctx.fillText(info.toAddress, 70, 485);
    }
    ctx.font = 'bold 15px Helvetica';
    ctx.fillText('交易哈希值', 50, 505);
    ctx.font = '12px Helvetica';
    let hash1 = info.hash.substring(0,45);
    let hash2 = info.hash.substring(45);
    ctx.fillText(hash1, 70, 525);
    ctx.fillText(hash2, 70, 535);

    let trackUrl = "";

    if(info.type == "TRON") {
        trackUrl = "https://tronscan.org/#/transaction/" + info.hash;
    } else if(info.type == "Polygon") {
        trackUrl = "https://polygonscan.com/tx/" + info.hash;
    } else if(info.type == "Ethereum") {
        trackUrl = "https://etherscan.io/tx/" + info.hash;
    }

    let url = await getQRCodeAsync(trackUrl);
    let qrImg = await loadImageFromDataUrlAsync(url);
    ctx.drawImage(qrImg, 110, 540, 200, 200);
    
    let bullText = ["區塊鏈讓所有人誠實，一整層的金融官僚都會被移除，\n也減低費用", "虛擬貨幣是網路組織獨立的未來基石\n就跟軍隊是建立州政府的基石一樣，阻止被其他州給佔據" ,"虛擬貨幣可能有美好的未來尤其是如果這個創新可以\n讓支付系統更快速，更安全，也更有效率" ,"比特幣是為了一個更高層級的政治原因所設計的\n一個自由不被監管的網路，所有人都可以平等進入" ,"比特幣是加密技術了不起的里程碑\n在數位世界創造一個具有不可複製性的技術擁有無限價值"];
    let bullAuthor = ["Paul Vigna, 華爾街日報記者及作家", "Julian Assange，維基解密創辦人", "班 伯南克，曾任美國聯邦準備理事會主席", "Amir Taaki, 敘利亞內戰革命家", "Eric Schmidt，前 Google CEO"];
    let idx = getRandom(0, bullText.length);

    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.strokeRect(40,357,335,380);

    ctx.font = 'bold 10px Helvetica';
    ctx.fillText("“" + bullText[idx] + "”\n", 90, 755);
    ctx.font = 'bold 11px Helvetica';
    ctx.fillText(" — " + bullAuthor[idx], 160, 790);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(filePath, buffer);
}

function getRandom(min,max){
    return Math.floor(Math.random()*max)+min;
};

async function getQRCodeAsync(data) {
    return new Promise((resolve, reject) => {
        QRCode.toDataURL(data, function (err, url) {
            resolve(url);
        });
    });
}

async function loadImageFromDataUrlAsync(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = function() {
            resolve(img);
        }
        img.onerror = err => { throw err }
        img.src = dataUrl;
    });
}

async function loadImageAsync(path) {
    return new Promise((resolve, reject) => {
        loadImage(path).then((image) => {
            resolve(image);
        });
    });
}

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