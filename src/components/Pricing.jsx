import { motion } from 'framer-motion';
import { Check, X, ArrowUpRight, Sparkles } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Pricing.css';

const plans = [
  {
    name: 'Starter',
    price: '₹15,000',
    period: 'one-time',
    description: 'Perfect for small businesses and personal brands looking for a solid online presence.',
    features: [
      { text: 'Single Page Website', included: true },
      { text: 'Responsive Design', included: true },
      { text: 'Basic SEO Setup', included: true },
      { text: 'Contact Form', included: true },
      { text: 'Social Media Links', included: true },
      { text: '2 Revisions', included: true },
      { text: 'Custom Animations', included: false },
      { text: 'CMS Integration', included: false },
      { text: 'Priority Support', included: false },
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: '₹40,000',
    period: 'one-time',
    description: 'For growing businesses that need a complete, conversion-optimized web presence.',
    features: [
      { text: 'Multi-Page Website (up to 8)', included: true },
      { text: 'Responsive Design', included: true },
      { text: 'Advanced SEO', included: true },
      { text: 'Contact Form + WhatsApp', included: true },
      { text: 'Custom Animations', included: true },
      { text: 'CMS Integration', included: true },
      { text: '5 Revisions', included: true },
      { text: '1 Month Free Support', included: true },
      { text: 'E-Commerce', included: false },
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'let\'s talk',
    description: 'Full-scale digital platforms with custom features, e-commerce, and dedicated support.',
    features: [
      { text: 'Unlimited Pages', included: true },
      { text: 'Responsive Design', included: true },
      { text: 'Complete SEO Strategy', included: true },
      { text: 'E-Commerce Integration', included: true },
      { text: 'Admin Dashboard', included: true },
      { text: 'Custom Animations & 3D', included: true },
      { text: 'Unlimited Revisions', included: true },
      { text: '3 Months Free Support', included: true },
      { text: 'Priority Support', included: true },
    ],
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section className="pricing" id="pricing">
      <div className="container">
        <SectionHeading
          label="Investment"
          title="Transparent Pricing, Zero Surprises"
          subtitle="Choose the plan that fits your needs. Every plan includes our signature design quality and attention to detail."
        />

        <div className="pricing-grid">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -8 }}
            >
              {plan.popular && (
                <div className="popular-badge">
                  <Sparkles size={14} />
                  Most Popular
                </div>
              )}
              <div className="pricing-header">
                <h4 className="plan-name">{plan.name}</h4>
                <div className="plan-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">{plan.period}</span>
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="pricing-features">
                {plan.features.map((feature) => (
                  <div
                    key={feature.text}
                    className={`pricing-feature ${feature.included ? 'included' : 'excluded'}`}
                  >
                    {feature.included ? (
                      <Check size={16} className="feature-check" />
                    ) : (
                      <X size={16} className="feature-x" />
                    )}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>

              <motion.a
                href={`https://wa.me/919653821027?text=Hi%20webing.io!%20I'm%20interested%20in%20the%20${plan.name}%20plan.`}
                target="_blank"
                rel="noopener noreferrer"
                className={plan.popular ? 'btn-primary pricing-cta' : 'btn-secondary pricing-cta'}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
              >
                <span>Get Started</span>
                <ArrowUpRight size={16} />
              </motion.a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
