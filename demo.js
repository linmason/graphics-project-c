//3456789_123456789_123456789_123456789_123456789_123456789_123456789_123456789_
// (JT: why the numbers? counts columns, helps me keep 80-char-wide listings)
//
// TABS set to 2.
//
// ORIGINAL SOURCE:
// RotatingTranslatedTriangle.js (c) 2012 matsuda
// HIGHLY MODIFIED to make:
//
// JT_MultiShader.js  for EECS 351-1, 
//									Northwestern Univ. Jack Tumblin

// Jack Tumblin's Project C -- step by step.

/* Show how to use 3 separate VBOs with different verts, attributes & uniforms. 
-------------------------------------------------------------------------------
	Create a 'VBObox' object/class/prototype & library to collect, hold & use all 
	data and functions we need to render a set of vertices kept in one Vertex 
	Buffer Object (VBO) on-screen, including:
	--All source code for all Vertex Shader(s) and Fragment shader(s) we may use 
		to render the vertices stored in this VBO;
	--all variables needed to select and access this object's VBO, shaders, 
		uniforms, attributes, samplers, texture buffers, and any misc. items. 
	--all variables that hold values (uniforms, vertex arrays, element arrays) we 
	  will transfer to the GPU to enable it to render the vertices in our VBO.
	--all user functions: init(), draw(), adjust(), reload(), empty(), restore().
	Put all of it into 'JT_VBObox-Lib.js', a separate library file.

USAGE:
------
1) If your program needs another shader program, make another VBObox object:
 (e.g. an easy vertex & fragment shader program for drawing a ground-plane grid; 
 a fancier shader program for drawing Gouraud-shaded, Phong-lit surfaces, 
 another shader program for drawing Phong-shaded, Phong-lit surfaces, and
 a shader program for multi-textured bump-mapped Phong-shaded & lit surfaces...)
 
 HOW:
 a) COPY CODE: create a new VBObox object by renaming a copy of an existing 
 VBObox object already given to you in the VBObox-Lib.js file. 
 (e.g. copy VBObox1 code to make a VBObox3 object).

 b) CREATE YOUR NEW, GLOBAL VBObox object.  
 For simplicity, make it a global variable. As you only have ONE of these 
 objects, its global scope is unlikely to cause confusions/errors, and you can
 avoid its too-frequent use as a function argument.
 (e.g. above main(), write:    var phongBox = new VBObox3();  )

 c) INITIALIZE: in your JS progam's main() function, initialize your new VBObox;
 (e.g. inside main(), write:  phongBox.init(); )

 d) DRAW: in the JS function that performs all your webGL-drawing tasks, draw
 your new VBObox's contents on-screen. 
 (NOTE: as it's a COPY of an earlier VBObox, your new VBObox's on-screen results
  should duplicate the initial drawing made by the VBObox you copied.  
  If that earlier drawing begins with the exact same initial position and makes 
  the exact same animated moves, then it will hide your new VBObox's drawings!
  --THUS-- be sure to comment out the earlier VBObox's draw() function call  
  to see the draw() result of your new VBObox on-screen).
  (e.g. inside drawAll(), add this:  
      phongBox.switchToMe();
      phongBox.draw();            )

 e) ADJUST: Inside the JS function that animates your webGL drawing by adjusting
 uniforms (updates to ModelMatrix, etc) call the 'adjust' function for each of your
VBOboxes.  Move all the uniform-adjusting operations from that JS function into the
'adjust()' functions for each VBObox. 

2) Customize the VBObox contents; add vertices, add attributes, add uniforms.
 ==============================================================================*/


// Global Variables  
//   (These are almost always a BAD IDEA, but here they eliminate lots of
//    tedious function arguments. 
//    Later, collect them into just a few global, well-organized objects!)
// ============================================================================
// for WebGL usage:--------------------
var gl;													// WebGL rendering context -- the 'webGL' object
																// in JavaScript with all its member fcns & data
var g_canvasID;									// HTML-5 'canvas' element ID#

// For multiple VBOs & Shaders:-----------------
worldBox = new VBObox0();		  // Holds VBO & shaders for 3D 'world' ground-plane grid, etc;
gouraudBox = new VBObox1();		  // "  "  for first set of custom-shaded 3D parts
phongBox = new VBObox2();     // "  "  for second set of custom-shaded 3D parts
gObj1Box = new VBObox3();
gObj2Box = new VBObox4();
gObj3Box = new VBObox5();

// For animation:---------------------
var g_lastMS = Date.now();			// Timestamp (in milliseconds) for our 
                                // most-recently-drawn WebGL screen contents.  
                                // Set & used by moveAll() fcn to update all
                                // time-varying params for our webGL drawings.
  // All time-dependent params (you can add more!)
var g_angleNow0  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate0 = 900.0;				// Rotation angle rate, in degrees/second.
                                //---------------
var g_angleNow1  = 100.0;       // current angle, in degrees
var g_angleRate1 =  1000.0;        // rotation angle rate, degrees/sec
var g_angleMax1  = 150.0;       // max, min allowed angle, in degrees
var g_angleMin1  =  60.0;
                                //---------------
var g_angleNow2  =  0.0; 			  // Current rotation angle, in degrees.
var g_angleRate2 =  100.0;				// Rotation angle rate, in degrees/second.

                                //---------------
var g_posNow0 =  0.0;           // current position
var g_posRate0 = 0.6;           // position change rate, in distance/second.
var g_posMax0 =  0.5;           // max, min allowed for g_posNow;
var g_posMin0 = -0.5;           
                                // ------------------
var g_posNow1 =  0.0;           // current position
var g_posRate1 = 0.5;           // position change rate, in distance/second.
var g_posMax1 =  1.0;           // max, min allowed positions
var g_posMin1 = -1.0;
                                //---------------

// For mouse/keyboard:------------------------
var g_show0 = 1;								// 0==Show, 1==Hide VBO0 contents on-screen.
var g_show1 = 1;								// 	"					"			VBO1		"				"				" 
var g_show2 = 0;                //  "         "     VBO2    "       "       "

// Save slider values for light position
var html_xSlider = document.getElementById("Light_xSlider");
var html_xOutput = document.getElementById("Light_xValue");
var g_light_x = html_xSlider.value;
html_xOutput.innerHTML = html_xSlider.value;
html_xSlider.oninput = function() {
  html_xOutput.innerHTML = this.value;
  g_light_x = this.value;
}
// Save slider values move all but g_light_y in function main?
var html_ySlider = document.getElementById("Light_ySlider");
var html_yOutput = document.getElementById("Light_yValue");
var g_light_y = html_ySlider.value;
html_yOutput.innerHTML = html_ySlider.value;
html_ySlider.oninput = function() {
  html_yOutput.innerHTML = this.value;
  g_light_y = this.value;
}
// Save slider values move all but g_light_y in function main?
var html_zSlider = document.getElementById("Light_zSlider");
var html_zOutput = document.getElementById("Light_zValue");
var g_light_z = html_zSlider.value;
html_zOutput.innerHTML = html_zSlider.value;
html_zSlider.oninput = function() {
  html_zOutput.innerHTML = this.value;
  g_light_z = this.value;
}

