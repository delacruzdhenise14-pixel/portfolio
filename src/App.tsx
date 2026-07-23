import { useEffect, useState, useMemo } from 'react'

// ── Hooks ──────────────────────────────────────────────────────────────────────

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    let frame = 0
    const h = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => setY(window.scrollY)) }
    window.addEventListener('scroll', h, { passive: true })
    return () => { window.removeEventListener('scroll', h); cancelAnimationFrame(frame) }
  }, [])
  return y
}

function useMouse() {
  const [m, setM] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setM({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [])
  return m
}

// ── Star data (deterministic golden-ratio spread) ──────────────────────────────

const PALETTE = ['#55E7FF', '#FF69B4', '#C8B6FF', '#FFFFFF', '#FFD700', '#B8F5C8']
const ALL_STARS = Array.from({ length: 280 }, (_, i) => ({
  id: i,
  x: (i * 137.508) % 100,
  y: (i * 97.315) % 100,
  size: (i % 5) * 0.3 + 0.6,
  color: PALETTE[i % PALETTE.length],
  dur: ((i * 1.618) % 3) + 2.2,
  del: (i * 0.618) % 6,
  layer: (i % 3) + 1,
}))

// ── Shared components ──────────────────────────────────────────────────────────

function Glass({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-3xl ${className}`} style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)', ...style }}>
      {children}
    </div>
  )
}

function NeonBtn({ children, color = '#FF69B4', href, target }: { children: React.ReactNode; color?: string; href?: string; target?: string }) {
  const [hov, setHov] = useState(false)
  const style: React.CSSProperties = {
    fontFamily: "'Orbitron', sans-serif",
    color: hov ? '#0D011C' : color,
    background: hov ? color : 'transparent',
    border: `1.5px solid ${color}`,
    boxShadow: hov ? `0 0 24px ${color}, 0 0 50px ${color}50` : `0 0 8px ${color}40`,
    padding: '12px 26px', borderRadius: '12px', cursor: 'pointer',
    fontWeight: 700, fontSize: '12px', letterSpacing: '0.09em',
    transition: 'all 0.22s ease', textDecoration: 'none', display: 'inline-block',
  }
  return href
    ? <a href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} style={style} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</a>
    : <button style={style} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>{children}</button>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span style={{ fontFamily: "'VT323', monospace", color: '#55E7FF', fontSize: '14px', letterSpacing: '0.2em', textShadow: '0 0 8px #55E7FF' }}>
        {children}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #55E7FF40, transparent)' }} />
    </div>
  )
}

function Stars({ scrollY, layer }: { scrollY: number; layer: 1 | 2 | 3 }) {
  const rate = layer === 1 ? 0.06 : layer === 2 ? 0.18 : 0.34
  const stars = useMemo(() => ALL_STARS.filter(s => s.layer === layer), [layer])
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ transform: `translateY(${scrollY * rate}px)`, willChange: 'transform' }}>
      {stars.map(s => (
        <div key={s.id} className="absolute rounded-full" style={{
          left: `${s.x}%`, top: `${s.y}%`,
          width: `${s.size * (layer === 3 ? 1.8 : 1)}px`, height: `${s.size * (layer === 3 ? 1.8 : 1)}px`,
          background: s.color, boxShadow: `0 0 ${s.size * 3}px ${s.color}`,
          animation: `twinkle ${s.dur}s ${s.del}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}

function Saturn({ scrollY, mouse }: { scrollY: number; mouse: { x: number; y: number } }) {
  return (
    <div style={{
      position: 'absolute', right: '5%', top: '10%',
      transform: `translate(${mouse.x * 14}px, ${mouse.y * 10 + scrollY * 0.12}px)`,
      animation: 'float-slow 12s ease-in-out infinite',
      willChange: 'transform',
    }}>
      <svg width="140" height="90" viewBox="0 0 140 90">
        <defs>
          <radialGradient id="satGrad" cx="38%" cy="35%">
            <stop offset="0%" stopColor="#e0d5ff" />
            <stop offset="100%" stopColor="#6b3fa0" />
          </radialGradient>
        </defs>
        <ellipse cx="70" cy="52" rx="66" ry="16" fill="none" stroke="rgba(200,182,255,0.35)" strokeWidth="3" />
        <circle cx="70" cy="45" r="34" fill="url(#satGrad)" style={{ filter: 'drop-shadow(0 0 20px rgba(200,182,255,0.6))' }} />
        <path d="M 4 52 A 66 16 0 0 0 136 52" fill="none" stroke="rgba(200,182,255,0.75)" strokeWidth="3" />
      </svg>
    </div>
  )
}

function Moon({ scrollY, mouse }: { scrollY: number; mouse: { x: number; y: number } }) {
  return (
    <div style={{
      position: 'absolute', left: '8%', top: '18%',
      transform: `translate(${mouse.x * -10}px, ${mouse.y * -8 + scrollY * 0.22}px)`,
      animation: 'float 8s 1s ease-in-out infinite',
    }}>
      <svg width="60" height="60" viewBox="0 0 60 60">
        <defs>
          <radialGradient id="moonGrad" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#fffde7" />
            <stop offset="100%" stopColor="#f9c74f" />
          </radialGradient>
        </defs>
        <circle cx="30" cy="30" r="28" fill="url(#moonGrad)" style={{ filter: 'drop-shadow(0 0 16px rgba(249,199,79,0.7))' }} />
        <circle cx="20" cy="20" r="28" fill="#0D011C" />
      </svg>
    </div>
  )
}

// ── Hero Section ───────────────────────────────────────────────────────────────

function HeroSection({ scrollY, mouse }: { scrollY: number; mouse: { x: number; y: number } }) {
  return (
    <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'linear-gradient(180deg, #0D011C 0%, #18032D 60%, #101530 100%)', display: 'flex', alignItems: 'center' }}>
      <Stars scrollY={scrollY} layer={1} />
      <Stars scrollY={scrollY} layer={2} />
      <Stars scrollY={scrollY} layer={3} />

      {/* Shooting stars */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', left: `${15 + i * 30}%`, top: `${8 + i * 15}%`,
          width: '2px', height: '2px', background: '#FFFFFF',
          boxShadow: '0 0 6px #fff, 20px 0 8px rgba(255,255,255,0.3)',
          animation: `shoot ${6 + i * 4}s ${i * 5 + 2}s linear infinite`,
          transform: 'rotate(30deg)',
        }} />
      ))}

      <Saturn scrollY={scrollY} mouse={mouse} />
      <Moon scrollY={scrollY} mouse={mouse} />

      {/* Floating pixel hearts */}
      {['💖', '✨', '🌸', '⭐', '💫'].map((em, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${[75, 88, 12, 65, 30][i]}%`,
          top: `${[65, 30, 75, 25, 45][i]}%`,
          fontSize: `${[18, 14, 16, 20, 12][i]}px`,
          animation: `drift ${[6, 8, 7, 9, 5][i]}s ${i * 1.2}s ease-in-out infinite`,
          opacity: 0.7,
        }}>{em}</div>
      ))}

      {/* Portrait glow frame */}
      <div style={{
        position: 'absolute', right: '12%', top: '50%', transform: `translateY(-50%) translate(${mouse.x * 8}px, ${mouse.y * 6}px)`,
        transition: 'transform 0.15s ease-out',
      }}>
        <div style={{ width: 260, height: 320, borderRadius: '32px', background: 'linear-gradient(135deg, rgba(255,105,180,0.2), rgba(85,231,255,0.2))', border: '2px solid rgba(255,105,180,0.5)', boxShadow: '0 0 40px rgba(255,105,180,0.4), 0 0 80px rgba(85,231,255,0.2)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, animation: 'glow-pulse 4s ease-in-out infinite', }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #FF69B4, #C8B6FF)', opacity: 0.6, boxShadow: '0 0 30px rgba(255,105,180,0.6)' }} />
          <p style={{ fontFamily: "'VT323', monospace", color: '#55E7FF', fontSize: 13, letterSpacing: '0.15em', textShadow: '0 0 8px #55E7FF' }}>[ PORTFOLIO OWNER ]</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {['#FF69B4', '#55E7FF', '#C8B6FF'].map((c, i) => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}`, animation: `twinkle ${2 + i * 0.5}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      </div>

      {/* Main text */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 8% 0 8%', maxWidth: 680 }}>
        <SectionLabel>✦ PORTFOLIO · 2024</SectionLabel>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FF', fontSize: 16, letterSpacing: '0.1em', marginBottom: 8 }}>
            Hello, Universe 🌌
          </p>
        </div>

        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(28px, 4.5vw, 62px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, color: '#F8F8FF', textShadow: '0 0 40px rgba(255,105,180,0.3)' }}>
          Hi, I'm{' '}
          <span style={{ color: '#FF69B4', textShadow: '0 0 20px #FF69B4, 0 0 40px rgba(255,105,180,0.5)', animation: 'neon-flicker 8s ease-in-out infinite' }}>
            Dhenise Ices
          </span>
          <br />
          <span style={{ color: '#55E7FF', textShadow: '0 0 20px #55E7FF, 0 0 40px rgba(85,231,255,0.4)' }}>
            Dela Cruz
          </span>
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 36 }}>
          {['UI/UX Designer', 'Software Engineering Student', 'Creative Problem Solver'].map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: ['#FF69B4', '#55E7FF', '#C8B6FF'][i], fontSize: 10, textShadow: `0 0 8px ${['#FF69B4', '#55E7FF', '#C8B6FF'][i]}` }}>◆</span>
              <span style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FF', fontSize: 16, fontWeight: 600 }}>{t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 48 }}>
          <NeonBtn color="#FF69B4">✦ Explore My Journey</NeonBtn>
          <NeonBtn color="#55E7FF">⬇ Download Resume</NeonBtn>
          <NeonBtn color="#C8B6FF">✉ Contact Me</NeonBtn>
        </div>

        {/* Scroll indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
          <span style={{ fontFamily: "'VT323', monospace", color: '#C8B6FF80', fontSize: 12, letterSpacing: '0.2em' }}>SCROLL TO EXPLORE</span>
          <div style={{ width: 1.5, height: 40, background: 'linear-gradient(to bottom, #C8B6FF, transparent)', animation: 'scroll-bounce 2s ease-in-out infinite' }} />
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, transparent, #0D011C)', pointerEvents: 'none' }} />
    </section>
  )
}

// ── About Section ──────────────────────────────────────────────────────────────

function AboutSection({ scrollY }: { scrollY: number }) {
  const stickyNotes = [
    { text: '☕ Coffee-powered developer', bg: '#fef08a', rot: '-2deg', left: '-3%', top: '5%' },
    { text: '🎮 Gamer at heart', bg: '#bbf7d0', rot: '3deg', right: '-2%', top: '20%' },
    { text: '🌸 Loves cozy aesthetics', bg: '#fce7f3', rot: '-1deg', right: '-4%', bottom: '25%' },
    { text: '🌙 Night owl coder', bg: '#ddd6fe', rot: '2.5deg', left: '-2%', bottom: '15%' },
  ]
  return (
    <section style={{ position: 'relative', padding: '100px 5%', background: 'linear-gradient(180deg, #0D011C 0%, #18032D 100%)', overflow: 'hidden' }}>
      {/* Decorative floating items */}
      {['⌨️', '🎮', '☕', '🌿', '🌙'].map((em, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${[3, 91, 88, 5, 94][i]}%`,
          top: `${[10, 8, 55, 60, 35][i]}%`,
          fontSize: 28, opacity: 0.5,
          animation: `float ${[7, 9, 6, 8, 10][i]}s ${i * 1.5}s ease-in-out infinite`,
          transform: `translateY(${scrollY * 0.04}px)`,
        }}>{em}</div>
      ))}

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>◈ ABOUT.ME</SectionLabel>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, marginBottom: 48, color: '#F8F8FF' }}>
          My Creative{' '}
          <span style={{ color: '#FF69B4', textShadow: '0 0 15px #FF69B4' }}>Workspace</span>
        </h2>

        {/* macOS-style glass window */}
        <div style={{ position: 'relative' }}>
          {stickyNotes.map((n, i) => (
            <div key={i} style={{
              position: 'absolute', ...(n.left ? { left: n.left } : { right: n.right }), ...(n.top ? { top: n.top } : { bottom: n.bottom }),
              background: n.bg, padding: '12px 16px', borderRadius: '4px', transform: `rotate(${n.rot})`,
              boxShadow: '3px 3px 12px rgba(0,0,0,0.3)', fontFamily: "'Nunito', sans-serif",
              fontSize: 12, color: '#1a1a2e', fontWeight: 700, maxWidth: 140, zIndex: 5,
              lineHeight: 1.4,
            }}>{n.text}</div>
          ))}

          <Glass style={{ overflow: 'hidden' }}>
            {/* Title bar */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {['#ff5f56', '#ffbd2e', '#27c93f'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              <span style={{ fontFamily: "'VT323', monospace", color: '#C8B6FF80', fontSize: 14, marginLeft: 12, letterSpacing: '0.1em' }}>about-me.exe — Creative Workspace</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
              {/* Left: Profile */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ width: 110, height: 110, borderRadius: '50%', background: 'linear-gradient(135deg, #FF69B4, #C8B6FF)', boxShadow: '0 0 30px rgba(255,105,180,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                  👩‍💻
                </div>
                <div>
                  <h3 style={{ fontFamily: "'Orbitron', sans-serif", color: '#F8F8FF', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Dhenise Ices Dela Cruz</h3>
                  <p style={{ color: '#C8B6FF', fontSize: 13, fontFamily: "'VT323', monospace", letterSpacing: '0.1em', textShadow: '0 0 8px #C8B6FF' }}>[ UI/UX DESIGNER · SOFTWARE ENG ]</p>
                </div>
                <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFcc', fontSize: 15, lineHeight: 1.7 }}>
                  I'm a passionate Software Engineering student who fell in love with the intersection of code and design.
                  I believe great software should be not just functional, but beautiful — and that every pixel has a purpose.
                </p>
                <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFcc', fontSize: 15, lineHeight: 1.7 }}>
                  From late-night coding sessions fueled by lofi beats and cold coffee ☕, to crafting interfaces that
                  make users genuinely smile — this is my journey through the digital galaxy. 🌌
                </p>
              </div>

              {/* Right: Fun facts + notebook */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px', fontFamily: "'Nunito', sans-serif' " }}>
                  <p style={{ fontFamily: "'VT323', monospace", color: '#55E7FF', fontSize: 13, letterSpacing: '0.15em', marginBottom: 16, textShadow: '0 0 8px #55E7FF' }}>// FUN_FACTS.JSON</p>
                  {[
                    ['🌸', 'Aesthetic perfectionist — every corner matters'],
                    ['🎮', 'Playing games teaches me about great UX'],
                    ['🌌', 'Stargazing fan who designs with cosmic ambition'],
                    ['🎵', 'Codes to lofi hip-hop & city pop'],
                    ['✏️', 'Sketches wireframes in physical notebooks first'],
                    ['🐱', 'Cat person — for the aesthetic and the vibe'],
                  ].map(([em, text], i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10, fontSize: 14, color: '#C8B6FFcc', lineHeight: 1.5 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{em}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Paper tape decoration */}
                <div style={{ height: 6, background: 'repeating-linear-gradient(90deg, rgba(200,182,255,0.3) 0px, rgba(200,182,255,0.3) 40px, rgba(255,105,180,0.3) 40px, rgba(255,105,180,0.3) 80px)', borderRadius: 3 }} />

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Figma', 'React', 'TypeScript', 'Three.js', 'WebGL', 'Tailwind'].map((t, i) => (
                    <span key={i} style={{ fontFamily: "'VT323', monospace", fontSize: 14, padding: '4px 12px', borderRadius: '20px', border: `1px solid ${PALETTE[i % PALETTE.length]}60`, color: PALETTE[i % PALETTE.length], textShadow: `0 0 6px ${PALETTE[i % PALETTE.length]}`, letterSpacing: '0.05em' }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </Glass>
        </div>
      </div>
    </section>
  )
}

// ── Design Philosophy Section ──────────────────────────────────────────────────

function PhilosophySection({ scrollY }: { scrollY: number }) {
  return (
    <section style={{ position: 'relative', padding: '120px 8%', background: 'linear-gradient(180deg, #18032D 0%, #0D011C 100%)', overflow: 'hidden', textAlign: 'center' }}>
      {/* Floating stars */}
      {Array.from({ length: 20 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${(i * 137.5) % 100}%`, top: `${(i * 73.2) % 100}%`,
          fontSize: `${10 + (i % 4) * 4}px`, opacity: 0.4,
          animation: `twinkle ${3 + (i % 3)}s ${i * 0.4}s ease-in-out infinite`,
          transform: `translateY(${scrollY * 0.05}px)`,
        }}>✦</div>
      ))}

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto' }}>
        <SectionLabel>◈ DESIGN.PHILOSOPHY</SectionLabel>

        <div style={{ fontSize: 'clamp(80px, 12vw, 140px)', lineHeight: 0.8, color: '#FF69B4', opacity: 0.15, fontFamily: "'Orbitron', sans-serif", fontWeight: 900, userSelect: 'none', marginBottom: -20 }}>"</div>

        <blockquote style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(18px, 2.8vw, 32px)', fontWeight: 700, lineHeight: 1.5, color: '#F8F8FF', marginBottom: 24, textShadow: '0 0 30px rgba(200,182,255,0.3)' }}>
          Design is not just what it{' '}
          <span style={{ color: '#FF69B4', textShadow: '0 0 15px #FF69B4' }}>looks like</span>
          {' '}and{' '}
          <span style={{ color: '#55E7FF', textShadow: '0 0 15px #55E7FF' }}>feels like</span>
          .
          <br />Design is how it{' '}
          <span style={{ color: '#C8B6FF', textShadow: '0 0 15px #C8B6FF' }}>works</span>
          .
        </blockquote>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 40 }}>
          {['Purposeful', 'Empathetic', 'Magical', 'Human-Centered'].map((w, i) => (
            <span key={i} style={{ fontFamily: "'VT323', monospace", fontSize: 16, color: PALETTE[i], textShadow: `0 0 10px ${PALETTE[i]}`, letterSpacing: '0.1em' }}>{w}</span>
          ))}
        </div>

        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFaa', fontSize: 17, lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
          I design not just to solve problems, but to create moments of delight. Every interaction is an opportunity to make
          someone's day a little more magical — one pixel, one interaction at a time. ✨
        </p>
      </div>
    </section>
  )
}

// ── Skills Section ─────────────────────────────────────────────────────────────

const skillData = [
  { cat: 'UI Design', color: '#FF69B4', icon: '🎨', items: [
    { icon: '✏️', name: 'Figma', level: 90, desc: 'Advanced systems & prototyping' },
    { icon: '🌈', name: 'Typography', level: 85, desc: 'Hierarchy, pairing, legibility' },
    { icon: '📐', name: 'Layout', level: 87, desc: 'Grid, spacing, composition' },
    { icon: '🖼️', name: 'Color Theory', level: 88, desc: 'Palettes, contrast, emotion' },
  ]},
  { cat: 'UX Design', color: '#C8B6FF', icon: '🔍', items: [
    { icon: '👥', name: 'User Research', level: 80, desc: 'Interviews & synthesis' },
    { icon: '📝', name: 'Wireframing', level: 85, desc: 'Lo-fi to hi-fi flows' },
    { icon: '🧪', name: 'Usability Testing', level: 78, desc: 'Moderated sessions' },
    { icon: '🗂️', name: 'Info Architecture', level: 82, desc: 'Sitemaps & card sorting' },
  ]},
  { cat: 'Frontend', color: '#55E7FF', icon: '⚛️', items: [
    { icon: '⚛️', name: 'React', level: 85, desc: 'Hooks, context, patterns' },
    { icon: '🌐', name: 'HTML/CSS', level: 92, desc: 'Semantic, modern CSS' },
    { icon: '⚡', name: 'JavaScript', level: 83, desc: 'ES6+, async, DOM' },
    { icon: '🔷', name: 'TypeScript', level: 76, desc: 'Types, interfaces, generics' },
  ]},
  { cat: 'Graphics', color: '#FFD700', icon: '🔺', items: [
    { icon: '🎮', name: 'WebGL', level: 72, desc: 'Shaders & rendering pipeline' },
    { icon: '🔺', name: 'Three.js', level: 70, desc: '3D scenes & lighting' },
    { icon: '💡', name: 'GLSL', level: 65, desc: 'Vertex & fragment shaders' },
    { icon: '🖼️', name: 'Canvas API', level: 80, desc: '2D drawing & animations' },
  ]},
  { cat: 'Tools', color: '#B8F5C8', icon: '🛠️', items: [
    { icon: '💻', name: 'VS Code', level: 95, desc: 'Extensions & debugging' },
    { icon: '🔧', name: 'Git / GitHub', level: 85, desc: 'Branching & collaboration' },
    { icon: '📦', name: 'Adobe Suite', level: 78, desc: 'Illustrator · Photoshop' },
    { icon: '📋', name: 'Notion', level: 90, desc: 'Planning & documentation' },
  ]},
]

function SkillBadge({ icon, name, level, desc, color }: { icon: string; name: string; level: number; desc: string; color: string }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? `${color}15` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? color : `${color}30`}`,
        borderRadius: 16, padding: '16px', cursor: 'default',
        boxShadow: hov ? `0 0 20px ${color}40, inset 0 0 20px ${color}05` : 'none',
        transition: 'all 0.25s ease', transform: hov ? 'translateY(-4px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <p style={{ fontFamily: "'Orbitron', sans-serif", color: '#F8F8FF', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>{name}</p>
          <p style={{ fontFamily: "'VT323', monospace", color: `${color}cc`, fontSize: 12, letterSpacing: '0.1em' }}>LVL {Math.round(level / 10)} / 10</p>
        </div>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginBottom: 8, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${level}%`, background: `linear-gradient(to right, ${color}80, ${color})`, borderRadius: 2, boxShadow: `0 0 8px ${color}` }} />
      </div>
      <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FF80', fontSize: 12, lineHeight: 1.5 }}>{desc}</p>
    </div>
  )
}

function SkillsSection() {
  const [active, setActive] = useState(0)
  const cat = skillData[active]
  return (
    <section style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #0D011C 0%, #101530 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Grid bg */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(85,231,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(85,231,255,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <SectionLabel>◈ SKILL.TREE</SectionLabel>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, marginBottom: 12, color: '#F8F8FF' }}>
          Collectible{' '}
          <span style={{ color: '#FFD700', textShadow: '0 0 15px #FFD700' }}>Skill Badges</span>
          {' '}⚔️
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFaa', marginBottom: 40, fontSize: 15 }}>Each skill unlocked through real projects, late nights, and a lot of curiosity.</p>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36 }}>
          {skillData.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                fontFamily: "'Orbitron', sans-serif", fontSize: 11, letterSpacing: '0.08em', padding: '8px 18px', borderRadius: 10,
                background: active === i ? cat.color : 'transparent',
                border: `1.5px solid ${cat.color}`,
                color: active === i ? '#0D011C' : cat.color,
                boxShadow: active === i ? `0 0 16px ${cat.color}` : 'none',
                cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 700,
              }}
            >
              {cat.icon} {cat.cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cat.items.map((s, i) => (
            <SkillBadge key={i} {...s} color={cat.color} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Projects Section ───────────────────────────────────────────────────────────

const projectData = [
  { name: 'AklanKnown', emoji: '🌴', tagline: 'Interactive Tropical Paradise', desc: 'Tourism platform showcasing Aklan province with interactive maps, cultural highlights, and immersive travel guides designed to celebrate local heritage.', role: 'UI/UX Designer & Frontend Developer', tools: ['Figma', 'React', 'Leaflet.js', 'TailwindCSS'], features: ['Interactive map', 'Cultural content', 'Passport stamps', 'Travel stickers'], gradient: 'linear-gradient(135deg, #023e8a 0%, #0077b6 50%, #48cae4 100%)', accent: '#48cae4' },
  { name: 'RecycLENS', emoji: '♻️', tagline: 'Eco Intelligence', desc: 'AI-powered recycling assistant using computer vision to identify materials and guide users toward sustainable, planet-friendly disposal habits.', role: 'UI/UX Designer', tools: ['Figma', 'TensorFlow.js', 'React Native', 'Firebase'], features: ['AI scanner', 'Material ID', 'Eco score', 'Community stats'], gradient: 'linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #52b788 100%)', accent: '#52b788' },
  { name: 'Klassly', emoji: '🎓', tagline: 'Digital Classroom', desc: 'Human-centered LMS that transforms remote learning into an engaging, collaborative experience with real-time sessions and intuitive progress tracking.', role: 'Lead UI/UX Designer', tools: ['Figma', 'React', 'Supabase', 'TypeScript'], features: ['Live sessions', 'Assignment tracker', 'Analytics', 'Peer collab'], gradient: 'linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #7986cb 100%)', accent: '#7986cb' },
  { name: 'Farm Dashboard', emoji: '🌾', tagline: 'Smart Agriculture', desc: 'Real-time agricultural monitoring dashboard integrating IoT sensors, weather API, predictive yield analytics, and drone fleet management.', role: 'UI Designer & Frontend Developer', tools: ['React', 'Recharts', 'Node.js', 'MQTT'], features: ['Sensor data', 'Weather API', 'Drone control', 'Yield prediction'], gradient: 'linear-gradient(135deg, #5d4037 0%, #8d6e63 40%, #66bb6a 100%)', accent: '#81c784' },
  { name: 'Behavioral Biometrics', emoji: '🔐', tagline: 'Cyber Security Lab', desc: 'Continuous authentication system using typing dynamics and mouse behavioral patterns as seamless, invisible security factors — no passwords needed.', role: 'Researcher & Frontend Developer', tools: ['Python', 'React', 'TensorFlow', 'Flask'], features: ['Keystroke dynamics', 'Mouse analytics', 'Real-time scoring', 'Anomaly detection'], gradient: 'linear-gradient(135deg, #1a0a2e 0%, #ad1457 60%, #f44336 100%)', accent: '#ef5350' },
]

function ProjectCard({ proj, idx }: { proj: typeof projectData[0]; idx: number }) {
  const [hov, setHov] = useState(false)
  const reversed = idx % 2 === 1
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ marginBottom: 60 }}>
      <Glass style={{ overflow: 'hidden', transform: hov ? 'translateY(-4px)' : 'none', transition: 'transform 0.3s ease', boxShadow: hov ? `0 16px 60px ${proj.accent}30` : '0 8px 40px rgba(0,0,0,0.5)' }}>
        <div className={`flex flex-col ${reversed ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
          {/* Visual panel */}
          <div style={{ flex: '0 0 44%', background: proj.gradient, minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ fontSize: 80, filter: `drop-shadow(0 0 30px ${proj.accent})`, animation: 'float-slow 8s ease-in-out infinite' }}>{proj.emoji}</div>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
            <div style={{ position: 'absolute', top: 16, left: 16, fontFamily: "'VT323', monospace", fontSize: 12, color: `${proj.accent}`, letterSpacing: '0.15em', background: `${proj.accent}20`, padding: '4px 10px', borderRadius: 4, border: `1px solid ${proj.accent}40` }}>
              {proj.tagline.toUpperCase()}
            </div>
          </div>

          {/* Text panel */}
          <div style={{ flex: 1, padding: '36px' }}>
            <h3 style={{ fontFamily: "'Orbitron', sans-serif", color: '#F8F8FF', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              {proj.emoji} {proj.name}
            </h3>
            <p style={{ color: proj.accent, fontFamily: "'VT323', monospace", fontSize: 13, letterSpacing: '0.1em', marginBottom: 16, textShadow: `0 0 8px ${proj.accent}` }}>{proj.role.toUpperCase()}</p>
            <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFcc', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>{proj.desc}</p>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontFamily: "'VT323', monospace", color: '#55E7FF80', fontSize: 12, letterSpacing: '0.1em', marginBottom: 8 }}>KEY FEATURES</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {proj.features.map((f, i) => (
                  <span key={i} style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, padding: '3px 10px', borderRadius: 20, background: `${proj.accent}15`, border: `1px solid ${proj.accent}40`, color: proj.accent }}>{f}</span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontFamily: "'VT323', monospace", color: '#55E7FF80', fontSize: 12, letterSpacing: '0.1em', marginBottom: 8 }}>TOOLS USED</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {proj.tools.map((t, i) => (
                  <span key={i} style={{ fontFamily: "'VT323', monospace", fontSize: 13, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#C8B6FF', letterSpacing: '0.05em' }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <NeonBtn color={proj.accent}>📖 Case Study</NeonBtn>
              <NeonBtn color="#C8B6FF">🐱 GitHub</NeonBtn>
              <NeonBtn color="#55E7FF">🚀 Live Demo</NeonBtn>
            </div>
          </div>
        </div>
      </Glass>
    </div>
  )
}

function ProjectsSection() {
  return (
    <section style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #101530 0%, #18032D 100%)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>◈ FEATURED.PROJECTS</SectionLabel>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, marginBottom: 12, color: '#F8F8FF' }}>
          My{' '}
          <span style={{ color: '#55E7FF', textShadow: '0 0 15px #55E7FF' }}>Digital Chapters</span>
          {' '}🚀
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFaa', marginBottom: 56, fontSize: 15 }}>Each project is a universe — with its own story, challenges, and discoveries.</p>
        {projectData.map((proj, idx) => <ProjectCard key={proj.name} proj={proj} idx={idx} />)}
      </div>
    </section>
  )
}

// ── Graphics Programming Showcase ─────────────────────────────────────────────

const graphicsActivities = [
  {
    num: '01', title: 'CSS Positions', accent: '#4FACFE', accent2: '#FF69B4',
    bgGrad: 'linear-gradient(135deg, #0a1628 0%, #0f2545 50%, #1a3a6e 100%)',
    pattern: 'grid' as const,
    demo: 'activities/act1/index.html',
    emoji: '⚽',
    decor: ['📐', '📍', '🔲'],
    desc: 'Explored all five CSS positioning modes through interactive demonstrations. Built a visual showcase of static, relative, absolute, fixed, and sticky elements using soccer-ball markers to map layout boundaries and stacking contexts.',
    tech: ['HTML5', 'CSS3'],
    skills: ['Document Flow', 'Stacking Context', 'Z-index', 'Overflow', 'Sticky'],
    features: ['5 positioning modes', 'Visual markers', 'Interactive demo', 'Responsive'],
    role: ['Frontend Development', 'UI Design'],
  },
  {
    num: '02', title: 'Five Celestial Wanderers', accent: '#C8B6FF', accent2: '#FF69B4',
    bgGrad: 'linear-gradient(135deg, #06000f 0%, #120825 50%, #1e1040 100%)',
    pattern: 'orbit' as const,
    demo: 'activities/act2/index.html',
    emoji: '🪐',
    decor: ['🌙', '⭐', '✨'],
    desc: 'Animated solar system built purely with CSS — five celestial bodies orbiting at different speeds and radii. Each planet uses keyframe animations with custom timing functions to simulate authentic orbital mechanics.',
    tech: ['HTML5', 'CSS3', 'CSS Animations', 'Keyframes'],
    skills: ['CSS Animations', 'Timing Functions', 'Transform Origin', 'Orbital Math'],
    features: ['5 animated orbits', 'Glow effects', 'Speed variation', 'Smooth easing'],
    role: ['Frontend Development', 'Creative Coding'],
  },
  {
    num: '03', title: 'WebGL Shapes', accent: '#55E7FF', accent2: '#00ff88',
    bgGrad: 'linear-gradient(135deg, #001418 0%, #002535 50%, #003d52 100%)',
    pattern: 'wireframe' as const,
    demo: 'activities/act3/index.html',
    emoji: '🔺',
    decor: ['💠', '⬡', '🔷'],
    desc: 'First real journey into the WebGL rendering pipeline — triangles, quads, and circles rendered from scratch using vertex buffers, index buffers, and hand-written GLSL vertex and fragment shaders.',
    tech: ['WebGL', 'GLSL', 'JavaScript', 'Canvas API'],
    skills: ['WebGL API', 'Vertex Buffers', 'Fragment Shaders', 'GLSL', 'Render Pipeline'],
    features: ['Custom shaders', 'Multiple shapes', 'Color gradients', 'Buffer objects'],
    role: ['Graphics Programming', 'Shader Development'],
  },
  {
    num: '04', title: '3D Shapes', accent: '#b06cff', accent2: '#C8B6FF',
    bgGrad: 'linear-gradient(135deg, #08001a 0%, #120030 50%, #1c0048 100%)',
    pattern: 'lowpoly' as const,
    demo: 'activities/act4/index.html',
    emoji: '🎲',
    decor: ['💎', '🔮', '🌀'],
    desc: 'Extended the WebGL foundation into true 3D — cubes, pyramids, and spheres with perspective projection matrices, model-view transforms, and a Phong lighting model for realistic directional shading.',
    tech: ['WebGL', 'GLSL', 'Linear Algebra', 'JavaScript'],
    skills: ['3D Transforms', 'Perspective Projection', 'Phong Lighting', 'Matrix Math', 'Normals'],
    features: ['Perspective camera', 'Phong lighting', 'Multiple objects', 'Rotation controls'],
    role: ['Graphics Programming', 'Mathematics'],
  },
  {
    num: '05', title: 'Extruded Polygon', accent: '#bf5fff', accent2: '#FF69B4',
    bgGrad: 'linear-gradient(135deg, #0e0020 0%, #1e0040 50%, #2e0060 100%)',
    pattern: 'mesh' as const,
    demo: 'activities/act5/index.html',
    emoji: '⬡',
    decor: ['🔷', '✦', '💜'],
    desc: 'Procedurally generated arbitrary 2D polygons and extruded them into 3D solid meshes in real time. Implemented automatic surface normals, flat shading, and mouse-driven interactive rotation for depth visualization.',
    tech: ['WebGL', 'Three.js', 'GLSL', 'JavaScript'],
    skills: ['Procedural Geometry', 'Extrusion', 'Normal Calculation', 'Interactive Controls'],
    features: ['Procedural mesh', 'Live rotation', 'Surface normals', 'Flat shading'],
    role: ['Graphics Programming', 'Procedural Design'],
  },
  {
    num: '06', title: 'Roblox Textures', accent: '#70c8ff', accent2: '#ffffff',
    bgGrad: 'linear-gradient(135deg, #001520 0%, #002535 50%, #003a50 100%)',
    pattern: 'pixel' as const,
    demo: 'activities/act6/index.html',
    emoji: '🟦',
    decor: ['🎮', '👾', '🕹️'],
    desc: "Reverse-engineered Roblox's iconic voxel texturing system using raw WebGL. Implemented tiled UV mapping, multi-material surface assignment, and GLSL texture sampler uniforms to recreate the distinctive blocky aesthetic.",
    tech: ['WebGL', 'GLSL', 'UV Mapping', 'JavaScript', 'Textures'],
    skills: ['UV Coordinates', 'Texture Samplers', 'Atlas Tiling', 'Multi-material', 'Voxels'],
    features: ['UV mapping', 'Texture atlases', 'Multi-material', 'Voxel style'],
    role: ['Graphics Programming', 'Texture Design'],
  },
  {
    num: '07', title: 'ALL NIGHTER 🌙', accent: '#FF69B4', accent2: '#FFD700',
    bgGrad: 'linear-gradient(135deg, #08000e 0%, #18002a 40%, #0d001e 100%)',
    pattern: 'cyber' as const,
    demo: 'activities/act7/index.html',
    emoji: '🌙',
    decor: ['⚡', '🔥', '💫'],
    desc: 'The capstone marathon session — an all-nighter to build a complete 3D galaxy experience: a particle system of 10,000 stars, real-time bloom post-processing, and a cinematic fly-through camera. Everything learned, synthesized.',
    tech: ['Three.js', 'GLSL', 'Post-processing', 'JavaScript', 'WebGL'],
    skills: ['Particle Systems', 'Post-processing', 'Bloom FX', 'Camera Animation', 'Full Pipeline'],
    features: ['10K galaxy particles', 'Bloom post-FX', 'Fly-through camera', 'Full pipeline'],
    role: ['Graphics Programming', 'Creative Direction', 'Full Stack'],
  },
]

type PatternType = 'grid' | 'orbit' | 'wireframe' | 'lowpoly' | 'mesh' | 'pixel' | 'cyber'

function BrowserMockup({ accent, accent2, bgGrad, pattern, emoji, demo, title }: { accent: string; accent2: string; bgGrad: string; pattern: PatternType; emoji: string; demo?: string; title?: string }) {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${accent}30`, boxShadow: `0 0 40px ${accent}20` }}>
      {/* Browser chrome */}
      <div style={{ background: 'rgba(20,20,35,0.95)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: `1px solid ${accent}20` }}>
        {['#ff5f56', '#ffbd2e', '#27c93f'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />)}
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '4px 12px', marginLeft: 6 }}>
          <span style={{ fontFamily: "'VT323', monospace", color: `${accent}80`, fontSize: 12, letterSpacing: '0.05em' }}>localhost:3000 / {demo ? demo : `activity-${pattern}`}</span>
        </div>
      </div>
      {/* Viewport */}
      <div style={{ background: bgGrad, height: 240, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {demo ? (
          <iframe
            src={demo}
            title={title ? `${title} — live demo` : 'Activity live demo'}
            loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', background: '#000' }}
          />
        ) : (
          <>
            <PatternVisual pattern={pattern} accent={accent} accent2={accent2} />
            <div style={{ position: 'absolute', fontSize: 56, opacity: 0.15, filter: `drop-shadow(0 0 20px ${accent})` }}>{emoji}</div>
          </>
        )}
      </div>
    </div>
  )
}

function PatternVisual({ pattern, accent, accent2 }: { pattern: PatternType; accent: string; accent2: string }) {
  if (pattern === 'grid') return (
    <svg width="100%" height="100%" viewBox="0 0 320 200" style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 8 }, (_, i) => <line key={`v${i}`} x1={i * 46} y1="0" x2={i * 46} y2="200" stroke={`${accent}20`} strokeWidth="1" />)}
      {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 40} x2="320" y2={i * 40} stroke={`${accent}20`} strokeWidth="1" />)}
      <rect x="60" y="30" width="80" height="50" fill="none" stroke={accent} strokeWidth="1.5" rx="4" strokeDasharray="4 2" />
      <rect x="180" y="80" width="90" height="60" fill={`${accent}10`} stroke={accent2} strokeWidth="1.5" rx="4" />
      <rect x="40" y="130" width="100" height="40" fill="none" stroke={`${accent}60`} strokeWidth="1" rx="4" strokeDasharray="2 3" />
      <circle cx="100" cy="55" r="6" fill={accent2} style={{ filter: `drop-shadow(0 0 6px ${accent2})` }} />
      <circle cx="225" cy="110" r="6" fill={accent} style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
    </svg>
  )
  if (pattern === 'orbit') return (
    <svg width="100%" height="100%" viewBox="0 0 320 200" style={{ position: 'absolute', inset: 0 }}>
      {[60, 85, 115].map((r, i) => <ellipse key={i} cx="160" cy="100" rx={r} ry={r * 0.35} fill="none" stroke={`${accent}${30 + i * 10}`} strokeWidth="1" />)}
      <circle cx="160" cy="100" r="14" fill="url(#sunGrad)" />
      <defs>
        <radialGradient id="sunGrad" cx="40%" cy="40%"><stop offset="0%" stopColor="#fffde7" /><stop offset="100%" stopColor="#f9c74f" /></radialGradient>
      </defs>
      {[[160 + 60, 100], [160 - 42, 100 - 30], [160 + 25, 100 + 40]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={4 + i} fill={[accent, accent2, '#55E7FF'][i]} style={{ filter: `drop-shadow(0 0 5px ${[accent, accent2, '#55E7FF'][i]})` }} />
      ))}
    </svg>
  )
  if (pattern === 'wireframe') return (
    <svg width="100%" height="100%" viewBox="0 0 320 200" style={{ position: 'absolute', inset: 0 }}>
      <polygon points="160,30 260,170 60,170" fill={`${accent}08`} stroke={accent} strokeWidth="1.5" />
      <polygon points="160,30 260,170 60,170" fill="none" stroke={accent2} strokeWidth="0.5" strokeDasharray="4 3" opacity="0.5" />
      {[[160, 30], [260, 170], [60, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="5" fill={accent} style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />)}
      <line x1="160" y1="30" x2="160" y2="170" stroke={`${accent}40`} strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  )
  if (pattern === 'lowpoly') return (
    <svg width="100%" height="100%" viewBox="0 0 320 200" style={{ position: 'absolute', inset: 0 }}>
      {[['M100,40 L180,20 L220,80 Z', 0.12], ['M180,20 L260,60 L220,80 Z', 0.18], ['M100,40 L220,80 L140,130 Z', 0.08], ['M220,80 L260,60 L270,150 Z', 0.15], ['M140,130 L220,80 L200,170 Z', 0.1]].map(([d, op], i) => (
        <path key={i} d={d as string} fill={`${accent}${Math.round((op as number) * 255).toString(16).padStart(2, '0')}`} stroke={accent} strokeWidth="1" />
      ))}
      {[[160, 75]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="6" fill={accent2} style={{ filter: `drop-shadow(0 0 10px ${accent})` }} />)}
    </svg>
  )
  if (pattern === 'mesh') return (
    <svg width="100%" height="100%" viewBox="0 0 320 200" style={{ position: 'absolute', inset: 0 }}>
      {[[120, 50], [200, 40], [240, 100], [200, 160], [120, 160], [80, 100]].map(([x, y], i, arr) => (
        <line key={i} x1={x} y1={y} x2={arr[(i + 1) % arr.length][0]} y2={arr[(i + 1) % arr.length][1]} stroke={`${accent}50`} strokeWidth="1.2" />
      ))}
      {[[120, 50], [200, 40], [240, 100], [200, 160], [120, 160], [80, 100]].map(([x, y], i) => (
        <line key={`d${i}`} x1={x} y1={y} x2="160" y2="100" stroke={`${accent}25`} strokeWidth="0.8" />
      ))}
      {[[120, 50], [200, 40], [240, 100], [200, 160], [120, 160], [80, 100]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={accent} style={{ filter: `drop-shadow(0 0 5px ${accent})` }} />
      ))}
      <circle cx="160" cy="100" r="7" fill={accent2} style={{ filter: `drop-shadow(0 0 10px ${accent2})` }} />
    </svg>
  )
  if (pattern === 'pixel') return (
    <svg width="100%" height="100%" viewBox="0 0 320 200" style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 6 }, (_, row) => Array.from({ length: 8 }, (_, col) => {
        const active = [[2,1],[3,1],[4,1],[1,2],[5,2],[2,3],[3,3],[4,3],[1,4],[5,4],[2,5],[3,5],[4,5]].some(([r, c]) => r === row && c === col)
        return active ? <rect key={`${row}-${col}`} x={80 + col * 22} y={40 + row * 22} width="18" height="18" fill={`${accent}${active ? 'cc' : '20'}`} rx="2" style={{ filter: active ? `drop-shadow(0 0 4px ${accent})` : 'none' }} /> : null
      }))}
    </svg>
  )
  // cyber
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 200" style={{ position: 'absolute', inset: 0 }}>
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1="0" y1={30 + i * 36} x2="320" y2={30 + i * 36} stroke={`${accent}15`} strokeWidth="1" />)}
      <rect x="80" y="60" width="160" height="80" fill={`${accent}08`} stroke={accent} strokeWidth="1.5" rx="4" />
      <rect x="80" y="60" width="160" height="20" fill={`${accent}20`} rx="4" />
      {['> INIT RENDER ENGINE', '> LOAD SHADERS...', '> COMPILE PARTICLES  ✓'].map((t, i) => (
        <text key={i} x="92" y={92 + i * 16} style={{ fontFamily: "'VT323', monospace", fontSize: 11, fill: i === 2 ? '#00ff88' : `${accent}cc` }}>{t}</text>
      ))}
      <circle cx="160" cy="170" r="12" fill="none" stroke={accent2} strokeWidth="2" style={{ filter: `drop-shadow(0 0 10px ${accent2})` }} />
      <text x="155" y="175" style={{ fontFamily: "'VT323', monospace", fontSize: 12, fill: accent2 }}>⚡</text>
    </svg>
  )
}

function ActivityCard({ act, idx }: { act: typeof graphicsActivities[0]; idx: number }) {
  const [hov, setHov] = useState(false)
  const reversed = idx % 2 === 1
  return (
    <div
      className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-0`}
      style={{ marginBottom: 72, opacity: 1 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Visual side */}
      <div style={{ flex: '0 0 48%', position: 'relative' }}>
        {/* Floating decor */}
        {act.decor.map((em, i) => (
          <div key={i} style={{
            position: 'absolute', zIndex: 5,
            left: `${[reversed ? 85 : 5, reversed ? 90 : 10, reversed ? 80 : 15][i]}%`,
            top: `${[-8, 75, 90][i]}%`,
            fontSize: 20, opacity: 0.6,
            animation: `drift ${5 + i * 2}s ${i}s ease-in-out infinite`,
          }}>{em}</div>
        ))}
        <div style={{ transform: hov ? 'translateY(-6px)' : 'none', transition: 'transform 0.35s ease' }}>
          <BrowserMockup accent={act.accent} accent2={act.accent2} bgGrad={act.bgGrad} pattern={act.pattern} emoji={act.emoji} demo={act.demo || undefined} title={act.title} />
        </div>
      </div>

      {/* Text side */}
      <div style={{ flex: 1, padding: reversed ? '0 0 0 48px' : '0 0 0 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: reversed ? 0 : 48, paddingRight: reversed ? 48 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 13, color: act.accent, letterSpacing: '0.2em', textShadow: `0 0 10px ${act.accent}` }}>ACTIVITY {act.num}</span>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: `${act.accent}60`, letterSpacing: '0.1em' }}>// COMPLETED ✓</span>
        </div>

        <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(20px, 2.4vw, 30px)', fontWeight: 700, color: '#F8F8FF', marginBottom: 16, textShadow: hov ? `0 0 20px ${act.accent}60` : 'none', transition: 'text-shadow 0.3s' }}>
          {act.title}
        </h3>

        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFcc', fontSize: 15, lineHeight: 1.75, marginBottom: 20 }}>{act.desc}</p>

        {/* Tech badges */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: `${act.accent}80`, letterSpacing: '0.15em', marginBottom: 8 }}>TECHNOLOGIES</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {act.tech.map((t, i) => (
              <span key={i} style={{ fontFamily: "'VT323', monospace", fontSize: 14, padding: '3px 12px', borderRadius: 6, background: `${act.accent}12`, border: `1px solid ${act.accent}40`, color: act.accent, textShadow: `0 0 6px ${act.accent}80`, letterSpacing: '0.05em' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Skills pills */}
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: `${act.accent}80`, letterSpacing: '0.15em', marginBottom: 8 }}>SKILLS LEARNED</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {act.skills.map((s, i) => (
              <span key={i} style={{ fontFamily: "'Nunito', sans-serif", fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#C8B6FF' }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Key features */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: 12, color: `${act.accent}80`, letterSpacing: '0.15em', marginBottom: 8 }}>KEY FEATURES</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {act.features.map((f, i) => (
              <span key={i} style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: '#B8F5C8', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: '#00ff88', fontSize: 10 }}>✓</span> {f}
              </span>
            ))}
          </div>
        </div>

        {/* Role tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24 }}>
          {act.role.map((r, i) => (
            <span key={i} style={{ fontFamily: "'VT323', monospace", fontSize: 12, padding: '2px 10px', borderRadius: 4, background: `${act.accent2}15`, border: `1px solid ${act.accent2}30`, color: act.accent2, letterSpacing: '0.05em' }}>{r}</span>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {act.demo
            ? <NeonBtn color={act.accent} href={act.demo} target="_blank">🚀 Launch Project</NeonBtn>
            : <NeonBtn color={act.accent}>🚀 Launch Project</NeonBtn>}
          <NeonBtn color="#C8B6FF">📖 Case Study</NeonBtn>
          {act.demo
            ? <NeonBtn color="#55E7FF" href={act.demo} target="_blank">💻 Source Code</NeonBtn>
            : <NeonBtn color="#55E7FF">💻 Source Code</NeonBtn>}
        </div>
      </div>
    </div>
  )
}

function GraphicsSection() {
  return (
    <section style={{ padding: '100px 5% 80px', background: 'linear-gradient(180deg, #18032D 0%, #050e18 100%)', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle scanlines */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(85,231,255,0.008) 3px, rgba(85,231,255,0.008) 4px)', pointerEvents: 'none' }} />
      {/* Floating bg decorations */}
      {['🌙', '🪐', '💎', '✨'].map((em, i) => (
        <div key={i} style={{ position: 'absolute', left: `${[2, 95, 96, 3][i]}%`, top: `${[15, 25, 60, 75][i]}%`, fontSize: 28, opacity: 0.15, animation: `float-slow ${8 + i * 3}s ${i * 2}s ease-in-out infinite`, pointerEvents: 'none' }}>{em}</div>
      ))}

      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <SectionLabel>◈ GRAPHICS.LAB</SectionLabel>

        {/* Intro panel */}
        <Glass style={{ padding: '40px 44px', marginBottom: 72, background: 'rgba(85,231,255,0.03)', borderColor: 'rgba(85,231,255,0.12)' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 700, color: '#F8F8FF', marginBottom: 16, lineHeight: 1.2 }}>
                Graphics Programming{' '}
                <span style={{ color: '#55E7FF', textShadow: '0 0 15px #55E7FF' }}>Journey</span>
                {' '}🧪
              </h2>
              <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFaa', fontSize: 15, lineHeight: 1.8, maxWidth: 640 }}>
                From learning basic CSS positioning to building interactive 3D graphics, these seven activities document my growth in graphics programming and modern web development. Each project represents a milestone in developing my technical skills, creativity, and understanding of computer graphics.
              </p>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'center', padding: '20px 32px', borderRadius: 16, background: 'rgba(85,231,255,0.06)', border: '1px solid rgba(85,231,255,0.2)' }}>
              <p style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 36, fontWeight: 900, color: '#55E7FF', textShadow: '0 0 20px #55E7FF', lineHeight: 1 }}>7</p>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: 14, color: '#55E7FF80', letterSpacing: '0.15em', marginTop: 4 }}>ACTIVITIES COMPLETED</p>
            </div>
          </div>
        </Glass>

        {/* Activity cards */}
        {graphicsActivities.map((act, idx) => <ActivityCard key={act.num} act={act} idx={idx} />)}
      </div>
    </section>
  )
}

// ── Timeline / Constellation Section ──────────────────────────────────────────

const NODES = [
  { label: 'HTML', year: '2021', x: 100, y: 60, color: '#ff6b35' },
  { label: 'CSS', year: '2021', x: 310, y: 145, color: '#55E7FF' },
  { label: 'JavaScript', year: '2022', x: 160, y: 250, color: '#FFD700' },
  { label: 'React', year: '2022', x: 370, y: 345, color: '#61dafb' },
  { label: 'UI Design', year: '2023', x: 130, y: 455, color: '#FF69B4' },
  { label: 'Graphics Programming', year: '2023', x: 350, y: 555, color: '#00ff88' },
  { label: 'Frontend Dev', year: '2024', x: 140, y: 655, color: '#C8B6FF' },
  { label: '✨ Future Career', year: '2025+', x: 260, y: 760, color: '#FFD700' },
]

function TimelineSection() {
  const W = 480, H = 820
  const pathD = NODES.map((n, i) => `${i === 0 ? 'M' : 'L'} ${n.x} ${n.y}`).join(' ')
  return (
    <section style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #050e18 0%, #0D011C 100%)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>◈ CONSTELLATION.TIMELINE</SectionLabel>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, marginBottom: 12, color: '#F8F8FF' }}>
          My{' '}
          <span style={{ color: '#C8B6FF', textShadow: '0 0 15px #C8B6FF' }}>Learning</span>
          {' '}Constellation 🌌
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFaa', marginBottom: 56, fontSize: 15 }}>Every star is a skill unlocked. Every line is a journey taken.</p>

        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div style={{ flexShrink: 0, position: 'relative' }}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="constGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF69B4" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#C8B6FF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FFD700" stopOpacity="0.9" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* Connection lines */}
              <path d={pathD} fill="none" stroke="url(#constGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />

              {/* Glow duplicate */}
              <path d={pathD} fill="none" stroke="url(#constGrad)" strokeWidth="3" opacity="0.15" filter="url(#glow)" />

              {/* Star nodes */}
              {NODES.map((n, i) => (
                <g key={i}>
                  <circle cx={n.x} cy={n.y} r="18" fill={`${n.color}15`} stroke={n.color} strokeWidth="1" opacity="0.6" />
                  <circle cx={n.x} cy={n.y} r="6" fill={n.color} filter="url(#glow)" style={{ animation: `twinkle ${2 + i * 0.3}s ${i * 0.5}s ease-in-out infinite` }} />

                  {/* Label */}
                  <text
                    x={n.x + (i % 2 === 0 ? -24 : 24)}
                    y={n.y}
                    textAnchor={i % 2 === 0 ? 'end' : 'start'}
                    style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, fill: n.color, filter: `drop-shadow(0 0 4px ${n.color})` }}
                  >
                    {n.label}
                  </text>
                  <text
                    x={n.x + (i % 2 === 0 ? -24 : 24)}
                    y={n.y + 14}
                    textAnchor={i % 2 === 0 ? 'end' : 'start'}
                    style={{ fontFamily: "'VT323', monospace", fontSize: 12, fill: `${n.color}80` }}
                  >
                    {n.year}
                  </text>

                  {/* Orbiting micro-star */}
                  {i === NODES.length - 1 && (
                    <circle cx={n.x} cy={n.y} r="4" fill="#FFD700" style={{ transformOrigin: `${n.x}px ${n.y}px`, animation: 'orbit 3s linear infinite', filter: 'url(#glow)' }} />
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Milestone list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NODES.map((n, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', padding: '14px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${n.color}20`, transition: 'all 0.2s' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: n.color, boxShadow: `0 0 12px ${n.color}`, flexShrink: 0, marginTop: 4 }} />
                <div>
                  <p style={{ fontFamily: "'Orbitron', sans-serif", color: '#F8F8FF', fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{n.label}</p>
                  <p style={{ fontFamily: "'VT323', monospace", color: n.color, fontSize: 13, letterSpacing: '0.1em', textShadow: `0 0 6px ${n.color}` }}>{n.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── Currently Learning Section ─────────────────────────────────────────────────

const learning = [
  { text: 'Next.js 15', color: '#F8F8FF' },
  { text: 'Framer Motion', color: '#FF69B4' },
  { text: 'Blender', color: '#F5A623' },
  { text: 'GSAP', color: '#B8F5C8' },
  { text: 'Motion Design', color: '#C8B6FF' },
  { text: 'Three.js', color: '#55E7FF' },
  { text: 'UI Animation', color: '#FF69B4' },
  { text: 'Rive', color: '#FFD700' },
  { text: 'Design Systems', color: '#C8B6FF' },
  { text: 'Accessibility', color: '#55E7FF' },
]

function LearningSection() {
  return (
    <section style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #0D011C 0%, #18032D 100%)', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>◈ CURRENTLY.LOADING</SectionLabel>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, marginBottom: 12, color: '#F8F8FF' }}>
          Currently{' '}
          <span style={{ color: '#B8F5C8', textShadow: '0 0 15px #B8F5C8' }}>Learning</span>
          {' '}📚
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFaa', marginBottom: 56, fontSize: 15 }}>Always expanding the skill tree. Always leveling up.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          {learning.map((l, i) => (
            <div key={i} style={{
              fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 700,
              padding: '12px 24px', borderRadius: 30,
              background: `${l.color}10`,
              border: `1.5px solid ${l.color}50`,
              color: l.color,
              boxShadow: `0 0 16px ${l.color}20`,
              letterSpacing: '0.06em',
              animation: `pill-float ${5 + (i % 4)}s ${i * 0.6}s ease-in-out infinite`,
              cursor: 'default',
              textShadow: `0 0 8px ${l.color}60`,
            }}>
              {l.text}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Beyond The Screen Section ──────────────────────────────────────────────────

const stickyData = [
  { title: '🎮 Things I Enjoy', items: ['Gaming (JRPG & puzzle)', 'Lofi playlist curation', 'Stargazing & space docs', 'Cafe-hopping for vibes'], bg: '#fef08a', rot: '-2deg' },
  { title: '🎨 Creative Hobbies', items: ['Digital illustration', 'UI concept sketching', 'Mood board collecting', 'Resin craft & DIY'], bg: '#fce7f3', rot: '2.5deg' },
  { title: '📖 Learning Mindset', items: ['1% better every day', 'Build in public', 'Design → code → repeat', 'Fail forward fast'], bg: '#ddd6fe', rot: '-1.5deg' },
  { title: '🛠️ Favorite Tools', items: ['Figma (always open)', 'VS Code + Vim mode', 'Notion for everything', 'Whimsical for flows'], bg: '#bbf7d0', rot: '1deg' },
  { title: '✨ Personal Motivation', items: ['Design for humans, not screens', 'Art + Code = magic', 'Make the web beautiful', 'Leave it better than you found it'], bg: '#fed7aa', rot: '-2.5deg' },
]

function BeyondSection() {
  return (
    <section style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #18032D 0%, #0D011C 100%)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>◈ BEYOND.THE.SCREEN</SectionLabel>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, marginBottom: 12, color: '#F8F8FF' }}>
          The Human{' '}
          <span style={{ color: '#FF69B4', textShadow: '0 0 15px #FF69B4' }}>Behind the Screen</span>
          {' '}🌸
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFaa', marginBottom: 56, fontSize: 15 }}>A few scrapbook pages from the world outside of Figma and VS Code.</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
          {stickyData.map((s, i) => (
            <div key={i} style={{
              background: s.bg, borderRadius: '4px 14px 14px 14px',
              padding: '20px 22px', minWidth: 190, maxWidth: 220,
              transform: `rotate(${s.rot})`,
              boxShadow: '4px 6px 20px rgba(0,0,0,0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              cursor: 'default',
              position: 'relative',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) scale(1.05)'; (e.currentTarget as HTMLElement).style.zIndex = '10' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = `rotate(${s.rot}) scale(1)`; (e.currentTarget as HTMLElement).style.zIndex = '1' }}
            >
              {/* Washi tape */}
              <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', width: 50, height: 18, background: 'rgba(255,255,255,0.6)', borderRadius: 2, opacity: 0.8 }} />

              <p style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: '#1a1a2e', marginBottom: 12, paddingTop: 8 }}>{s.title}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {s.items.map((item, j) => (
                  <li key={j} style={{ fontFamily: "'Nunito', sans-serif", fontSize: 12, color: '#2d2d4e', lineHeight: 1.6, paddingLeft: 12, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: '#7c3aed' }}>·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Contact Section ────────────────────────────────────────────────────────────

function ContactSection({ scrollY }: { scrollY: number }) {
  const socials = [
    { label: 'Email', icon: '✉️', color: '#FF69B4', href: 'mailto:dhenise@email.com' },
    { label: 'GitHub', icon: '🐱', color: '#C8B6FF', href: '#' },
    { label: 'LinkedIn', icon: '💼', color: '#55E7FF', href: '#' },
    { label: 'Resume', icon: '📄', color: '#FFD700', href: '#' },
  ]
  return (
    <section style={{ padding: '100px 5%', background: 'linear-gradient(180deg, #0D011C 0%, #18032D 60%, #0D011C 100%)', position: 'relative', overflow: 'hidden' }}>
      <Stars scrollY={scrollY} layer={1} />

      {/* Floating paper planes */}
      {['✈️', '💌', '🛸'].map((em, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${[10, 85, 70][i]}%`,
          top: `${[20, 30, 65][i]}%`,
          fontSize: 28, opacity: 0.5,
          animation: `drift ${[8, 6, 10][i]}s ${i * 2}s ease-in-out infinite`,
          transform: `translateY(${scrollY * 0.04}px)`,
        }}>{em}</div>
      ))}

      <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <SectionLabel>◈ CONTACT.ME</SectionLabel>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 700, marginBottom: 16, color: '#F8F8FF' }}>
          Let's{' '}
          <span style={{ color: '#FF69B4', textShadow: '0 0 15px #FF69B4' }}>Build Something</span>
          {' '}Together 🤝
        </h2>
        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FFaa', marginBottom: 48, fontSize: 16, lineHeight: 1.7 }}>
          Whether it's a dream project, a collaboration, an internship, or just a conversation about UI — I'd love to hear from you. My inbox is always open. ✨
        </p>

        <Glass style={{ padding: '48px', marginBottom: 40 }}>
          <p style={{ fontFamily: "'Orbitron', sans-serif", color: '#F8F8FF', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>dhenise.icesdelacruz</p>
          <p style={{ fontFamily: "'VT323', monospace", color: '#55E7FF', fontSize: 16, letterSpacing: '0.15em', textShadow: '0 0 8px #55E7FF', marginBottom: 32 }}>[ SOFTWARE ENGINEER · UI/UX DESIGNER ]</p>

          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14 }}>
            {socials.map((s, i) => (
              <NeonBtn key={i} color={s.color} href={s.href}>
                {s.icon} {s.label}
              </NeonBtn>
            ))}
          </div>
        </Glass>

        <p style={{ fontFamily: "'Nunito', sans-serif", color: '#C8B6FF60', fontSize: 14 }}>
          💌 Average response time: within 24 hours
        </p>
      </div>
    </section>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────────

function FooterSection() {
  return (
    <footer style={{ position: 'relative', padding: '100px 5% 60px', overflow: 'hidden', background: 'linear-gradient(180deg, #0D011C 0%, #18032D 30%, #2d0040 55%, #ff69b420 75%, #fce4ec30 88%, #fff0f520 100%)' }}>
      {/* Horizon glow */}
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: 300, background: 'radial-gradient(ellipse at bottom, rgba(255,105,180,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 24, animation: 'float 6s ease-in-out infinite' }}>🌅</div>

        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, marginBottom: 24, color: '#F8F8FF', lineHeight: 1.1, textShadow: '0 0 40px rgba(255,105,180,0.3)' }}>
          Thank You for{' '}
          <span style={{ color: '#FF69B4', textShadow: '0 0 20px #FF69B4' }}>Visiting</span>
          {' '}my{' '}
          <span style={{ color: '#55E7FF', textShadow: '0 0 20px #55E7FF' }}>Galaxy</span>
          {' '}✨
        </h2>

        <blockquote style={{ fontFamily: "'Nunito', sans-serif", fontStyle: 'italic', color: '#C8B6FFcc', fontSize: 'clamp(14px, 1.8vw, 18px)', lineHeight: 1.8, maxWidth: 620, margin: '0 auto 48px', borderLeft: '2px solid rgba(255,105,180,0.4)', paddingLeft: 20, textAlign: 'left' }}>
          "Turning ideas into meaningful digital experiences — one interface, one interaction, and one project at a time."
        </blockquote>

        {/* Washi tape divider */}
        <div style={{ height: 8, background: 'repeating-linear-gradient(90deg, rgba(255,105,180,0.3) 0, rgba(255,105,180,0.3) 40px, rgba(85,231,255,0.3) 40px, rgba(85,231,255,0.3) 80px, rgba(200,182,255,0.3) 80px, rgba(200,182,255,0.3) 120px)', borderRadius: 4, marginBottom: 40 }} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {['🌸', '🌙', '⭐', '💖', '✨', '🎮', '☕', '🌌'].map((em, i) => (
            <span key={i} style={{ fontSize: 20, animation: `twinkle ${2 + i * 0.3}s ${i * 0.4}s ease-in-out infinite`, opacity: 0.7 }}>{em}</span>
          ))}
        </div>

        <p style={{ fontFamily: "'VT323', monospace", color: '#C8B6FF50', fontSize: 14, letterSpacing: '0.15em' }}>
          © 2024 DHENISE ICES DELA CRUZ · DESIGNED WITH 💖 AND ☕
        </p>
      </div>
    </footer>
  )
}

// ── Navigation ─────────────────────────────────────────────────────────────────

function Nav({ scrollY }: { scrollY: number }) {
  const scrolled = scrollY > 60
  const links = ['About', 'Skills', 'Projects', 'Lab', 'Contact']
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(13,1,28,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '16px 6%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', color: '#FF69B4', textShadow: '0 0 12px #FF69B4' }}>DHENISE✦</span>
      <div style={{ display: 'flex', gap: 28 }}>
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 11, color: '#C8B6FFaa', textDecoration: 'none', letterSpacing: '0.1em', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#FF69B4')}
            onMouseLeave={e => (e.currentTarget.style.color = '#C8B6FFaa')}
          >{l}</a>
        ))}
      </div>
    </nav>
  )
}

// ── App ────────────────────────────────────────────────────────────────────────

export default function App() {
  const scrollY = useScrollY()
  const mouse = useMouse()

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", color: '#F8F8FF', background: '#0D011C' }}>
      <Nav scrollY={scrollY} />
      <HeroSection scrollY={scrollY} mouse={mouse} />
      <AboutSection scrollY={scrollY} />
      <PhilosophySection scrollY={scrollY} />
      <SkillsSection />
      <ProjectsSection />
      <GraphicsSection />
      <TimelineSection />
      <LearningSection />
      <BeyondSection />
      <ContactSection scrollY={scrollY} />
      <FooterSection />
    </div>
  )
}
