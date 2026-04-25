import s from "./landing.module.css";

export function LandingFooter() {
  return (
    <footer className={s.footer}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className={s.logoMark} style={{ width: 24, height: 24, fontSize: 14 }}>✓</span>
        <span>
          <b>Checker</b> · 2026
        </span>
      </div>
      <div className={s.footerLinks}>
        <a href="#">Privacidad</a>
        <a href="#">Términos</a>
        <a href="#">Contacto</a>
        <a href="#">Status</a>
      </div>
      <div className={s.mono} style={{ fontSize: 11 }}>
        Hecho en CDMX · para LATAM
      </div>
    </footer>
  );
}
