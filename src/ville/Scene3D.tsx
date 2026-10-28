import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { SCENARIOS, kw, rng, type Quartier, type ScenarioId } from '../engine'

// Scène 3D du quartier, reprise de reference/app-base.html (init3D).
// Elle n'invente rien : la lumière des panneaux, des fenêtres et les particules suivent les résultats du moteur.

export interface EtatScene {
  q: Quartier // quartier affiché (avec ou sans coordination)
  slot: number
  scenario: ScenarioId
  cloud: boolean
}

// Différences avec la maquette (three r128 → r186) : les lumières sont multipliées par π,
// car three.js utilise maintenant des unités physiques. Le rendu visuel reste le même.
const PI = Math.PI

export default function Scene3D(props: EtatScene) {
  const conteneur = useRef<HTMLDivElement>(null)
  const etat = useRef(props)
  const majRef = useRef<(() => void) | null>(null)
  etat.current = props

  useEffect(() => {
    const wrap = conteneur.current!
    const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true }) } catch {
      wrap.insertAdjacentHTML('beforeend', '<div class="scene__secours">Votre navigateur ne permet pas l\'affichage 3D (WebGL).</div>')
      return
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap
    wrap.prepend(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x9fc8de, 70, 150)
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 400)
    camera.position.set(54, 42, 60) // un peu plus loin que la maquette : les panneaux flottants couvrent une partie de l'écran
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true; controls.target.set(0, 2, 0); controls.enablePan = false
    controls.maxPolarAngle = Math.PI * .44; controls.minDistance = 30; controls.maxDistance = 100
    controls.autoRotate = !reduit; controls.autoRotateSpeed = .35

    const hemi = new THREE.HemisphereLight(0xdcefff, 0x2f3d33, .55 * PI); scene.add(hemi)
    const sunL = new THREE.DirectionalLight(0xfff0d0, 1.2 * PI); sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048)
    Object.assign(sunL.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, far: 160 }); scene.add(sunL, sunL.target)

    const std = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, metalness: 0, ...extra })
    const add = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; scene.add(m); return m }
    const box = (w: number, h: number, d: number, mat: THREE.Material, x: number, z: number, y = 0) => add(new THREE.BoxGeometry(w, h, d), mat, x, y + h / 2, z)

    // Sol, rues, places
    const ground = add(new THREE.PlaneGeometry(130, 130), std(0x7fa77d), 0, 0, 0); ground.rotation.x = -Math.PI / 2; ground.castShadow = false
    const road = std(0x4b545c), walk = std(0xc9cfc8)
    box(130, .06, 6, road, 0, 0); box(6, .06, 130, road, 0, 0)
    box(130, .08, 1.2, walk, 0, 3.6); box(130, .08, 1.2, walk, 0, -3.6); box(1.2, .08, 130, walk, 3.6, 0); box(1.2, .08, 130, walk, -3.6, 0)
    for (let i = -60; i < 60; i += 5) { box(2.4, .07, .25, std(0xe8e2c8), i, 0); box(.25, .07, 2.4, std(0xe8e2c8), 0, i) }

    // Matériaux des fenêtres, pilotés par la consommation
    const winMat = { res: std(0x1b2430, { emissive: 0xffc46b }), ecole: std(0x1b2430, { emissive: 0xffd88a }), boul: std(0x1b2430, { emissive: 0xffb04a }), gym: std(0x1b2430, { emissive: 0xbfe8ff }) }
    function windows(cx: number, cz: number, w: number, h: number, d: number, rows: number, cols: number, mat: THREE.Material, y0 = 1) {
      const g = new THREE.BoxGeometry(.9, .7, .08)
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const yy = y0 + r * ((h - y0 - .8) / Math.max(1, rows - 1 || 1))
        const xx = cx - w / 2 + (c + .5) * (w / cols)
        const m1 = new THREE.Mesh(g, mat); m1.position.set(xx, yy, cz + d / 2 + .05); scene.add(m1)
        const m2 = new THREE.Mesh(g, mat); m2.position.set(xx, yy, cz - d / 2 - .05); scene.add(m2)
      }
    }

    // Gymnase et ses 18 panneaux solaires
    const GYM = { x: -15, z: -15 }
    box(16, 5, 11, std(0xd9d2c4), GYM.x, GYM.z)
    windows(GYM.x, GYM.z, 16, 5, 11, 1, 7, winMat.gym, 2)
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1c2e52, roughness: .35, metalness: .4, emissive: 0xffb300, emissiveIntensity: 0 })
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
      const p = add(new THREE.BoxGeometry(2.2, .12, 2.6), panelMat, GYM.x - 6.2 + c * 2.5, 5.6, GYM.z - 3 + r * 3)
      p.rotation.x = -.35
    }
    // École
    box(13, 6, 8, std(0xe7c9a0), 15, -14); box(5, 6, 5, std(0xe7c9a0), 19.5, -8)
    windows(15, -14, 13, 6, 8, 2, 6, winMat.ecole, 1.6)
    box(9, .1, 4, std(0xb7a07c), 12, -7.5) // cour
    // Boulangerie de Lily
    box(6, 4, 5, std(0xf0e3cf), 14, 11)
    add(new THREE.BoxGeometry(6.4, .2, 1.6), std(0xb5502f), 14, 2.9, 14.1).rotation.x = .3
    windows(14, 11, 6, 4, 5, 1, 3, winMat.boul, 1.6)
    // Logements sociaux
    box(7, 15, 7, std(0xc7ccd3), -16, 15); box(7, 11, 7, std(0xb9c0c9), -8.5, 21)
    windows(-16, 15, 7, 15, 7, 6, 3, winMat.res, 1.4); windows(-8.5, 21, 7, 11, 7, 4, 3, winMat.res, 1.4)
    // Maisons
    const roofMat = std(0x9a4b3c), houseCols = [0xf2ead8, 0xe6dccb, 0xf5efe3, 0xdfe5e4]
    const houses: THREE.Vector3[] = [];
    [[9, 22], [15, 22], [21, 22], [27, 22], [9, 29], [15, 29], [21, 29], [27, 29], [-26, -5], [-28, -27]].forEach(([x, z], k) => {
      box(4, 3, 4, std(houseCols[k % 4]), x, z)
      const roof = add(new THREE.ConeGeometry(3.2, 2, 4), roofMat, x, 4, z); roof.rotation.y = Math.PI / 4
      const w = new THREE.Mesh(new THREE.BoxGeometry(1, .8, .08), winMat.res); w.position.set(x, 1.6, z + 2.05); scene.add(w)
      houses.push(new THREE.Vector3(x, 2, z))
    })
    // Poste électrique et pylône
    const POSTE = new THREE.Vector3(30, 9, -28)
    box(4, 2.5, 3, std(0x8d969c), 30, -24)
    const pyl = std(0x6f777d, { metalness: .5, roughness: .5 })
    add(new THREE.CylinderGeometry(.25, .7, 12, 4), pyl, 30, 6, -28)
    add(new THREE.BoxGeometry(6, .25, .25), pyl, 30, 11, -28); add(new THREE.BoxGeometry(4.5, .25, .25), pyl, 30, 9, -28)
    // Bornes et voitures
    const borneMat = std(0x0e3b40, { emissive: 0x46c5d0, emissiveIntensity: .8 });
    [[-6, -27], [-2, -27], [2, -27]].forEach(([x, z], k) => {
      box(.6, 1.6, .6, borneMat, x, z)
      if (k !== 1) { box(2.2, 1.1, 4, std([0x2f6fb0, 0xd6d9dc][k ? 1 : 0], { metalness: .3, roughness: .4 }), x, z + 3.2); box(1.9, .8, 2.2, std(0x22303a, { metalness: .3, roughness: .3 }), x, z + 3.2, 1.1) }
    })
    // Arbres (pas dans les emprises au sol des bâtiments)
    const FOOT = [[-23, -7, -20.5, -9.5], [8.5, 21.5, -18, -10], [17, 22, -10.5, -5.5], [11, 17, 8.5, 14.5], [-19.5, -12.5, 11.5, 18.5], [-12, -5, 17.5, 24.5], [28, 32, -25.5, -22.5], [-8, 4, -28, -21],
      ...houses.map(h => [h.x - 2.5, h.x + 2.5, h.z - 2.5, h.z + 2.5])]
    const leaf = std(0x3f7f4a), trunk = std(0x6b4a33), rr = rng(7)
    for (let k = 0; k < 34; k++) {
      const side = rr() < .5 ? 1 : -1, along = (rr() - .5) * 110, alongX = rr() < .5
      const x = alongX ? along : side * (5.4 + rr() * .6), z = alongX ? side * (5.4 + rr() * .6) : along
      if (Math.abs(x) < 7 && Math.abs(z) < 7) continue
      if (FOOT.some(([x1, x2, z1, z2]) => x > x1 - 1.6 && x < x2 + 1.6 && z > z1 - 1.6 && z < z2 + 1.6)) continue
      add(new THREE.CylinderGeometry(.15, .2, 1.2, 6), trunk, x, .6, z)
      add(new THREE.SphereGeometry(.9 + rr() * .5, 10, 8), leaf, x, 1.9, z)
    }

    // Nuage : visible quand on clique sur « Un nuage arrive », il passe au-dessus du quartier
    const nuage = new THREE.Group()
    const nuageMat = new THREE.MeshStandardMaterial({ color: 0xf4f7f9, roughness: 1, transparent: true, opacity: .92 });
    [[0, 0, 0, 6], [5, -.5, 1, 4.5], [-5, -.8, -1, 4.2], [2, 1.5, -2, 4.4], [-2, 1, 2, 3.8]].forEach(([x, y, z, r]) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), nuageMat); s.position.set(x, y, z); s.castShadow = true; nuage.add(s)
    })
    nuage.scale.set(1.3, .7, 1); nuage.position.set(-60, 26, -6); nuage.visible = false; scene.add(nuage)

    // Particules d'énergie : jaunes = soleil local, bleues = réseau
    const GYM_TOP = new THREE.Vector3(GYM.x, 7, GYM.z)
    const consumers = [...houses, new THREE.Vector3(-16, 8, 15), new THREE.Vector3(-8.5, 6, 21), new THREE.Vector3(15, 5, -14), new THREE.Vector3(14, 3, 11), new THREE.Vector3(-2, 2, -27)]
    const pGeo = new THREE.SphereGeometry(.32, 8, 8)
    const pSun = new THREE.MeshBasicMaterial({ color: 0xffc53d }), pGrid = new THREE.MeshBasicMaterial({ color: 0x5ad1e6 })
    type Particule = { m: THREE.Mesh; t: number; a: THREE.Vector3; b: THREE.Vector3; c: THREE.Vector3 }
    const pool: Particule[] = []
    for (let k = 0; k < 220; k++) { const m = new THREE.Mesh(pGeo, pSun); m.visible = false; scene.add(m); pool.push({ m, t: 0, a: GYM_TOP, b: GYM_TOP, c: GYM_TOP }) }
    const acc = { sun: 0, grid: 0 }
    function spawn(from: THREE.Vector3, mat: THREE.Material) {
      const p = pool.find(o => !o.m.visible); if (!p) return
      const b = consumers[Math.floor(Math.random() * consumers.length)]
      p.a = from; p.b = b; p.c = from.clone().lerp(b, .5).add(new THREE.Vector3(0, 9, 0)); p.t = 0; p.m.material = mat; p.m.visible = true
    }

    // Étiquettes HTML au-dessus des bâtiments
    const cur = () => { const { q, slot } = etat.current; return { q, i: slot, prod: q.prod[slot], cons: q.cons[slot] } }
    const LBL = [
      { pos: new THREE.Vector3(GYM.x, 10, GYM.z), html: () => `Gymnase solaire<i class="soleil">${kw(cur().prod)}</i>` },
      { pos: new THREE.Vector3(15, 9, -14), html: () => 'École' },
      { pos: new THREE.Vector3(14, 7, 11), html: () => 'Boulangerie de Lily' },
      { pos: new THREE.Vector3(-16, 18, 15), html: () => 'Logements' },
      { pos: new THREE.Vector3(30, 14, -28), html: () => `Poste électrique<i class="reseau">${kw(Math.max(0, cur().cons - Math.min(cur().prod, cur().cons)))}</i>` },
    ].map(l => { const el = document.createElement('div'); el.className = 'etiquette'; wrap.appendChild(el); return { ...l, el } })

    const skyNight = new THREE.Color(0x0a1626), skyDay = new THREE.Color(0x9fd2ec), skyWinter = new THREE.Color(0xb7c6d0), tmp = new THREE.Color()
    function update() {
      const { q, i, prod } = cur(), { scenario, cloud } = etat.current
      const h = q.ctx[i].h, sc = SCENARIOS[scenario]
      const day = Math.max(0, Math.sin(Math.PI * (h - sc.sun.rise) / (sc.sun.set - sc.sun.rise)))
      const isDay = h >= sc.sun.rise && h <= sc.sun.set
      const dayAmt = isDay ? Math.min(1, .25 + day) : 0
      const sousNuage = cloud && h >= 11.5 && h < 15.5
      tmp.copy(skyNight).lerp(scenario === 'ete' ? skyDay : skyWinter, dayAmt * (sousNuage ? .7 : 1))
      renderer.setClearColor(tmp); (scene.fog as THREE.Fog).color.copy(tmp)
      const az = Math.PI * Math.min(1, Math.max(0, (h - sc.sun.rise) / (sc.sun.set - sc.sun.rise)))
      sunL.position.set(Math.cos(az) * -60, 10 + Math.sin(az) * 50, -25)
      sunL.intensity = (isDay ? .35 + 1.1 * day * (scenario === 'ete' ? 1 : .6) : .08) * PI
      hemi.intensity = (.18 + .5 * dayAmt) * PI
      const maxProd = Math.max(1, ...q.prod)
      panelMat.emissiveIntensity = 1.4 * prod / maxProd
      const p = q.parts[i], resMax = Math.max(...q.parts.map((pp, k) => pp.res + q.flex[k]))
      const night = 1 - dayAmt
      winMat.res.emissiveIntensity = .05 + (1.2 + night) * (p.res + q.flex[i]) / resMax
      winMat.ecole.emissiveIntensity = p.ecole ? .4 + night : .02
      winMat.boul.emissiveIntensity = p.boul > 2 ? .5 + night : .05
      winMat.gym.emissiveIntensity = .05 + .3 * night
      if (cloud && !nuage.visible) nuage.position.x = -30 // il entre dans le champ tout de suite
      nuage.visible = cloud
      nuageMat.opacity = sousNuage ? .95 : .6
      LBL.forEach(l => { l.el.innerHTML = l.html() })
    }
    majRef.current = update

    function resize() {
      const r = wrap.getBoundingClientRect(); if (!r.width) return
      renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height
      // Sur grand écran, les panneaux flottants couvrent la droite et le bas :
      // on décale l'image pour centrer le quartier dans la zone restée libre.
      if (r.width > 1100) camera.setViewOffset(r.width, r.height, 170, 105, r.width, r.height)
      else camera.clearViewOffset()
      camera.updateProjectionMatrix()
    }
    const observateur = new ResizeObserver(resize); observateur.observe(wrap)

    let last = performance.now(), raf = 0
    const v = new THREE.Vector3()
    function loop(now: number) {
      const dt = Math.min(.05, (now - last) / 1000); last = now
      const { prod, cons } = cur(), loc = Math.min(prod, cons)
      acc.sun += loc * dt * .45; acc.grid += (cons - loc) * dt * .45
      while (acc.sun >= 1) { spawn(GYM_TOP, pSun); acc.sun-- }
      while (acc.grid >= 1) { spawn(POSTE, pGrid); acc.grid-- }
      for (const p of pool) if (p.m.visible) {
        p.t += dt * .55; if (p.t >= 1) { p.m.visible = false; continue }
        const t = p.t, u = 1 - t
        p.m.position.set(u * u * p.a.x + 2 * u * t * p.c.x + t * t * p.b.x, u * u * p.a.y + 2 * u * t * p.c.y + t * t * p.b.y, u * u * p.a.z + 2 * u * t * p.c.z + t * t * p.b.z)
      }
      if (nuage.visible) { nuage.position.x += dt * 4; if (nuage.position.x > 60) nuage.position.x = -60 }
      controls.update()
      renderer.render(scene, camera)
      const r = wrap.getBoundingClientRect()
      LBL.forEach(l => {
        v.copy(l.pos).project(camera)
        l.el.style.display = v.z > 1 ? 'none' : ''
        l.el.style.transform = `translate(${((v.x + 1) / 2 * r.width).toFixed(0)}px, ${((1 - v.y) / 2 * r.height).toFixed(0)}px) translate(-50%, -100%)`
      })
      raf = requestAnimationFrame(loop)
    }
    resize(); update(); raf = requestAnimationFrame(loop)

    // Nettoyage quand on quitte l'onglet : on libère la mémoire de la carte graphique.
    return () => {
      cancelAnimationFrame(raf)
      observateur.disconnect()
      controls.dispose()
      LBL.forEach(l => l.el.remove())
      scene.traverse(o => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach(m => m.dispose())
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
      majRef.current = null
    }
  }, [])

  // À chaque changement d'heure, de nuage, de scénario ou de coordination : mise à jour de la lumière.
  useEffect(() => { majRef.current?.() }, [props.q, props.slot, props.scenario, props.cloud])

  return <div ref={conteneur} className="scene" aria-label="Vue 3D du quartier : gymnase solaire, école, boulangerie, logements, maisons, poste électrique et bornes" role="img" />
}
