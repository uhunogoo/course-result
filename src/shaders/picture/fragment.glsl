uniform float u_time;
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;

varying vec2 vUv;


void main() {
  vec2 st = vUv.xy;

  vec3 color = vec3(1.0);

  // bottom-left
  // vec2 bl = step(vec2(0.1),st);
  // float pct = bl.x * bl.y;

  // // top-right
  // vec2 tr = step(vec2(0.1),1.0-st);
  // pct *= tr.x * tr.y;

  // color = vec3(pct);
    
  gl_FragColor = vec4( color, 1.0 );
}