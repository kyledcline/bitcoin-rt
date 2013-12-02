var wsURI = "wss://websocket.mtgox.com:80/mtgox?Currency=USD";


// *** WEBSOCKET (ws.blockchain.info) FUNCTIONS *** //

function initWebSocket()
{
    websocket = new WebSocket(wsURI);
    websocket.onopen = function(evt) { onOpen(evt) };
    websocket.onclose = function(evt) { onClose(evt) };
    websocket.onmessage = function(evt) { onMessage(evt) };
    websocket.onerror = function(evt) { onError(evt) };
}

function onOpen(evt)
{
	websocket.send('{"op":"mtgox.subscribe","type":"ticker"}');
}

function onClose(evt)
{
	initWebSocket(); // Reinitialize WebSocket
}

function onError(evt)
{
	// Do nothing
}

function onMessage(evt)
{
	console.log(evt.data);	
}