// Save slider values move all but g_light_y in function main?
var html_lightSwitch = document.getElementById("Light_Switch");
var g_lightSwitch = html_lightSwitch.checked;
html_lightSwitch.oninput = function() {
  g_lightSwitch = this.checked;
  console.log(g_lightSwitch);
}

// Save slider values for IA values
var html_IA_rSlider = document.getElementById("IA_rSlider");
var html_IA_rOutput = document.getElementById("IA_rValue");
var g_IA_r = html_IA_rSlider.value/255;
html_IA_rOutput.innerHTML = html_IA_rSlider.value;
html_IA_rSlider.oninput = function() {
  html_IA_rOutput.innerHTML = this.value;
  g_IA_r = this.value/255;
}
// Save slider values for IA values
var html_IA_gSlider = document.getElementById("IA_gSlider");
var html_IA_gOutput = document.getElementById("IA_gValue");
var g_IA_g = html_IA_gSlider.value/255;
html_IA_gOutput.innerHTML = html_IA_gSlider.value;
html_IA_gSlider.oninput = function() {
  html_IA_gOutput.innerHTML = this.value;
  g_IA_g = this.value/255;
}
// Save slider values for IA values
var html_IA_bSlider = document.getElementById("IA_bSlider");
var html_IA_bOutput = document.getElementById("IA_bValue");
var g_IA_b = html_IA_bSlider.value/255;
html_IA_bOutput.innerHTML = html_IA_bSlider.value;
html_IA_bSlider.oninput = function() {
  html_IA_bOutput.innerHTML = this.value;
  g_IA_b = this.value/255;
}

/*
const setupSlider = (sliderID, valueID, globalVal) => {
  var html_Slider = document.getElementById(sliderID);
  var html_Output = document.getElementById(valueID);
  globalVal = html_Slider.value/255;
  html_Output.innerHTML = html_Slider.value;
  html_Slider.oninput = function() {
    html_Output.innerHTML = this.value;
    globalVal = this.value/255;
  }
}
var g_ID_r = 0.0;
setupSlider("ID_rSlider", "ID_rValue", g_ID_r)
var g_ID_g = 0.0;
setupSlider("ID_gSlider", "ID_gValue", g_ID_g)
var g_ID_b = 0.0;
setupSlider("ID_bSlider", "ID_bValue", g_ID_b)
*/

// Save slider values for ID values
var html_ID_rSlider = document.getElementById("ID_rSlider");
var html_ID_rOutput = document.getElementById("ID_rValue");
var g_ID_r = html_ID_rSlider.value/255;
html_ID_rOutput.innerHTML = html_ID_rSlider.value;
html_ID_rSlider.oninput = function() {
  html_ID_rOutput.innerHTML = this.value;
  g_ID_r = this.value/255;
}
// Save slider values for ID values
var html_ID_gSlider = document.getElementById("ID_gSlider");
var html_ID_gOutput = document.getElementById("ID_gValue");
var g_ID_g = html_ID_gSlider.value/255;
html_ID_gOutput.innerHTML = html_ID_gSlider.value;
html_ID_gSlider.oninput = function() {
  html_ID_gOutput.innerHTML = this.value;
  g_ID_g = this.value/255;
}
// Save slider values for ID values
var html_ID_bSlider = document.getElementById("ID_bSlider");
var html_ID_bOutput = document.getElementById("ID_bValue");
var g_ID_b = html_ID_bSlider.value/255;
html_ID_bOutput.innerHTML = html_ID_bSlider.value;
html_ID_bSlider.oninput = function() {
  html_ID_bOutput.innerHTML = this.value;
  g_ID_b = this.value/255;
}

// Save slider values for IS values
var html_IS_rSlider = document.getElementById("IS_rSlider");
var html_IS_rOutput = document.getElementById("IS_rValue");
var g_IS_r = html_IS_rSlider.value/255;
html_IS_rOutput.innerHTML = html_IS_rSlider.value;
html_IS_rSlider.oninput = function() {
  html_IS_rOutput.innerHTML = this.value;
  g_IS_r = this.value/255;
}
// Save slider values for IS values
var html_IS_gSlider = document.getElementById("IS_gSlider");
var html_IS_gOutput = document.getElementById("IS_gValue");
var g_IS_g = html_IS_gSlider.value/255;
html_IS_gOutput.innerHTML = html_IS_gSlider.value;
html_IS_gSlider.oninput = function() {
  html_IS_gOutput.innerHTML = this.value;
  g_IS_g = this.value/255;
}
// Save slider values for IS values
var html_IS_bSlider = document.getElementById("IS_bSlider");
var html_IS_bOutput = document.getElementById("IS_bValue");
var g_IS_b = html_IS_bSlider.value/255;
html_IS_bOutput.innerHTML = html_IS_bSlider.value;
html_IS_bSlider.oninput = function() {
  html_IS_bOutput.innerHTML = this.value;
  g_IS_b = this.value/255;
}

// Save slider values for KA values
var html_KA_rSlider = document.getElementById("KA_rSlider");
var html_KA_rOutput = document.getElementById("KA_rValue");
var g_KA_r = html_KA_rSlider.value/255;
html_KA_rOutput.innerHTML = html_KA_rSlider.value;
html_KA_rSlider.oninput = function() {
  html_KA_rOutput.innerHTML = this.value;
  g_KA_r = this.value/255;
}
// Save slider values for KA values
var html_KA_gSlider = document.getElementById("KA_gSlider");
var html_KA_gOutput = document.getElementById("KA_gValue");
var g_KA_g = html_KA_gSlider.value/255;
html_KA_gOutput.innerHTML = html_KA_gSlider.value;
html_KA_gSlider.oninput = function() {
  html_KA_gOutput.innerHTML = this.value;
  g_KA_g = this.value/255;
}
// Save slider values for KA values
var html_KA_bSlider = document.getElementById("KA_bSlider");
var html_KA_bOutput = document.getElementById("KA_bValue");
var g_KA_b = html_KA_bSlider.value/255;
html_KA_bOutput.innerHTML = html_KA_bSlider.value;
html_KA_bSlider.oninput = function() {
  html_KA_bOutput.innerHTML = this.value;
  g_KA_b = this.value/255;
}

