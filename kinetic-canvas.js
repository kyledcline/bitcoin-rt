// *** GLOBAL VARIABLE DECLARATION *** //
var stage, layer0, layer1, layer2, layer3, layer4;
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
	layer1 = new Kinetic.Layer(); // nodes, heatnets
	layer2 = new Kinetic.Layer(); // ripples
	layer3 = new Kinetic.Layer(); // sidelines
	layer4 = new Kinetic.Layer(); // top-layer (logos)

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

	initWebSocket();
	}
	imageObj.src = 'images/worldmap_bg.png';
}

function initLogo() {
	var logoText = "Bitcoin-RT";
	var subtitleText = "Watch bitcoin transactions relayed across the globe in realtime";

	// All top logo code
	var logoObj = new Kinetic.Text({
		text: logoText,
		x: 0,
		y: mapScreenHeight / 2 - 72,
		fill: 'white',
		fontSize: 72,
		fontFamily: 'Changa One',
		opacity: 1
	});
	layer4.add(logoObj);

	var easeInLogo = new Kinetic.Tween({
		node: logoObj,
		duration: 1,
		easing: Kinetic.Easings.BackEaseOut,
		x: (mapScreenWidth / 2) - (logoObj.getWidth() / 2),
		onFinish: function() { fadeLogo.play(); }
	});

	var fadeLogo = new Kinetic.Tween({
		node: logoObj,
		duration: 7,
		opacity: 0
	});

	// All sublogo code
	var logoSubObj = new Kinetic.Text({
		text: subtitleText,
		x: mapScreenWidth,
		y: mapScreenHeight / 2,
		fill: 'white',
		fontSize: 24,
		fontFamily: 'Changa One',
		fontStyle: 'italic',
		opacity: 1
	});
	layer4.add(logoSubObj);

	var easeInLogoSub = new Kinetic.Tween({
		node: logoSubObj,
		duration: 1,
		easing: Kinetic.Easings.BackEaseOut,
		x: (mapScreenWidth / 2) - (logoSubObj.getWidth() / 2),
		onFinish: function() { fadeLogoSub.play(); }
	});

	var fadeLogoSub = new Kinetic.Tween({
		node: logoSubObj,
		duration: 7,
		opacity: 0
	});

	stage.add(layer4);
	easeInLogo.play();
	easeInLogoSub.play();
}

function animateNewBlock() {

	var blockRect = new Kinetic.Rect({
		x: 0,
		y: 0,
		width: mapScreenWidth,
		height: mapScreenHeight,
		fill: 'white',
		stroke: 'white',
		strokeWidth: 5,
		opacity: 1
	});
	layer4.add(blockRect);

	var implodeBlock = new Kinetic.Tween({
		node: blockRect,
		duration: 0.5,
		x: 0,
		y: mapScreenHeight,
		width: 0,
		height: 0,
		opacity: 0,
		easing: Kinetic.Easings.Linear,
		onFinish: function() { blockRect.destroy(); }
	});

	var blockText = new Kinetic.Text({
		x: mapScreenWidth / 2,
		y: mapScreenHeight / 2,
		text: 'New block found!',
		fontSize: 24,
		fontFamily: 'Changa One',
		fill: 'white',
		opacity: 1
	});
	blockText.setOffset(blockText.getWidth()/2, 0);
	layer4.add(blockText);

	var fadeBlockText = new Kinetic.Tween({
		node: blockText,
		opacity: 0,
		duration: 2,
		easing: Kinetic.Easings.EaseIn,
		onFinish: function() { blockText.destroy(); }
	});

	stage.add(layer4);
	implodeBlock.play();
	fadeBlockText.play();
}

// *** OBJECT CONSTRUCTOR *** //

function TX(jsonLoc, wsData) {
	// Object TX Constructor

	this.hasError = false;

	// Object TX properties
	this.ipAddress = wsData.x.relayed_by; // WebSocket
	this.hash = wsData.x.hash; // WebSocket
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

		layer2.add(rip);
		stage.add(layer2);

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
				opacity: 0.1
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
			fontFamily: 'Droid Sans Mono',
			shadowColor: 'black',
			shadowBlur: 2,
			shadowOffset: [1, 1],
			shadowOpacity: 0.2
		});

		// Fix sideLine offsets to account for text bleeding off of page (anywhere eastward of Japan)
		xFix = (this.longitude < 130) ? -12 : sideLineObj.getWidth() + 12;
		yFix = 6;
		sideLineObj.setOffset(xFix, yFix);

		layer3.add(sideLineObj);
		stage.add(layer3);

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