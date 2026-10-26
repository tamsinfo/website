import * as THREE from "three";

/* Material library for the whole world (docs/ART_DIRECTION.md, "Material language").
   Physically based, extended with shader code where the look needs it. One instance per
   look, shared by every station; disposed once by the World. */

export const COLORS = {
  paper: new THREE.Color("#F2EEE7"),
  porcelain: new THREE.Color("#FBF9F5"),
  ink: new THREE.Color("#101826"),
  blue: new THREE.Color("#1638D8"),
  blueDeep: new THREE.Color("#0B1E78"),
  blueSoft: new THREE.Color("#8FA6F5"),
  signal: new THREE.Color("#FF5A1F"),
  steel: new THREE.Color("#B9BCC2"),
  warmGrey: new THREE.Color("#D8D2C8"),
};

/** brushed streaks: perturb roughness along object-space X with layered noise */
function brushed(m: THREE.MeshPhysicalMaterial, scale = 60) {
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObjPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObjPos = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
         varying vec3 vObjPos;
         float bHash(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }
         float bNoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
           return mix(mix(bHash(i), bHash(i+vec2(1,0)), f.x), mix(bHash(i+vec2(0,1)), bHash(i+vec2(1,1)), f.x), f.y); }`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
         float streak = bNoise(vec2(vObjPos.x * 0.6, (vObjPos.y + vObjPos.z) * ${scale.toFixed(1)}));
         streak = 0.6 * streak + 0.4 * bNoise(vec2(vObjPos.x * 2.0, (vObjPos.y - vObjPos.z) * ${(scale * 2.3).toFixed(1)}));
         roughnessFactor = clamp(roughnessFactor * (0.72 + streak * 0.56), 0.04, 1.0);`,
      );
  };
  m.customProgramCacheKey = () => `brushed-${scale}`;
  return m;
}

export type Materials = ReturnType<typeof createMaterials>;

export function createMaterials() {
  const phys = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial(p);
  const m = {
    ceramic: phys({ color: new THREE.Color("#F7F5F1"), roughness: 0.78, sheen: 0.3, sheenRoughness: 0.8, sheenColor: new THREE.Color("#ffffff") }),
    ceramicWarm: phys({ color: COLORS.warmGrey, roughness: 0.86 }),
    ceramicInk: phys({ color: new THREE.Color("#2A3142"), roughness: 0.7 }),
    ceramicBlue: phys({ color: COLORS.blue, roughness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
    anodised: brushed(phys({ color: new THREE.Color("#2648E0"), metalness: 1, roughness: 0.32, anisotropy: 0.8, clearcoat: 0.35, clearcoatRoughness: 0.2 })),
    anodisedPale: brushed(phys({ color: new THREE.Color("#C9D3F6"), metalness: 1, roughness: 0.3, anisotropy: 0.7 })),
    steel: brushed(phys({ color: COLORS.steel, metalness: 1, roughness: 0.34, anisotropy: 0.9 }), 90),
    chrome: phys({ color: new THREE.Color("#E9EBEF"), metalness: 1, roughness: 0.08 }),
    glass: phys({
      color: new THREE.Color("#ffffff"),
      metalness: 0,
      roughness: 0.04,
      transmission: 1,
      thickness: 1.2,
      ior: 1.5,
      dispersion: 5,
      attenuationColor: new THREE.Color("#DDE5FF"),
      attenuationDistance: 4,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    }),
    glassBlue: phys({ color: new THREE.Color("#BFD0FF"), roughness: 0.06, transmission: 1, thickness: 1.5, ior: 1.45, dispersion: 4, attenuationColor: new THREE.Color("#2A52F0"), attenuationDistance: 2.2 }),
    frosted: phys({ color: new THREE.Color("#ffffff"), roughness: 0.9, transmission: 1, thickness: 2, ior: 1.45, dispersion: 2 }),
    iridescent: phys({ color: new THREE.Color("#F4F2FF"), metalness: 0.2, roughness: 0.22, iridescence: 1, iridescenceIOR: 1.35, iridescenceThicknessRange: [220, 620], clearcoat: 1, clearcoatRoughness: 0.1 }),
    signal: new THREE.MeshStandardMaterial({ color: COLORS.signal, emissive: COLORS.signal, emissiveIntensity: 5.5, roughness: 0.4 }),
    signalDim: new THREE.MeshStandardMaterial({ color: COLORS.signal, emissive: COLORS.signal, emissiveIntensity: 0.25, roughness: 0.5 }),
    lineBlue: new THREE.MeshStandardMaterial({ color: COLORS.blue, emissive: COLORS.blue, emissiveIntensity: 0.6, roughness: 0.4 }),
    floor: phys({ color: new THREE.Color("#E9E6E0"), roughness: 0.86 }),
  };
  return {
    ...m,
    dispose() {
      Object.values(m).forEach((x) => x.dispose());
    },
  };
}

/** Warm studio environment: a soft room of emissive softboxes, prefiltered once. */
export function createEnvironment(renderer: THREE.WebGLRenderer) {
  const env = new THREE.Scene();
  env.background = new THREE.Color("#EAE5DC");
  const box = (w: number, h: number, pos: [number, number, number], color: string, s: number) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(s), side: THREE.DoubleSide }));
    mesh.position.set(...pos);
    mesh.lookAt(0, 0, 0);
    env.add(mesh);
  };
  // ceiling grid of soft lights, a warm key wall, a cool window strip, and a blue bounce card
  for (let x = -2; x <= 2; x++) for (let z = -2; z <= 2; z++) box(1.6, 1.6, [x * 2.4, 6, z * 2.4], "#FFF6EA", 2.4);
  box(9, 4, [-8, 3, 3], "#FFE9D2", 3.2);
  box(1.2, 6, [8, 2.5, -2], "#E6EEFF", 4.2);
  box(4, 2, [3, 1, 8], "#5C78F2", 1.4);
  box(30, 30, [0, -6, 0], "#D8D1C6", 0.9);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.035).texture;
  pm.dispose();
  env.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      (o as THREE.Mesh).geometry.dispose();
      ((o as THREE.Mesh).material as THREE.Material).dispose();
    }
  });
  return tex;
}
