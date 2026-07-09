import { motion } from 'framer-motion';
import { Palette, Code, ShoppingCart, Layers, RefreshCw, Headphones } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Services.css';

const services = [
  {
    icon: Palette,
    title: 'Custom Website Design',
    description: 'Bespoke designs tailored to your brand identity. No templates, no compromises — just pixel-perfect craftsmanship that makes your business stand out.',
    color: '#6c5ce7',
  },
  {
    icon: Code,
    title: 'Web Development',
    description: 'Fast, responsive, and SEO-optimized websites built with modern tech stacks. Clean code that scales with your business growth.',
    color: '#00d2ff',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Solutions',
    description: 'Online stores that don\'t just display products — they sell. Seamless checkout flows, payment integration, and inventory management.',
    color: '#a855f7',
  },
  {
    icon: Layers,
    title: 'UI/UX Design',
    description: 'User interfaces that feel intuitive from the first click. Research-driven design that prioritizes user delight and conversion.',
    color: '#f093fb',
  },
  {
    icon: RefreshCw,
    title: 'Website Redesign',
    description: 'Transform your outdated website into a modern masterpiece. We breathe new life into existing platforms while preserving your brand\'s soul.',
    color: '#4facfe',
  },
  {
    icon: Headphones,
    title: 'Maintenance & Support',
    description: 'Your website deserves ongoing care. We provide continuous updates, security patches, and performance optimization to keep you ahead.',
    color: '#43e97b',
  },
];

const Services = () => {
  return (
    <section className="services" id="services">
      <div className="container">
        <SectionHeading
          label="Our Services"
          title="What We Do Best"
          subtitle="From concept to launch, we offer end-to-end digital solutions that elevate your brand and drive real business results."
        />

        <div className="services-grid">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              className="service-card glass"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8, borderColor: 'rgba(108, 92, 231, 0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="service-icon-wrapper" style={{ '--icon-color': service.color }}>
                <service.icon size={28} strokeWidth={1.5} />
              </div>
              <h4 className="service-title">{service.title}</h4>
              <p className="service-description">{service.description}</p>
              <div className="service-card-gradient" style={{ '--icon-color': service.color }} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
