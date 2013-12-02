// *** GLOBAL VARIABLE DECLARATION *** //

var wsURI = "wss://ws.blockchain.info/inv";
var counterTX = 0;
var zero, time, timeHr, timeMin, timeSec, cleanTime;
var qInfoHidden = true;
var donateQRHidden = true;
var webSocketOpen = false;

// *** WEBSOCKET FUNCTIONS *** //

function initWebSocket() {
    websocket = new WebSocket(wsURI);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt) {
	// Needed for updateClock func
	zero = Date.now() / 1000 |0;
	webSocketOpen = true;

	websocket.send('{"op":"unconfirmed_sub"}');
	websocket.send('{"op":"blocks_sub"}');
}

function onClose(evt){
	initWebSocket(); // Reinitialize WebSocket
}

function onMessage(evt) {
	// Parse JSON string into JSON object
	var jsonResp = JSON.parse(evt.data);
	
	// Call tx or block function based on response
	if (jsonResp.op == "utx") manageNewTX(jsonResp);
}

function onError(evt) {
	// Do nothing
}

// *** TIER II FUNCTIONS *** //

function manageNewTX(jsonResp) {
	// Instantiate new TX and plot on map after checking for errors
	var newTX = new TX(jsonResp.x.relayed_by, 0, jsonResp.x.hash, jsonResp.x.time);
	if (newTX.hasError) return;
	
	// Map TX on mainCanvas
	newTX.mapNode();
	newTX.ripple();
	newTX.heatNet();
	newTX.sideLine();

	updateExternalDisplays(newTX);
}

function toggleDivDisplay(el, elHidden) {
	// Both el and elHidden must be passed as strings
	if (window[elHidden]) {
		document.getElementById(el).style.visibility = 'visible';
		window[elHidden] = false;
	} else {
		document.getElementById(el).style.visibility = 'hidden';
		window[elHidden] = true;
	}
}

function updateExternalDisplays(tx) {
	// Increment TX counter and bottom-center TX descriptor
	counterTX++;
	document.getElementById('pageNumofTX').innerHTML = counterTX;
	document.title ="Bitcoin-RT [" + counterTX + " tx]";
	
	var txText = "TX Hash: <b>" + tx.hash.substring(0,15) + "</b><br />Relay IP: <b>" + tx.ipAdd + "</b><br />Location: <b>"
		 + cleanStringLocation(tx) + "</b><br />Lat, Long: <b>" + tx.latitude + ", " + tx.longitude + "</b>";
	document.getElementById('elLatestTX').innerHTML = txText;
}

function cleanStringLocation(tx) {
	// Prettify tx location strings and concatenate
	var cleanString;

	cleanString = (tx.city !== "") ? tx.city + ", " : "Unidentified city in ";
	cleanString = ((tx.country == "USA") && (tx.region !== "")) ? cleanString + tx.region + ", " + tx.country : cleanString + tx.country;
	cleanString = ((tx.ipName == "") || (tx.ipName == "null")) ? cleanString : cleanString + " (" + tx.ipName + ")";

	// debug, delete
	if (tx.city == "") console.log(tx.ipAdd);

	return cleanString;
}

function updateClock() {
	// Update page clock

	if (!webSocketOpen) return;

	// There has to be an easier way to do this - why the fuck don't we have metric time yet?

	time = (Date.now() / 1000 |0) - zero;

	timeHr = time / 3600 |0;
	timeMin = (time % 3600) / 60 |0;
	timeSec = (time % 3600) % 60;

	timeMin = (timeMin < 10) ? "0" + timeMin : timeMin;
	timeSec = (timeSec < 10) ? "0" + timeSec : timeSec;

	cleanTime = timeHr + ":" + timeMin + ":" + timeSec;
	document.getElementById('pageClock').innerHTML = cleanTime;
}