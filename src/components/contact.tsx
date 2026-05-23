export const Contact = () => {
  return (
    <section className="contact" id="contacto">
      <div className="container contact__grid">
        <div className="contact__info">
          <span className="tag reveal">Contacto</span>
          <h2 className="section-title reveal">
            ¿Listo para dejar de
            <br />
            preocuparte?
          </h2>
          <p className="reveal">
            Primera consultoría gratuita, sin compromiso
            <br />y respuesta en menos de 2 horas
          </p>
          <div className="contact__items">
            {[
              { icon: "✉️", label: "Email", value: "hola@smp.es" },
              { icon: "📞", label: "Teléfono", value: "+34 900 123 456" },
              {
                icon: "📍",
                label: "Sede",
                value: "Madrid · Barcelona · Sevilla",
              },
            ].map((item) => (
              <div className="citem reveal" key={item.label}>
                <span className="citem__icon">{item.icon}</span>
                <div>
                  <div className="citem__label">{item.label}</div>
                  <div className="citem__value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <form
          className="contact__form reveal"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="form-row">
            <div className="fgroup">
              <label>Empresa</label>
              <input type="text" placeholder="Tu empresa" />
            </div>
            <div className="fgroup">
              <label>Email</label>
              <input type="email" placeholder="correo@empresa.com" />
            </div>
          </div>
          <div className="fgroup">
            <label>¿En qué podemos ayudarte?</label>
            <textarea rows={5} placeholder="Cuéntanos tu situación..." />
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Enviar mensaje →
          </button>
        </form>
      </div>
    </section>
  );
};
