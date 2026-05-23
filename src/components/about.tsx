export const About = () => {
  return (
    <section className="about" id="nosotros">
      <div className="container about__grid">
        <div className="about__visual reveal">
          <div className="orbit orbit-1">
            <div className="orb-dot" />
          </div>
          <div className="orbit orbit-2">
            <div className="orb-dot" />
          </div>
          <div className="orbit orbit-3">
            <div className="orb-dot" />
          </div>
          <div className="about__core">SMP</div>
        </div>
        <div className="about__text">
          <span className="tag reveal">Nosotros</span>
          <h2 className="section-title reveal">
            Ingeniería real,
            <br />
            resultados medibles
          </h2>
          <p className="reveal">
            Somos un equipo de ingenieros con más de 12 años resolviendo los
            retos tecnológicos de empresas medianas y grandes en España y
            Europa.
          </p>
          <p className="reveal">
            No vendemos promesas. Entregamos sistemas que funcionan, equipos que
            responden y métricas que lo demuestran.
          </p>
        </div>
      </div>
    </section>
  );
};