// Save slider values for KD values
var html_KD_rSlider = document.getElementById("KD_rSlider");
var html_KD_rOutput = document.getElementById("KD_rValue");
var g_KD_r = html_KD_rSlider.value/255;
html_KD_rOutput.innerHTML = html_KD_rSlider.value;
html_KD_rSlider.oninput = function() {
  html_KD_rOutput.innerHTML = this.value;
  g_KD_r = this.value/255;
}
// Save slider values for KD values
var html_KD_gSlider = document.getElementById("KD_gSlider");
var html_KD_gOutput = document.getElementById("KD_gValue");
var g_KD_g = html_KD_gSlider.value/255;
html_KD_gOutput.innerHTML = html_KD_gSlider.value;
html_KD_gSlider.oninput = function() {
  html_KD_gOutput.innerHTML = this.value;
  g_KD_g = this.value/255;
}
// Save slider values for KD values
var html_KD_bSlider = document.getElementById("KD_bSlider");
var html_KD_bOutput = document.getElementById("KD_bValue");
var g_KD_b = html_KD_bSlider.value/255;
html_KD_bOutput.innerHTML = html_KD_bSlider.value;
html_KD_bSlider.oninput = function() {
  html_KD_bOutput.innerHTML = this.value;
  g_KD_b = this.value/255;
}

// Save slider values for KS values
var html_KS_rSlider = document.getElementById("KS_rSlider");
var html_KS_rOutput = document.getElementById("KS_rValue");
var g_KS_r = html_KS_rSlider.value/255;
html_KS_rOutput.innerHTML = html_KS_rSlider.value;
html_KS_rSlider.oninput = function() {
  html_KS_rOutput.innerHTML = this.value;
  g_KS_r = this.value/255;
}
// Save slider values for KS values
var html_KS_gSlider = document.getElementById("KS_gSlider");
var html_KS_gOutput = document.getElementById("KS_gValue");
var g_KS_g = html_KS_gSlider.value/255;
html_KS_gOutput.innerHTML = html_KS_gSlider.value;
html_KS_gSlider.oninput = function() {
  html_KS_gOutput.innerHTML = this.value;
  g_KS_g = this.value/255;
}
// Save slider values for KS values
var html_KS_bSlider = document.getElementById("KS_bSlider");
var html_KS_bOutput = document.getElementById("KS_bValue");
var g_KS_b = html_KS_bSlider.value/255;
html_KS_bOutput.innerHTML = html_KS_bSlider.value;
html_KS_bSlider.oninput = function() {
  html_KS_bOutput.innerHTML = this.value;
  g_KS_b = this.value/255;
}

// Save slider values for KE values
var html_KE_rSlider = document.getElementById("KE_rSlider");
var html_KE_rOutput = document.getElementById("KE_rValue");
var g_KE_r = html_KE_rSlider.value/255;
html_KE_rOutput.innerHTML = html_KE_rSlider.value;
html_KE_rSlider.oninput = function() {
  html_KE_rOutput.innerHTML = this.value;
  g_KE_r = this.value/255;
}
// Save slider values for KE values
var html_KE_gSlider = document.getElementById("KE_gSlider");
var html_KE_gOutput = document.getElementById("KE_gValue");
var g_KE_g = html_KE_gSlider.value/255;
html_KE_gOutput.innerHTML = html_KE_gSlider.value;
html_KE_gSlider.oninput = function() {
  html_KE_gOutput.innerHTML = this.value;
  g_KE_g = this.value/255;
}
// Save slider values for KE values
var html_KE_bSlider = document.getElementById("KE_bSlider");
var html_KE_bOutput = document.getElementById("KE_bValue");
var g_KE_b = html_KE_bSlider.value/255;
html_KE_bOutput.innerHTML = html_KE_bSlider.value;
html_KE_bSlider.oninput = function() {
  html_KE_bOutput.innerHTML = this.value;
  g_KE_b = this.value/255;
}

// Save slider values for SE values
var html_SE_Slider = document.getElementById("SE_Slider");
var html_SE_Output = document.getElementById("SE_Value");
var g_SE = html_SE_Slider.value/255;
html_SE_Output.innerHTML = html_SE_Slider.value;
html_SE_Slider.oninput = function() {
  html_SE_Output.innerHTML = this.value;
  g_SE = this.value;
}

// Initalize lighting and shading type
var g_isBlinn = 1;
var g_isGouraud = 1; 


var MATL_RED_PLASTIC =    1;
var MATL_GRN_PLASTIC =    2;
var MATL_BLU_PLASTIC =    3;
var MATL_BLACK_PLASTIC =  4;
var MATL_BLACK_RUBBER =   5;
var MATL_BRASS =          6;
var MATL_BRONZE_DULL =    7;
var MATL_BRONZE_SHINY =   8;
var MATL_CHROME =         9;
var MATL_COPPER_DULL =   10;
var MATL_COPPER_SHINY =  11;
var MATL_GOLD_DULL =     12;
var MATL_GOLD_SHINY =    13;
var MATL_PEWTER =        14;
var MATL_SILVER_DULL =   15;
var MATL_SILVER_SHINY =  16;
var MATL_EMERALD =       17;
var MATL_JADE =          18;
var MATL_OBSIDIAN =      19;
var MATL_PEARL =         20;
var MATL_RUBY =          21;
var MATL_TURQUOISE =     22;
var MATL_DEFAULT =       23;    // (used for unrecognized material names)

function Material(opt_Matl) {
//==============================================================================
// Constructor:  use these defaults:

  this.K_emit = [];   // JS arrays that hold 4 (not 3!) reflectance values: 
                      // r,g,b,a where 'a'==alpha== opacity; usually 1.0.
                      // (Opacity is part of this set of measured materials)
  this.K_ambi = [];
  this.K_diff = [];
  this.K_spec = [];
  this.K_shiny = 0.0;
  this.K_name = "Undefined Material";   // text string with material name.
  this.K_matlNum =  MATL_DEFAULT;       // material number.
  
  // GPU location values for GLSL struct-member uniforms (LampT struct) needed
  // to transfer K values above to the GPU. Get these values using the
  // webGL fcn 'gl.getUniformLocation()'.  False for 'not initialized'.
  this.uLoc_Ke = false;
  this.uLoc_Ka = false;
  this.uLoc_Kd = false;
  this.uLoc_Ks = false;
  this.uLoc_Kshiny = false;
  // THEN: ?Did the user specified a valid material?
  if(   opt_Matl && opt_Matl >=0 && opt_Matl < MATL_DEFAULT)  {   
    this.setMatl(opt_Matl);     // YES! set the reflectance values (K_xx)
  }
  return this;
}



