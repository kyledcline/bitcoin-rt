// *** GLOBAL VARIABLE DECLARATION *** //

var mainCanvas;
var mapGeoLeft   = -180.0000;
var mapGeoRight  =  180.0000;
var mapGeoTop    =   90.0000;
var mapGeoBottom =  -90.0000;
var mapScreenWidth = window.innerWidth;
var mapScreenHeight = window.innerHeight;

// *** TOP-LEVEL FUNCTIONS *** //

function initCanvas() {

	// Create and set main canvas properties
	mainCanvas = new fabric.StaticCanvas('main');
	mainCanvas.selection = false;
	mainCanvas.setDimensions({
		width  : window.innerWidth,
		height : window.innerHeight
	});

	// Initialize and render background image
	mainCanvas.setBackgroundImage('images/worldmap_bg.png', mainCanvas.renderAll.bind(mainCanvas));

	// Initialize fading header
	initHeader();

	// Initialize WebSocket
	initWebSocket();
}

function initHeader() {
	var headerLogoMain = new fabric.Text(
		"Bitcoin-RT",
		{
			originX: 'left',
			left: 30,
			top: 30,
			fontSize: 26,
			fontWeight: 'bold',
			fontStyle: 'italic',
			fill: 'white',
			opacity: 1,
			fontFamily: 'Trebuchet MS',
			selectable: false
		}
	);

	var headerLogoMini = new fabric.Text(
		"Watch global bitcoin transactions relayed in realtime",
		{
			originX: 'left',
			left: 30,
			top: 54,
			fontSize: 12,
			fontStyle: 'italic',
			fill: 'white',
			opacity: 1,
			fontFamily: 'Trebuchet MS',
			selectable: false
		}
	);	

	mainCanvas.add(headerLogoMain);
	mainCanvas.add(headerLogoMini);
	
	headerLogoMain.animate('opacity', 0, {
		onChange: mainCanvas.renderAll.bind(mainCanvas),
		onComplete: mainCanvas.remove.bind(mainCanvas, headerLogoMain),
		duration: 15000
	});

	headerLogoMini.animate('opacity', 0, {
		onChange: mainCanvas.renderAll.bind(mainCanvas),
		onComplete: mainCanvas.remove.bind(mainCanvas, headerLogoMain),
		duration: 15000
	});

}

// *** OBJECT CONSTRUCTORS *** //

function TX(ipAdd, confs, hash, timeRelayed) {	
	// Object TX Constructor

	this.hasError = false;
	
	// Parse ipAdd into integer representation and query mySQL CDDB for location info
	var tempIPtoStrArray = ipAdd.split(".");
	var tempIPtoIntArray = tempIPtoStrArray.map(function(x) { return parseInt(x, 10); });
	var tempIntIpAdd = (16777216*tempIPtoIntArray[0])+(65536*tempIPtoIntArray[1])+(256*tempIPtoIntArray[2])+tempIPtoIntArray[3];
	jsmysqlSetOption("output_type","json");
	var jsonLoc = jsmysqlQuery("SELECT l.* FROM blocks b JOIN locations l ON (b.locId = l.locId) WHERE " + tempIntIpAdd + " BETWEEN b.startIp AND b.endIp LIMIT 1;");
	
	// Return if errors occur
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
	this.continent = jsonLoc.continent;
	
	// Object TX methods
	this.mapNode = function() {		
		this.node = new fabric.Circle({
			radius: 0.75,
			fill: 'white',
			left: this.xpos,
			top: this.ypos,
			selectable: false
		});
		mainCanvas.add(this.node);
	}
	
	this.ripple = function() {
		var strkClr = 'white';
	
		this.rip = new fabric.Circle({
			radius: 1,
			fill: '',
			stroke: strkClr,
			strokeWidth: 1,
			hasBorders: false,
			hasControls: false,
			left: this.xpos,
			top: this.ypos,
			selectable: false
		});
		mainCanvas.add(this.rip);
		this.rip.animate('radius', '10', {
			onChange: mainCanvas.renderAll.bind(mainCanvas),
			onComplete: mainCanvas.remove.bind(mainCanvas, this.rip),
			duration: 750
		});
	}
	
	this.heatNet = function() {
		// Generate random heatlines in polar plane, transform to Cartesian plane and plot
		var r, theta;
		var rMax = 15;
		var thetaMax = 2*Math.PI;
		var cartX = new Array(3);
		var cartY = new Array(3);
		var lineOpacity = 0.05;
		this.heatLine = new Array();

		for (var i = 0; i < 3; i++) {
			r = rMax*Math.random();
			theta = thetaMax*Math.random();

			cartX[i] = r*Math.cos(theta);
			cartY[i] = r*Math.sin(theta);

			this.heatLine[i] = new fabric.Line(
				[this.xpos, this.ypos, this.xpos+cartX[i], this.ypos+cartY[i]],
				{
					strokeWidth: 0.75,
					stroke: 'white',
					opacity: lineOpacity,
					selectable: false
				}
			);
		}
		
		mainCanvas.add(this.heatLine[0], this.heatLine[1], this.heatLine[2]);
	}
	
	this.sideLine = function() {
		// Display basic TX info to the right of node
		var sideLineString = cleanStringLocation(this);

		// Instantiate sideLine object and display
		this.sideLineObj = new fabric.Text(
			sideLineString, 
			{
				fill: 'white',
				opacity: 1,
				fontSize: 10,
				fontFamily: 'Droid Sans Mono',
				originX: 'left',
				left: this.xpos+12,
				top: this.ypos,
				selectable: false
			}
		);

		mainCanvas.add(this.sideLineObj);

		// Fade out sideLine object
		this.sideLineObj.animate('opacity', 0, {
			onChange: mainCanvas.renderAll.bind(mainCanvas),
			onComplete: mainCanvas.remove.bind(mainCanvas, this.sideLineObj),
			duration: 5000
		});
	}
}