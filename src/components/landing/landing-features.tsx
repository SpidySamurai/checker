import s from "./landing.module.css";

const chartBars = [30, 55, 40, 70, 60, 85, 75, 95];

export function LandingFeatures() {
  return (
    <section id="features" className={s.section}>
      <div className={s.eyebrow}>Funciones</div>
      <h2 className={s.sectionTitle}>
        Todo lo que necesitas.{" "}
        <span className={s.hand}>Nada de relleno.</span>
      </h2>
      <p className={s.sectionSub}>
        Funciones diseñadas alrededor de cómo realmente trabaja una flotilla en
        LATAM.
      </p>

      <div className={s.bento}>
        {/* Check-in — tall */}
        <div className={`${s.bentoCard} ${s.bcTall} ${s.softBg}`}>
          <div>
            <h4 className={s.bentoCardTitle}>Check-in instantáneo</h4>
            <p className={s.bentoCardDesc}>
              Botón circular gigante. Para usar mientras manejas, de noche, con
              guantes. Sin fricción.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
            <div className={s.bentoCheckBtn}>+</div>
          </div>
        </div>

        {/* Earnings chart — wide */}
        <div className={`${s.bentoCard} ${s.bcWide}`}>
          <div>
            <h4 className={s.bentoCardTitle}>Reportes de ganancias</h4>
            <p className={s.bentoCardDesc}>
              Por día, conductor o plataforma. Bruto vs. neto. Comisiones
              automáticas.
            </p>
          </div>
          <div className={s.miniChart}>
            {chartBars.map((h, i) => (
              <div
                key={i}
                className={i >= 5 ? s.miniBarAccent : s.miniBar}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        {/* Multi-platform */}
        <div className={`${s.bentoCard} ${s.bcMd}`}>
          <h4 className={s.bentoCardTitle}>Multi-plataforma</h4>
          <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <span className={`${s.plogo} ${s.plogoUber}`} style={{ width: 26, height: 26, fontSize: 12 }}>U</span>
            <span className={`${s.plogo} ${s.plogoDidi}`} style={{ width: 26, height: 26, fontSize: 12 }}>D</span>
            <span className={`${s.plogo} ${s.plogoCabify}`} style={{ width: 26, height: 26, fontSize: 12 }}>C</span>
            <span className={`${s.plogo} ${s.plogoIndrive}`} style={{ width: 26, height: 26, fontSize: 12 }}>i</span>
          </div>
          <p className={s.bentoCardDesc}>
            Uber, Didi, Cabify, InDrive — todo en un dashboard.
          </p>
        </div>

        {/* Active count */}
        <div className={`${s.bentoCard} ${s.bcMd}`}>
          <div>
            <div className={s.bentoNum}>12</div>
            <p className={s.bentoCardDesc}>
              conductores activos en tu flotilla esta semana
            </p>
          </div>
        </div>

        {/* Vehicles */}
        <div className={`${s.bentoCard} ${s.bcMd}`}>
          <h4 className={s.bentoCardTitle}>Vehículos asignados</h4>
          <div className={s.avatars} style={{ marginTop: "auto" }}>
            <div className={s.avatar}>A</div>
            <div className={s.avatar}>B</div>
            <div className={`${s.avatar} ${s.avatarAcc}`}>C</div>
            <div className={s.avatar}>+9</div>
          </div>
          <p className={s.bentoCardDesc}>Placa, modelo, año, color, conductor.</p>
        </div>

        {/* Onboarding checklist */}
        <div className={`${s.bentoCard} ${s.bcMd}`}>
          <h4 className={s.bentoCardTitle}>Onboarding guiado</h4>
          <div className={s.miniCheck}>
            <div className={s.miniCheckRow}>
              <span className={`${s.miniCheckBox} ${s.miniCheckBoxDone}`}>✓</span>
              <span className={s.done}>Crear cuenta</span>
            </div>
            <div className={s.miniCheckRow}>
              <span className={`${s.miniCheckBox} ${s.miniCheckBoxDone}`}>✓</span>
              <span className={s.done}>Agregar conductor</span>
            </div>
            <div className={s.miniCheckRow}>
              <span className={s.miniCheckBox} />
              <span>Agregar vehículo</span>
            </div>
          </div>
        </div>

        {/* Dark mode */}
        <div className={`${s.bentoCard} ${s.bcMd} ${s.darkBg}`}>
          <div>
            <h4 className={s.bentoCardTitle} style={{ color: "var(--accent-orange)" }}>
              Dark mode
            </h4>
            <p className={s.bentoCardDesc} style={{ color: "rgba(255,255,255,0.6)" }}>
              Para conductores que trabajan de noche. Menos cansancio visual.
            </p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--accent-orange)" }} />
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--paper)", opacity: 0.4 }} />
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--paper)", opacity: 0.4 }} />
          </div>
        </div>
      </div>
    </section>
  );
}
