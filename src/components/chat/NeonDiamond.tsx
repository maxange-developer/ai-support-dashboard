'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Torus knot wireframe in neon blue, slow continuous
 * rotation. Used as empty-state visual in Playground
 * and Widget chats.
 *
 * Three.js (already in bundle from login background).
 * Renderer disposed on unmount.
 */
export function NeonDiamond() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // Scene
    const scene = new THREE.Scene()

    // Camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.z = 5

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    const size = 96 // px, container dimensions (matches old NeonDiamond footprint)
    renderer.setSize(size, size)
    renderer.setPixelRatio(window.devicePixelRatio)
    mount.appendChild(renderer.domElement)

    // Torus knot geometry
    // Args: radius, tube, tubularSegments, radialSegments, p, q
    const geometry = new THREE.TorusKnotGeometry(1.0, 0.32, 128, 16, 2, 3)

    // Wireframe via WireframeGeometry for clean line look
    // (no internal triangulation visible)
    const wireframeGeometry = new THREE.WireframeGeometry(geometry)

    const material = new THREE.LineBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.85,
    })

    const wireframe = new THREE.LineSegments(wireframeGeometry, material)
    scene.add(wireframe)

    // Subtle ambient light pass — wireframe doesn't need
    // lighting but a faint scene tint helps perceived
    // depth on darker chunks.
    const ambient = new THREE.AmbientLight(0x2563eb, 0.3)
    scene.add(ambient)

    // Animate
    let frameId: number
    const startTime = performance.now()

    function animate() {
      const elapsed = (performance.now() - startTime) / 1000

      // Continuous, hypnotic, multi-axis rotation
      // Different rates per axis = never repeats exactly
      wireframe.rotation.x = elapsed * 0.35
      wireframe.rotation.y = elapsed * 0.55
      wireframe.rotation.z = elapsed * 0.15

      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }

    if (prefersReducedMotion) {
      // Single static frame at an attractive pose
      wireframe.rotation.x = 0.6
      wireframe.rotation.y = 0.4
      renderer.render(scene, camera)
    } else {
      animate()
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId)
      renderer.dispose()
      geometry.dispose()
      wireframeGeometry.dispose()
      material.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="w-24 h-24 flex items-center justify-center"
      style={{
        filter: 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.5))',
      }}
      aria-hidden="true"
    />
  )
}
