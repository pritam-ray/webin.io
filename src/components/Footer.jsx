import { motion } from 'framer-motion';
import { ArrowUpRight, Heart } from 'lucide-react';
import './Footer.css';

const footerLinks = {
  'Navigation': [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Portfolio', href: '#portfolio' },
  ],
  'Services': [
    { name: 'Web Design', href: '#services' },
    { name: 'Development', href: '#services' },
    { name: 'E-Commerce', href: '#services' },
    { name: 'UI/UX Design', href: '#services' },
  ],
  'Contact': [
    { name: 'WhatsApp', href: 'https://wa.me/919653821027', external: true },
    { name: 'Call Us', href: 'tel:+919653821027', external: true },
    { name: 'Email', href: 'mailto:itswebing.io@gmail.com', external: true },
  ],
};

const Footer = () => {
  const isHomePage = window.location.pathname === '/';
  const getLinkHref = (href) => {
    if (href.startsWith('http') || href.startsWith('tel') || href.startsWith('mailto')) {
      return href;
    }
    return isHomePage ? href : `/${href}`;
  };

  const scrollToSection = (e, href) => {
    if (href.startsWith('#') && isHomePage) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <motion.div
            className="footer-brand"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <a href="/" className="footer-logo" onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}>
              <svg viewBox="0 0 100 100" className="logo-svg" width="28" height="28" style={{ marginRight: '8px', overflow: 'visible' }}>
                <defs>
                  <linearGradient id="footer-logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#052626" />
                    <stop offset="100%" stopColor="#021111" />
                  </linearGradient>
                  <linearGradient id="footer-logo-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#9ca5a5" />
                  </linearGradient>
                  <filter id="footer-logo-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="-1" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.4" />
                  </filter>
                </defs>
                <circle cx="24" cy="26" r="6" fill="#052626" />
                <path d="M 25 38 L 38 62" stroke="url(#footer-logo-grad-2)" strokeWidth="11" strokeLinecap="round" />
                <path d="M 38 62 L 52 26" stroke="url(#footer-logo-grad-1)" strokeWidth="11" strokeLinecap="round" filter="url(#footer-logo-shadow)" />
                <path d="M 52 26 L 66 62" stroke="url(#footer-logo-grad-2)" strokeWidth="11" strokeLinecap="round" />
                <path d="M 66 62 L 80 26" stroke="url(#footer-logo-grad-1)" strokeWidth="11" strokeLinecap="round" filter="url(#footer-logo-shadow)" />
              </svg>
              <span className="logo-text">webing</span>
              <span className="logo-dot">.io</span>
            </a>
            <p className="footer-tagline">
              Crafting premium digital experiences that convert visitors into customers.
              Let's build something extraordinary together.
            </p>
            <a
              href="https://wa.me/919653821027?text=Hi%20webing.io!%20Let's%20build%20something%20amazing."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary footer-cta"
            >
              <span>Start a Project</span>
              <ArrowUpRight size={16} />
            </a>
          </motion.div>

          <div className="footer-links-grid">
            {Object.entries(footerLinks).map(([category, links], ci) => (
              <motion.div
                key={category}
                className="footer-link-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: ci * 0.1 }}
              >
                <h4 className="footer-link-title">{category}</h4>
                {links.map((link) => (
                  <a
                    key={link.name}
                    href={getLinkHref(link.href)}
                    className="footer-link"
                    onClick={(e) => scrollToSection(e, link.href)}
                    {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {link.name}
                    {link.external && <ArrowUpRight size={12} />}
                  </a>
                ))}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} webing.io. All rights reserved.
          </p>
          <p className="footer-made-with">
            Made with <Heart size={14} fill="#f5576c" color="#f5576c" /> by webing.io
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
