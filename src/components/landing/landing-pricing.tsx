import s from "./landing.module.css";

const plans = [
  {
    tag: "Starter",
    title: "Para empezar",
    price: "$0",
    per: "/ mes · 14 días",
    features: [
      "Hasta 3 conductores",
      "Hasta 3 vehículos",
      "App móvil para conductor",
      "Reportes básicos",
    ],
    cta: "Empezar gratis",
    ctaHref: "#cta",
    featured: false,
  },
  {
    tag: "Más popular",
    title: "Pro",
    price: "$499",
    per: "MXN / mes",
    features: [
      "Hasta 25 conductores",
      "Vehículos ilimitados",
      "Multi-plataforma (4 apps)",
      "Reportes avanzados + export CSV",
      "Soporte por WhatsApp",
    ],
    cta: "Elegir Pro →",
    ctaHref: "#cta",
    featured: true,
  },
  {
    tag: "Empresa",
    title: "Flotilla grande",
    price: "Custom",
    per: "",
    features: [
      "Conductores ilimitados",
      "API + integraciones",
      "Multi-sucursal",
      "SLA · Soporte dedicado",
      "Onboarding asistido",
    ],
    cta: "Hablar con ventas",
    ctaHref: "#cta",
    featured: false,
  },
];

export function LandingPricing() {
  return (
    <section id="pricing" className={s.section}>
      <div className={s.eyebrow}>Precios</div>
      <h2 className={s.sectionTitle}>Paga por lo que usas.</h2>
      <p className={s.sectionSub}>
        Sin costos ocultos. Cancela cuando quieras. Todos los planes incluyen
        14 días gratis.
      </p>

      <div className={s.pricing}>
        {plans.map((plan) => (
          <div
            key={plan.tag}
            className={`${s.plan} ${plan.featured ? s.planFeatured : ""}`}
          >
            <span className={s.planTag}>{plan.tag}</span>
            <h3 className={s.planTitle}>{plan.title}</h3>
            <div className={s.price}>
              <span className={s.priceAmt}>{plan.price}</span>
              {plan.per && <span className={s.pricePer}>{plan.per}</span>}
            </div>
            <ul className={s.planList}>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <a
              href={plan.ctaHref}
              className={`${s.btn} ${plan.featured ? s.btnAccent : ""}`}
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
