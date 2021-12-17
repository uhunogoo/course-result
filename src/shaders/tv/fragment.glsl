uniform float u_time;

varying vec2 vUv;
float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

//	Classic Perlin 2D Noise 
//	by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec2 P){
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * 
    vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

float random(in vec2 st){
    return fract(sin(dot(st.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float rchar(in vec2 outer,in vec2 inner){
  float grid = 5.;
  vec2 margin = vec2(.2,.05);
  float seed = 23.;
  vec2 borders = step(margin,inner)*step(margin,1.-inner);
  return step(.5,random( vec2(cnoise((outer*seed+floor(inner*grid) / 200.0))) + 1.0 )) * borders.x * borders.y;
}

vec3 matrix(in vec2 st){
  float rows = 390.0;
  vec2 ipos = floor(st*rows);

  ipos += vec2(.0,floor(u_time * 20.0 * random(vec2(cnoise(vec2(ipos.x / 60.0)) * cnoise(vec2(ipos.x / 60.0)) ))));


  vec2 fpos = fract(st*rows);
  vec2 center = (.5-fpos);

  float pct = random( vec2(cnoise(ipos), cnoise(ipos)) + 1.0);
  float glow = (1.-dot(center,center)*3.)*2.0;

  // vec3 color = vec3(0.643,0.851,0.690) * ( rchar(ipos,fpos) * pct );
  // color +=  vec3(0.027,0.180,0.063) * pct * glow;
  return vec3(rchar(ipos,fpos) * pct * glow);
}

void main(){
  vec2 st = vUv;
  st.y *= 1.0;
  vec3 color = vec3(0.0);

  color = matrix(st.yx);
  gl_FragColor = vec4( vec3(1.0 - color) + color * vec3(0.0, 1.0, 0.0), 1.0);
}