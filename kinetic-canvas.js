// *** GLOBAL VARIABLE DECLARATION *** //
var stage, layer0, layer1;
var mapGeoLeft   = -180.0000;
var mapGeoRight  =  180.0000;
var mapGeoTop    =   90.0000;
var mapGeoBottom =  -90.0000;
var mapScreenWidth = window.innerWidth;
var mapScreenHeight = window.innerHeight;

// *** TOP-LEVEL FUNCTIONS *** //

function initCanvas() {

	stage = new Kinetic.Stage({
		container: 'container',
		width: mapScreenWidth,
		height: mapScreenWidth
	});

	layer0 = new Kinetic.Layer();
	layer1 = new Kinetic.Layer();

	var imageObj = new Image();
	imageObj.onload = function() {
		var bgWorldImg = new Kinetic.Image({
			x: 0,
			y: 0,
			image: imageObj,
			width: mapScreenWidth,
			height: mapScreenHeight
		});
	layer0.add(bgWorldImg);
	stage.add(layer0);
	}
	imageObj.src = 'images/worldmap_bg.png';

	// initHeader();

	initWebSocket();
}

// *** OBJECT CONSTRUCTOR *** //

function TX(ipAdd, confs, hash, timeRelayed) {
	// Object TX Constructor

	this.hasError = false;

	// Parse ipAdd into integer representation and query mySQL CDDB for location info
	var tempIPtoStrArray = ipAdd.split(".");
	var tempIPtoIntArray = tempIPtoStrArray.map(function(x) { return parseInt(x, 10); });
	var tempIntIpAdd = (16777216*tempIPtoIntArray[0])+(65536*tempIPtoIntArray[1])+(256*tempIPtoIntArray[2])+tempIPtoIntArray[3];
	jsmysqlSetOption("output_type","json");
	var jsonLoc = jsmysqlQuery("SELECT l.* FROM blocks b JOIN locations l ON (b.locId = l.locId) WHERE " + tempIntIpAdd + " BETWEEN b.startIp AND b.endIp LIMIT 1;");
	
	// Let other functions know if errors occur
	if (!jsonLoc.hasOwnProperty("locId")) this.hasError = true;
	
	// Object TX properties
	this.ipAdd = ipAdd; // WebSocket
	this.confs = confs; // WebSocket
	this.hash = hash; // WebSocket
	this.timeRelayed = timeRelayed; // WebSocket
	this.longitude = jsonLoc.longitude; // mySQL
	this.latitude = jsonLoc.latitude; // mySQL
	this.country = jsonLoc.country; // mySQL
	this.region = jsonLoc.region; // mySQL
	this.city = jsonLoc.city; // mySQL
	this.postalCode = jsonLoc.postalCode; // mySQL
	this.metroCode = jsonLoc.metroCode; // mySQL
	this.areaCode = jsonLoc.areaCode; // mySQL
	this.ipName = jsonLoc.ipName; // plaintext name for known IPs, like "Blockchain.info" or "SatoshiDICE" (future dev)
	this.xpos = mapScreenWidth*(this.longitude-mapGeoLeft)/(mapGeoRight-mapGeoLeft);
	this.ypos = mapScreenHeight - mapScreenHeight*(this.latitude-mapGeoBottom)/(mapGeoTop-mapGeoBottom);
	this.continent = jsonLoc.continent; // mySQL (future dev)
	
	// Object TX Methods

	this.mapNode = function() {
		var nodeCir = new Kinetic.Circle({
			x: this.xpos,
			y: this.ypos,
			radius: 0.75,
			fill: 'white',
			strokeWidth: 0
		});

		layer1.add(nodeCir);
		stage.add(layer1);
	}

	this.ripple = function() {
		// Generate animated rippling circle at node
		var rip = new Kinetic.Circle({
			x: this.xpos,
			y: this.ypos,
			radius: 0.75,
			stroke: 'white',
			strokeWidth: 1,
			opacity: 1
		});

		layer1.add(rip);
		stage.add(layer1);

		var ripEffect = new Kinetic.Tween({
			node: rip,
			duration: 0.75,
			radius: 10,
			onFinish: function() { rip.destroy(); }
		});

		ripEffect.play();
	}

	this.heatNet = function() {
		// Generate random heatlines in polar plane, transform to Cartesian plane and plot
		var numHL = 3;
		var r, theta;
		var rMax = 15;
		var thetaMax = 2*Math.PI;
		var cartX = new Array(numHL);
		var cartY = new Array(numHL);
		var heatLines = new Array(numHL);

		for (var i = 0; i < numHL; i++) {
			r = rMax*Math.random();
			theta = thetaMax*Math.random();

			cartX[i] = r*Math.cos(theta);
			cartY[i] = r*Math.sin(theta);

			heatLines[i] = new Kinetic.Line({
				points: [this.xpos, this.ypos, this.xpos+cartX[i], this.ypos+cartY[i]],
				stroke: 'white',
				strokeWidth: 1,
				opacity: 0.05
			});

			layer1.add(heatLines[i]);
		}
		stage.add(layer1);
	}

	this.sideLine = function() {
		// Display basic TX info to the right of node
		var sideLineString = cleanStringLocation(this);
		var xFix, yFix;

		// Instantiate sideLine object and display
		var sideLineObj = new Kinetic.Text({
			text: sideLineString,
			x: this.xpos,
			y: this.ypos,
			fill: 'white',
			opacity: 1,
			fontSize: 10,
			fontFamily: 'Droid Sans Mono'
		});

		// Fix sideLine offsets to account for text bleeding off of page (anywhere eastward of Japan)
		xFix = (this.longitude < 130) ? -12 : sideLineObj.getWidth() + 12;
		yFix = 6;
		sideLineObj.setOffset(xFix, yFix);

		layer1.add(sideLineObj);
		stage.add(layer1);

		// Fade out sideLine object
		var fadeOutObj = new Kinetic.Tween({
			node: sideLineObj,
			duration: 5,
			opacity: 0,
			onFinish: function() { sideLineObj.destroy(); }
		});

		fadeOutObj.play();
	}
}