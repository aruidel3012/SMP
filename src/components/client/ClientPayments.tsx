import type { PaymentMethod } from "../../types";

type ClientPaymentsProps = {
  paymentMethods: PaymentMethod[];
  handleSavePayment: () => void;
  handleDeletePayment: (id: string) => void;
  loading: boolean;
  payType: "card" | "transfer" | "bizum";
  setPayType: (v: "card" | "transfer" | "bizum") => void;
  payAlias: string;
  setPayAlias: (v: string) => void;
  payLast4: string;
  setPayLast4: (v: string) => void;
  payHolder: string;
  setPayHolder: (v: string) => void;
  payExpiry: string;
  setPayExpiry: (v: string) => void;
  payCVV: string;
  setPayCVV: (v: string) => void;
  payPhone: string;
  setPayPhone: (v: string) => void;
  payIban: string;
  setPayIban: (v: string) => void;
};

export function ClientPayments({
  paymentMethods,
  handleSavePayment,
  handleDeletePayment,
  loading,
  payType,
  setPayType,
  payAlias,
  setPayAlias,
  payLast4,
  setPayLast4,
  payHolder,
  setPayHolder,
  payExpiry,
  setPayExpiry,
  payCVV,
  setPayCVV,
  payPhone,
  setPayPhone,
  payIban,
  setPayIban,
}: ClientPaymentsProps) {
  return (
    <div className="client-payments-grid">
      <div className="client-card">
        <h3>Anadir metodo de pago</h3>
        <p>
          Guarda tu metodo preferido para gestionar costes adicionales y servicios extra.
        </p>
        <div className="client-form">
          <div className="fgroup">
            <label>Tipo de pago</label>
            <div className="client-pay-type-tabs">
              {(["card", "transfer", "bizum"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`client-pay-type-tab${payType === t ? " active" : ""}`}
                  onClick={() => setPayType(t)}
                >
                  {t === "card" ? "Tarjeta" : t === "transfer" ? "Transferencia" : "Bizum"}
                </button>
              ))}
            </div>
          </div>
          <div className="fgroup">
            <label>Alias / Etiqueta</label>
            <input placeholder="Ej: Tarjeta empresa" value={payAlias} onChange={(e) => setPayAlias(e.target.value)} />
          </div>
          {payType === "card" && (
            <>
              <div className="fgroup">
                <label>Numero de tarjeta</label>
                <input placeholder="1234 5678 9012 3456" maxLength={19} value={payLast4} onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = v.replace(/(\d{4})(?=\d)/g, "$1 ");
                  setPayLast4(formatted);
                }} />
              </div>
              <div className="fgroup">
                <label>Titular</label>
                <input placeholder="Nombre del titular" value={payHolder} onChange={(e) => setPayHolder(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="fgroup">
                  <label>Caducidad</label>
                  <input placeholder="MM/YY" maxLength={5} value={payExpiry} onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                    setPayExpiry(v);
                  }} />
                </div>
                <div className="fgroup">
                  <label>CVV</label>
                  <input placeholder="123" maxLength={4} value={payCVV} onChange={(e) => setPayCVV(e.target.value.replace(/\D/g, "").slice(0, 4))} />
                </div>
              </div>
            </>
          )}
          {payType === "transfer" && (
            <div className="fgroup">
              <label>IBAN (ultimos 4 digitos)</label>
              <input placeholder="ES91...XXXX" value={payIban} onChange={(e) => setPayIban(e.target.value)} />
            </div>
          )}
          {payType === "bizum" && (
            <div className="fgroup">
              <label>Telefono Bizum</label>
              <input placeholder="+34 6XX XXX XXX" value={payPhone} onChange={(e) => setPayPhone(e.target.value)} />
            </div>
          )}
          <button className="client-btn client-btn--primary" onClick={handleSavePayment} disabled={loading}>
            {loading ? <span className="client-spinner" /> : "Guardar metodo"}
          </button>
        </div>
      </div>

      <div className="client-card">
        <h3>Metodos guardados</h3>
        {paymentMethods.length === 0 && (
          <p className="client-empty">No tienes metodos de pago guardados.</p>
        )}
        <div className="client-pay-methods-list">
          {paymentMethods.map((m) => (
            <div key={m._id} className="client-pay-method-card">
              <div className="client-pay-method-card__icon">
                {m.type === "card" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                ) : m.type === "transfer" ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                )}
              </div>
              <div className="client-pay-method-card__info">
                <strong>{m.alias || (m.type === "card" ? "Tarjeta" : m.type === "transfer" ? "Transferencia" : "Bizum")}</strong>
                <span>
                  {m.type === "card" && m.last4 ? `**** ${m.last4}` : ""}
                  {m.type === "bizum" && m.phone ? m.phone : ""}
                  {m.type === "transfer" && m.iban ? m.iban : ""}
                </span>
              </div>
              <button
                className="client-btn client-btn--sm"
                onClick={() => handleDeletePayment(m._id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
        <div className="client-pay-info-box">
          <p>Tus datos de pago se almacenan de forma segura. No guardamos datos completos de tarjeta.</p>
        </div>
      </div>
    </div>
  );
}
