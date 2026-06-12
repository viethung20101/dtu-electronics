import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Box,
  Cpu,
  ExternalLink,
  Stethoscope,
  Tablet,
  Trophy,
} from 'lucide-react';
import { useSEO } from '../utils/useSEO';
import { getSeoMeta } from '../seoRoutes';
import { AppHeader } from '../components/layout/AppHeader';
import heroBg from '../assets/about/image_8.png';
import ctaBg from '../assets/about/image_8.png';
import heroLogoStrip from '../assets/about/group_211_1394.svg';
import vectorHero from '../assets/about/vector_196_3106.svg';
import vectorRdLeft from '../assets/about/vector_211_913.svg';
import vectorRdRight from '../assets/about/vector_211_915.svg';
import vectorProductsLeft from '../assets/about/vector_220_6296.svg';
import vectorProductsRight from '../assets/about/vector_220_6297.svg';
import vectorCta from '../assets/about/vector_227_6760.svg';
import whatCvsGroup from '../assets/about/group_211_1396.svg';
import vectorWhatLeft from '../assets/about/vector_220_6296.svg';
import vectorSectionDivider from '../assets/about/vector_2_211_6027.svg';
import rdHubGridLeft from '../assets/about/group_211_5719.svg';
import rdHubGrid from '../assets/about/group_211_5742.svg';
import rdHubLeft from '../assets/about/group_211_5766.svg';
import rdHubRight from '../assets/about/group_211_5816.svg';
import rdHubCenter from '../assets/about/group_211_5867.svg';
import rdHubRuler from '../assets/about/group_211_5946.svg';
import rdHubDataGrid from '../assets/about/group_211_5971.svg';
import productAed from '../assets/about/product-aed.png';
import productDental from '../assets/about/product-dental.png';
import productEcpr from '../assets/about/product-ecpr.png';
import productAnatomy from '../assets/about/product-anatomy.png';
import productSimcar from '../assets/about/product-simcar.png';
import productOrtho from '../assets/about/product-ortho.png';
import emulatorLll1 from '../assets/about/emulator-lll-1-overlay.png';
import emulatorMockupFrame from '../assets/about/emulator-mockup-frame.png';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import './AboutPage.css';

const FigmaVector = ({ src, className }: { src: string; className: string }) => (
  <img src={src} className={`about-figma-vector ${className}`} alt="" aria-hidden />
);

/** Figma 211:1394 — một vòng DTU · CVS · VEPS · SCA (1501×45), lặp 4 lần cho marquee khép kín */
const HERO_LOGO_LOOP_COPIES = 4;

const AboutSectionDivider = () => (
  <div className="about-section-divider" aria-hidden>
    <img src={vectorSectionDivider} className="about-section-divider-line" alt="" />
  </div>
);

/** Figma S6 — lll 1 (220:6334) + Overlay+Border+OverlayBlur (220:6336) */
const AboutEmulatorVisual = () => (
  <div
    className="about-emulator-visual"
    role="img"
    aria-label="ESP32-S3 emulator mockup — STATUS: RUNNING"
  >
    <img
      src={emulatorMockupFrame}
      className="about-emulator-layer about-emulator-layer--frame"
      alt=""
    />
    <img src={emulatorLll1} className="about-emulator-layer about-emulator-layer--board" alt="" />
  </div>
);

/** Figma hub composite — groups 5719, 5742, 5766, 5816, 5867, 5946, 5971 */
const AboutRdHubArt = () => (
  <div className="about-rd-hub-art" aria-hidden>
    <img src={rdHubGridLeft} className="about-rd-hub-layer about-rd-hub-layer--grid-left" alt="" />
    <img src={rdHubGrid} className="about-rd-hub-layer about-rd-hub-layer--grid-right" alt="" />
    <img src={rdHubLeft} className="about-rd-hub-layer about-rd-hub-layer--left" alt="" />
    <img src={rdHubRight} className="about-rd-hub-layer about-rd-hub-layer--right" alt="" />
    <img src={rdHubCenter} className="about-rd-hub-layer about-rd-hub-layer--center" alt="" />
    <img src={rdHubRuler} className="about-rd-hub-layer about-rd-hub-layer--ruler" alt="" />
    <img src={rdHubDataGrid} className="about-rd-hub-layer about-rd-hub-layer--data" alt="" />
  </div>
);

