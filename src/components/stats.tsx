import { STATS } from "../data/plans";

export const Stats = () => {
  return (
    <section className="stats">
      <div className="container">
        <div className="stats__grid">
          {STATS.map((s, i) => (
            <div
              className="stat reveal"
              key={s.label}
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <span className="stat__value">{s.value}</span>
              <span className="stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
