import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ShaderMaterial, Vector2 } from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float time;
uniform vec2 resolution;
uniform float spinRotationSpeed;
uniform float moveSpeed;
uniform vec2 offset;
uniform vec4 color1;
uniform vec4 color2;
uniform vec4 color3;
uniform float contrast;
uniform float lighting;
uniform float spinAmount;
uniform float pixelFilter;
uniform bool isRotating;
uniform float zoom;

#define SPIN_EASE 1.0

varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screenCoords) {
    float pixel_size = length(screenSize) / pixelFilter;
    vec2 uv = floor(screenCoords*(1.0/pixel_size))*pixel_size - 0.5*screenSize;
    uv /= length(screenSize);
    uv -= offset;
    float uv_len = length(uv);

    float speed = (spinRotationSpeed*SPIN_EASE*0.2);
    if(isRotating){
        speed = time * speed;
    }
    speed += 302.2;
    float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.0*(1.0*spinAmount*uv_len + (1.0 - 1.0*spinAmount));
    vec2 mid = screenSize/(length(screenSize)*2.0);
    vec2 rotated = vec2(uv_len * cos(new_pixel_angle) + mid.x, uv_len * sin(new_pixel_angle) + mid.y);
    uv = rotated - mid;

    uv *= 30.0 / zoom;

    speed = time*moveSpeed;
    vec2 uv2 = vec2(uv.x + uv.y);

    for(int i = 0; i < 5; i++) {
        uv2 += sin(max(uv.x, uv.y)) + uv;
        uv += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121), sin(uv2.x - 0.113*speed));
        uv -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
    }

    float contrast_mod = (0.25*contrast + 0.5*spinAmount + 1.2);
    float paint_res = min(2.0, max(0.0, length(uv)*0.035*contrast_mod));
    float c1p = max(0.0, 1.0 - contrast_mod*abs(1.0-paint_res));
    float c2p = max(0.0, 1.0 - contrast_mod*abs(paint_res));
    float c3p = 1.0 - min(1.0, c1p + c2p);
    
    float ligth = (lighting - 0.2) * max(c1p*5.0 - 4.0, 0.0) + lighting * max(c2p*5.0 - 4.0, 0.0); 
    vec4 ret_col = (0.3/contrast)*color1 + (1.0 - 0.3/contrast)*(color1*c1p + color2*c2p + vec4(c3p*color3.rgb, c3p*color1.a)) + ligth;
    return ret_col;
}

void main() {
    vec2 uv = vUv * resolution;
    gl_FragColor = effect(resolution, uv);
}
`;

export function BalatroBackground() {
    const materialRef = useRef<ShaderMaterial>(null);
    const { size } = useThree();

    useFrame(({ clock }) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = clock.getElapsedTime();
            materialRef.current.uniforms.resolution.value.set(size.width, size.height);
        }
    });

    return (
        <mesh scale={[100, 100, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    time: { value: 0 },
                    resolution: { value: new Vector2(size.width, size.height) },
                    spinRotationSpeed: { value: 0.5 },
                    moveSpeed: { value: 1.0 },
                    offset: { value: new Vector2(0, 0) },
                    color1: { value: [0.871, 0.267, 0.231, 1.0] },
                    color2: { value: [0.0, 0.42, 0.706, 1.0] },
                    color3: { value: [0.086, 0.137, 0.145, 1.0] },
                    contrast: { value: 3.5 },
                    lighting: { value: 0.4 },
                    spinAmount: { value: 0.25 },
                    pixelFilter: { value: 4000.0 },
                    isRotating: { value: true },
                    zoom: { value: 0.4 },
                }}
                toneMapped={false}
            />
        </mesh>
    );
}
