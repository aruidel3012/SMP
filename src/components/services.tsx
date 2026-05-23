import { SERVICES } from "../data/plans";

export const Services = () => {
  return (
    <section className="services" id="servicios">
      <div className="container">
        <div className="section-head">
          <span className="tag reveal">Servicios</span>
          <h2 className="section-title reveal">
            Todo lo que necesita
            <br />
            tu empresa
          </h2>
          <p className="section-sub reveal">
            Un equipo técnico especializado cubriendo cada capa de tu
            infraestructura digital.
          </p>
        </div>
        <div className="cards-grid">
          {SERVICES.map((service, index) => (
            <article
              className="card reveal"
              key={service.title}
              style={{ transitionDelay: `${index * 75}ms` }}
            >
              <div className="card__top">
                <span className="card__icon">{service.icon}</span>
                <span className="card__arrow">→</span>
              </div>
              <h3 className="card__title">{service.title}</h3>
              <p className="card__desc">{service.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
