uniform float u_time;
uniform sampler2D u_texture;
uniform sampler2D u_backTexture;
uniform vec3 u_colorStart;
uniform vec3 u_colorEnd;
uniform vec2 u_count;
uniform vec2 u_frontAspect;
uniform vec2 u_backAspect;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

#define PI 3.14159265358979323846

mat2 rotate2d(float _angle){
  return mat2(cos(_angle),-sin(_angle),
              sin(_angle),cos(_angle));
}

void main() {
  vec2 newUV = vUv / u_count + 0.5;
  vec4 sideColor = vec4( sin((vPosition.x + vPosition.y + vPosition.z) * 50.0) );

  // second iteration
  float step_x = floor(newUV.x * u_count.x) / u_count.x;
  vec2 frontCoords = fract(newUV * vec2(u_count.x, 1.0));
  frontCoords = frontCoords / vec2(u_count.x, 1.0) + vec2(step_x, 0.0);

  vec4 frontColor = texture2D(u_texture, (frontCoords - 0.5) * u_frontAspect + 0.5 );
  vec4 backColor = vec4(vec3(0.2), 1.0 );
  
  float side = abs( dot(vNormal, vec3(0.0, 0.0, 1.0)) );
  float backFront = (dot(vNormal, vec3(0.0, 0.0, 1.0)) + 1.0) * 0.5;
  vec4 backFrontTexture = mix( backColor, frontColor, backFront );

  gl_FragColor = mix(sideColor, backFrontTexture, side);
  // gl_FragColor = vec4(vec3(fract(newUV * vec2(u_count.x, u_count.y)).y), 1.0);
}