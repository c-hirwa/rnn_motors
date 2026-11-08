/**
 * The 3D "showroom under the stars" on the home page.
 * Loaded on demand (dynamic import) so three.js never weighs down the first paint.
 *
 * Model: "Car Concept" by Eric Chadwick / Darmstadt Graphics Group, CC BY 4.0,
 * from the Khronos glTF Sample Assets (logos removed, repainted, compressed).
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type ShowroomScene = {
  /** 0 → 1 as the visitor scrolls through the section. */
  setProgress(p: number): void;
  /** Only render while the section is on screen. */
  setActive(on: boolean): void;
  dispose(): void;
};

type Opts = { url: string; onReady(): void; onError(): void; still?: boolean };

const CAR_LENGTH = 4.6;

/** Soft radial texture used for the contact shadow and the light pool on the floor. */
function radial(inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createShowroomScene(host: HTMLElement, opts: Opts): ShowroomScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.55;

  // A single warm-white downlight, like the showroom spots, plus a cool rim from behind.
  const key = new THREE.SpotLight(0xffffff, 120, 30, Math.PI / 6, 0.6, 1.4);
  key.position.set(2.5, 9, 3);
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xc9d6ff, 1.4);
  rim.position.set(-6, 3, -6);
  scene.add(rim);

  // Turntable: dark brushed disc with a thin silver edge.
  const table = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(3.1, 3.1, 0.08, 96),
    new THREE.MeshStandardMaterial({ color: 0x060607, metalness: 0.35, roughness: 0.55 })
  );
  disc.position.y = -0.04;
  const edge = new THREE.Mesh(
    new THREE.TorusGeometry(3.1, 0.01, 8, 160),
    new THREE.MeshStandardMaterial({ color: 0x9a9fa6, metalness: 1, roughness: 0.3, emissive: 0x15171a })
  );
  edge.rotation.x = Math.PI / 2;
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ map: radial("rgba(0,0,0,0.85)", "rgba(0,0,0,0)"), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.002;
  table.add(disc, edge, shadow);
  scene.add(table);

  const pool = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshBasicMaterial({ map: radial("rgba(220,226,235,0.16)", "rgba(220,226,235,0)"), transparent: true, depthWrite: false })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = -0.085;
  scene.add(pool);

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  // Scroll-driven state, eased every frame so wheel "steps" feel smooth.
  let target = opts.still ? 0.35 : 0;
  let cur = target;
  let active = false;
  let raf = 0;
  let disposed = false;
  let w = 0;
  let h = 0;

  function resize() {
    w = host.clientWidth;
    h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Wide screens: push the car right so the captions get the left side. Tall screens: push it up.
    if (camera.aspect > 1.15) camera.setViewOffset(w, h, -w * 0.17, h * 0.04, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.1, w, h);
    camera.updateProjectionMatrix();
  }

  function place() {
    const p = cur;
    // Car + turntable turn ~200° over the section; the camera eases closer and lower.
    table.rotation.y = -0.9 + p * Math.PI * 1.15;
    const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    // Portrait screens use the full width for the car; wide ones keep the left ~40% for text.
    const fit = (CAR_LENGTH * (camera.aspect > 1.15 ? 0.95 : 0.55)) / Math.tan(hfov / 2);
    const dist = Math.max(fit, THREE.MathUtils.lerp(12.5, 10.8, p));
    const height = THREE.MathUtils.lerp(2.5, 1.25, p);
    camera.position.set(0, height, dist);
    camera.lookAt(0, 0.45, 0);
  }

  function frame() {
    raf = 0;
    if (disposed) return;
    cur += (target - cur) * 0.08;
    place();
    renderer.render(scene, camera);
    if (active && Math.abs(target - cur) > 0.0005) raf = requestAnimationFrame(frame);
  }
  const kick = () => {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  };

  const ro = new ResizeObserver(() => {
    resize();
    kick();
  });
  ro.observe(host);
  resize();

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  loader.load(
    opts.url,
    (gltf) => {
      if (disposed) return;
      const car = gltf.scene;
      // Smooth, deep gloss instead of the coarse metal-flake normal map.
      car.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        for (const m of ([] as THREE.Material[]).concat(mesh.material)) {
          if (m.name.startsWith("Paint") && "normalMap" in m) {
            const pm = m as THREE.MeshPhysicalMaterial;
            pm.normalMap = null;
            pm.clearcoat = 1;
            pm.clearcoatRoughness = 0.06;
            pm.needsUpdate = true;
          }
        }
      });
      // Normalise: centre on the turntable, wheels on the floor, fixed length.
      // (Compressed meshes carry their scale on child nodes, so refresh world matrices before measuring.)
      const measure = () => {
        car.updateMatrixWorld(true);
        return new THREE.Box3().setFromObject(car, true);
      };
      let box = measure();
      const size = box.getSize(new THREE.Vector3());
      if (size.x > size.z) car.rotation.y = Math.PI / 2;
      car.scale.setScalar(CAR_LENGTH / Math.max(size.x, size.z));
      box = measure();
      const c = box.getCenter(new THREE.Vector3());
      car.position.set(-c.x, -box.min.y, -c.z);
      const sz = measure().getSize(new THREE.Vector3());
      shadow.scale.set(sz.x * 1.35, sz.z * 1.25, 1);
      table.add(car);
      kick();
      opts.onReady();
    },
    undefined,
    () => opts.onError()
  );

  return {
    setProgress(p) {
      if (opts.still) return;
      target = Math.min(1, Math.max(0, p));
      kick();
    },
    setActive(on) {
      active = on;
      if (on) kick();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        mats.forEach((mat) => {
          Object.values(mat).forEach((v) => v instanceof THREE.Texture && v.dispose());
          mat.dispose();
        });
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
