'use client'

import { useEffect, useRef } from 'react'

// ─── Globe radius (normalised) ─────────────────────────────────────────────
const R = 1.0

// ─── Brand palette ────────────────────────────────────────────────────────
const C = {
  yellow:    0xE4DC1F,
  lightBlue: 0x1CA3DB,
  green:     0x2D7D46,
  white:     0xffffff,
  dark:      0x1A1A2E,
}

// ─── Hub ──────────────────────────────────────────────────────────────────
const HUB = { name: 'Kigali', iata: 'KGL', lat: -1.9441, lon: 30.0619 }

// ─── Route network ────────────────────────────────────────────────────────
const FEATURED = [
  { name: 'Amsterdam',        iata: 'AMS', lat:  52.3676,  lon:   4.9041 },
  { name: 'Frankfurt',        iata: 'FRA', lat:  50.0379,  lon:   8.5622 },
  { name: 'Berlin',           iata: 'BER', lat:  52.5200,  lon:  13.4050 },
  { name: 'Stockholm',        iata: 'ARN', lat:  59.6519,  lon:  17.9186 },
  { name: 'Copenhagen',       iata: 'CPH', lat:  55.6761,  lon:  12.5683 },
  { name: 'Oslo',             iata: 'OSL', lat:  59.9139,  lon:  10.7522 },
  { name: 'Dhaka',            iata: 'DAC', lat:  23.8103,  lon:  90.4125 },
  { name: 'Beijing',          iata: 'PEK', lat:  39.9042,  lon: 116.4074 },
  { name: 'Shanghai',         iata: 'PVG', lat:  31.2304,  lon: 121.4737 },
  { name: 'Istanbul',         iata: 'IST', lat:  41.0082,  lon:  28.9784 },
  { name: 'New York',         iata: 'JFK', lat:  40.7128,  lon: -74.0060 },
  { name: 'Washington D.C.',  iata: 'IAD', lat:  38.9072,  lon: -77.0369 },
  { name: 'Kuala Lumpur',     iata: 'KUL', lat:   3.1390,  lon: 101.6869 },
  { name: 'Ho Chi Minh City', iata: 'SGN', lat:  10.8231,  lon: 106.6297 },
]

// Africa network — green, shown on ALL devices (mobile + desktop)
const AFRICA = [
  // East Africa
  { name: 'Entebbe',       iata: 'EBB', lat:   0.0447,  lon:  32.4430 },
  { name: 'Nairobi',       iata: 'NBO', lat:  -1.2921,  lon:  36.8219 },
  { name: 'Dar es Salaam', iata: 'DAR', lat:  -6.7924,  lon:  39.2083 },
  { name: 'Kilimanjaro',   iata: 'JRO', lat:  -3.4295,  lon:  37.0074 },
  { name: 'Bujumbura',     iata: 'BJM', lat:  -3.3869,  lon:  29.3644 },
  { name: 'Kamembe',       iata: 'KME', lat:  -2.4622,  lon:  28.9079 },
  { name: 'Djibouti',      iata: 'JIB', lat:  11.8251,  lon:  42.5903 },
  // Southern Africa
  { name: 'Johannesburg',  iata: 'JNB', lat: -26.2041,  lon:  28.0473 },
  { name: 'Harare',        iata: 'HRE', lat: -17.8252,  lon:  31.0335 },
  { name: 'Lusaka',        iata: 'LUN', lat: -15.4167,  lon:  28.2833 },
  // West Africa
  { name: 'Lagos',         iata: 'LOS', lat:   6.5244,  lon:   3.3792 },
  { name: 'Abuja',         iata: 'ABV', lat:   9.0065,  lon:   7.2679 },
  { name: 'Accra',         iata: 'ACC', lat:   5.6037,  lon:  -0.1870 },
  { name: 'Cotonou',       iata: 'COO', lat:   6.3572,  lon:   2.3844 },
  { name: 'Libreville',    iata: 'LBV', lat:   0.3924,  lon:   9.4536 },
  // Central Africa
  { name: 'Douala',        iata: 'DLA', lat:   4.0061,  lon:   9.7195 },
  { name: 'Yaoundé',       iata: 'YAO', lat:   3.8480,  lon:  11.5021 },
  { name: 'Bangui',        iata: 'BGF', lat:   4.3612,  lon:  18.5550 },
  { name: 'Brazzaville',   iata: 'BZV', lat:  -4.2694,  lon:  15.2712 },
]

