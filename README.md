# webing.io — Premium Digital Experience Agency

Welcome to the official repository for **webing.io**, a premium full-service digital agency website. We specialize in designing and engineering high-converting custom websites, scalable web applications, native/cross-platform mobile apps, and custom enterprise software (CRMs/ERPs).

---

## ✨ Features

- **Stunning UI/UX:** Built with sleek dark mode aesthetics, glassmorphism, HSL custom color palettes, and interactive micro-animations.
- **Framer Motion Animations:** Smooth section transitions, interactive testimonial sliders, and dynamic card scaling effects.
- **Interactive Estimate Generator:** A comprehensive client-facing budgetary estimate and B2B software proposal generator sheet. Features:
  - Custom pricing calculator (Web/App/Software/Design)
  - Milestone & phase scheduling
  - White-label policy & SLA terms generation
  - Electronic signature/stamping blocks
  - Real-time printable A4 invoice sheet preview
  - JSON configuration download/upload capability
- **Instant WhatsApp Integration:** Automated CTA button message payloads prefilled with selected plan inquiries or general contact greetings.
- **Responsive Navigation:** A custom fullscreen drawer menu featuring a live digital clock tuned to India Time (IST).

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/) + [Vite 8](https://vite.dev/)
- **Core UI Elements:** Vanilla CSS (Tailored variables for consistent branding)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **3D graphics:** [Three.js](https://threejs.org/) + [React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction) + [Drei](https://github.com/pmndrs/drei)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18 or higher) installed.

### Installation

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/pritam-ray/webin.io.git
   cd webin.io
   ```

2. Install the package dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the application for production:
   ```bash
   npm run build
   ```

5. Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## 📂 Project Structure

```text
├── public/                     # Static assets (Favicons, images, logo)
│   ├── logo/                   # Official logo graphics
│   └── favicon.svg             # Webing vector favicon logo mark
├── src/
│   ├── components/             # Reusable UI React components
│   │   ├── About.jsx           # Team story & agency statistics
│   │   ├── Contact.jsx         # Contact form with WhatsApp actions
│   │   ├── EstimateGenerator.jsx # Budget & proposal PDF sheet engine
│   │   ├── Footer.jsx          # Copyright and navigation links
│   │   ├── Hero.jsx            # Interactive landing header
│   │   ├── Navbar.jsx          # Sticky header & IST clock drawer
│   │   └── Testimonials.jsx    # Animated client reviews slider
│   ├── App.jsx                 # Application entry layout
│   ├── index.css               # Global theme styles & variables
│   └── main.jsx                # DOM mounting & rendering
├── Webing_Services_Catalog.html # Interactive agency pricing document
├── Webing_Services_Catalog.pdf  # Static offline services catalog
└── package.json                # Project configurations & dependency versions
```

---

## 📄 License

Confidential Document. © 2026 webing.io. All rights reserved.