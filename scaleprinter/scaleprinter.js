(function () {
	'use strict';
	let textEncoder = new TextEncoder();
	document.addEventListener('DOMContentLoaded', event => {
		let connectButton = document.querySelector("#connect");
		let printerconnectButton = document.querySelector("#printerconnect");
		let printdataButton = document.querySelector("#printdata");
		let printtestdataButton = document.querySelector("#printtestdata");
		let buttonKG = document.querySelector("#KG");
		let buttonLB = document.querySelector("#LB");
		let buttonOZ = document.querySelector("#OZ");
		let buttonTARE = document.querySelector("#TARE");
		let statusDisplay = document.querySelector('#status');
		let printerstatusDisplay = document.querySelector('#printerstatus');
		let rawreadingDisplay = document.querySelector('#rawreading');
		let stableDisplay = document.querySelector('#stable');
		let unitDisplay = document.querySelector('#unit');
		let unitvalueDisplay = document.querySelector('#unitvalue');
		let boxidDisplay = document.querySelector('#boxid');
		let boxtypeDisplay = document.querySelector('#boxtype');

		let scaleport;
		let printerport;

		let buffer = "";
		let start = false;
		let ustart = false;
		let tstart = false;
		let complete = false;

		function printerconnect() {
			printerport.connect().then(() => {
				printerstatusDisplay.textContent = 'Connected to printer with PID ' + printerport.device_.productId.toString(16);
				printerconnectButton.textContent = 'Disconnect Printer' ;
			
			
			}, error => {
				printerstatusDisplay.textContent = error;
			});
		
		}

		function scaleconnect() {
			scaleport.connect().then(() => {
				statusDisplay.textContent = 'Connected to scale with PID ' + scaleport.device_.productId.toString(16);
				connectButton.textContent = 'Disconnect Scale';
				scaleport.send(textEncoder.encode('E'));

				scaleport.onReceive = data => {
					let textDecoder = new TextDecoder();
					var str = textDecoder.decode(data)
						console.log(str);

						if ((start) || (ustart) || (tstart)) {
							buffer += str;
						}

						switch (str) {
						case 'A':
							start = true;
							buffer = "";
							break;
						case 'U':
							ustart = true;
							buffer = "";
							break;
						case 'T':
							tstart = true;
							buffer = "";
							break;
						case 'C':
							start = true;
							buffer = "";
							break;
						case 'E':
							unitDisplay.textContent = 'kg';
							break;
						case 'F':
							unitDisplay.textContent = 'lb';
							break;
						case 'G':
							unitDisplay.textContent = 'oz';
							break;
						case '\n':
							if (start) {
								complete = true;
								//console.log(buffer + "-" + buffer.length);
								var tempbuffer = buffer;
								buffer = buffer.replace(/(\r\n|\n|\r)/gm, "");
								var lastChar = buffer.substr(-1);

								if (lastChar == 'S')
									stableDisplay.textContent = 'STABLE';
								else if (lastChar == 'N')
									stableDisplay.textContent = 'UNSTABLE';
								else {
									//console.log('breaking due to incorrect pack');
									//console.log(tempbuffer + "-" + tempbuffer.length);
									break;
								}

								buffer = buffer.substr(0, buffer.length - 1);
								rawreadingDisplay.textContent = buffer;

								switch (unitDisplay.textContent) {
								case 'kg':
									if (!isNaN(Number(buffer))) unitvalue.textContent = Number(buffer);
									break;
								case 'lb':
									if (!isNaN(Number(buffer))) unitvalue.textContent = Number(buffer) * 2.20462262185;
									if (unitvalue.textContent == 'NaN')
										console.log(tempbuffer + "-" + tempbuffer.length);
									break;
								case 'oz':
									if (!isNaN(Number(buffer))) unitvalue.textContent = Number(buffer) * 35.27396195;
									if (unitvalue.textContent == 'NaN')
										console.log(tempbuffer + "-" + tempbuffer.length);
									break;
								default:
									unitvalue.textContent = '';
								}
								start=false;
							} else if (ustart) {
								buffer = buffer.replace(/(\r\n|\n|\r)/gm, "");
								boxidDisplay.textContent=buffer;
								ustart=false;		
							} else if(tstart) {
								buffer = buffer.replace(/(\r\n|\n|\r)/gm, "");
								boxtypeDisplay.textContent=buffer;
								tstart=false;		
							} else
								buffer="";

							break;
						}
				}
				scaleport.onReceiveError = error => {
					console.error(error);
				};
			}, error => {
				statusDisplay.textContent = error;
			});
		}

		connectButton.addEventListener('click', function () {
			if (scaleport) {
				scaleport.disconnect();
				connectButton.textContent = 'Connect';
				statusDisplay.textContent = '';
				scaleport = null;
			} else {
				serial.requestPort().then(selectedPort => {
					scaleport = selectedPort;
					scaleconnect();
				}).catch (error => {
					statusDisplay.textContent = error;
				});
			}
		});

		printerconnectButton.addEventListener('click', function () {
			if (printerport) {
				printerport.disconnect();
				printerconnectButton.textContent = 'Connect Printer';
				printerstatusDisplay.textContent = '';
				printerport = null;
			} else {
				serial.requestPort().then(selectedPort => {
					printerport = selectedPort;
					printerconnect();
				}).catch (error => {
					printerstatusDisplay.textContent = error;
				});
			}
		});
		printdataButton.addEventListener('click', function () {
			if (!printerport) {
				alert("Printer not connected!");
				return;
			}
			printerport.send(textEncoder.encode('^XA^FD The weight is ' + unitvalueDisplay.textContent + unitDisplay.textContent + '^FS^XZ'));
		});
		printtestdataButton.addEventListener('click', function () {
			if (!printerport) {
				alert("Printer not connected!");
				return;
			}
			//printerport.send(textEncoder.encode('^XA^MNN^PW640^LL100^FO110,23^FDSHIP VIA AUSPOST EXPRESS^FS^XZ'));
			var x = document.getElementById("myTextarea").value;
			printerport.send(textEncoder.encode(x));
		});

		buttonKG.addEventListener('click', function () {
			if (!scaleport) {
				return;
			}
			scaleport.send(textEncoder.encode("E"));
		});
		buttonLB.addEventListener('click', function () {
			if (!scaleport) {
				return;
			}
			scaleport.send(textEncoder.encode("F"));
		});
		buttonOZ.addEventListener('click', function () {
			if (!scaleport) {
				return;
			}
			scaleport.send(textEncoder.encode("G"));
		});
		buttonTARE.addEventListener('click', function () {
			if (!scaleport) {
				return;
			}
			scaleport.send(textEncoder.encode("D"));
		});

		serial.getPorts().then(ports => {
			if (ports.length == 0) {
				statusDisplay.textContent = 'No device found.';
			} else {
				statusDisplay.textContent = 'Connecting...';
				for (var i=0; i< ports.length; i++) {
					if ((ports[i].device_.productId==0x2007) && (ports[i].device_.vendorId==0x310A)){
						console.log ('Found Shopify Label Printer');
						printerport = ports[i];
						printerconnect();
					}
					if ((ports[i].device_.productId==0x2001) && (ports[i].device_.vendorId==0x310A)){
						console.log ('Found Checkout Chick Label Printer');
						printerport = ports[i];
						printerconnect();
					}
					if ((ports[i].device_.productId==0x200A) && (ports[i].device_.vendorId==0x310A)){
						console.log ('Found Shopify Scale');
						scaleport = ports[i];
						scaleconnect();
					}
					
				}
			}
		});
	});
})();
