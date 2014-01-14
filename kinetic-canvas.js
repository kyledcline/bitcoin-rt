// *** GLOBAL VARIABLE DECLARATION *** //
var stage, layer0, layer1, layer2;
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

	layer0 = new Kinetic.Layer(); // background
	layer1 = new Kinetic.Layer(); // tx
	layer2 = new Kinetic.Layer(); // logo

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

	var logo = new otherShape();
	logo.logoDisplay();

	initWebSocket();
}

function initLogo() {
	var logoText = "Bitcoin-RT";
	var subtitleText = "Watch bitcoin transactions relayed across the globe in realtime";

	var logoObj = new Kinetic.Text({
		text: logoText,
		x: 0,
		y: 0,
		fill: 'white',
		fontSize: 64,
		fontFamily: 'Share Tech Mono',
		opacity: 1
	});

	layer2.add(logoObj);
	stage.add(layer2);

	// var easeInLogo = new Kinetic.Tween({
	// 	node: logoObj,
	// 	duration: 3,
	// 	x: stage.getWidth() / 2
	// });

	//easeInLogo.play();
}

function debugLogo() {

	layer2.getChildren().each(function(shape) {
		console.log(shape.getOpacity());
		console.log(shape.getAbsoluteZIndex());
		console.log(shape.isVisible());
	});
}

// *** OBJECT CONSTRUCTOR *** //

function TX(jsonLoc) {
	// Object TX Constructor

	this.hasError = false;

	// Object TX properties
	this.longitude = jsonLoc.longitude; // postgreSQL
	this.latitude = jsonLoc.latitude; // postgreSQL
	this.country = jsonLoc.country; // postgreSQL
	this.region = jsonLoc.region; // postgreSQL
	this.city = jsonLoc.city; // postgreSQL
	this.postalCode = jsonLoc.postalcode; // postgreSQL
	this.metroCode = jsonLoc.metrocode; // postgreSQL
	this.areaCode = jsonLoc.areacode; // postgreSQL
	this.ipName = jsonLoc.ipname; // plaintext name for known IPs, like "Blockchain.info" or "SatoshiDICE" (future dev)
	this.xpos = mapScreenWidth*(this.longitude-mapGeoLeft)/(mapGeoRight-mapGeoLeft);
	this.ypos = mapScreenHeight - mapScreenHeight*(this.latitude-mapGeoBottom)/(mapGeoTop-mapGeoBottom);
	this.continent = jsonLoc.continent; // postgreSQL (future dev)
	
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

function otherShape() {

	this.logoDisplay = function() {
		var logoText = "Bitcoin-RT";
		var subtitleText = "Watch bitcoin transactions relayed across the globe in realtime";

		var logoObj = new Kinetic.Text({
			text: logoText,
			x: 0,
			y: 0,
			fill: 'white',
			fontSize: 64,
			fontFamily: 'Share Tech Mono',
			opacity: 1
		});

		layer2.add(logoObj);
		stage.add(layer2);
	}
}