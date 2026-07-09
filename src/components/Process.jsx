import { motion } from 'framer-motion';
import { Search, PenTool, Code, Rocket } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Process.css';

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Discovery',
    description: 'We dive deep into your brand, audience, and goals. Through collaborative sessions, we map out a strategy that aligns with your vision.',
  },
  {
    icon: PenTool,
    number: '02',
    title: 'Design',
    description: 'Pixel-perfect mockups come to life. We iterate with you until every element feels just right — from typography to micro-interactions.',
  },
  {
    icon: Code,
    number: '03',
    title: 'Develop',
    description: 'Clean, scalable code meets stunning design. We build responsive, blazing-fast websites using modern frameworks and best practices.',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Deploy',
    description: 'Launch day and beyond. We handle hosting, SEO optimization, and provide ongoing support to ensure your site thrives.',
  },
];

const Process = () => {
  return (
    <section className="process" id="process">
      <div className="container">
        <SectionHeading
          label="Our Process"
          title="How We Bring Ideas to Life"
          subtitle="A proven four-step framework that transforms your vision into a digital reality, with zero guesswork."
        />

        <div className="process-timeline">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="process-step"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="step-connector">
                <div className="step-dot">
                  <motion.div
                    className="step-dot-inner"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.15 + 0.3, type: 'spring' }}
                  />
                </div>
                {i < steps.length - 1 && <div className="step-line" />}
              </div>

              <motion.div
                className="step-content glass"
                whileHover={{ scale: 1.02, borderColor: 'rgba(108, 92, 231, 0.3)' }}
                transition={{ duration: 0.3 }}
              >
                <div className="step-header">
                  <span className="step-number">{step.number}</span>
                  <div className="step-icon-wrap">
                    <step.icon size={22} strokeWidth={1.5} />
                  </div>
                </div>
                <h4 className="step-title">{step.title}</h4>
                <p className="step-description">{step.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
