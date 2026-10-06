import "../styles/service-cards.css";

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function SpeedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3.5 17a9 9 0 0 1 17 0" />
      <path d="M12 17l4.2-4.2" />
      <circle cx="12" cy="17" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

const CARDS = [
  {
    icon: <ClockIcon />,
    title: "24 HORAS",
    desc: "Atendimento 24 horas por dia, todos os dias.",
  },
  {
    icon: <SpeedIcon />,
    title: "CHEGADA RÁPIDA",
    desc: "Agilidade no atendimento e rapidez na chegada.",
  },
  {
    icon: <ShieldIcon />,
    title: "ATENDIMENTO SEGURO",
    desc: "Equipe experiente e transporte com total segurança.",
  },
];

function ServiceCards() {
  return (
    <section id="beneficios" className="service-cards">
      <div className="service-cards__grid">
        {CARDS.map((card) => (
          <article className="card" data-reveal key={card.title}>
            <span className="card__icon">{card.icon}</span>
            <h2 className="card__title">{card.title}</h2>
            <p className="card__desc">{card.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default ServiceCards;
