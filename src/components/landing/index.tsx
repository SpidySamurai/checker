import s from "./landing.module.css";
import { LandingNav } from "./landing-nav";
import { LandingHero } from "./landing-hero";
import { LandingStrip } from "./landing-strip";
import { LandingRoles } from "./landing-roles";
import { LandingFeatures } from "./landing-features";
import { LandingHowItWorks } from "./landing-how";
import { LandingPricing } from "./landing-pricing";
import { LandingCTA } from "./landing-cta";
import { LandingFooter } from "./landing-footer";

export function LandingPage() {
  return (
    <div className={s.gridBg}>
      <LandingNav />
      <LandingHero />
      <LandingStrip />
      <LandingRoles />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
