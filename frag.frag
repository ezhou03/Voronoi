#ifdef GL_ES
precision mediump float;
#endif

// DEFINE CONSTANTS
#define K 0.142857142857
#define K2 0.0714285714285
#define jitter 0.8

// UNIFORMS
uniform float u_time;
uniform float u_aspectRatio;
uniform vec2 u_mouse;
uniform sampler2D u_photocopyTexture;
uniform sampler2D u_paperTexture;
uniform float u_textureScale;
uniform vec3 u_bgColor;        // BACKGROUND COLOR
uniform vec3 u_stippleColor;   // STIPPLE COLOR

varying vec2 vTexCoord;

// PERMUTE FUNCTION
vec4 permute(vec4 x) {
  return mod((34.0 * x + 1.0) * x, 289.0);
}

// CELLULAR NOISE
vec2 cellular2x2(vec2 P) {
  vec2 Pi = mod(floor(P), 289.0);
  vec2 Pf = fract(P);
  vec4 Pfx = Pf.x + vec4(-0.5, -1.5, -0.5, -1.5);
  vec4 Pfy = Pf.y + vec4(-0.5, -0.5, -1.5, -1.5);
  vec4 p = permute(Pi.x + vec4(0.0, 1.0, 0.0, 1.0));
  p = permute(p + Pi.y + vec4(0.0, 0.0, 1.0, 1.0));
  vec4 ox = mod(p, 7.0) * K + K2;
  vec4 oy = mod(floor(p * K), 7.0) * K + K2;
  vec4 dx = Pfx + jitter * ox;
  vec4 dy = Pfy + jitter * oy;
  vec4 d = dx * dx + dy * dy;
  d.xy = (d.x < d.y) ? d.xy : d.yx;
  d.xz = (d.x < d.z) ? d.xz : d.zx;
  d.xw = (d.x < d.w) ? d.xw : d.wx;
  d.y = min(d.y, d.z);
  d.y = min(d.y, d.w);
  return sqrt(d.xy);
}

// RANDOM FUNCTION
vec2 random2(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}

void main() {
  vec2 st = vTexCoord;
  st.x *= u_aspectRatio;

  // SCALE COORDS
  st *= 3.0;

  // TILE SPACE
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = 1.0;
  vec2 closestPoint;
  vec2 closestNeighbor;

  // VORONOI COMPUTATION
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);

      if (dist < m_dist) {
        m_dist = dist;
        closestPoint = point;
        closestNeighbor = neighbor;
      }
    }
  }

  vec2 cellCenter = closestNeighbor + closestPoint;
  vec2 fragToCenter = f_st - cellCenter;
  float distToCenter = dot(fragToCenter, fragToCenter);

  // STIPPLE SIZE AND SPEED
  float stippleSize = mix(0.5, 5.0, u_mouse.x);
  float speed = mix(0.05, 0.5, 1.0 - u_mouse.y);
  float radius = mod(u_time * speed, 1.0);

  // STIPPLING EFFECT
  vec2 F = cellular2x2(f_st * 20.0);
  float edgeWidth = 0.02; // EDGE SOFTNESS
  float stippleValue = abs(sin((distToCenter - radius) * 3.1415 * stippleSize));
  float stipple = smoothstep(F.x * 2.0 + edgeWidth, F.x * 2.0 - edgeWidth, stippleValue);

  // CELL MASK
  float cellMask = smoothstep(0.02, 0.05, m_dist);

  // COMBINE COLORS USING UNIFORMS
  vec3 color = mix(u_bgColor, u_stippleColor, stipple * cellMask);

  // TEXTURE COORDS
  vec2 texCoords = vTexCoord * u_textureScale;

  // SAMPLE TEXTURES
  vec3 photocopyColor = texture2D(u_photocopyTexture, texCoords).rgb;
  vec3 paperColor = texture2D(u_paperTexture, texCoords).rgb;

  // SCREEN BLEND
  color = 1.0 - ((1.0 - color) * (1.0 - photocopyColor));

  // MULTIPLY BLEND WITH OPACITY
  vec3 multiplyBlend = color * paperColor;
  float paperOpacity = 0.6; // PAPER OPACITY
  color = mix(color, multiplyBlend, paperOpacity);

  // BLOOM COLOR
  vec3 bloomColor = u_bgColor; // USE BACKGROUND COLOR FOR BLOOM

  // ADD BLOOM EFFECT
  float bloomIntensity = 0.05; // BLOOM INTENSITY
  color += bloomIntensity * bloomColor * color;

  gl_FragColor = vec4(color, 1.0);
}
