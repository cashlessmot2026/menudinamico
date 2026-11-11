import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/** Inclina el contenido en 3D siguiendo el puntero. */
export default function Tilt3D({ children, max = 12, className = '', ...rest }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 200, damping: 18 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 200, damping: 18 })

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div className="scene3d">
      <motion.div
        className={className}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        {...rest}
      >
        {children}
      </motion.div>
    </div>
  )
}
