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

  // calculation for back texture  
  float left = step( 1.0 / u_count.x, newUV.x );        // mask for left segment
  float right = step( 1.0 / u_count.x, 1.0 - newUV.x ); // mask for right segment

  vec2 stepX = vec2( 1.0 - 1.0 / u_count.x, 0.0);
  vec2 frontUV = vec2(1.0 - newUV.x, newUV.y) * u_frontAspect;


  // calculation for back texture  
  vec2 backUV = ( vUv / u_count ) * u_backAspect + 0.5;


  // setup textures
  vec4 frontColor = texture2D(u_texture, frontUV - stepX * u_frontAspect ) * (1.0 - left);
  frontColor += texture2D(u_texture, frontUV + stepX * u_frontAspect) * (1.0 - right);
  frontColor += texture2D(u_texture, frontUV ) * left * right;
  
  vec4 backColor = texture2D(u_backTexture, backUV * u_backAspect );


  vec4 sideColor = vec4( sin((vPosition.x + vPosition.y + vPosition.z) * 50.0) );

  // apply textures to geometry
  float side = abs( dot(vNormal, vec3(0.0, 0.0, 1.0)) );
  float backFront = (dot(vNormal, vec3(0.0, 0.0, 1.0)) + 1.0) * 0.5;
  vec4 backFrontTexture = mix( frontColor, backColor, backFront );

  gl_FragColor = mix(sideColor, backFrontTexture, side);
}