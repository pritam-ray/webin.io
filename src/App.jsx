import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Services from './components/Services';
import Portfolio from './components/Portfolio';
import Process from './components/Process';
import DoodleCanvas from './components/DoodleCanvas';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CustomCursor from './components/CustomCursor';
import WhatsAppButton from './components/WhatsAppButton';
import EstimateGenerator from './components/EstimateGenerator';
import './App.css';

function App() {
  const isEstimateRoute = window.location.pathname === '/estimate-generator';

  if (isEstimateRoute) {
    return <EstimateGenerator />;
  }

  return (
    <div className="app-wrapper">
      <CustomCursor />
      <div className="grain-overlay" />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Services />
        <Portfolio />
        <Process />
        <DoodleCanvas />
        <Testimonials />
        <Pricing />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
