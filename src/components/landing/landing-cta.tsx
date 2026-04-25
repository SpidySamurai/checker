import s from "./landing.module.css";

export function LandingCTA() {
  return (
    <section id="cta" className={s.section}>
      <div className={s.ctaBand}>
        <h2 className={s.ctaTitle}>
          ¿Listo para <span className={s.ctaAccent}>tomar el control?</span>
        </h2>
        <p className={s.ctaSub}>
          14 días gratis · sin tarjeta · cancelas cuando quieras
        </p>
        <a href="/register" className={`${s.btn} ${s.btnAccent} ${s.btnLg}`}>
          Crear mi flotilla →
        </a>
      </div>
    </section>
  );
}
