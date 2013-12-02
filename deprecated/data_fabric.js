
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
	
}