/** S4 product images — Figma groups 38452–38463 (image layers inside each card) */
const PRODUCTS = [
  {
    title: 'AED-302 Trainer',
    desc: 'A simulated automated external defibrillator for training CPR plus defibrillation procedures in emergency treatment.',
    image: productAed,
  },
  {
    title: 'Dental Anatomy',
    desc: 'A virtual dental and maxillofacial training environment with detailed 3D structures for teeth, jaw, nerves and blood vessels.',
    image: productDental,
  },
  {
    title: 'eCPR',
    desc: 'A CPR training device that combines 3D simulation, IoT sensors, quantitative feedback for first-aid and resuscitation practice.',
    image: productEcpr,
  },
  {
    title: 'Human Anatomy',
    desc: 'A 3D anatomical simulation platform for exploring skeletal, muscular and internal organ systems, with VR and AR support for medical education.',
    image: productAnatomy,
  },
  {
    title: 'SIMCar',
    desc: 'An intelligent automotive training simulator for sensors, control systems, autonomous-driving scenarios and learner feedback.',
    image: productSimcar,
  },
  {
    title: '3D printing for orthopedic care',
    desc: 'A clinical-support direction using patient-specific splints and digital workflows for trauma and orthopedic treatment.',
    image: productOrtho,
  },
] as const;

const RD_CARDS = [
  {
    key: 'tl',
    icon: Box,
    title: '3D simulation, VR and AR',
    desc: 'CVS builds immersive visualization systems that make complex bodies, devices and procedures easier to inspect, practice and teach.',
  },
  {
    key: 'tr',
    icon: Stethoscope,
    title: 'Healthcare training technology',
    desc: 'The center works with physicians and domain specialists to turn medical training into measurable, repeatable simulation workflows.',
  },
  {
    key: 'bl',
    icon: Cpu,
    title: 'AI and intelligent sensing',
    desc: 'Several CVS products combine software, sensors, IoT and feedback loops so learners can correct technique while practicing.',
  },
  {
    key: 'br',
    icon: Tablet,
    title: 'Education and industrial engineering',
    desc: 'Beyond healthcare, CVS applies simulation to automotive training, 3D printing, engineering education and digital transformation.',
  },
] as const;

const IMPACT_CARDS = [
  {
    title: 'CVS Human Anatomy',
    desc: 'Has been recognized in Vietnamese and regional Technology awards, including Vietnam Talent, ASEAN ICT and Sao Khue in Vietnam.',
  },
  {
    title: 'The eCPR System',
    desc: 'Was researched and created by CVS staff, patented in 2023, and put into use in first-aid and medical training institutions.',
  },
  {
    title: 'DTU Sources',
    desc: 'Describe CVS as continuing to expand international collaboration and next-generation work in visualization, simulation and modeling.',
  },
] as const;

