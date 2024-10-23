//Voronoi Cell Movement W/ Stippling
//Created with assitance from code from The Book of Shaders (https://thebookofshaders.com/12/) and OpenAI ChatGPT 
//Created for Project 2, Generative Art, Desma 113

let theShader;
let photocopyTexture;
let paperTexture;
let bgColor;
let stippleColor;

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

  // DEFINE COLOR COMBINATIONS
  const colorCombos = [
    { bgColor: [0.459, 0.592, 0.914], stippleColor: [1.0, 0.992, 0.961] },
    // #955C63 and #161817
    { bgColor: [0.584, 0.361, 0.388], stippleColor: [0.086, 0.094, 0.090] },
    // #1B2126 and #BAC0AE
    { bgColor: [0.106, 0.129, 0.149], stippleColor: [0.729, 0.753, 0.682] },
    // #D7CBB3 and #F84328
    { bgColor: [0.843, 0.796, 0.702], stippleColor: [0.973, 0.263, 0.157] },
    // #CDD8C2 and #0C34B6
    { bgColor: [0.804, 0.847, 0.761], stippleColor: [0.047, 0.204, 0.714] },
    // #E2D6BB and #948E75
    { bgColor: [0.886, 0.839, 0.733], stippleColor: [0.580, 0.557, 0.459] },
    // #93A578 and #D7DAD7
    { bgColor: [0.576, 0.647, 0.471], stippleColor: [0.843, 0.855, 0.843] },
    // #752744 and #FADDD7
    { bgColor: [0.459, 0.153, 0.267], stippleColor: [0.980, 0.867, 0.843] },
    // #222222 and #D1D1D1
    { bgColor: [0.133, 0.133, 0.133], stippleColor: [0.820, 0.820, 0.820] },
    // #8FBA86 and #F0F8F8
    { bgColor: [0.561, 0.729, 0.525], stippleColor: [0.941, 0.973, 0.973] },
    // #C6FE01 and #A1A1A1
    { bgColor: [0.776, 0.996, 0.004], stippleColor: [0.631, 0.631, 0.631] },
  ];

  // PICK A RANDOM COLOR COMBINATION
  const combo = random(colorCombos);

  // SET THE COLORS
  bgColor = combo.bgColor;
  stippleColor = combo.stippleColor;
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

  // SET COLOR UNIFORMS
  theShader.setUniform('u_bgColor', bgColor);
  theShader.setUniform('u_stippleColor', stippleColor);

  // DRAW PLANE
  plane(width, height);
}

function windowResized() {
  // RESIZE CANVAS
  resizeCanvas(windowWidth, windowHeight);
}

