import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Portfolio.css';

const projects = [
  {
    title: 'Maskedon',
    category: 'Web Application',
    year: '2026',
    description: 'A security-focused, end-to-end encrypted messaging and anonymous networking platform. Engineered with high-performance real-time communication protocols, robust privacy controls, and a modern, distraction-free user interface designed for confidential networking.',
    link: 'https://maskedon.com',
    displayUrl: 'maskedon.com',
    image: '/projects/maskedon.png',
  },
  {
    title: 'MitthuuG',
    category: 'Premium E-Commerce',
    year: '2026',
    description: 'A luxurious digital storefront for traditional Indian confectionery. Featuring interactive product showcases, fluid add-to-cart dynamics, an elegant custom cart system, and responsive, brand-aligned storytelling that elevates the gourmet sweets shopping experience.',
    link: 'https://mitthuug.netlify.app',
    displayUrl: 'mitthuug.netlify.app',
    image: '/projects/mitthuug.png',
  },
  {
    title: 'Dungeon Master',
    category: 'AI Interactive Game',
    year: '2025',
    description: 'A rich, story-driven gaming platform that utilizes advanced LLMs to create infinite customized adventure paths. Features interactive user choices, real-time context-aware narration, and an immersive fantasy theme powered by retro-modern styling and responsive layouts.',
    link: 'https://dungeonmastergame.netlify.app',
    displayUrl: 'dungeonmastergame.netlify.app',
    image: '/projects/dungeonmaster.png',
  },
  {
    title: 'Chat-Ji-Pitty',
    category: 'AI Chat Interface',
    year: '2025',
    description: 'A hyper-realistic clone of state-of-the-art AI assistants. Built to demonstrate high-fidelity UI recreation, incorporating dynamic markdown rendering, responsive conversational flows, code highlight syntax, and customizable sidebar parameters for a fluid chat experience.',
    link: 'https://chat-ji-pitty.netlify.app',
    displayUrl: 'chat-ji-pitty.netlify.app',
    image: '/projects/chatjipitty.png',
  },
];

const ProjectCard = ({ project, index }) => {
  return (
    <motion.div
      className="project-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <div className="project-image">
        <div className="project-mockup">
          <div className="mockup-browser">
            <div className="mockup-dots">
              <span /><span /><span />
            </div>
            <div className="mockup-url">
              <span>{project.displayUrl}</span>
            </div>
          </div>
          <div className={`mockup-content ${project.image ? 'has-image' : ''}`}>
            {project.image ? (
              <img src={project.image} alt={project.title} className="mockup-screenshot" />
            ) : (
              <>
                <div className="mockup-hero-block" />
                <div className="mockup-text-lines">
                  <div className="mockup-line w80" />
                  <div className="mockup-line w60" />
                  <div className="mockup-line w70" />
                </div>
                <div className="mockup-grid-blocks">
                  <div className="mockup-block" />
                  <div className="mockup-block" />
                  <div className="mockup-block" />
                </div>
              </>
            )}
          </div>
        </div>
        <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-overlay-link">
          <div className="project-overlay">
            <span className="view-project-text">
              Visit Live Site <ArrowUpRight size={16} />
            </span>
          </div>
        </a>
      </div>
      <div className="project-info">
        <div className="project-meta">
          <span className="project-category">{project.category}</span>
          <span className="project-year">{project.year}</span>
        </div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-description">{project.description}</p>
      </div>
    </motion.div>
  );
};

const Portfolio = () => {
  const targetRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 900);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Track holds 6 cards: 1 title card, 4 project cards, 1 CTA card
  // Translate goes from 0% to -75% of the total track width
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-76%']);

  if (isDesktop) {
    return (
      <section ref={targetRef} className="portfolio-scroll-container" id="portfolio">
        <div className="portfolio-sticky-wrapper">
          <motion.div style={{ x }} className="portfolio-horizontal-track">
            {/* Title Card inside horizontal scrolling track */}
            <div className="portfolio-title-card glass">
              <span className="portfolio-track-badge">SELECTED WORK</span>
              <h2 className="portfolio-track-title">Projects We're Proud Of</h2>
              <p className="portfolio-track-subtitle">
                Every project is a story of collaboration, creativity, and meticulous craft. 
                Here's a glimpse of what we've built.
              </p>
              <div className="scroll-hint-arrow">
                <span>SCROLL DOWN TO SLIDE SIDEWAYS &rarr;</span>
              </div>
            </div>

            {projects.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))}

            {/* CTA Card at the end of track */}
            <div className="portfolio-cta-card glass">
              <h3 className="cta-card-title">WANT SOMETHING SIMILAR?</h3>
              <p className="cta-card-desc">
                Let's discuss how we can build a high-performance web platform customized for your business growth.
              </p>
              <a
                href="https://wa.me/919653821027?text=Hi!%20I'd%20like%20to%20discuss%20a%20project%20similar%20to%20your%20portfolio%20work."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>LET'S TALK</span>
                <ArrowUpRight size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Mobile View
  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <SectionHeading
          label="Selected Work"
          title="Projects We're Proud Of"
          subtitle="Every project is a story of collaboration, creativity, and meticulous craft. Here's a glimpse of what we've built."
        />

        <div className="portfolio-grid-mobile">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        <div className="portfolio-cta">
          <a
            href="https://wa.me/919653821027?text=Hi!%20I'd%20like%20to%20discuss%20a%20project%20similar%20to%20your%20portfolio%20work."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Want Something Similar? Let's Talk
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
