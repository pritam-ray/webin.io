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
    description: 'A full-stack private event discovery and social reputation platform where users host city experiences, request to join events, rate fellow attendees post-event, and build a social rating. Built with React, TailwindCSS, Node.js, Express, TypeScript, and PostgreSQL with Supabase image storage.',
    link: 'https://maskedon.com',
    displayUrl: 'maskedon.com',
    image: '/projects/maskedon.png',
  },
  {
    title: 'MitthuuG',
    category: 'Premium E-Commerce',
    year: '2026',
    description: 'A premium, responsive e-commerce storefront for artisan-crafted Til-Gud snacks and traditional jaggery-based sweets. Includes customer authentication, cart and checkout flows, reviews, order history tracking, and Razorpay payment integration. Built with React, TypeScript, TailwindCSS, and Supabase.',
    link: 'https://mitthuug.netlify.app',
    displayUrl: 'mitthuug.netlify.app',
    image: '/projects/mitthuug.png',
  },
  {
    title: 'Dungeon Master',
    category: 'AI Interactive Game',
    year: '2025',
    description: 'An AI-powered, choice-driven role-playing game where story paths are dynamically generated using Azure OpenAI. Features 6 unique themes, character stat progression (Health, Mana, Strength, Intelligence, Charisma), real-time inventory management, achievements, and relationship tracking.',
    link: 'https://dungeonmastergame.netlify.app',
    displayUrl: 'dungeonmastergame.netlify.app',
    image: '/projects/dungeonmaster.png',
  },
  {
    title: 'Chat-Ji-Pitty',
    category: 'AI Chat Interface',
    year: '2025',
    description: 'A premium AI chatbot application integrating Groq (Llama 3.3 70B) and Gemini AI. Supports Supabase session database persistence, multi-key rate limit failover rotation, PDF text extraction, and a stateless Render search proxy backend for real-time web retrieval.',
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
  const trackRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  // Track holds 6 cards: 1 title card, 4 project cards, 1 CTA card
  // Translate goes from 0% to -75% of the total track width
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-76%']);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let startX = 0;
    let startY = 0;
    let isHorizontalSwipe = false;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isHorizontalSwipe = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;

      const deltaX = startX - currentX;
      const deltaY = startY - currentY;

      // Identify horizontal swipe vs vertical page scroll
      if (!isHorizontalSwipe && Math.abs(deltaX) > 5 && Math.abs(deltaX) > Math.abs(deltaY)) {
        isHorizontalSwipe = true;
      }

      if (isHorizontalSwipe) {
        if (e.cancelable) {
          e.preventDefault();
        }
        // Scroll the window vertically in response to horizontal touch drag
        window.scrollBy({
          top: deltaX * 1.3,
          behavior: 'auto'
        });

        startX = currentX;
        startY = currentY;
      }
    };

    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      track.removeEventListener('touchstart', handleTouchStart);
      track.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <section ref={targetRef} className="portfolio-scroll-container" id="portfolio">
      <div className="portfolio-sticky-wrapper">
        <motion.div ref={trackRef} style={{ x }} className="portfolio-horizontal-track">
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
};

export default Portfolio;
