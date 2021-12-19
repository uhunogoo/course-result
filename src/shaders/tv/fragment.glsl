uniform float u_time;

varying vec2 vUv;
float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

//---------------------------------------------------------------
// A random SDF - it places spheres of random sizes in a grid
//---------------------------------------------------------------

// 0 = lattice
// 1 = simplex
#define NOISE 1


// please, do not use in real projects - replace this by something better
float hash(vec3 p)  
{
    p  = 17.0*fract( p*0.3183099+vec3(.11,.17,.13) );
    return fract( p.x*p.y*p.z*(p.x+p.y+p.z) );
}

// http://iquilezles.org/www/articles/smin/smin.htm
float smax( float a, float b, float k )
{
    float h = max(k-abs(a-b),0.0);
    return max(a, b) + h*h*0.25/k;
}

float sdBase( in vec3 p )
{
#if NOISE==0
    vec3 i = floor(p);
    vec3 f = fract(p);

	#define RAD(r) ((r)*(r)*0.7)
    #define SPH(i,f,c) length(f-c)-RAD(hash(i+c))
    
    return min(min(min(SPH(i,f,vec3(0,0,0)),
                       SPH(i,f,vec3(0,0,1))),
                   min(SPH(i,f,vec3(0,1,0)),
                       SPH(i,f,vec3(0,1,1)))),
               min(min(SPH(i,f,vec3(1,0,0)),
                       SPH(i,f,vec3(1,0,1))),
                   min(SPH(i,f,vec3(1,1,0)),
                       SPH(i,f,vec3(1,1,1)))));
#else
    const float K1 = 0.333333333;
    const float K2 = 0.166666667;
    
    vec3 i = floor(p + (p.x + p.y + p.z) * K1);
    vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
    
    vec3 e = step(d0.yzx, d0);
	vec3 i1 = e*(1.0-e.zxy);
	vec3 i2 = 1.0-e.zxy*(1.0-e);
    
    vec3 d1 = d0 - (i1  - 1.0*K2);
    vec3 d2 = d0 - (i2  - 2.0*K2);
    vec3 d3 = d0 - (1.0 - 3.0*K2);
    
    float r0 = hash( i+0.0 );
    float r1 = hash( i+i1 );
    float r2 = hash( i+i2 );
    float r3 = hash( i+1.0 );

    #define SPH(d,r) length(d)-r*r*0.55

    return min( min(SPH(d0,r0),
                    SPH(d1,r1)),
                min(SPH(d2,r2),
                    SPH(d3,r3)));
#endif
}

//---------------------------------------------------------------
// subtractive fbm
//---------------------------------------------------------------
vec2 sdFbm( in vec3 p, float d )
{
    const mat3 m = mat3( 0.00,  0.80,  0.60, 
                        -0.80,  0.36, -0.48,
                        -0.60, -0.48,  0.64 );
    float t = 0.0;
	float s = 1.0;
    for( int i=0; i<7; i++ )
    {
        float n = s * sdBase(p);
    	d = smax( d, -n, 0.2*s );
        t += d;
        p = 2.0*m*p;
        s = 0.5*s;
    }
    
    return vec2(d,t);
}

void main(){
  vec2 st = vUv;
  vec2 noise = sdFbm( vec3(st * 70.0 + sin(st.x * 40.0 + u_time * 0.5) * 0.1 + u_time * 0.6, .00002), 0.02 );
  noise = pow(noise, vec2(1.2)) * 20.0;
  vec2 noise_2 = (sdFbm( vec3(st * 90.0 + vec2(u_time * 0.3), 0.2), 0.0 )) ;
  noise_2 = pow(noise_2, vec2(1.2)) * 20.0;

  vec3 color = vec3(noise.r + noise_2.r) * 0.3;
  color = clamp( color, vec3(0.0), vec3(1.0) );
  gl_FragColor = vec4( color, 1.0);
}