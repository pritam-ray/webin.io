import { useRef, useState } from 'react';
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
    gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a855f7 100%)',
    link: 'https://maskedon.com',
    displayUrl: 'maskedon.com',
    image: '/projects/maskedon.png',
  },
  {
    title: 'MitthuuG',
    category: 'Premium E-Commerce',
    year: '2026',
    description: 'A luxurious digital storefront for traditional Indian confectionery. Featuring interactive product showcases, fluid add-to-cart dynamics, an elegant custom cart system, and responsive, brand-aligned storytelling that elevates the gourmet sweets shopping experience.',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    link: 'https://mitthuug.netlify.app',
    displayUrl: 'mitthuug.netlify.app',
    image: '/projects/mitthuug.png',
  },
  {
    title: 'Dungeon Master',
    category: 'AI Interactive Game',
    year: '2025',
    description: 'A rich, story-driven gaming platform that utilizes advanced LLMs to create infinite customized adventure paths. Features interactive user choices, real-time context-aware narration, and an immersive fantasy theme powered by retro-modern styling and responsive layouts.',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    link: 'https://dungeonmastergame.netlify.app',
    displayUrl: 'dungeonmastergame.netlify.app',
    image: '/projects/dungeonmaster.png',
  },
  {
    title: 'Chat-Ji-Pitty',
    category: 'AI Chat Interface',
    year: '2025',
    description: 'A hyper-realistic clone of state-of-the-art AI assistants. Built to demonstrate high-fidelity UI recreation, incorporating dynamic markdown rendering, responsive conversational flows, code highlight syntax, and customizable sidebar parameters for a fluid chat experience.',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    link: 'https://chat-ji-pitty.netlify.app',
    displayUrl: 'chat-ji-pitty.netlify.app',
    image: '/projects/chatjipitty.png',
  },
];

const ProjectCard = ({ project, index }) => {
  return (
    <motion.div
      className="project-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <div className="project-image" style={{ background: project.gradient }}>
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
          <motion.div
            className="project-overlay"
            whileHover={{ opacity: 1 }}
            initial={{ opacity: 0 }}
          >
            <span className="view-project-text">
              Visit Live Site <ArrowUpRight size={18} />
            </span>
          </motion.div>
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
  const [activeProject, setActiveProject] = useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const index = Math.min(
      projects.length - 1,
      Math.max(0, Math.round(scrollLeft / (width * 0.85 + 20)))
    );
    setActiveProject(index);
  };

  return (
    <section className="portfolio" id="portfolio">
      <div className="container">
        <SectionHeading
          label="Selected Work"
          title="Projects We're Proud Of"
          subtitle="Every project is a story of collaboration, creativity, and meticulous craft. Here's a glimpse of what we've built."
        />

        {/* Mobile view native drag-snap carousel */}
        <div className="portfolio-carousel-wrapper">
          <div className="portfolio-carousel" onScroll={handleScroll}>
            {projects.map((project, i) => (
              <ProjectCard key={project.title} project={project} index={i} />
            ))}
          </div>
          <div className="carousel-indicators">
            {projects.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === activeProject ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop view grid */}
        <div className="portfolio-grid">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>

        <motion.div
          className="portfolio-cta"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <a
            href="https://wa.me/919653821027?text=Hi!%20I'd%20like%20to%20discuss%20a%20project%20similar%20to%20your%20portfolio%20work."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Want Something Similar? Let's Talk
            <ArrowUpRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Portfolio;
