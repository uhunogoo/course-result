uniform float u_time;
uniform sampler2D u_texture;
uniform sampler2D u_backTexture;
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#define PI 3.14159265358979323846

void main() {
  vec2 newUV = vUv + 0.5; 
  float pct = vUv.x + 0.5;
  pct = smoothstep(0.45, 0.5, pct);
  vec4 frontColor = texture2D(u_texture, (vUv - 0.5) / 4.0 + 0.5 + (0.5 / 4.0));
  vec4 backColor = texture2D(u_backTexture, (vUv - 0.5) / 4.0 + 0.5 + (0.5 / 4.0));
  vec4 sideColor = vec4( sin((vPosition.x + vPosition.y + vPosition.z) * 50.0) );

  float side = abs( dot(vNormal, vec3(0.0, 0.0, 1.0)) );
  float backFront = (dot(vNormal, vec3(0.0, 0.0, 1.0)) + 1.0) * 0.5;
  vec4 backFrontTexture = mix( frontColor, backColor, backFront );

  gl_FragColor = vec4( vec3( pct + 0.3 ), 1.0);
  // gl_FragColor = image;
  gl_FragColor = mix(sideColor, backFrontTexture, side);
}