// International — light blue, desktop only
const STANDARD = [
  { name: 'Brussels',  iata: 'BRU', lat:  50.8503,  lon:   4.3517 },
  { name: 'London',    iata: 'LHR', lat:  51.5074,  lon:  -0.1278 },
  { name: 'Paris',     iata: 'CDG', lat:  48.8566,  lon:   2.3522 },
  { name: 'Dubai',     iata: 'DXB', lat:  25.2048,  lon:  55.2708 },
  { name: 'Doha',      iata: 'DOH', lat:  25.2854,  lon:  51.5310 },
  { name: 'Riyadh',    iata: 'RUH', lat:  24.7136,  lon:  46.6753 },
  { name: 'Tokyo',     iata: 'NRT', lat:  35.6762,  lon: 139.6503 },
  { name: 'Seoul',     iata: 'ICN', lat:  37.5665,  lon: 126.9780 },
  { name: 'Singapore', iata: 'SIN', lat:   1.3521,  lon: 103.8198 },
  { name: 'Bangkok',   iata: 'BKK', lat:  13.7563,  lon: 100.5018 },
  { name: 'Colombo',   iata: 'CMB', lat:   6.9271,  lon:  79.8612 },
  { name: 'Karachi',   iata: 'KHI', lat:  24.8607,  lon:  67.0011 },
  { name: 'Toronto',   iata: 'YYZ', lat:  43.6532,  lon: -79.3832 },
  { name: 'Montreal',  iata: 'YUL', lat:  45.5017,  lon: -73.5673 },
]

// ─── Coordinate helpers ───────────────────────────────────────────────────

function toRad(deg) { return deg * Math.PI / 180 }

/**
 * Convert lat/lon (degrees) to a THREE.Vector3 on a sphere of given radius.
 * Formula from spec: x = R·cos(φ)·cos(λ), y = R·sin(φ), z = −R·cos(φ)·sin(λ)
 */
function latLonToV3(THREE, lat, lon, radius) {
  const φ = toRad(lat)
  const λ = toRad(lon)
  return new THREE.Vector3(
    radius * Math.cos(φ) * Math.cos(λ),
    radius * Math.sin(φ),
    radius * Math.cos(φ) * Math.sin(λ) * -1,
  )
}

/**
 * Build a CatmullRomCurve3 arc between two lat/lon points on the globe,
 * lifting intermediate points radially by `lift` × R so the arc floats
 * visibly above the surface.
 */
function buildArc(THREE, latA, lonA, latB, lonB, lift, segments) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const t   = i / segments
    const lat = latA + (latB - latA) * t
    const lon = lonA + (lonB - lonA) * t
    const p   = latLonToV3(THREE, lat, lon, R)
    // Lift peaks at midpoint (sin curve)
    p.normalize().multiplyScalar(R + lift * Math.sin(Math.PI * t))
    pts.push(p)
  }
  return new THREE.CatmullRomCurve3(pts)
}

// ─── Component ────────────────────────────────────────────────────────────