Material.prototype.setMatl = function(nuMatl) {
//==============================================================================
// Call this member function to change the Ke,Ka,Kd,Ks members of this object 
// to describe the material whose identifying number is 'nuMatl' (see list of
// these numbers and material names at the top of this file).
// This function DOES NOT CHANGE values of any of its uLoc_XX member variables.

  console.log('Called Material.setMatl( ', nuMatl,');'); 
  this.K_emit = [];     // DISCARD any current material reflectance values.
  this.K_ambi = [];
  this.K_diff = [];
  this.K_spec = [];
  this.K_name = [];
  this.K_shiny = 0.0;
  //  Set new values ONLY for material reflectances:
  switch(nuMatl)
  {
    case MATL_RED_PLASTIC: // 1
      this.K_emit.push(0.0,     0.0,    0.0,    1.0);
      this.K_ambi.push(0.1,     0.1,    0.1,    1.0);
      this.K_diff.push(0.6,     0.0,    0.0,    1.0);
      this.K_spec.push(0.6,     0.6,    0.6,    1.0);   
      this.K_shiny = 100.0;
      this.K_name = "MATL_RED_PLASTIC";
      break;
    case MATL_GRN_PLASTIC: // 2
      this.K_emit.push(0.0,     0.0,    0.0,    1.0);
      this.K_ambi.push(0.05,    0.05,   0.05,   1.0);
      this.K_diff.push(0.0,     0.6,    0.0,    1.0);
      this.K_spec.push(0.2,     0.2,    0.2,    1.0);   
      this.K_shiny = 60.0;
      this.K_name = "MATL_GRN_PLASTIC";
      break;
    case MATL_BLU_PLASTIC: // 3
      this.K_emit.push(0.0,     0.0,    0.0,    1.0);
      this.K_ambi.push(0.05,    0.05,   0.05,   1.0);
      this.K_diff.push(0.0,     0.2,    0.6,    1.0);
      this.K_spec.push(0.1,     0.2,    0.3,    1.0);   
      this.K_shiny = 5.0;
      this.K_name = "MATL_BLU_PLASTIC";
      break;
    case MATL_BLACK_PLASTIC:
      this.K_emit.push(0.0,     0.0,    0.0,    1.0);
      this.K_ambi.push(0.0,     0.0,    0.0,    1.0);
      this.K_diff.push(0.01,    0.01,   0.01,   1.0);
      this.K_spec.push(0.5,     0.5,    0.5,    1.0);   
      this.K_shiny = 32.0;
      this.K_name = "MATL_BLACK_PLASTIC";
      break;
    case MATL_BLACK_RUBBER:
      this.K_emit.push(0.0,     0.0,    0.0,    1.0);
      this.K_ambi.push(0.02,    0.02,   0.02,   1.0);
      this.K_diff.push(0.01,    0.01,   0.01,   1.0);
      this.K_spec.push(0.4,     0.4,    0.4,    1.0);   
      this.K_shiny = 10.0;
      this.K_name = "MATL_BLACK_RUBBER";
      break;
    case MATL_BRASS:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.329412, 0.223529, 0.027451, 1.0);
      this.K_diff.push(0.780392, 0.568627, 0.113725, 1.0);
      this.K_spec.push(0.992157, 0.941176, 0.807843, 1.0);   
      this.K_shiny = 27.8974;
      this.K_name = "MATL_BRASS";
      break;
    case MATL_BRONZE_DULL:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.2125,   0.1275,   0.054,    1.0);
      this.K_diff.push(0.714,    0.4284,   0.18144,  1.0);
      this.K_spec.push(0.393548, 0.271906, 0.166721, 1.0);  
      this.K_shiny = 25.6;
      this.K_name = "MATL_BRONZE_DULL";
      break;
    case MATL_BRONZE_SHINY:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.25,     0.148,    0.06475,  1.0);
      this.K_diff.push(0.4,      0.2368,   0.1036,   1.0);
      this.K_spec.push(0.774597, 0.458561, 0.200621, 1.0);  
      this.K_shiny = 76.8;
      this.K_name = "MATL_BRONZE_SHINY";
      break;
    case MATL_CHROME:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.25,     0.25,     0.25,     1.0);
      this.K_diff.push(0.4,      0.4,      0.4,      1.0);
      this.K_spec.push(0.774597, 0.774597, 0.774597, 1.0);  
      this.K_shiny = 76.8;
      this.K_name = "MATL_CHROME";
      break;
    case MATL_COPPER_DULL:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.19125,  0.0735,   0.0225,   1.0);
      this.K_diff.push(0.7038,   0.27048,  0.0828,   1.0);
      this.K_spec.push(0.256777, 0.137622, 0.086014, 1.0);  
      this.K_shiny = 12.8;
      this.K_name = "MATL_COPPER_DULL";
      break;
    case MATL_COPPER_SHINY:
      this.K_emit.push(0.0,      0.0,      0.0,       1.0);
      this.K_ambi.push(0.2295,   0.08825,  0.0275,    1.0);
      this.K_diff.push(0.5508,   0.2118,   0.066,     1.0);
      this.K_spec.push(0.580594, 0.223257, 0.0695701, 1.0);  
      this.K_shiny = 51.2;
      this.K_name = "MATL_COPPER_SHINY";
      break;
    case MATL_GOLD_DULL:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.24725,  0.1995,   0.0745,   1.0);
      this.K_diff.push(0.75164,  0.60648,  0.22648,  1.0);
      this.K_spec.push(0.628281, 0.555802, 0.366065, 1.0);  
      this.K_shiny = 51.2;
      this.K_name = "MATL_GOLD_DULL";
      break;
    case MATL_GOLD_SHINY:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.24725,  0.2245,   0.0645,   1.0);
      this.K_diff.push(0.34615,  0.3143,   0.0903,   1.0);
      this.K_spec.push(0.797357, 0.723991, 0.208006, 1.0);  
      this.K_shiny = 83.2;
      this.K_name = "MATL_GOLD_SHINY";
      break;
    case MATL_PEWTER:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.105882, 0.058824, 0.113725, 1.0);
      this.K_diff.push(0.427451, 0.470588, 0.541176, 1.0);
      this.K_spec.push(0.333333, 0.333333, 0.521569, 1.0);  
      this.K_shiny = 9.84615;
      this.K_name = "MATL_PEWTER";
      break;
    case MATL_SILVER_DULL:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.19225,  0.19225,  0.19225,  1.0);
      this.K_diff.push(0.50754,  0.50754,  0.50754,  1.0);
      this.K_spec.push(0.508273, 0.508273, 0.508273, 1.0);  
      this.K_shiny = 51.2;
      this.K_name = "MATL_SILVER_DULL";
      break;
    case MATL_SILVER_SHINY:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.23125,  0.23125,  0.23125,  1.0);
      this.K_diff.push(0.2775,   0.2775,   0.2775,   1.0);
      this.K_spec.push(0.773911, 0.773911, 0.773911, 1.0);  
      this.K_shiny = 89.6;
      this.K_name = "MATL_SILVER_SHINY";
      break;
    case MATL_EMERALD:
      this.K_emit.push(0.0,     0.0,      0.0,     1.0);
      this.K_ambi.push(0.0215,  0.1745,   0.0215,  0.55);
      this.K_diff.push(0.07568, 0.61424,  0.07568, 0.55);
      this.K_spec.push(0.633,   0.727811, 0.633,   0.55);   
      this.K_shiny = 76.8;
      this.K_name = "MATL_EMERALD";
      break;
    case MATL_JADE:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.135,    0.2225,   0.1575,   0.95);
      this.K_diff.push(0.54,     0.89,     0.63,     0.95);
      this.K_spec.push(0.316228, 0.316228, 0.316228, 0.95);   
      this.K_shiny = 12.8;
      this.K_name = "MATL_JADE";
      break;
    case MATL_OBSIDIAN:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.05375,  0.05,     0.06625,  0.82);
      this.K_diff.push(0.18275,  0.17,     0.22525,  0.82);
      this.K_spec.push(0.332741, 0.328634, 0.346435, 0.82);   
      this.K_shiny = 38.4;
      this.K_name = "MATL_OBSIDIAN";
      break;
    case MATL_PEARL:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.25,     0.20725,  0.20725,  0.922);
      this.K_diff.push(1.0,      0.829,    0.829,    0.922);
      this.K_spec.push(0.296648, 0.296648, 0.296648, 0.922);   
      this.K_shiny = 11.264;
      this.K_name = "MATL_PEARL";
      break;
    case MATL_RUBY:
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.1745,   0.01175,  0.01175,  0.55);
      this.K_diff.push(0.61424,  0.04136,  0.04136,  0.55);
      this.K_spec.push(0.727811, 0.626959, 0.626959, 0.55);   
      this.K_shiny = 76.8;
      this.K_name = "MATL_RUBY";
      break;
    case MATL_TURQUOISE: // 22
      this.K_emit.push(0.0,      0.0,      0.0,      1.0);
      this.K_ambi.push(0.1,      0.18725,  0.1745,   0.8);
      this.K_diff.push(0.396,    0.74151,  0.69102,  0.8);
      this.K_spec.push(0.297254, 0.30829,  0.306678, 0.8);   
      this.K_shiny = 12.8;
      this.K_name = "MATL_TURQUOISE";
      break;
    default:
      // ugly featureless (emissive-only) red:
      this.K_emit.push(0.5, 0.0, 0.0, 1.0); // DEFAULT: ugly RED emissive light only
      this.K_ambi.push(0.0, 0.0, 0.0, 1.0); // r,g,b,alpha  ambient reflectance
      this.K_diff.push(0.0, 0.0, 0.0, 1.0); //              diffuse reflectance
      this.K_spec.push(0.0, 0.0, 0.0, 1.0); //              specular reflectance
      this.K_shiny = 1.0;       // Default (don't set specular exponent to zero!)
      this.K_name = "DEFAULT_RED";
      break;
  }
  console.log('set to:', this.K_name, '\n');
  return this;
}

