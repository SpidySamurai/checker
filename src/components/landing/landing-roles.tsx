import s from "./landing.module.css";

function FleetOwnerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="7" r="3" />
      <path d="M4 19c0-3 3-5 7-5s7 2 7 5" />
    </svg>
  );
}

function DriverIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13V10l2-5h12l2 5v3M3 13v3h3v-3M16 13v3h3v-3M3 13h16" />
      <circle cx="7" cy="14" r="1.5" />
      <circle cx="15" cy="14" r="1.5" />
    </svg>
  );
}

export function LandingRoles() {
  return (
    <section id="roles" className={s.section}>
      <div className={s.eyebrow}>Para quién</div>
      <h2 className={s.sectionTitle}>Tres roles, una plataforma.</h2>
      <p className={s.sectionSub}>
        Cada quien con la herramienta correcta. Conductores en el celular,
        dueños en el escritorio, admin en su panel.
      </p>

      <div className={s.roles}>
        <div className={s.role}>
          <div className={s.roleIcon}>
            <FleetOwnerIcon />
          </div>
          <div className={s.roleEyebrow}>01 · Dueño de flotilla</div>
          <h3 className={s.roleTitle}>Tu flotilla, en una sola pantalla.</h3>
          <ul className={s.roleList}>
            <li>KPIs en vivo: activos, viajes, ganancias por semana</li>
            <li>Lista de conductores con estado en turno / libre</li>
            <li>Vehículos: placas, modelos, asignaciones</li>
            <li>Reportes filtrables por plataforma y fecha</li>
          </ul>
        </div>

        <div className={s.role}>
          <div className={s.roleIcon}>
            <DriverIcon />
          </div>
          <div className={s.roleEyebrow}>02 · Conductor</div>
          <h3 className={s.roleTitle}>Botón grande. Trabaja, no escribas.</h3>
          <ul className={s.roleList}>
            <li>Check in / check out con un solo tap</li>
            <li>Registra viajes en segundos: monto, km, plataforma</li>
            <li>Ve tu ganancia neta del turno en tiempo real</li>
            <li>Optimizado para uso nocturno y con una mano</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
