import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink, User } from 'lucide-react';
import SectionHeading from './SectionHeading';
import './Team.css';

const team = [
  {
    name: 'Pritam',
    role: 'Co-Founder & Lead Developer',
    bio: 'Turning caffeine into code since day one. Pritam architects robust digital solutions and leads the technical vision at webing.io.',
    gradient: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
    initial: 'P',
    image: '/team/pritam.png',
  },
  {
    name: 'Laxmi',
    role: 'Co-Founder & Creative Director',
    bio: "Design is not what it looks like — it's how it works. Laxmi brings brands to life through compelling visual storytelling.",
    gradient: 'linear-gradient(135deg, #f093fb, #f5576c)',
    initial: 'L',
    image: '/team/laxmi.jpeg',
  },
  {
    name: 'Lakshya',
    role: 'UI/UX Designer',
    bio: 'Pixels are my playground. Lakshya crafts intuitive interfaces that users love to interact with, one micro-animation at a time.',
    gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)',
    initial: 'L',
    image: '/team/lakshya.png',
  },
  {
    name: 'Bhomik',
    role: 'Full-Stack Developer',
    bio: 'Building the web, one line at a time. Bhomik turns complex requirements into clean, scalable, and performant code.',
    gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    initial: 'B',
    image: '/team/bhomik.png',
  },
];

const TeamMemberCard = ({ member, index }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      className="team-card"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      whileHover={{ y: -10 }}
    >
      <div className="team-card-inner">
        <div className="team-avatar" style={{ background: member.gradient }}>
          {!imageError && member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="team-avatar-img"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="avatar-initial">{member.initial}</span>
          )}
          <div className="avatar-ring" />
        </div>
        <h4 className="team-name">{member.name}</h4>
        <span className="team-role">{member.role}</span>
        <p className="team-bio">{member.bio}</p>
        <div className="team-socials">
          <a href="#" className="team-social-link" aria-label="Portfolio">
            <Globe size={16} />
          </a>
          <a href="#" className="team-social-link" aria-label="Profile">
            <User size={16} />
          </a>
          <a href="#" className="team-social-link" aria-label="Link">
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
      <div className="team-card-border" style={{ background: member.gradient }} />
    </motion.div>
  );
};

const Team = () => {
  const [activeMember, setActiveMember] = useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const index = Math.min(
      team.length - 1,
      Math.max(0, Math.round(scrollLeft / (width * 0.85 + 20)))
    );
    setActiveMember(index);
  };

  return (
    <section className="team" id="team">
      <div className="container">
        <SectionHeading
          label="Our Team"
          title="The Minds Behind webing.io"
          subtitle="A small but mighty team of creators, thinkers, and builders obsessed with digital excellence."
        />

        {/* Mobile view native drag-snap carousel */}
        <div className="team-carousel-wrapper">
          <div className="team-carousel" onScroll={handleScroll}>
            {team.map((member, i) => (
              <TeamMemberCard key={member.name} member={member} index={i} />
            ))}
          </div>
          <div className="carousel-indicators">
            {team.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === activeMember ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop view grid */}
        <div className="team-grid">
          {team.map((member, i) => (
            <TeamMemberCard key={member.name} member={member} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