var material_num = 1;
var mt = new Material(material_num);
g_KE_r = mt.K_emit[0];
g_KE_g = mt.K_emit[1];
g_KE_b = mt.K_emit[2];
g_KA_r = mt.K_ambi[0];
g_KA_g = mt.K_ambi[1];
g_KA_b = mt.K_ambi[2];
g_KD_r = mt.K_diff[0];
g_KD_g = mt.K_diff[1];
g_KD_b = mt.K_diff[2];
g_KS_r = mt.K_spec[0];
g_KS_g = mt.K_spec[1];
g_KS_b = mt.K_spec[2];
g_SE = mt.K_shiny;

// Update HTML
html_KE_rSlider.value = Math.round(g_KE_r*255);
html_KE_rOutput.innerHTML = Math.round(g_KE_r*255);
html_KE_gSlider.value = Math.round(g_KE_g*255);
html_KE_gOutput.innerHTML = Math.round(g_KE_g*255);
html_KE_bSlider.value = Math.round(g_KE_b*255);
html_KE_bOutput.innerHTML = Math.round(g_KE_b*255);

html_KA_rSlider.value = Math.round(g_KA_r*255);
html_KA_rOutput.innerHTML = Math.round(g_KA_r*255);
html_KA_gSlider.value = Math.round(g_KA_g*255);
html_KA_gOutput.innerHTML = Math.round(g_KA_g*255);
html_KA_bSlider.value = Math.round(g_KA_b*255);
html_KA_bOutput.innerHTML = Math.round(g_KA_b*255);

html_KD_rSlider.value = Math.round(g_KD_r*255);
html_KD_rOutput.innerHTML = Math.round(g_KD_r*255);
html_KD_gSlider.value = Math.round(g_KD_g*255);
html_KD_gOutput.innerHTML = Math.round(g_KD_g*255);
html_KD_bSlider.value = Math.round(g_KD_b*255);
html_KD_bOutput.innerHTML = Math.round(g_KD_b*255);      

html_KS_rSlider.value = Math.round(g_KS_r*255);
html_KS_rOutput.innerHTML = Math.round(g_KS_r*255);
html_KS_gSlider.value = Math.round(g_KS_g*255);
html_KS_gOutput.innerHTML = Math.round(g_KS_g*255);
html_KS_bSlider.value = Math.round(g_KS_b*255);
html_KS_bOutput.innerHTML = Math.round(g_KS_b*255);      

html_SE_Slider.value = g_SE;
html_SE_Output.innerHTML = g_SE;

// GLOBAL CAMERA CONTROL:					// 
g_worldMat = new Matrix4();				// Changes CVV drawing axes to 'world' axes.
// (equivalently: transforms 'world' coord. numbers (x,y,z,w) to CVV coord. numbers)
// WHY?
// Lets mouse/keyboard functions set just one global matrix for 'view' and 
// 'projection' transforms; then VBObox objects use it in their 'adjust()'
// member functions to ensure every VBObox draws its 3D parts and assemblies
// using the same 3D camera at the same 3D position in the same 3D world).
var g_strafeTranslate = 0;
var g_lookatTranslate = 0;
var g_theta = 0;
var g_thetaRate = 0;
var g_zOffset = 0;
var g_zOffsetRate = 0;
var ANGLE_STEP = 45.0;		// Rotation angle rate (degrees/second)

// Create, init current rotation angle value in JavaScript
	var currentAngle = 0.0;

	// Initialize eye position
	var eye_position = [-5, 0, 1];

	// Initialize look at position
	var lookat_position = [0, 0, 0];

