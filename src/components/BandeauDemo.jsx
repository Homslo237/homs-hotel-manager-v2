// Bandeau fixe en haut de l'écran pendant la démo : données fictives, changement de rôle, sortie.
const ROLES = [
  { id: 'directeur',      label: '👔 Patron' },
  { id: 'receptionniste', label: '🛎️ Réception' },
  { id: 'caissier',       label: '💰 Caisse' },
]

export default function BandeauDemo({ role, onChangerRole, onQuitter }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 450,
      background: '#1B3A6B', borderBottom: '2px solid #C9A84C', padding: '6px 10px 8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#F5D98A', fontSize: '11px', fontWeight: '800' }}>🎬 DÉMO · données fictives</span>
        <button onClick={onQuitter} style={{
          background: '#C9A84C', color: '#1B3A6B', border: 'none', borderRadius: '8px',
          padding: '4px 10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
        }}>Créer mon compte ›</button>
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
        {ROLES.map(r => (
          <button key={r.id} onClick={() => role !== r.id && onChangerRole(r.id)} style={{
            flex: 1, padding: '6px 2px', borderRadius: '8px', fontSize: '11px', fontWeight: '700', cursor: 'pointer',
            border: `1.5px solid ${role === r.id ? '#C9A84C' : 'rgba(255,255,255,0.25)'}`,
            background: role === r.id ? 'rgba(201,168,76,0.25)' : 'transparent',
            color: role === r.id ? '#F5D98A' : 'rgba(255,255,255,0.75)',
          }}>{r.label}</button>
        ))}
      </div>
    </div>
  )
}
