var wsUri = "wss://ws.blockchain.info/inv";
var procSketch;
 
function init()
{
    initWebSocket();
}

function initWebSocket()
{
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt)
{
	doSend('{"op":"unconfirmed_sub"}');
	//doSend('{"op":"blocks_sub"}');
}

function onClose(evt)
{
	initWebSocket(); // Reinitialize WebSocket
}

function onMessage(evt)
{
	// Parse JSON string into JSON object
	var jsonObj = JSON.parse(evt.data);
	// Grab IP address and translate to integer representation
	var ipAdd = jsonObj.x.relayed_by;
	var intIpAdd = ipAddToIntegerRep(ipAdd);
	// Match geo IP in mySQL and return lat-long coordinates
	var jsonLocation = makeQueryCDDB("SELECT l.* FROM blocks b JOIN locations l ON (b.locId = l.locId) WHERE " + intIpAdd + " BETWEEN b.startIp AND b.endIp LIMIT 1;");
	// Check for errors
	if (!jsonLocation.hasOwnProperty("locId"))
		return;
	// Draw transaction on sketch
	drawTX(jsonLocation);
}

function onError(evt)
{
	// Do nothing
}

function doSend(message)
{ 
    websocket.send(message);
}

function ipAddToIntegerRep(ipAdd)
{
	var ipAddArray = ipAdd.split(".");
	var ipAddArrayInt = ipAddArray.map(function (x) {
		return parseInt(x, 10);
	});
	var intIpAdd = (16777216*ipAddArrayInt[0])+(65536*ipAddArrayInt[1])+(256*ipAddArrayInt[2])+ipAddArrayInt[3];
	
	return intIpAdd;
}
  
function makeQueryCDDB(query) 
{
	jsmysqlSetOption("output_type","json");
	return jsmysqlQuery(query);
}

function drawTX(jsonData)
{
	if (!procSketch) { procSketch = Processing.getInstanceById('worldmapcanvas'); }
	
	var txLong = parseFloat(jsonData.longitude);
	var txLat  = parseFloat(jsonData.latitude);
	
	var TX = new procSketch.TXNode(txLong, txLat, 2);
	TX.mapTX();
	TX.ripple(5,75);
	TX.ripple(10,25);
	//TX.ripple(15,25);

function iTXData()
{

}
	
}