function main() {
//=============================================================================
  // Retrieve the HTML-5 <canvas> element where webGL will draw our pictures:
  g_canvasID = document.getElementById('webgl');	
  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine adjusted by large sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL function call
  // will follow this format:  gl.WebGLfunctionName(args);

  // Create the the WebGL rendering context: one giant JavaScript object that
  // contains the WebGL state machine, adjusted by big sets of WebGL functions,
  // built-in variables & parameters, and member data. Every WebGL func. call
  // will follow this format:  gl.WebGLfunctionName(args);
  //SIMPLE VERSION:  gl = getWebGLContext(g_canvasID); 
  // Here's a BETTER version:
  gl = g_canvasID.getContext("webgl", { preserveDrawingBuffer: true});
	// This fancier-looking version disables HTML-5's default screen-clearing, so 
	// that our drawMain() 
	// function will over-write previous on-screen results until we call the 
	// gl.clear(COLOR_BUFFER_BIT); function. )
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  //Camera: add event listeners and variables
	window.addEventListener("keydown", myKeyDown, false);
	window.addEventListener("keyup", myKeyUp, false);
	
  gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <canvas>

  gl.enable(gl.DEPTH_TEST);

  /*
//----------------SOLVE THE 'REVERSED DEPTH' PROBLEM:------------------------
  // IF the GPU doesn't transform our vertices by a 3D Camera Projection Matrix
  // (and it doesn't -- not until Project B) then the GPU will compute reversed 
  // depth values:  depth==0 for vertex z == -1;   (but depth = 0 means 'near') 
  //		    depth==1 for vertex z == +1.   (and depth = 1 means 'far').
  //
  // To correct the 'REVERSED DEPTH' problem, we could:
  //  a) reverse the sign of z before we render it (e.g. scale(1,1,-1); ugh.)
  //  b) reverse the usage of the depth-buffer's stored values, like this:
  gl.enable(gl.DEPTH_TEST); // enabled by default, but let's be SURE.

  gl.clearDepth(0.0);       // each time we 'clear' our depth buffer, set all
                            // pixel depths to 0.0  (1.0 is DEFAULT)
  gl.depthFunc(gl.GREATER); // draw a pixel only if its depth value is GREATER
                            // than the depth buffer's stored value.
                            // (gl.LESS is DEFAULT; reverse it!)
  //------------------end 'REVERSED DEPTH' fix---------------------------------
*/

  // Initialize each of our 'vboBox' objects: 
  worldBox.init(gl);		// VBO + shaders + uniforms + attribs for our 3D world,
                        // including ground-plane,                       
  gouraudBox.init(gl);		//  "		"		"  for 1st kind of shading & lighting
	phongBox.init(gl);    //  "   "   "  for 2nd kind of shading & lighting
	gObj1Box.init(gl);
	gObj2Box.init(gl);
	gObj3Box.init(gl);
	
	
  gl.clearColor(0.2, 0.2, 0.2, 1);	  // RGBA color for clearing <canvas>
  
  // ==============ANIMATION=============
  // Quick tutorials on synchronous, real-time animation in JavaScript/HTML-5: 
  //    https://webglfundamentals.org/webgl/lessons/webgl-animation.html
  //  or
  //  	http://creativejs.com/resources/requestanimationframe/
  //		--------------------------------------------------------
  // Why use 'requestAnimationFrame()' instead of the simpler-to-use
  //	fixed-time setInterval() or setTimeout() functions?  Because:
  //		1) it draws the next animation frame 'at the next opportunity' instead 
  //			of a fixed time interval. It allows your browser and operating system
  //			to manage its own processes, power, & computing loads, and to respond 
  //			to on-screen window placement (to skip battery-draining animation in 
  //			any window that was hidden behind others, or was scrolled off-screen)
  //		2) it helps your program avoid 'stuttering' or 'jittery' animation
  //			due to delayed or 'missed' frames.  Your program can read and respond 
  //			to the ACTUAL time interval between displayed frames instead of fixed
  //		 	fixed-time 'setInterval()' calls that may take longer than expected.
  //------------------------------------
  var tick = function() {		    // locally (within main() only), define our 
                                // self-calling animation function. 
    // Camera: get lookat and eye positions
		updateCameraPositions(eye_position, lookat_position);
		currentAngle = animate(currentAngle);  // Update the rotation angle
		setCamera();
    resizeCanvas();

    requestAnimationFrame(tick, g_canvasID); // browser callback request; wait
                                // til browser is ready to re-draw canvas, then
    timerAll();  // Update all time-varying params, and
    drawAll();                // Draw all the VBObox contents
    };
  //------------------------------------
  // Resize canvas as window size updates
  resizeCanvas();

  tick();                       // do it again!
}

function timerAll() {
//=============================================================================
// Find new values for all time-varying parameters used for on-screen drawing
  // use local variables to find the elapsed time.
  var nowMS = Date.now();             // current time (in milliseconds)
  var elapsedMS = nowMS - g_lastMS;   // 
  g_lastMS = nowMS;                   // update for next webGL drawing.
  if(elapsedMS > 1000.0) {            
    // Browsers won't re-draw 'canvas' element that isn't visible on-screen 
    // (user chose a different browser tab, etc.); when users make the browser
    // window visible again our resulting 'elapsedMS' value has gotten HUGE.
    // Instead of allowing a HUGE change in all our time-dependent parameters,
    // let's pretend that only a nominal 1/30th second passed:
    elapsedMS = 1000.0/30.0;
    }
  // Find new time-dependent parameters using the current or elapsed time:
  // Continuous rotation:
  g_angleNow0 = g_angleNow0 + (g_angleRate0 * elapsedMS) / 1000.0;
  g_angleNow1 = g_angleNow1 + (g_angleRate1 * elapsedMS) / 1000.0;
  g_angleNow2 = g_angleNow2 + (g_angleRate2 * elapsedMS) / 1000.0;
  g_angleNow0 %= 360.0;   // keep angle >=0.0 and <360.0 degrees  
  g_angleNow1 %= 360.0;   
  g_angleNow2 %= 360.0;
  if(g_angleNow1 > g_angleMax1) { // above the max?
    g_angleNow1 = g_angleMax1;    // move back down to the max, and
    g_angleRate1 = -g_angleRate1; // reverse direction of change.
    }
  else if(g_angleNow1 < g_angleMin1) {  // below the min?
    g_angleNow1 = g_angleMin1;    // move back up to the min, and
    g_angleRate1 = -g_angleRate1;
    }
  // Continuous movement:
  g_posNow0 += g_posRate0 * elapsedMS / 1000.0;
  g_posNow1 += g_posRate1 * elapsedMS / 1000.0;
  // apply position limits
  if(g_posNow0 > g_posMax0) {   // above the max?
    g_posNow0 = g_posMax0;      // move back down to the max, and
    g_posRate0 = -g_posRate0;   // reverse direction of change
    }
  else if(g_posNow0 < g_posMin0) {  // or below the min? 
    g_posNow0 = g_posMin0;      // move back up to the min, and
    g_posRate0 = -g_posRate0;   // reverse direction of change.
    }
  if(g_posNow1 > g_posMax1) {   // above the max?
    g_posNow1 = g_posMax1;      // move back down to the max, and
    g_posRate1 = -g_posRate1;   // reverse direction of change
    }
  else if(g_posNow1 < g_posMin1) {  // or below the min? 
    g_posNow1 = g_posMin1;      // move back up to the min, and
    g_posRate1 = -g_posRate1;   // reverse direction of change.
    }

}

