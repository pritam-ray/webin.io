import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import HeroCanvas from './HeroCanvas';
import './Hero.css';

const Hero = () => {
  const scrollToWork = () => {
    document.querySelector('#portfolio')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollDown = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero-bg-gradient" />
      <HeroCanvas />

      <div className="hero-content container">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="badge-dot" />
          Available for new projects
        </motion.div>

        <div className="hero-headline">
          <div className="hero-line">
            {'We Don\'t Just Build'.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="hero-word"
                initial={{ opacity: 0, y: 80, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.5 + i * 0.08,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </div>
          <div className="hero-line">
            {'Websites.'.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="hero-word gradient-word"
                initial={{ opacity: 0, y: 80, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.9 + i * 0.08,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </div>
          <div className="hero-line">
            {'We Build Digital'.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="hero-word"
                initial={{ opacity: 0, y: 80, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 1.0 + i * 0.08,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </div>
          <div className="hero-line">
            {'Empires.'.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="hero-word gradient-word"
                initial={{ opacity: 0, y: 80, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 1.25 + i * 0.08,
                  ease: [0.215, 0.61, 0.355, 1],
                }}
              >
                {word}&nbsp;
              </motion.span>
            ))}
          </div>
        </div>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          webing.io crafts premium digital experiences that
          convert visitors into loyal customers. Design that captivates. Code that performs.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.7 }}
        >
          <motion.button 
          className="btn-primary" 
            onClick={scrollToWork}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
          >
            <span>View Our Work</span>
            <ArrowUpRight size={16} />
          </motion.button>
          <motion.a
            href="https://wa.me/919653821027?text=Hi%20webing.io!%20I'd%20like%20to%20start%20a%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
          >
            Start a Project
          </motion.a>
        </motion.div>
      </div>

      <motion.button
        className="hero-scroll-indicator"
        onClick={scrollDown}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        aria-label="Scroll down"
      >
        <span className="scroll-text">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default Hero;
