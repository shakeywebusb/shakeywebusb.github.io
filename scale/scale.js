(function () {
	'use strict';
	let textEncoder = new TextEncoder();
	document.addEventListener('DOMContentLoaded', event => {
		let connectButton = document.querySelector("#connect");
		let buttonKG = document.querySelector("#KG");
		let buttonLB = document.querySelector("#LB");
		let buttonOZ = document.querySelector("#OZ");
		let buttonTARE = document.querySelector("#TARE");
		let statusDisplay = document.querySelector('#status');
		let rawreadingDisplay = document.querySelector('#rawreading');
		let stableDisplay = document.querySelector('#stable');
		let unitDisplay = document.querySelector('#unit');
		let unitvalueDisplay = document.querySelector('#unitvalue');
		
		let port;
		let buffer="";
		let start=false;
		let complete=false;

		function connect() {
			port.connect().then(() => {
				statusDisplay.textContent = 'Connected to ' + port.device_.productName;
				connectButton.textContent = 'Disconnect';
				port.send(textEncoder.encode('E'));
				
				port.onReceive = data => {
					let textDecoder = new TextDecoder();
					var str = textDecoder.decode(data)
					//console.log(str);
					
					if (start) {
						buffer +=str;
					}
					
					switch (str) {
						case 'C':
							start=true;
							buffer="";
							break;
						case '\n':
							complete=true;
							buffer = buffer.replace(/(\r\n|\n|\r)/gm, "");
							var lastChar = buffer.substr(-1);
							
							if (lastChar=='S') 
								stableDisplay.textContent = 'STABLE';
							else if (lastChar=='N')
								stableDisplay.textContent = 'UNSTABLE';
							
							buffer = buffer.substr(0, buffer.length-1);
							rawreadingDisplay.textContent = buffer;
							
							switch (unitDisplay.textContent) {
								case 'kg':
									unitvalue.textContent = Number(buffer);
									break;
								case 'lb':
									unitvalue.textContent = Number(buffer) * 2.20462262185;
									break;
								case 'oz':
									unitvalue.textContent = Number(buffer) * 35.27396195;
									break;
								default:
									unitvalue.textContent = '';
							}
							break;
						case 'A':
							start=true;
							buffer="";
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
					}
				}
				port.onReceiveError = error => {
					console.error(error);
				};
			}, error => {
				statusDisplay.textContent = error;
			});
		}

		connectButton.addEventListener('click', function () {
			if (port) {
				port.disconnect();
				connectButton.textContent = 'Connect';
				statusDisplay.textContent = '';
				port = null;
			} else {
				serial.requestPort().then(selectedPort => {
					port = selectedPort;
					connect();
				}).catch (error => {
					statusDisplay.textContent = error;
				});
			}
		});

		buttonKG.addEventListener('click', function () {
			if (!port) {
				return;
			}
			port.send(textEncoder.encode("E"));
		});
		buttonLB.addEventListener('click', function () {
			if (!port) {
				return;
			}
			port.send(textEncoder.encode("F"));
		});
		buttonOZ.addEventListener('click', function () {
			if (!port) {
				return;
			}
			port.send(textEncoder.encode("G"));
		});
		buttonTARE.addEventListener('click', function () {
			if (!port) {
				return;
			}
			port.send(textEncoder.encode("D"));
		});

		serial.getPorts().then(ports => {
			if (ports.length == 0) {
				statusDisplay.textContent = 'No device found.';
			} else {
				statusDisplay.textContent = 'Connecting...';
				port = ports[0];
				connect();
			}
		});
	});
})();
