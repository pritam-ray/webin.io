import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Services', href: '#services' },
  { name: 'Work', href: '#portfolio' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Contact', href: '#contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setTime(new Intl.DateTimeFormat('en-US', options).format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <motion.nav
        className={`navbar ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="navbar-container container">
          <a href="#" className="navbar-logo" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <svg viewBox="0 0 100 100" className="logo-svg" width="28" height="28" style={{ marginRight: '8px', overflow: 'visible' }}>
              <defs>
                <linearGradient id="nav-logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#052626" />
                  <stop offset="100%" stopColor="#021111" />
                </linearGradient>
                <linearGradient id="nav-logo-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#9ca5a5" />
                </linearGradient>
                <filter id="nav-logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4" />
                </filter>
              </defs>
              <circle cx="24" cy="26" r="6" fill="#052626" />
              <path d="M 25 38 L 38 62" stroke="url(#nav-logo-grad-2)" strokeWidth="11" strokeLinecap="round" />
              <path d="M 38 62 L 52 26" stroke="url(#nav-logo-grad-1)" strokeWidth="11" strokeLinecap="round" filter="url(#nav-logo-shadow)" />
              <path d="M 52 26 L 66 62" stroke="url(#nav-logo-grad-2)" strokeWidth="11" strokeLinecap="round" />
              <path d="M 66 62 L 80 26" stroke="url(#nav-logo-grad-1)" strokeWidth="11" strokeLinecap="round" filter="url(#nav-logo-shadow)" />
            </svg>
            <span className="logo-text">webing</span>
            <span className="logo-dot">.io</span>
          </a>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="nav-link"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.name}
              </a>
            ))}
          </div>

          <a
            href="https://wa.me/919653821027?text=Hi%20webing.io!%20I'm%20interested%20in%20your%20services."
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-cta btn-primary"
          >
            <span>Let's Talk</span>
            <ArrowUpRight size={16} />
          </a>

          <button
            className={`navbar-hamburger ${mobileOpen ? 'is-active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Ambient background glows inside drawer */}
            <div className="mobile-menu-glow-1" />
            <div className="mobile-menu-glow-2" />

            <div className="mobile-menu-wrapper">
              <div className="mobile-menu-meta">
                <div className="mobile-menu-status">
                  <div className="status-indicator">
                    <span className="status-dot-green" />
                    <span className="status-text">AVAILABLE FOR PROJECTS</span>
                  </div>
                </div>

                <div className="mobile-menu-clock">
                  <Clock size={14} className="clock-icon" />
                  <span>INDIA TIME: {time}</span>
                </div>
              </div>

              <div className="mobile-menu-content">
                <div className="mobile-links-section">
                  {navLinks.map((link, i) => (
                    <div key={link.name} className="mobile-link-overflow">
                      <motion.a
                        href={link.href}
                        className="mobile-link"
                        onClick={(e) => handleNavClick(e, link.href)}
                        initial={{ y: 50, rotate: 2 }}
                        animate={{ y: 0, rotate: 0 }}
                        exit={{ y: 50, rotate: 2 }}
                        transition={{ duration: 0.4, delay: i * 0.05, ease: [0.215, 0.61, 0.355, 1] }}
                      >
                        <span className="mobile-link-number">0{i + 1}</span>
                        <span className="mobile-link-text">{link.name}</span>
                        <ArrowUpRight className="mobile-link-arrow" size={24} />
                      </motion.a>
                    </div>
                  ))}
                </div>

                <div className="mobile-contact-section">
                  <div className="mobile-contact-title">SAY HELLO</div>
                  <a href="mailto:itswebing.io@gmail.com" className="mobile-contact-item">
                    <Mail size={16} />
                    <span>itswebing.io@gmail.com</span>
                  </a>
                  <a href="tel:+919653821027" className="mobile-contact-item">
                    <Phone size={16} />
                    <span>+91 96538 21027</span>
                  </a>
                  <a
                    href="https://wa.me/919653821027"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-contact-item highlight"
                  >
                    <MessageCircle size={16} />
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
