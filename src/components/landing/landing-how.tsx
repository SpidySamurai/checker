import s from "./landing.module.css";

const steps = [
  {
    num: "01",
    title: "Crea tu cuenta",
    desc: "Registro de fleet owner en menos de 2 min. 14 días gratis.",
  },
  {
    num: "02",
    title: "Invita conductores",
    desc: "Por email. Reciben link para enrolarse.",
  },
  {
    num: "03",
    title: "Asigna vehículos",
    desc: "Placa, marca, modelo, color. Asigna de un tap.",
  },
  {
    num: "04",
    title: "Mide y optimiza",
    desc: "Ve KPIs en vivo. Detecta quién rinde más y cuándo.",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how" className={s.section}>
      <div className={s.eyebrow}>Cómo funciona</div>
      <h2 className={s.sectionTitle}>
        De cero a primer turno{" "}
        <span className={s.hand}>en 10 minutos.</span>
      </h2>
      <p className={s.sectionSub}>
        Sin contratos, sin tarjeta de crédito, sin instaladores. Te registras y
        empiezas.
      </p>

      <div className={s.steps}>
        {steps.map((step, i) => (
          <div
            key={step.num}
            className={`${s.step} ${i === steps.length - 1 ? s.stepLast : ""}`}
          >
            <div className={s.stepNum}>{step.num}</div>
            {i < steps.length - 1 && <div className={s.stepArrow} />}
            <h4 className={s.stepTitle}>{step.title}</h4>
            <p className={s.stepDesc}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