export default function RouteGlobe({ height = 640, className = '' }) {
  const mountRef   = useRef(null)
  const tipRef     = useRef(null)
  const stateRef   = useRef({ cleanup: null })

  useEffect(() => {
    if (typeof window === 'undefined') return
    let cancelled = false

    function bootstrap() {
      if (window.THREE) {
        if (!cancelled) initGlobe()
        return
      }
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      s.onload  = () => { if (!cancelled) initGlobe() }
      s.onerror = () => console.error('[RouteGlobe] Failed to load Three.js from CDN')
      document.head.appendChild(s)
    }

    bootstrap()

    return () => {
      cancelled = true
      if (stateRef.current.cleanup) stateRef.current.cleanup()
    }
  }, [])

  // ─── Main init (runs once THREE is available) ────────────────
  function initGlobe() {
    const THREE = window.THREE
    const el    = mountRef.current
    if (!el || !THREE) return

    const isMobile      = window.innerWidth < 768
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // ── Renderer ─────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setClearColor(C.dark, 1)
    el.appendChild(renderer.domElement)

    // ── Scene & Camera ────────────────────────────────────────
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      el.clientWidth / el.clientHeight,
      0.1,
      200,
    )
    camera.position.set(0, 0.35, 3.0)
    camera.lookAt(0, 0, 0)

    // ── Ambient + Directional light ───────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    const sun = new THREE.DirectionalLight(0xffffff, 0.9)
    sun.position.set(5, 3, 5)
    scene.add(sun)

    // ── Star field ────────────────────────────────────────────
    const starCount = isMobile ? 500 : 1800
    const starPos   = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const r   = 40 + Math.random() * 20
      const th  = Math.random() * Math.PI * 2
      const ph  = Math.acos(2 * Math.random() - 1)
      starPos[i * 3]     = r * Math.sin(ph) * Math.cos(th)
      starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th)
      starPos[i * 3 + 2] = r * Math.cos(ph)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3))
    scene.add(new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, sizeAttenuation: true }),
    ))

    // ── Globe group (all globe elements spin together) ────────
    const globe = new THREE.Group()
    // Initial orientation: tilt + rotate so Africa / KGL faces camera
    // KGL lon ≈ 30° east; with our formula z = -R·cos(φ)·sin(λ),
    // rotating Y by +toRad(30) pushes KGL toward +z (camera).
    globe.rotation.x = 0.18
    globe.rotation.y = toRad(30)
    scene.add(globe)

    // ── Texture loader ────────────────────────────────────────
    const loader = new THREE.TextureLoader()

    // ── Earth surface ─────────────────────────────────────────
    const earthMat = new THREE.MeshPhongMaterial({
      map:       loader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg',
      ),
      specular:  new THREE.Color(0x111111),
      shininess: 12,
    })
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R, 64, 64), earthMat))

    // ── Cloud layer (desktop only) ────────────────────────────
    let cloudMesh = null
    if (!isMobile) {
      const cloudMat = new THREE.MeshPhongMaterial({
        map:         loader.load(
          'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_clouds_1024.png',
        ),
        transparent: true,
        opacity:     0.38,
        depthWrite:  false,
      })
      cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(R + 0.012, 64, 64), cloudMat)
      globe.add(cloudMesh)
    }

    // ── Atmospheric rim glow ──────────────────────────────────
    // BackSide ShaderMaterial — bright at limb, dark toward back hemisphere.
    // With BackSide, normalMatrix * normal still returns outward normals.
    // At limb pixels: outward normal ⊥ view → dot(n, (0,0,-1)) ≈ 0 → intensity ≈ 1.
    // At back-center: outward normal → −z in view space → dot ≈ 1 → intensity → 0.
    const atmosMat = new THREE.ShaderMaterial({
      side:        THREE.BackSide,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
      uniforms: { glowColor: { value: new THREE.Color(C.lightBlue) } },
      vertexShader: `
        varying float vIntensity;
        void main() {
          vec3 n = normalize(normalMatrix * normal);
          vIntensity = pow(max(0.0, 1.0 - dot(n, vec3(0.0, 0.0, -1.0))), 3.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float vIntensity;
        void main() {
          gl_FragColor = vec4(glowColor, vIntensity * 0.75);
        }
      `,
    })
    globe.add(new THREE.Mesh(new THREE.SphereGeometry(R + 0.10, 64, 64), atmosMat))

    // ── Routes: arcs + aircraft + markers ─────────────────────
    const yellowV3    = new THREE.Color(C.yellow)
    const greenV3     = new THREE.Color(C.green)
    const lightBlueV3 = new THREE.Color(C.lightBlue)

    // Featured (yellow) + Africa (green) always shown; international (blue) desktop only
    const routes = [
      ...FEATURED.map(d => ({ dest: d, tier: 'featured' })),
      ...AFRICA.map(d   => ({ dest: d, tier: 'africa'   })),
      ...(isMobile ? [] : STANDARD.map(d => ({ dest: d, tier: 'standard' }))),
    ]

    const aircraftData = []  // { mesh, curve, t, speed }
    const markerMeshes = []  // THREE.Mesh[] — for raycasting hover

    routes.forEach((route, idx) => {
      const { dest, tier } = route
      const color  = tier === 'featured' ? yellowV3
                   : tier === 'africa'   ? greenV3
                   :                       lightBlueV3
      const lift   = tier === 'featured' ? 0.24 : 0.18
      const segs   = 60

      // Great-circle-approximating arc curve
      const curve = buildArc(THREE, HUB.lat, HUB.lon, dest.lat, dest.lon, lift, segs)

      // Route tube (thin, catches scene lighting)
      const tubeGeo = new THREE.TubeGeometry(curve, segs, 0.0022, 5, false)
      const tubeMat = new THREE.MeshBasicMaterial({
        color,
        transparent: tier === 'standard',
        opacity:     tier === 'standard' ? 0.50 : 1.0,
      })
      globe.add(new THREE.Mesh(tubeGeo, tubeMat))

      // Destination surface marker
      const mGeo = new THREE.SphereGeometry(0.011, 8, 8)
      const mMat = new THREE.MeshBasicMaterial({ color })
      const marker = new THREE.Mesh(mGeo, mMat)
      marker.position.copy(latLonToV3(THREE, dest.lat, dest.lon, R))
      marker.userData = { dest, tier }
      globe.add(marker)
      markerMeshes.push(marker)

      // Aircraft —────────────────────────────────────────────
      // ConeGeometry tip in +Y → rotate X 90° → tip now in +Z
      // lookAt(nextWorldPos) makes +Z face forward along path ✓
      const acGeo = new THREE.ConeGeometry(0.007, 0.026, 4)
      acGeo.rotateX(Math.PI / 2)
      const acMat  = new THREE.MeshBasicMaterial({
        color: tier === 'featured' ? C.yellow : tier === 'africa' ? C.green : C.white,
      })
      const acMesh = new THREE.Mesh(acGeo, acMat)

      if (prefersReduced) {
        // Reduced motion: pin at midpoint, no animation
        acMesh.position.copy(curve.getPointAt(0.5))
      } else {
        // Stagger each aircraft's start t so the globe shows live traffic
        const startT = (idx * 0.13) % 1
        acMesh.position.copy(curve.getPointAt(startT))
        aircraftData.push({
          mesh:  acMesh,
          curve,
          t:     startT,
          speed: 0.00055 + Math.random() * 0.00025,
        })
      }

      globe.add(acMesh)
    })

    // ── KGL hub marker ────────────────────────────────────────
    const kglPos = latLonToV3(THREE, HUB.lat, HUB.lon, R)

    const hubMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.020, 12, 12),
      new THREE.MeshBasicMaterial({ color: C.yellow }),
    )
    hubMesh.position.copy(kglPos)
    globe.add(hubMesh)

    // KGL pulsing rings (3 staggered sonar pings)
    const rings = []
    for (let i = 0; i < 3; i++) {
      const rGeo  = new THREE.RingGeometry(0.022, 0.030, 32)
      const rMat  = new THREE.MeshBasicMaterial({
        color:       C.yellow,
        transparent: true,
        opacity:     0.9,
        side:        THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(rGeo, rMat)
      ring.position.copy(kglPos)
      // Orient ring perpendicular to the radius at KGL
      // lookAt(kglPos × 2) makes ring's +Z face outward from globe centre ✓
      ring.lookAt(kglPos.clone().multiplyScalar(2))
      ring.userData.phase = i / 3
      globe.add(ring)
      rings.push(ring)
    }

    // ── Manual orbit controls ─────────────────────────────────
    let isDragging   = false
    let prevMouse    = { x: 0, y: 0 }
    let velY = 0, velX = 0
    let resumeAutoMs = 0
    let autoRotate   = !prefersReduced

    const cv = renderer.domElement

    function onPointerDown(e) {
      isDragging   = true
      autoRotate   = false
      prevMouse    = { x: e.clientX, y: e.clientY }
    }
    function onPointerMove(e) {
      if (!isDragging) return
      const dx = (e.clientX - prevMouse.x) * 0.006
      const dy = (e.clientY - prevMouse.y) * 0.006
      globe.rotation.y += dx
      globe.rotation.x  = Math.max(-0.7, Math.min(0.7, globe.rotation.x + dy))
      velY = dx
      velX = dy
      prevMouse = { x: e.clientX, y: e.clientY }
    }
    function onPointerUp() {
      isDragging   = false
      resumeAutoMs = Date.now() + 2000
    }

    cv.addEventListener('pointerdown',  onPointerDown)
    cv.addEventListener('pointermove',  onPointerMove)
    cv.addEventListener('pointerup',    onPointerUp)
    cv.addEventListener('pointerleave', onPointerUp)

    // Pinch / scroll zoom
    function onWheel(e) {
      camera.position.z = Math.max(1.7, Math.min(5.5, camera.position.z + e.deltaY * 0.006))
    }
    cv.addEventListener('wheel', onWheel, { passive: true })

    // ── Raycasting hover tooltip ──────────────────────────────
    const raycaster = new THREE.Raycaster()
    const ndc       = new THREE.Vector2()

    function onMouseMove(e) {
      const rect = cv.getBoundingClientRect()
      ndc.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1
      ndc.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1
      raycaster.setFromCamera(ndc, camera)
      const hits = raycaster.intersectObjects(markerMeshes)
      const tip  = tipRef.current
      if (!tip) return
      if (hits.length > 0) {
        const { dest, tier } = hits[0].object.userData
        const badge = tier === 'featured' ? '🌍 Intl' : tier === 'africa' ? '🟢 Africa' : '🔵 Intl'
        tip.style.display = 'block'
        tip.style.left    = `${e.clientX - rect.left + 14}px`
        tip.style.top     = `${e.clientY - rect.top  - 14}px`
        tip.innerHTML = `
          <span style="font-weight:700">${dest.name}</span>
          <span style="opacity:0.6;margin-left:6px">${dest.iata}</span>
          <span style="margin-left:6px;font-size:11px;opacity:0.8">${badge}</span>
        `
        cv.style.cursor = 'pointer'
      } else {
        tip.style.display = 'none'
        cv.style.cursor   = 'default'
      }
    }
    cv.addEventListener('mousemove', onMouseMove)

    // ── Resize ────────────────────────────────────────────────
    function onResize() {
      const w = el.clientWidth
      const h = el.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ────────────────────────────────────────
    let clock = 0
    let rafId = null

    function animate() {
      rafId = requestAnimationFrame(animate)

      // Pause when tab is hidden
      if (document.visibilityState === 'hidden') return

      clock += 0.016

      // Resume auto-rotation 2 s after last interaction
      if (!autoRotate && resumeAutoMs && Date.now() > resumeAutoMs) {
        autoRotate = true
        velY = 0
        velX = 0
      }

      if (!isDragging) {
        if (autoRotate) {
          globe.rotation.y -= 0.0015   // slow westward drift
        } else {
          // Momentum decay
          globe.rotation.y += velY
          globe.rotation.x  = Math.max(-0.7, Math.min(0.7, globe.rotation.x + velX))
          velY *= 0.90
          velX *= 0.90
        }
      }

      // Cloud layer drifts slightly faster than surface
      if (cloudMesh) cloudMesh.rotation.y += 0.00025

      // Aircraft travel along their curves
      aircraftData.forEach(ac => {
        ac.t = (ac.t + ac.speed) % 1
        const pos  = ac.curve.getPointAt(ac.t)
        const tNext = (ac.t + 0.006) % 1
        const nxt  = ac.curve.getPointAt(tNext)

        ac.mesh.position.copy(pos)

        // Convert next-point from globeGroup local → world space for lookAt
        const nxtWorld = globe.localToWorld(nxt.clone())
        ac.mesh.lookAt(nxtWorld)
      })

      // KGL pulse rings: scale up + fade out, staggered by phase offset
      rings.forEach(ring => {
        const ph    = (clock * 0.75 + ring.userData.phase) % 1
        ring.scale.setScalar(1 + ph * 3.8)
        ring.material.opacity = (1 - ph) * 0.85
      })

      renderer.render(scene, camera)
    }

    animate()

    // ── Cleanup on unmount ────────────────────────────────────
    stateRef.current.cleanup = () => {
      cancelAnimationFrame(rafId)
      cv.removeEventListener('pointerdown',  onPointerDown)
      cv.removeEventListener('pointermove',  onPointerMove)
      cv.removeEventListener('pointerup',    onPointerUp)
      cv.removeEventListener('pointerleave', onPointerUp)
      cv.removeEventListener('wheel',        onWheel)
      cv.removeEventListener('mousemove',    onMouseMove)
      window.removeEventListener('resize',   onResize)
      renderer.dispose()
      if (el.contains(cv)) el.removeChild(cv)
    }
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', height, background: '#1A1A2E' }}
      role="img"
      aria-label="Interactive 3D globe showing RwandAir Cargo route network from Kigali hub"
    >
      {/* Three.js canvas mount point */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Hover tooltip */}
      <div
        ref={tipRef}
        aria-hidden="true"
        style={{
          display:        'none',
          position:       'absolute',
          pointerEvents:  'none',
          background:     'rgba(4,84,155,0.96)',
          color:          '#fff',
          padding:        '5px 11px',
          borderRadius:   '8px',
          fontSize:       '13px',
          fontFamily:     "'Lato', sans-serif",
          whiteSpace:     'nowrap',
          border:         '1px solid rgba(28,163,219,0.45)',
          boxShadow:      '0 4px 20px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          zIndex:         20,
        }}
      />

      {/* Legend — bottom left */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          bottom:     16,
          left:       16,
          display:    'flex',
          flexDirection: 'column',
          gap:        '5px',
          userSelect: 'none',
        }}
      >
        {[
          { color: '#E4DC1F', label: 'Long-haul routes' },
          { color: '#2D7D46', label: 'Africa network'   },
          { color: '#1CA3DB', label: 'International'    },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', fontFamily: "'Lato', sans-serif" }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Corner badge */}
      <div
        aria-hidden="true"
        style={{
          position:   'absolute',
          bottom:     16,
          right:      16,
          color:      'rgba(255,255,255,0.25)',
          fontSize:   '11px',
          fontFamily: "'Lato', sans-serif",
          userSelect: 'none',
        }}
      >
        {FEATURED.length + AFRICA.length + STANDARD.length + 1} destinations · Drag to rotate · Scroll to zoom
      </div>
    </div>
  )
}