function drawAll() {
//=============================================================================
  // Clear on-screen HTML-5 <canvas> object:
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

var b4Draw = Date.now();
var b4Wait = b4Draw - g_lastMS;

	if(g_show0 == 1) {	// IF user didn't press HTML button to 'hide' VBO0:
	  worldBox.switchToMe();  // Set WebGL to render from this VBObox.
		worldBox.adjust();		  // Send new values for uniforms to the GPU, and
		worldBox.draw();			  // draw our VBO's contents using our shaders.
  }
  if(g_show1 == 1) { // IF user didn't press HTML button to 'hide' VBO1:
    gouraudBox.switchToMe();  // Set WebGL to render from this VBObox.
  	gouraudBox.adjust();		  // Send new values for uniforms to the GPU, and
  	gouraudBox.draw();			  // draw our VBO's contents using our shaders.
	  }
	if(g_show2 == 1) { // IF user didn't press HTML button to 'hide' VBO2:
	  phongBox.switchToMe();  // Set WebGL to render from this VBObox.
  	phongBox.adjust();		  // Send new values for uniforms to the GPU, and
  	phongBox.draw();			  // draw our VBO's contents using our shaders.
  	}

	gObj1Box.switchToMe();
	gObj1Box.adjust();
	gObj1Box.draw();

	gObj2Box.switchToMe();
	gObj2Box.adjust();
	gObj2Box.draw();

	gObj3Box.switchToMe();
	gObj3Box.adjust();
	gObj3Box.draw();
/* // ?How slow is our own code?  	
var aftrDraw = Date.now();
var drawWait = aftrDraw - b4Draw;
console.log("wait b4 draw: ", b4Wait, "drawWait: ", drawWait, "mSec");
*/
}

function VBO0toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO0'.
  if(g_show0 != 1) g_show0 = 1;				// show,
  else g_show0 = 0;										// hide.
  console.log('g_show0: '+g_show0);
}

function VBO1toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO1'.
  if(g_show1 != 1) g_show1 = 1;			// show,
  else g_show1 = 0;									// hide.
  console.log('g_show1: '+g_show1);
}

function VBO2toggle() {
//=============================================================================
// Called when user presses HTML-5 button 'Show/Hide VBO2'.
  if(g_show2 != 1) g_show2 = 1;			// show,
  else g_show2 = 0;									// hide.
  console.log('g_show2: '+g_show2);
}

function setCamera() {
//============================================================================
// PLACEHOLDER:  sets a fixed camera at a fixed position for use by
// ALL VBObox objects.  REPLACE This with your own camera-control code.

  //----------------------Create, fill viewport------------------------
  gl.viewport(0,
    0,            // location(in pixels)
    g_canvasID.width,     // viewport width,
    g_canvasID.height);     // viewport height in pixels.

  var vpAspect = (g_canvasID.width) / g_canvasID.height;  // onscreen aspect ratio for this camera: width/height.

  g_worldMat.setIdentity();    // DEFINE 'world-space' coords.
  
  // Define 'camera lens':
  var fovy = 30.0;
  var near = 1.0;
  var far = 100.0;
  g_worldMat.perspective(fovy,   // FOVY: top-to-bottom vertical image angle, in degrees
    vpAspect,   // Image Aspect Ratio: camera lens width/height
    near,   // camera z-near distance (always positive; frustum begins at z = -znear)
    far);  // camera z-far distance (always positive; frustum ends at z = -zfar)

  g_worldMat.lookAt( eye_position[0], eye_position[1], eye_position[2],	// center of projection
		lookat_position[0], lookat_position[1], lookat_position[2],	// look-at point 
		0, 0, 1);	// View UP vector.
	// READY to draw in the 'world' coordinate system.
//------------END COPY

}

// updates camera position based on keyboard input
function updateCameraPositions(eye_position, lookat_position) {
	// Update theta and zOffset
	g_theta += g_thetaRate;
	g_zOffset += g_zOffsetRate;

	// element-wise subtraction and mult of velocity
	var displacement = [];
	for(var i = 0;i<=lookat_position.length-1;i++)
  		displacement.push((lookat_position[i] - eye_position[i]) * g_lookatTranslate * 0.02);

	// element-wise add displacement to eye position
	for(var i = 0;i<=lookat_position.length-1;i++) {
		eye_position[i] += displacement[i];
	}

	// element-wise add strafing to eye position
	eye_position[0] += Math.cos(g_theta + Math.PI/2) * g_strafeTranslate * 0.02;
	eye_position[1] += Math.sin(g_theta + Math.PI/2) * g_strafeTranslate * 0.02;


	// update look at position
	lookat_position[0] = eye_position[0] + Math.cos(g_theta);
	lookat_position[1] = eye_position[1] + Math.sin(g_theta);
	lookat_position[2] = eye_position[2] + g_zOffset;
}

function animate(angle) {
//==============================================================================
	// Calculate the elapsed time
	var now = Date.now();
	var elapsed = now - g_lastMS;
	g_lastMS = now;    
	// Update the current rotation angle (adjusted by the elapsed time)
	//  limit the angle to move smoothly between +20 and -85 degrees:
	//  if(angle >  120.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
	//  if(angle < -120.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
	var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
	return newAngle %= 360;
}


function resizeCanvas() {
  //==============================================================================
  // Called when user re-sizes their browser window and on load, because our HTML file
  // contains:  <body onload="main()" onresize="winResize()">
  
  // Report our current browser-window contents:
  
  //console.log('g_Canvas width,height=', g_canvasID.width, g_canvasID.height);   
  //console.log('Browser window: innerWidth,innerHeight=', innerWidth, innerHeight);
  
  // Make canvas fill the top 70% of our browser window:
  var xtraMargin = 16;    // keep a margin (otherwise, browser adds scroll-bars)
  g_canvasID.width = innerWidth - xtraMargin;
  g_canvasID.height = (innerHeight*.7) - xtraMargin;
}


