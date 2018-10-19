(function() {
  'use strict';
  let textEncoder = new TextEncoder();
  document.addEventListener('DOMContentLoaded', event => {
    let connectButton = document.querySelector("#connect");
	let upButton      = document.querySelector("#up");
	let downButton      = document.querySelector("#down");
	let leftButton      = document.querySelector("#left");
	let rightButton      = document.querySelector("#right");
	let spaceButton      = document.querySelector("#space");
	let clickButton      = document.querySelector("#click");

	let statusDisplay = document.querySelector('#status');
    let port;

    function connect() {
      port.connect().then(() => {
        statusDisplay.textContent = '';
        connectButton.textContent = 'Disconnect';

        port.onReceive = data => {
          let textDecoder = new TextDecoder();
          console.log(textDecoder.decode(data));
        }
        port.onReceiveError = error => {
          console.error(error);
        };
      }, error => {
        statusDisplay.textContent = error;
      });
    }

    connectButton.addEventListener('click', function() {
      if (port) {
        port.disconnect();
        connectButton.textContent = 'Connect';
        statusDisplay.textContent = '';
        port = null;
      } else {
        serial.requestPort().then(selectedPort => {
          port = selectedPort;
          connect();
        }).catch(error => {
          statusDisplay.textContent = error;
        });
      }
    });
	
    upButton.addEventListener('click', function() {
      if (!port) {
	  
        return;
      }
		port.send(textEncoder.encode("U"));
    });
	
    downButton.addEventListener('click', function() {
		if (!port) {
	  
        return;
      }
		port.send(textEncoder.encode("D"));
    });

    leftButton.addEventListener('click', function() {
		if (!port) {
	  
        return;
      }
		port.send(textEncoder.encode("L"));
    });
    rightButton.addEventListener('click', function() {
		if (!port) {
	  
        return;
      }
		port.send(textEncoder.encode("R"));
    });
    spaceButton.addEventListener('click', function() {
		if (!port) {
	  
        return;
      }
		port.send(textEncoder.encode("S"));
    });
    clickButton.addEventListener('click', function() {
		if (!port) {
	  
        return;
      }
		port.send(textEncoder.encode("C"));
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
