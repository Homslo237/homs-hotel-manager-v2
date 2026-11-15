import { useState } from 'react'
import { NOMS_DEMO } from '../demo/donneesDemo'

const TAILLES = [
  { id: 'petit', emoji: '🏠', titre: 'Petit hôtel', detail: '12 chambres · 3 catégories', sous: 'Auberge, résidence, motel' },
  { id: 'grand', emoji: '🏨', titre: 'Grand hôtel', detail: '50 chambres · 4 catégories', sous: 'Hôtel d\'affaires, grand établissement' },
]
const ROLES = [
  { id: 'directeur',      emoji: '👔', label: 'Patron',       detail: 'Voit tout : caisse, statistiques, rapports' },
  { id: 'receptionniste', emoji: '🛎️', label: 'Réception',    detail: 'Séjours, chambres, reçus' },
  { id: 'caissier',       emoji: '💰', label: 'Caissier',     detail: 'Encaissements et caisse du jour' },
]

// Écran de choix avant la démo. Rien n'est créé sur le serveur : les données sont fictives et restent dans le téléphone.
export default function EcranDemo({ onLancer, onRetour }) {
  const [taille, setTaille] = useState('petit')
  const [role, setRole] = useState('directeur')

  const carte = (actif, couleur = '#C9A84C') => ({
    display: 'flex', alignItems: 'center', gap: '14px', width: '100%', padding: '14px 16px', borderRadius: '14px', cursor: 'pointer', textAlign: 'left',
    border: `2px solid ${actif ? couleur : 'rgba(255,255,255,0.14)'}`,
    background: actif ? 'rgba(201,168,76,0.16)' : 'rgba(255,255,255,0.06)',
    color: 'white',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #0A1628 0%, #1B3A6B 50%, #0D2240 100%)', overflowY: 'auto', padding: '24px 20px 40px' }}>
      <div style={{ maxWidth: '420px', margin: '0 auto' }}>
        <button onClick={onRetour} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>‹ Retour</button>

        <div style={{ textAlign: 'center', margin: '18px 0 22px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎬</div>
          <div style={{ color: '#C9A84C', fontWeight: '900', fontSize: '21px' }}>Essayez HOMS-HÔTEL MANAGER</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' }}>
            Sans inscription, avec un hôtel fictif et 6 mois d'historique.<br/>Rien n'est enregistré : tout repart à zéro quand vous quittez.
          </div>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>1️⃣ TAILLE DE L'HÔTEL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {TAILLES.map(t => (
            <button key={t.id} onClick={() => setTaille(t.id)} style={carte(taille === t.id)}>
              <span style={{ fontSize: '28px' }}>{t.emoji}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: '800', fontSize: '15px' }}>{t.titre}</span>
                <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{t.detail} · {t.sous}</span>
              </span>
              {taille === t.id && <span style={{ color: '#C9A84C', fontSize: '18px' }}>✓</span>}
            </button>
          ))}
        </div>

        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '8px' }}>2️⃣ VOUS ÊTES…</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '8px' }}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRole(r.id)} style={carte(role === r.id)}>
              <span style={{ fontSize: '24px' }}>{r.emoji}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontWeight: '800', fontSize: '14px' }}>{r.label} <span style={{ fontWeight: '500', color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>· {NOMS_DEMO[r.id]}</span></span>
                <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{r.detail}</span>
              </span>
              {role === r.id && <span style={{ color: '#C9A84C', fontSize: '18px' }}>✓</span>}
            </button>
          ))}
        </div>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '11px', marginBottom: '20px' }}>Vous pourrez changer de rôle à tout moment depuis le bandeau en haut de l'écran.</div>

        <button onClick={() => onLancer({ taille, role })} style={{
          width: '100%', padding: '16px', borderRadius: '14px', border: 'none', cursor: 'pointer',
          background: 'linear-gradient(90deg, #C9A84C 0%, #F5D98A 40%, #C9A84C 60%, #A07830 100%)',
          color: '#1B3A6B', fontWeight: '900', fontSize: '16px', boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
        }}>
          ▶ Lancer la démo
        </button>
      </div>
    </div>
  )
}
