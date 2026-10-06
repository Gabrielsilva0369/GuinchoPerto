import { trackCtaClick } from "../lib/analytics";
import { usePhoneContact } from "../lib/PhoneContext";
import "../styles/hero.css";

function Hero() {
  const { WHATSAPP_URL, CALL_URL } = usePhoneContact();

  return (
    <section id="inicio" className="hero">
      <div className="hero__media">
        <img
          className="hero__img"
          src="/assets/hero-guincho-perto.webp"
          alt="Caminhão da Guincho Perto preparado para atendimento 24 horas"
          width={941}
          height={1672}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="hero__gradient-top" aria-hidden="true"></div>
        <div className="hero__glow" aria-hidden="true"></div>
        <div className="hero__gradient-bottom" aria-hidden="true"></div>
      </div>

      <div className="hero__content">
        <h1 className="hero__title">
          <span className="hero__title-guincho">GUINCHO</span>
          <span className="hero__title-24h">24H</span>
        </h1>

        <p className="hero__subtitle">
          Atendimento rápido para carros, motos e utilitários em{" "}
          <span className="accent">Curitiba e região.</span>
        </p>

        <a
          id="cta-whatsapp-hero"
          className="hero__btn hero__btn--whatsapp cta-whatsapp"
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="whatsapp-hero"
          onClick={trackCtaClick}
          aria-label="Chamar a Guincho Perto no WhatsApp"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.9 11.9 0 005.71 1.454h.006c6.585 0 11.946-5.359 11.949-11.893a11.821 11.821 0 00-3.484-8.46" />
          </svg>
          CHAMAR NO WHATSAPP
        </a>

        <a
          id="cta-telefone-hero"
          className="hero__btn hero__btn--call cta-phone"
          href={CALL_URL}
          data-cta="telefone-hero"
          onClick={trackCtaClick}
          aria-label="Ligar agora para a Guincho Perto"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          LIGAR AGORA
        </a>

        <p className="hero__benefits">
          <span>Atendimento 24 horas</span>
          <span className="hero__benefits-dot" aria-hidden="true"></span>
          <span>Chegada rápida</span>
          <span className="hero__benefits-dot" aria-hidden="true"></span>
          <span>Suporte seguro</span>
        </p>
      </div>
    </section>
  );
}

export default Hero;
