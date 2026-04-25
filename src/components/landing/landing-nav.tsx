import Link from "next/link";
import s from "./landing.module.css";

export function LandingNav() {
  return (
    <nav className={s.nav}>
      <Link href="/" className={s.logo}>
        <span className={s.logoMark}>✓</span>
        <span>Checker</span>
      </Link>
      <div className={s.navLinks}>
        <a href="#roles">Para quién</a>
        <a href="#features">Funciones</a>
        <a href="#how">Cómo funciona</a>
        <a href="#pricing">Precios</a>
      </div>
      <Link href="/login" className={s.btn} style={{ marginLeft: "auto" }}>
        Iniciar sesión
      </Link>
      <a href="#cta" className={`${s.btn} ${s.btnAccent}`}>
        Probar gratis
      </a>
    </nav>
  );
}
