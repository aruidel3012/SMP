import type { PaymentMethod } from "../../types";

type ConfirmHireModalProps = {
  confirmHireData: {
    type: 'subscription' | 'service';
    id: string;
    name: string;
    price: number | string;
    period?: string;
  } | null;
  setConfirmHireData: (v: null) => void;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethodId: string;
  setSelectedPaymentMethodId: (v: string) => void;
  authTerms: boolean;
  setAuthTerms: (v: boolean) => void;
  loading: boolean;
  subLoading: string | null;
  handleConfirmHire: () => void;
  error: string;
  notice: string;
};

export function ConfirmHireModal({
  confirmHireData,
  setConfirmHireData,
  paymentMethods,
  selectedPaymentMethodId,
  setSelectedPaymentMethodId,
  authTerms,
  setAuthTerms,
  loading,
  subLoading,
  handleConfirmHire,
  error,
  notice,
}: ConfirmHireModalProps) {
  if (!confirmHireData) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal modal--confirm">
        <button className="modal-close" onClick={() => setConfirmHireData(null)}>✕</button>
        <div className="modal-logo">
          <span className="logo__icon">◈</span>Confirmacion de Pago
        </div>
        <div className="modal-body">
          <div className="confirm-summary-card" style={{
            background: 'rgba(30, 120, 255, 0.08)',
            border: '1px solid rgba(30, 120, 255, 0.25)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <span className="confirm-tag" style={{
              fontSize: '0.72rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              color: 'var(--blue-lt)',
              letterSpacing: '0.06em'
            }}>{confirmHireData.type === 'subscription' ? 'Plan de Suscripcion' : 'Servicio Adicional'}</span>
            <h4 style={{ margin: '0.4rem 0', fontSize: '1.2rem', color: 'var(--t0)', fontWeight: 'bold' }}>{confirmHireData.name}</h4>
            <p className="confirm-price" style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              color: '#4da3ff',
              margin: 0
            }}>
              {typeof confirmHireData.price === 'number' ? '€' + confirmHireData.price : confirmHireData.price}
              {confirmHireData.period && '/' + confirmHireData.period}
            </p>
          </div>

          <div className="fgroup" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--t1)', marginBottom: '0.3rem', display: 'block' }}>Metodo de pago autorizado</label>
            <select
              value={selectedPaymentMethodId}
              onChange={(e) => setSelectedPaymentMethodId(e.target.value)}
              className="pay-select"
              style={{
                background: 'rgba(5, 7, 9, 0.75)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '0.8rem',
                color: 'var(--t0)',
                width: '100%',
                outline: 'none'
              }}
            >
              {paymentMethods.map((pm) => (
                <option key={pm._id} value={pm._id}>
                  {pm.alias || (pm.type === 'card' ? 'Tarjeta' : pm.type === 'bizum' ? 'Bizum' : 'Transferencia')} (•••• {pm.last4 || pm.phone.slice(-4) || 'IBAN'})
                </option>
              ))}
            </select>
          </div>

          <div className="fgroup checkbox-group" style={{ marginBottom: '1.2rem' }}>
            <label className="checkbox-label" style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: 'var(--t2)',
              lineHeight: 1.5
            }}>
              <input
                type="checkbox"
                checked={authTerms}
                onChange={(e) => setAuthTerms(e.target.checked)}
                style={{ marginTop: '0.2rem' }}
              />
              <span>Confirmo la contratacion de este servicio y autorizo el cargo automatico recurrente en el metodo de pago seleccionado.</span>
            </label>
          </div>

          {error && <div className="modal-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          {notice && <div className="modal-success" style={{ marginBottom: '1rem' }}>{notice}</div>}

          <div className="confirm-actions" style={{
            display: 'flex',
            gap: '0.8rem',
            marginTop: '0.5rem'
          }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setConfirmHireData(null)}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleConfirmHire} disabled={loading || subLoading !== null}>
              {loading || subLoading !== null ? <span className="spinner" /> : "Confirmar y Activar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