const SOURCE_LINKS = [
  'DTU innovation ecosystem & the DTU School of Computer Science & Artificial Intelligence',
  'DTU Virtual Reality Simulation as a new direction for medical learning materials',
  'DTU Commercialization of the patented eCPR system',
  'DTU AED-302 Trainer and Wellbeing commercialization agreement',
] as const;

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const whatRef = useRef<HTMLElement>(null);

  useSEO({
    ...getSeoMeta('/about')!,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About CVS — Center of Visualization & Simulation',
      description:
        'CVS is the Center of Visualization & Simulation within Duy Tan University, focused on 3D simulation, VR, AR and AI.',
      url: 'https://cvs.local/about',
    },
  });

  const scrollToWhat = () => {
    whatRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="about-page">
      {/* S1 — Hero */}
      <section className="about-hero">
        <div className="about-hero-bg" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="about-hero-overlay" />
        <FigmaVector src={vectorHero} className="about-figma-vector--hero" />
        <div className="about-glow about-glow--cyan about-hero-glow-1" />
        <div className="about-glow about-glow--purple about-hero-glow-2" />
        <AppHeader />
        <ScrollReveal className="about-hero-content" eager delay={100}>
          <div className="about-hero-badge">
            <span className="about-hero-badge-dot" />
            <span>Duy Tan University · SCA Innovation Ecosystem</span>
          </div>
          <h1 className="about-hero-cvs">CVS</h1>
          <h2 className="about-hero-subtitle">Center of Visualization & Simulation</h2>
          <p className="about-hero-desc">
            CVS is the Center of Visualization & Simulation within Duy Tan University, focused on 3D
            simulation, virtual reality, augmented reality, AI and applied training systems for
            education, healthcare and engineering.
          </p>
          <button type="button" className="about-hero-cta" onClick={scrollToWhat}>
            <BookOpen size={18} strokeWidth={2} />
            Xem thêm
          </button>
        </ScrollReveal>
        <ScrollReveal
          className="about-hero-logos"
          role="region"
          aria-label="Duy Tan University, CVS, VEPS, SCA Innovation"
          eager
          delay={280}
          direction="none"
        >
          <div className="about-hero-logos-viewport">
            <div className="about-hero-logos-track" aria-hidden>
              {Array.from({ length: HERO_LOGO_LOOP_COPIES }, (_, index) => (
                <img
                  key={index}
                  src={heroLogoStrip}
                  className="about-hero-logos-strip"
                  alt=""
                  width={1501}
                  height={45}
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* S2 — What CVS Does */}
      <section className="about-what" ref={whatRef} id="what-cvs-does">
        <FigmaVector src={vectorWhatLeft} className="about-figma-vector--what-left" />
        <div className="about-container">
          <div className="about-what-grid">
            <ScrollReveal className="about-what-text" direction="right" delay={40}>
              <h2 className="about-section-title">What CVS Does</h2>
              <p style={{ marginTop: 32 }}>
                According to Duy Tan University, CVS sits inside the innovation ecosystem of the DTU
                School of Computer Science & Artificial Intelligence. The center researches and
                develops advanced technology applications in 3D simulation, VR, AR and AI.
              </p>
              <p>
                Its work is practical by design: the team collaborates with physicians, engineers
                and domain experts to create digital transformation solutions for education,
                healthcare and industrial engineering.
              </p>
            </ScrollReveal>
            <ScrollReveal className="about-what-visual-wrap" direction="left" delay={120}>
              <div className="about-glow about-glow--cyan about-what-visual-glow" aria-hidden />
              <div className="about-what-visual">
                <img
                  src={whatCvsGroup}
                  className="about-what-visual-art"
                  alt="CVS simulation and visualization workspace"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <AboutSectionDivider />

      {/* S3 — Research & Development Focus */}
      <section className="about-rd">
        <FigmaVector src={vectorRdLeft} className="about-figma-vector--rd-left" />
        <div className="about-container">
          <ScrollReveal as="h2" className="about-section-title about-section-title--center">
            Research and Development Focus
          </ScrollReveal>
          <div className="about-rd-layout">
            {RD_CARDS.map((card, index) => {
              const Icon = card.icon;
              return (
                <ScrollReveal
                  key={card.key}
                  className={`about-rd-card about-rd-card--${card.key}`}
                  delay={index * 80}
                >
                  <div className="about-rd-card-icon">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <div className="about-rd-card-body">
                    <h3>{card.title}</h3>
                    <p>{card.desc}</p>
                  </div>
                </ScrollReveal>
              );
            })}
            <ScrollReveal
              className="about-rd-hub"
              role="img"
              aria-label="CVS research and development hub"
              delay={200}
              duration={900}
            >
              <AboutRdHubArt />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* S4 — Flagship Products */}
      <section className="about-products">
        <FigmaVector src={vectorRdRight} className="about-figma-vector--products-right" />
        <FigmaVector src={vectorProductsLeft} className="about-figma-vector--products-left" />
        <div className="about-container">
          <ScrollReveal
            as="h2"
            className="about-section-title about-section-title--center about-section-title--underline"
          >
            Flagship CVS Products
          </ScrollReveal>
          <div className="about-products-grid">
            {PRODUCTS.map((product, index) => (
              <ScrollReveal
                key={product.title}
                as="article"
                className="about-product-card"
                delay={(index % 3) * 90}
              >
                <img className="about-product-img" src={product.image} alt={product.title} />
                <div className="about-product-body">
                  <h3>{product.title}</h3>
                  <p>{product.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* S5 — Impact */}
      <section className="about-impact">
        <div className="about-glow about-glow--figma about-impact-glow-7" aria-hidden />
        <div className="about-glow about-glow--figma about-impact-glow-8" aria-hidden />
        <div className="about-container">
          <ScrollReveal as="h2" className="about-section-title about-section-title--center">
            Impact
          </ScrollReveal>
          <div className="about-impact-grid">
            {IMPACT_CARDS.map((card, index) => (
              <ScrollReveal key={card.title} className="about-impact-card" delay={index * 100}>
                <div className="about-impact-trophy">
                  <Trophy size={28} strokeWidth={1.5} />
                </div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* S6 — About This Emulator */}
      <section className="about-emulator">
        <FigmaVector src={vectorProductsRight} className="about-figma-vector--emulator-right" />
        <div className="about-container">
          <div className="about-emulator-grid">
            <ScrollReveal className="about-emulator-text" direction="right" delay={60}>
              <h2 className="about-section-title">About This Emulator</h2>
              <p style={{ marginTop: 32 }}>
                CVS Emulator extends the same simulation-first mission into browser-based
                electronics education. It gives students, makers and engineers a fast way to run
                microcontroller code, wire circuits, inspect behavior and learn by interacting with
                a working system.
              </p>
              <p>
                The product direction is deliberately aligned with the broader CVS identity: visual,
                hands-on, repeatable training environments that help learners move from theory to
                practice.
              </p>
              <button
                type="button"
                className="about-emulator-start"
                onClick={() => navigate('/editor')}
              >
                Start Emulator
                <ExternalLink size={16} />
              </button>
            </ScrollReveal>
            <ScrollReveal direction="left" delay={140}>
              <AboutEmulatorVisual />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* S7 — Sources + CTA */}
      <section className="about-sources">
        <div className="about-container">
          <ScrollReveal
            as="h2"
            className="about-section-title about-section-title--center"
            style={{ marginBottom: 40 }}
          >
            About This Emulator
          </ScrollReveal>
          <div className="about-sources-list">
            {SOURCE_LINKS.map((label, i) => (
              <ScrollReveal key={label} delay={i * 70}>
                <button
                  type="button"
                  className={`about-source-item${i === 2 ? ' about-source-item--active' : ''}`}
                >
                  <span>{label}</span>
                  <ArrowRight size={18} />
                </button>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <ScrollReveal className="about-cta" distance={36} duration={800}>
          <div className="about-cta-bg" style={{ backgroundImage: `url(${ctaBg})` }} />
          <div className="about-cta-overlay" />
          <FigmaVector src={vectorCta} className="about-figma-vector--cta" />
          <div className="about-container about-cta-content">
            <h2>{'Open the\nCVS Emulator'}</h2>
            <p>Start from a circuit canvas or example project</p>
            <button type="button" className="about-cta-btn" onClick={() => navigate('/editor')}>
              Open Editor
              <ExternalLink size={16} />
            </button>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};
