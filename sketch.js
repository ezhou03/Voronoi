//Voronoi Cell Movement W/ Stippling
//Created with assitance from code from The Book of Shaders (https://thebookofshaders.com/12/) and OpenAI ChatGPT 
//Created for Project 2, Generative Art, Desma 113

let theShader;
let photocopyTexture;
let paperTexture;

function preload() {
  // LOAD SHADER
  theShader = loadShader('vertex.vert', 'frag.frag');
  // LOAD TEXTURES
  photocopyTexture = loadImage('photocopyTexture.jpg'); // SCREEN BLEND
  paperTexture = loadImage('paperTexture.jpg');         // MULTIPLY BLEND
}

function setup() {
  // CREATE CANVAS
  createCanvas(windowWidth, windowHeight, WEBGL);
  noStroke();
}

function draw() {
  // APPLY SHADER
  shader(theShader);

  // SET UNIFORMS
  theShader.setUniform('u_aspectRatio', width / height);
  theShader.setUniform('u_time', millis() / 1000.0);
  theShader.setUniform('u_mouse', [mouseX / width, 1.0 - mouseY / height]);
  theShader.setUniform('u_photocopyTexture', photocopyTexture);
  theShader.setUniform('u_paperTexture', paperTexture);
  theShader.setUniform('u_textureScale', 1.0); // TEXTURE SCALE

  // DRAW PLANE
  plane(width, height);
}

function windowResized() {
  // RESIZE CANVAS
  resizeCanvas(windowWidth, windowHeight);
}
