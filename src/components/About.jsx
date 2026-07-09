import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionHeading from './SectionHeading';
import './About.css';

const stats = [
  { number: 50, suffix: '+', label: 'Projects Delivered' },
  { number: 30, suffix: '+', label: 'Happy Clients' },
  { number: 4, suffix: '', label: 'Creative Minds' },
  { number: 100, suffix: '%', label: 'Client Satisfaction' },
];

const CountUp = ({ target, suffix }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const stepTime = Math.floor(duration / target);
    const timer = setInterval(() => {
      start++;
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref} className="stat-number">
      {count}{suffix}
    </span>
  );
};

const About = () => {
  return (
    <section className="about" id="about">
      <div className="about-glow-orb about-orb-1" />
      <div className="about-glow-orb about-orb-2" />

      <div className="container">
        <SectionHeading
          label="About Us"
          title="Crafting Digital Excellence Since Day One"
          subtitle="We're not just another agency. We're your digital growth partners, obsessed with creating websites that don't just look good — they perform."
        />

        <div className="about-grid">
          <motion.div
            className="about-story"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
          >
            <h3>Our Story</h3>
            <p>
              Born from a shared passion for design and technology, webing.io was founded by
              Pritam and Laxmi with a simple mission: to build websites that businesses are
              genuinely proud of. What started as two friends with big dreams has grown into a
              tight-knit team of four creative minds, each bringing unique expertise to the table.
            </p>
            <p>
              We believe every brand deserves a digital presence that matches its ambition.
              That's why we pour obsessive attention into every pixel, every interaction,
              and every line of code we write. No templates. No shortcuts. Just pure,
              handcrafted digital excellence.
            </p>

            <div className="about-philosophy">
              <div className="philosophy-line" />
              <blockquote>
                "Great design is not about making things pretty. It's about making things work
                beautifully."
              </blockquote>
            </div>
          </motion.div>

          <motion.div
            className="about-stats-grid"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="stat-card glass"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                whileHover={{ scale: 1.03, borderColor: 'rgba(108, 92, 231, 0.4)' }}
                whileTap={{ scale: 0.97 }}
              >
                <CountUp target={stat.number} suffix={stat.suffix} />
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
