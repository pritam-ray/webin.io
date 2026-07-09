import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Contact.css';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    projectType: '',
    budget: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = `Hi webing.io! 👋\n\nName: ${form.name}\nEmail: ${form.email}\nProject Type: ${form.projectType}\nBudget: ${form.budget}\n\nMessage: ${form.message}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919653821027?text=${encoded}`, '_blank');
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-glow-orb contact-orb-1" />
      <div className="contact-glow-orb contact-orb-2" />

      <div className="container">
        <SectionHeading
          label="Get In Touch"
          title="Let's Create Something Amazing"
          subtitle="Ready to elevate your digital presence? Drop us a message and we'll get back to you within 24 hours."
        />

        <div className="contact-grid">
          <motion.form
            className="contact-form glass"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-name">Your Name</label>
                <input
                  type="text"
                  id="contact-name"
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="contact-email">Email Address</label>
                <input
                  type="email"
                  id="contact-email"
                  name="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact-project">Project Type</label>
                <select
                  id="contact-project"
                  name="projectType"
                  value={form.projectType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a service</option>
                  <option value="Custom Website">Custom Website Design</option>
                  <option value="Web Development">Web Development</option>
                  <option value="E-Commerce">E-Commerce Solution</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Website Redesign">Website Redesign</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="contact-budget">Budget Range</label>
                <select
                  id="contact-budget"
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select budget</option>
                  <option value="Under ₹15,000">Under ₹15,000</option>
                  <option value="₹15,000 - ₹40,000">₹15,000 — ₹40,000</option>
                  <option value="₹40,000 - ₹1,00,000">₹40,000 — ₹1,00,000</option>
                  <option value="₹1,00,000+">₹1,00,000+</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Tell Us About Your Project</label>
              <textarea
                id="contact-message"
                name="message"
                placeholder="Describe your dream website..."
                rows="5"
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>

            <motion.button 
              type="submit" 
              className="btn-primary contact-submit"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
            >
              <span>Send via WhatsApp</span>
              <Send size={16} />
            </motion.button>
          </motion.form>

          <motion.div
            className="contact-info"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="contact-info-card glass">
              <div className="info-icon-wrap">
                <Phone size={22} />
              </div>
              <div>
                <h4>Call Us</h4>
                <a href="tel:+919653821027" className="info-link">+91 96538 21027</a>
              </div>
            </div>

            <div className="contact-info-card glass">
              <div className="info-icon-wrap whatsapp">
                <MessageCircle size={22} />
              </div>
              <div>
                <h4>WhatsApp</h4>
                <a
                  href="https://wa.me/919653821027"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="info-link"
                >
                  Chat with us instantly
                </a>
              </div>
            </div>

            <div className="contact-info-card glass">
              <div className="info-icon-wrap">
                <Mail size={22} />
              </div>
              <div>
                <h4>Email</h4>
                <a href="mailto:impritamray@gmail.com" className="info-link">impritamray@gmail.com</a>
              </div>
            </div>

            <div className="contact-info-card glass">
              <div className="info-icon-wrap">
                <MapPin size={22} />
              </div>
              <div>
                <h4>Location</h4>
                <p className="info-text">India · Remote Worldwide</p>
              </div>
            </div>

            {/* <div className="contact-availability">
              <div className="availability-dot" />
              <span>We typically respond within 2 hours</span>
            </div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