function myKeyDown(kev) {
	//===============================================================================
	// Called when user presses down ANY key on the keyboard;
	//
	// For a light, easy explanation of keyboard events in JavaScript,
	// see:    http://www.kirupa.com/html5/keyboard_events_in_javascript.htm
	// For a thorough explanation of a mess of JavaScript keyboard event handling,
	// see:    http://javascript.info/tutorial/keyboard-events
	//
	// NOTE: Mozilla deprecated the 'keypress' event entirely, and in the
	//        'keydown' event deprecated several read-only properties I used
	//        previously, including kev.charCode, kev.keyCode. 
	//        Revised 2/2019:  use kev.key and kev.code instead.
	//
	// Report EVERYTHING in console:
	  console.log(  "--kev.code:",    kev.code,   "\t\t--kev.key:",     kev.key, 
				  "\n--kev.ctrlKey:", kev.ctrlKey,  "\t--kev.shiftKey:",kev.shiftKey,
				  "\n--kev.altKey:",  kev.altKey,   "\t--kev.metaKey:", kev.metaKey);

	switch(kev.code) {
		//----------------WASD keys------------------------
		case "KeyA":
			console.log("a/A key: Strafe LEFT!\n");
			g_strafeTranslate = 1;
			console.log(g_strafeTranslate);
			break;
		case "KeyD":
			console.log("d/D key: Strafe RIGHT!\n");
			g_strafeTranslate = -1;
			console.log(g_strafeTranslate);
			break;
		case "KeyS":
			console.log("s/S key: Move BACK!\n");
			g_lookatTranslate = -1;
			console.log(g_lookatTranslate);
			break;
		case "KeyW":
			console.log("w/W key: Move FWD!\n");
			g_lookatTranslate = 1;
			console.log(g_lookatTranslate);
			break;
		//----------------Arrow keys------------------------
		case "ArrowLeft": 	
			console.log(' left-arrow.');
			g_thetaRate = 0.03;
			break;
		case "ArrowRight":
			console.log('right-arrow.');
			g_thetaRate = -0.03;
			break;
		case "ArrowUp":		
			console.log('   up-arrow.');
			g_zOffsetRate = 0.02;
			break;
		case "ArrowDown":
			console.log(' down-arrow.');
			g_zOffsetRate = -0.02;
			break;	
		default:
			console.log("UNUSED!");
			break;
	}
}
function SwitchLighting() {
  var lightbutton = document.getElementById("LightingSwitch");
  if (g_isBlinn == 0) {
    g_isBlinn = 1;
    lightbutton.innerHTML = "Blinn-Phong";
    console.log(g_isBlinn);
  }
  else if (g_isBlinn == 1) {
    g_isBlinn = 0;
    lightbutton.innerHTML = "Phong";
    console.log(g_isBlinn);
  }
  else {
    console.log("Error: Wrong lighting type isBlinn");
  }
}

function SwitchShading() {
  var shadebutton = document.getElementById("ShadingSwitch");
  if (g_show1 == 0 && g_show2 == 1) {
    g_show1 = 1;
    g_show2 = 0;
    shadebutton.innerHTML = "Gouraud";
    console.log(g_isGouraud);
  }
  else if (g_show1 == 1 && g_show2 == 0) {
    g_show1 = 0;
    g_show2 = 1;
    shadebutton.innerHTML = "Phong";
    console.log(g_isGouraud);
  }
  else {
    console.log("Error: Wrong shading type g_isGouraud");
  }
}

function myKeyUp(kev) {
	//===============================================================================
	// Called when user releases ANY key on the keyboard; captures scancodes well
	
	console.log('myKeyUp()--keyCode='+kev.keyCode+' released.');
	switch(kev.code) {
		//----------------WASD keys------------------------
		case "KeyA":
			g_strafeTranslate = 0;
			console.log(g_strafeTranslate);
			break;
		case "KeyD":
			g_strafeTranslate = 0;
			console.log(g_strafeTranslate);
			break;
		case "KeyS":
			g_lookatTranslate = 0;
			console.log(g_lookatTranslate);
			break;
		case "KeyW":
			g_lookatTranslate = 0;
			console.log(g_lookatTranslate);
			break;
    case "KeyM":
      if (material_num >= 23) {
        material_num = 1;
      }
      else {
        material_num += 1;
      }
      var mt = new Material(material_num);
      g_KE_r = mt.K_emit[0];
      g_KE_g = mt.K_emit[1];
      g_KE_b = mt.K_emit[2];
      g_KA_r = mt.K_ambi[0];
      g_KA_g = mt.K_ambi[1];
      g_KA_b = mt.K_ambi[2];
      g_KD_r = mt.K_diff[0];
      g_KD_g = mt.K_diff[1];
      g_KD_b = mt.K_diff[2];
      g_KS_r = mt.K_spec[0];
      g_KS_g = mt.K_spec[1];
      g_KS_b = mt.K_spec[2];
      g_SE = mt.K_shiny;
      html_KE_rSlider.value = Math.round(g_KE_r*255);
      html_KE_rOutput.innerHTML = Math.round(g_KE_r*255);
      html_KE_gSlider.value = Math.round(g_KE_g*255);
      html_KE_gOutput.innerHTML = Math.round(g_KE_g*255);
      html_KE_bSlider.value = Math.round(g_KE_b*255);
      html_KE_bOutput.innerHTML = Math.round(g_KE_b*255);

      html_KA_rSlider.value = Math.round(g_KA_r*255);
      html_KA_rOutput.innerHTML = Math.round(g_KA_r*255);
      html_KA_gSlider.value = Math.round(g_KA_g*255);
      html_KA_gOutput.innerHTML = Math.round(g_KA_g*255);
      html_KA_bSlider.value = Math.round(g_KA_b*255);
      html_KA_bOutput.innerHTML = Math.round(g_KA_b*255);

      html_KD_rSlider.value = Math.round(g_KD_r*255);
      html_KD_rOutput.innerHTML = Math.round(g_KD_r*255);
      html_KD_gSlider.value = Math.round(g_KD_g*255);
      html_KD_gOutput.innerHTML = Math.round(g_KD_g*255);
      html_KD_bSlider.value = Math.round(g_KD_b*255);
      html_KD_bOutput.innerHTML = Math.round(g_KD_b*255);      

      html_KS_rSlider.value = Math.round(g_KS_r*255);
      html_KS_rOutput.innerHTML = Math.round(g_KS_r*255);
      html_KS_gSlider.value = Math.round(g_KS_g*255);
      html_KS_gOutput.innerHTML = Math.round(g_KS_g*255);
      html_KS_bSlider.value = Math.round(g_KS_b*255);
      html_KS_bOutput.innerHTML = Math.round(g_KS_b*255);      

      html_SE_Slider.value = g_SE;
      html_SE_Output.innerHTML = g_SE;
      break;
		//----------------Arrow keys------------------------
		case "ArrowLeft": 	
			g_thetaRate = 0;
			break;
		case "ArrowRight":
			g_thetaRate = 0;
			break;
		case "ArrowUp":
			g_zOffsetRate = 0;
			break;
		case "ArrowDown":
			g_zOffsetRate = 0;
			break;	
		default:
			break;
	}

	}