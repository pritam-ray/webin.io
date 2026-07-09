import './Marquee.css';

const words = ['DESIGN', 'DEVELOP', 'DEPLOY', 'DOMINATE', 'INNOVATE', 'CREATE', 'TRANSFORM', 'ELEVATE'];

const Marquee = () => {
  return (
    <div className="marquee-section">
      <div className="marquee-track">
        <div className="marquee-content">
          {[...words, ...words].map((word, i) => (
            <span key={i} className={i % 2 === 0 ? 'marquee-word filled' : 'marquee-word outlined'}>
              {word}
              <span className="marquee-separator">✦</span>
            </span>
          ))}
        </div>
        <div className="marquee-content" aria-hidden="true">
          {[...words, ...words].map((word, i) => (
            <span key={i} className={i % 2 === 0 ? 'marquee-word filled' : 'marquee-word outlined'}>
              {word}
              <span className="marquee-separator">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Marquee;
