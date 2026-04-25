import s from "./landing.module.css";

export function LandingHero() {
  return (
    <section className={s.hero}>
      <div>
        <div className={s.heroBadge}>
          <span className={s.heroBadgeDot} />
          Hecho para LATAM · MX · CO · AR
        </div>
        <h1 className={s.heroH1}>
          Maneja tu flotilla,{" "}
          <span className={s.heroAccent}>turno a turno.</span>
        </h1>
        <p className={s.heroLede}>
          Checker te da control total sobre tus conductores y vehículos en Uber,
          Didi, Cabify e InDrive. Check-in, viajes, ganancias — todo en un solo
          lugar.
        </p>
        <div className={s.heroCtas}>
          <a href="#cta" className={`${s.btn} ${s.btnAccent} ${s.btnLg}`}>
            Probar 14 días gratis →
          </a>
          <a href="#how" className={`${s.btn} ${s.btnLg}`}>
            Ver cómo funciona
          </a>
        </div>
        <div className={s.heroTrust}>
          <span>Conecta con</span>
          <div className={s.platformRow}>
            <span className={`${s.plogo} ${s.plogoUber}`}>U</span>
            <span className={`${s.plogo} ${s.plogoDidi}`}>D</span>
            <span className={`${s.plogo} ${s.plogoCabify}`}>C</span>
            <span className={`${s.plogo} ${s.plogoIndrive}`}>i</span>
          </div>
          <span>+ tu flotilla</span>
        </div>
      </div>

      <div className={s.heroArt}>
        <div className={`${s.floatCard} ${s.fc1}`}>
          <div className={s.floatCardLabel}>Activos hoy</div>
          <div className={s.floatCardValue}>7 / 12</div>
        </div>
        <div className={`${s.floatCard} ${s.fc2}`}>
          <div className={s.floatCardLabel}>Neto semana</div>
          <div className={s.floatCardValueAcc}>$28,450</div>
        </div>
        <div className={`${s.floatCard} ${s.fc3}`}>
          <div className={s.floatCardLabel}>Viajes</div>
          <div className={s.floatCardValue}>384</div>
        </div>

        <div className={s.phoneMock}>
          <div className={s.phoneNotch} />
          <div className={s.phoneScreen}>
            <div className={s.phoneLabel}>EN TURNO</div>
            <div className={s.phoneTimer}>4h 12m</div>
            <div className={s.phoneStats}>
              <div className={s.phoneStat}>
                <div className={s.phoneStatValue}>8</div>
                <div className={s.phoneStatLabel}>VIAJES</div>
              </div>
              <div className={s.phoneStat}>
                <div className={s.phoneStatValueAcc}>$820</div>
                <div className={s.phoneStatLabel}>NETO</div>
              </div>
            </div>
            <div className={s.bigCta}>
              <span className={s.bigCtaPlus}>+</span>
              <span className={s.bigCtaLabel}>Viaje</span>
            </div>
          </div>
        </div>

        <div className={s.annot}>
          un solo tap, listo
          <svg
            width="50"
            height="40"
            viewBox="0 0 50 40"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            style={{ display: "block", marginTop: 4 }}
          >
            <path d="M5 5 Q 25 25, 45 32" />
            <path d="M40 26 L 45 32 L 39 36" />
          </svg>
        </div>
      </div>
    </section>
  );
}
