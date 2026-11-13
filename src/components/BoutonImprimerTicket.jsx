import { useState, useEffect, useRef } from 'react'
import { imprimanteDisponible, chargerImprimante, imprimerTicket, texteStatut, texteErreur } from '../imprimanteThermique'

// Bouton « Imprimer sur l'imprimante de poche ».
// Utilisation : <BoutonImprimerTicket construire={() => construireTicketHotel({ ... })} />
// « construire » est appelée au moment du clic : le ticket reflète toujours les données du moment.
// Le bouton n'apparaît pas si le navigateur n'a pas le Bluetooth web (iPhone, Firefox…).
export default function BoutonImprimerTicket({ construire, libelle = '🖨️ Imprimante de poche', style }) {
  const [dispo] = useState(imprimanteDisponible)
  const [occupe, setOccupe] = useState(false)
  const [message, setMessage] = useState('')
  const vivant = useRef(true)

  useEffect(() => {
    vivant.current = true
    if (dispo) chargerImprimante().catch(() => {}) // préchargée : le clic part sans attente
    return () => { vivant.current = false }
  }, [dispo])

  if (!dispo) return null

  const dire = (m) => { if (vivant.current) setMessage(m) }

  const imprimer = async () => {
    if (occupe) return
    setOccupe(true)
    dire('')
    try {
      const spec = construire()
      await imprimerTicket(spec, (phase, info) => dire(texteStatut(phase, info)))
      dire(texteStatut('done'))
    } catch (e) {
      dire(texteErreur(e))
    }
    if (vivant.current) setOccupe(false)
  }

  return (
    <div style={{ width: '100%', ...style }}>
      <button type="button" onClick={imprimer} disabled={occupe} style={{
        width: '100%', minHeight: '48px', padding: '12px 16px', borderRadius: '12px',
        border: '1.5px solid #C9A84C', background: '#1B3A6B', color: 'white',
        fontWeight: '800', fontSize: '14px', cursor: occupe ? 'not-allowed' : 'pointer', opacity: occupe ? 0.6 : 1,
      }}>
        {libelle}
      </button>
      {message && (
        <div style={{ marginTop: '8px', fontSize: '12px', textAlign: 'center', color: '#C9A84C', lineHeight: '1.4' }}>
          {message}
        </div>
      )}
    </div>
  )
}
