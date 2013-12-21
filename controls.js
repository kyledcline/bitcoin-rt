// *** GLOBAL VARIABLE DECLARATION *** //

var wsURI = "wss://ws.blockchain.info/inv";
var counterTX = 0;
var zero, time, timeHr, timeMin, timeSec, cleanTime;
var qInfoHidden = true;
var donateQRHidden = true;
var webSocketOpen = false;
var chartFirstCall = true;
var continentsData = { NA: 0, SA: 0, EU: 0, AF: 0, AS: 0, OC: 0 };

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

	document.getElementById('pageStatus').innerHTML = "Connected to Bitcoin network!";

	websocket.send('{"op":"unconfirmed_sub"}');
	websocket.send('{"op":"blocks_sub"}');
}

function onClose(evt){
	initWebSocket(); // Reinitialize WebSocket
}

function onMessage(evt) {
	// Parse JSON string into JSON object
	var wsData = JSON.parse(evt.data);

	// Call tx or block function based on response
	if (wsData.op == "utx") handleOP(wsData);
}

function onError(evt) {
	// Do nothing
}

// *** TIER II FUNCTIONS *** //

function handleOP(wsData) {
	// Parse ipAdd into integer representation and query postgreSQL CDDB for location info
	var tempIPtoStrArray = wsData.x.relayed_by.split(".");
	var tempIPtoIntArray = tempIPtoStrArray.map(function(x) { return parseInt(x, 10); });
	var tempIntIpAdd = (16777216*tempIPtoIntArray[0])+(65536*tempIPtoIntArray[1])+(256*tempIPtoIntArray[2])+tempIPtoIntArray[3];
	jspgSetOption("output_type","json");
	
	jspgQuery("SELECT l.* FROM blocks b JOIN locations2 l ON (b.locid::text = l.locid_del) WHERE " + tempIntIpAdd + " BETWEEN b.startip AND b.endip LIMIT 1;", wsData);
	
	// Let other functions know if errors occur
	// if (!jsonLoc.hasOwnProperty("locid_del")) doWhat?

	// manageNewTX() will be called from jspgsql.js

}

function manageNewTX(ajaxResp, wsData) {
	// Instantiate new TX and plot on map after checking for errors
	var newTX = new TX(ajaxResp, wsData);
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
	counterTX++;
	document.getElementById('pageNumofTX').innerHTML = counterTX;
	document.title = "Bitcoin-RT [" + counterTX + " tx]";

	if (tx.continent == "NA") continentsData.NA++;
	if (tx.continent == "EU") continentsData.EU++;
	if (tx.continent == "AS") continentsData.AS++;

	var txText = "TX Hash: <b>" + tx.hash.substring(0,15) + "</b><br />Relay IP: <b>" + tx.ipAddress + "</b><br />Location: <b>"
		 + cleanStringLocation(tx) + "</b><br />Lat, Long: <b>" + tx.latitude + ", " + tx.longitude + "</b>";
	document.getElementById('pageStatus').innerHTML = txText;
}

function cleanStringLocation(tx) {
	// Prettify tx location strings and concatenate
	var cleanString;

	cleanString = (tx.city !== "") ? tx.city + ", " : "Unidentified city in ";
	cleanString = ((tx.country == "USA") && (tx.region !== "")) ? cleanString + tx.region + ", " + tx.country : cleanString + tx.country;
	cleanString = ((tx.ipName == "") || (tx.ipName == "null")) ? cleanString : cleanString + " (" + tx.ipName + ")";

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

function initCharts() {
	var options = {};
	if (chartFirstCall == true) {
		options = {
			segmentStrokeColor: "rgba(0,0,0,0)",
			animation: true,
			animationEasing: "easeInOutSine",
			animateScale: true
		};
	} else {
		options = {
			segmentStrokeColor: "rgba(0,0,0,0)",
			animation: false
		};
	}
	
	var data = [
		{
			// NA
			value: continentsData.NA,
			color: "rgba(255,255,255,0.5)"
		},
		{
			// SA
			value: continentsData.SA,
			color: "rgba(204,204,204,0.5)"
		},
		{
			// EU
			value: continentsData.EU,
			color: "rgba(153,153,153,0.5)"
		},
		{
			// AF
			value: continentsData.AF,
			color: "rgba(102,102,102,0.5)"
		},
		{
			// AS
			value: continentsData.AS,
			color: "rgba(51,51,51,0.5)"
		},
		{
			// OC
			value: continentsData.OC,
			color: "rgba(5,5,5,0.5)"
		}
	];
	var chartCanvas = document.getElementById('continentsChart').getContext('2d');
	var continentsChart = new Chart(chartCanvas).Pie(data, options);


}