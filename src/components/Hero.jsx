import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
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
      <div className="hero-content container">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: -20, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span>AVAILABLE FOR NEW PROJECTS</span>
        </motion.div>

        {/* Sticker badge for pricing (from the Instagram image) */}
        <motion.div
          className="price-sticker-badge"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 12 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.6 }}
        >
          <div className="sticker-content">
            <span className="sticker-sub">WEBSITES START AT</span>
            <span className="sticker-price">₹9,999/-</span>
          </div>
        </motion.div>

        <h1 className="hero-title">
          <span className="title-block">Don't Just Build</span>
          <span className="title-block orange-text">a Digital Product</span>
          <span className="title-block teal-text">— Build It for Growth! —</span>
        </h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          We design and build high-performance websites, e-commerce solutions, 
          and custom web applications engineered for business growth. Design that captivates. Code that performs.
        </motion.p>

        <motion.div
          className="hero-ctas"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <button className="btn-primary" onClick={scrollToWork}>
            <span>View Our Work</span>
            <ArrowUpRight size={18} />
          </button>
          <a
            href="https://wa.me/919653821027?text=Hi%20webing.io!%20I'd%20like%20to%20start%20a%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Start a Project
          </a>
        </motion.div>
      </div>

      <button className="hero-scroll-indicator" onClick={scrollDown} aria-label="Scroll down">
        <span className="scroll-text">Scroll</span>
        <ChevronDown size={20} />
      </button>
    </section>
  );
};

export default Hero;
