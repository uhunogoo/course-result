uniform float u_time;
uniform sampler2D u_texture;
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;

varying vec2 vUv;

#define PI 3.14159265358979323846

void main() {
  vec2 newUV = vUv + 0.5; 
  float pct = vUv.x + 0.5;
  pct = smoothstep(0.45, 0.5, pct);
  vec4 image = texture2D(u_texture, (vUv - 0.5) / 4.0 + 0.5 + (0.5 / 4.0));
  gl_FragColor = vec4( vec3( pct + 0.3 ), 1.0);
  gl_FragColor = image;
}