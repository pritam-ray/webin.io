import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Testimonials.css';

const testimonials = [
  {
    quote: "webing.io completely transformed our online presence. The website they built for us isn't just beautiful — it actually converts visitors into paying customers. Our revenue increased by 40% within three months of launch.",
    name: 'Arjun Mehta',
    company: 'Artisan Café',
    role: 'Founder',
    rating: 5,
    gradient: 'linear-gradient(135deg, #667eea, #764ba2)',
  },
  {
    quote: "Working with Pritam and the team was an absolute pleasure. They understood our vision from day one and delivered a product that exceeded all expectations. The attention to detail is unmatched.",
    name: 'Sneha Kapoor',
    company: 'FitPulse',
    role: 'CEO',
    rating: 5,
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
  },
  {
    quote: "We've worked with several agencies before, but webing.io is on a different level. Their design sense, technical expertise, and commitment to quality make them our go-to digital partner for everything.",
    name: 'Rahul Sharma',
    company: 'Luxe Realty',
    role: 'Managing Director',
    rating: 5,
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="testimonials" id="testimonials">
      <div className="container">
        <SectionHeading
          label="Testimonials"
          title="What Our Clients Say"
          subtitle="Don't just take our word for it — hear from the businesses we've helped grow."
        />

        <div className="testimonials-wrapper">
          <div className="testimonial-quote-icon">
            <Quote size={48} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="testimonial-slide"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              <div className="testimonial-stars">
                {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                  <Star key={i} size={18} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>

              <p className="testimonial-text">
                "{testimonials[current].quote}"
              </p>

              <div className="testimonial-author">
                <div className="author-avatar" style={{ background: testimonials[current].gradient }}>
                  {testimonials[current].name[0]}
                </div>
                <div>
                  <h4 className="author-name">{testimonials[current].name}</h4>
                  <span className="author-role">
                    {testimonials[current].role}, {testimonials[current].company}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="testimonial-controls">
            <button onClick={prev} className="testimonial-btn" aria-label="Previous testimonial">
              <ChevronLeft size={20} />
            </button>
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`testimonial-dot ${i === current ? 'active' : ''}`}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
            <button onClick={next} className="testimonial-btn" aria-label="Next testimonial">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
