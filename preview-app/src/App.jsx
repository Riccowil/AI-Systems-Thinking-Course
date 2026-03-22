import { useState, lazy, Suspense } from 'react'

const weeks = [
  {
    label: 'Week 1',
    tabs: [
      { id: 'w1c1', label: 'W1-C1: Systems Thinking', component: lazy(() => import('./systems-thinking-fundamentals.jsx')) },
      { id: 'w1c2', label: 'W1-C2: AI System Lever', component: lazy(() => import('./ai-system-lever.jsx')) },
      { id: 'w1c3', label: 'W1-C3: SMB Mindset Shift', component: lazy(() => import('./smb-mindset-shift.jsx')) },
    ]
  },
  {
    label: 'Week 2',
    tabs: [
      { id: 'st001', label: 'ST-001: Feedback Loops', component: lazy(() => import('./feedback-loop-builder.jsx')) },
      { id: 'st002', label: 'ST-002: Leverage Points', component: lazy(() => import('./leverage-point-scorer.jsx')) },
      { id: 'st003', label: 'ST-003: Burden Shift', component: lazy(() => import('./burden-shift-simulator.jsx')) },
    ]
  },
  {
    label: 'Week 3',
    tabs: [
      { id: 'st004', label: 'ST-004: Agent Feedback', component: lazy(() => import('./agent-feedback-loop-builder.jsx')) },
      { id: 'st005', label: 'ST-005: Tool Orchestration', component: lazy(() => import('./tool-orchestration-analyzer.jsx')) },
      { id: 'st006', label: 'ST-006: Automation Debt', component: lazy(() => import('./automation-debt-simulator.jsx')) },
    ]
  }
]

const allTabs = weeks.flatMap(w => w.tabs)

export default function App() {
  const [active, setActive] = useState('w1c1')
  const ActiveComponent = allTabs.find(a => a.id === active)?.component

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0f1117', fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #1e2130',
        background: '#161922', flexShrink: 0, overflowX: 'auto', alignItems: 'stretch'
      }}>
        {weeks.map((week, wi) => (
          <div key={week.label} style={{ display: 'flex', alignItems: 'stretch', borderRight: wi < weeks.length - 1 ? '1px solid #2a2d3a' : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '10px', color: '#8b8fa3', padding: '4px 14px 0', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.5px' }}>
                {week.label.toUpperCase()}
              </div>
              <div style={{ display: 'flex' }}>
                {week.tabs.map(a => (
                  <button
                    key={a.id}
                    onClick={() => setActive(a.id)}
                    style={{
                      padding: '8px 14px',
                      background: active === a.id ? '#0f1117' : 'transparent',
                      color: active === a.id ? '#00d4aa' : '#8b8fa3',
                      border: 'none',
                      borderBottom: active === a.id ? '2px solid #00d4aa' : '2px solid transparent',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: active === a.id ? 600 : 400,
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Suspense fallback={<div style={{ color: '#8b8fa3', padding: 40, textAlign: 'center' }}>Loading artifact...</div>}>
          {ActiveComponent && <ActiveComponent />}
        </Suspense>
      </div>
    </div>
  )
}
