"use strict";

var canvas;
var gl;
var scale = 2;

var points = [];

var NumTimesToSubdivide = 5; 
var Theta = 45;

window.onload = function init()
{
if (Meteor.isClient) {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2( -1*0.7, -1*0.7 ),
        vec2(  0,  1),
        vec2(  1*0.7, -1*0.7 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                    NumTimesToSubdivide);
 
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    

    render();
}
};


function get_angle(a, b) {
	var new_angle = a*a+b*b;
	new_angle = Math.sqrt(new_angle);
	new_angle = scale*new_angle;
	new_angle = new_angle*radians(Theta);  //scale angle

   return new_angle;
}

function rotate(v) {  //rotates the damn vertex
   var x_val = v[0]; 
	var y_val = v[1];
   var rads = get_angle(x_val, y_val); 
	var cos_theta = Math.cos(rads);
	var sin_theta = Math.sin(rads);
	
	
	var newX, newY; 
	newX = x_val*cos_theta-y_val*sin_theta;
	newY = x_val*sin_theta+y_val*cos_theta;
	var result = vec2(newX, newY);
	return result;
}

function triangle( a, b, c )
{
	var newA= rotate(a);
	var newB = rotate(b);
	var newC = rotate(c);
	
    
    points.push(newA,newB, newC);
}


function divideTriangle( a, b, c, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c );
    }
    else {

        //bisect the sides
        

        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var bc = mix( b, c, 0.5 );
		 
        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length );
}
