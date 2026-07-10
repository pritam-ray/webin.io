import { motion } from 'framer-motion';
import { Palette, Code, ShoppingCart, Layers, RefreshCw, Headphones } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Services.css';

const services = [
  {
    icon: Palette,
    title: 'Custom Website Design',
    description: 'Bespoke designs tailored to your brand identity. No templates, no compromises — just pixel-perfect craftsmanship that makes your business stand out.',
  },
  {
    icon: Code,
    title: 'Web Development',
    description: 'Fast, responsive, and SEO-optimized websites built with modern tech stacks. Clean code that scales with your business growth.',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Solutions',
    description: 'Online stores that don\'t just display products — they sell. Seamless checkout flows, payment integration, and inventory management.',
  },
  {
    icon: Layers,
    title: 'UI/UX Design',
    description: 'User interfaces that feel intuitive from the first click. Research-driven design that prioritizes user delight and conversion.',
  },
  {
    icon: RefreshCw,
    title: 'Website Redesign',
    description: 'Transform your outdated website into a modern masterpiece. We breathe new life into existing platforms while preserving your brand\'s soul.',
  },
  {
    icon: Headphones,
    title: 'Maintenance & Support',
    description: 'Your website deserves ongoing care. We provide continuous updates, security patches, and performance optimization to keep you ahead.',
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="service-icon-wrapper">
                <service.icon size={26} strokeWidth={2} />
              </div>
              <h4 className="service-title">{service.title}</h4>
              <p className="service-description">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
