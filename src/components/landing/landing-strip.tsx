import { Fragment } from "react";
import s from "./landing.module.css";

const stats = [
  { value: "+2,400", label: "conductores activos" },
  { value: "184",    label: "flotillas en LATAM" },
  { value: "4",      label: "plataformas integradas" },
  { value: "98%",    label: "turnos registrados" },
];

export function LandingStrip() {
  return (
    <div className={s.strip}>
      {stats.map((stat, i) => (
        <Fragment key={stat.label}>
          {i > 0 && <div className={s.stripDivider} />}
          <div className={s.stripItem}>
            <div className={s.stripValue}>{stat.value}</div>
            <div className={s.stripLabel}>{stat.label}</div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
