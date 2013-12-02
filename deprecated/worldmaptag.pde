/* @pjs preload="worldmap_bg.png"; */

PImage backgroundMap;
PImage coinlogo;
float framerate = 24;
float mapGeoLeft   = -180.00;          // Longitude 180 degrees W
float mapGeoRight  =  180.00;          // Longitude 180 degrees E
float mapGeoTop    =   90.00;          // Latitude 90 degrees N
float mapGeoBottom =  -90.00;          // Latitude 90 degrees S
float mapScreenWidth, mapScreenHeight;  // Dimension of map in pixels
float rDiaMax = 250;
boolean firstDraw = true;

void setup()
{
  size(window.innerWidth,window.innerHeight);
  frameRate(framerate);
  loop();
  smooth();
  backgroundMap   = loadImage("worldmap_bg.png");
  mapScreenWidth  = width;
  mapScreenHeight = height;
}

void draw()
{
	if (firstDraw == true) {
		image(backgroundMap,0,0,mapScreenWidth,mapScreenHeight);
		firstDraw = false;
	} else {
	}
}

public PVector pixelToGeo(PVector screenLocation)
{
	// Converts screen coordinates into geographical coordinates. 
	// Useful for interpreting mouse position.
    return new PVector(mapGeoLeft + (mapGeoRight-mapGeoLeft)*(screenLocation.x)/mapScreenWidth),mapGeoTop - (mapGeoTop-mapGeoBottom)*(screenLocation.y)/mapScreenHeight;
}


public PVector geoToPixel(PVector geoLocation)
{
	// Converts geographical coordinates into screen coordinates.
	// Useful for drawing geographically referenced items on screen.
    return new PVector(mapScreenWidth*(geoLocation.x-mapGeoLeft)/(mapGeoRight-mapGeoLeft),mapScreenHeight - mapScreenHeight*(geoLocation.y-mapGeoBottom)/(mapGeoTop-mapGeoBottom));
}



public class TXNode
{
	// Variables
	float x, y;
	float txRad;
	float rDia;
	
	// Constructor
	public TXNode(float xpos, float ypos, float nodeRad)
	{
		txRad = nodeRad;
		rDia = 0.1;
		
		PVector p = geoToPixel(new PVector(xpos,ypos));
		x = p.x;
		y = p.y;
		
	}

	// Functions
	void mapTX()
	{
		strokeWeight(1);
		
		// stroke(75);
		// line(x,y,x-5,y+5);
		// line(x,y,x+4,y-0.7);
		// line(x,y,x-3,y-4.4);
	
		fill(255,255,255);
		noStroke();
		ellipse(x,y,txRad,txRad);

	}
	
	void ripple(rad, rColor)
	{

	noFill();
	strokeWeight(1);
	stroke(rColor);	
	
	ellipse(x, y, rad, rad);
	}
	
}
