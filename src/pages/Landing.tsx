import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Sparkles, Award, MessageCircle, ChevronDown, Menu, X, FileText, Check, Star } from 'lucide-react';

const steps = [
  { icon: Upload, label: 'Upload your PDF', desc: 'Drop any lecture file' },
  { icon: Sparkles, label: 'AI explains it simply', desc: 'Clear, friendly breakdown' },
  { icon: Award, label: 'Get your proof certificate', desc: 'Onchain, timestamped' },
];

const features = [
  {
    icon: MessageCircle,
    title: "explained like you're 10",
    desc: "AI breaks down complex topics into clear, friendly language anyone can follow. No jargon, no confusion.",
  },
  {
    icon: Sparkles,
    title: "practice questions that don't bore you",
    desc: "Fun, conversational exam questions generated from your actual material. Actually enjoy studying.",
  },
  {
    icon: Award,
    title: "proof you can't fake",
    desc: "Every study session gets a timestamped certificate locked onchain via 0G. Share it with anyone.",
  },
];

const testimonials = [
  {
    quote: "I actually understood my microeconomics lecture for the first time. The AI explained it like a friend would.",
    name: "Maya Chen",
    school: "Stanford University",
    avatar: "MC",
  },
  {
    quote: "The practice questions felt like a game, not a chore. And now I have proof I studied for my scholarship.",
    name: "Jordan Williams",
    school: "UCLA",
    avatar: "JW",
  },
  {
    quote: "My professor was skeptical about AI studying tools until I showed him the onchain certificate. He was impressed.",
    name: "Sam Rodriguez",
    school: "MIT",
    avatar: "SR",
  },
];

function PDFVisual() {
  return (
    <div className="relative w-64 h-72 md:w-80 md:h-96 animate-float">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-amber-50 rounded-3xl shadow-2xl transform rotate-3 opacity-60" />
      <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-6 border border-violet-100">
        <div className="w-full h-4 bg-violet-100 rounded-full mb-3" />
        <div className="w-3/4 h-3 bg-gray-100 rounded-full mb-2" />
        <div className="w-5/6 h-3 bg-gray-100 rounded-full mb-2" />
        <div className="w-2/3 h-3 bg-gray-100 rounded-full mb-6" />
        <div className="w-full h-20 bg-gradient-to-br from-violet-50 to-amber-50 rounded-2xl flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-violet-400 animate-pulse" />
        </div>
        <div className="w-full h-16 bg-gradient-to-r from-violet-500 to-amber-400 rounded-2xl flex items-center justify-center animate-pulse-soft">
          <Award className="w-6 h-6 text-white mr-2" />
          <span className="text-white font-semibold text-sm">Verified</span>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-amber-300 to-amber-400 rounded-2xl shadow-lg flex items-center justify-center animate-pulse-soft">
        <Check className="w-8 h-8 text-white" />
      </div>
    </div>
  );
}

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<{[key: string]: boolean}>({});

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-violet-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-amber-400 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StudyProof</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-violet-600 transition-colors font-medium">Students</a>
              <button
                onClick={scrollToHowItWorks}
                className="text-gray-600 hover:text-violet-600 transition-colors font-medium"
              >
                How it works
              </button>
              <Link to="/app" className="btn-primary text-white px-5 py-2.5 rounded-full font-semibold">
                Try it free
              </Link>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-violet-50 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-violet-100 px-4 py-4 space-y-3">
            <a href="#features" className="block py-2 text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#testimonials" className="block py-2 text-gray-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Students</a>
            <button onClick={scrollToHowItWorks} className="block py-2 text-gray-600 font-medium w-full text-left">How it works</button>
            <Link to="/app" className="btn-primary text-white w-full py-3 rounded-full font-semibold mt-2 block text-center">
              Try it free
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left order-2 md:order-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                your lectures,{' '}
                <span className="text-gradient">finally making sense.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed max-w-lg mx-auto md:mx-0">
                upload a pdf. get a clear explanation, practice questions, and onchain proof you actually studied it.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/app" className="btn-primary text-white px-8 py-4 rounded-full font-semibold text-lg text-center">
                  try it free
                </Link>
                <button
                  onClick={scrollToHowItWorks}
                  className="btn-secondary text-violet-600 px-8 py-4 rounded-full font-semibold text-lg flex items-center justify-center gap-2"
                >
                  see how it works
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="order-1 md:order-2 flex justify-center">
              <PDFVisual />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={howItWorksRef} className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-violet-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">how it works</h2>
            <p className="text-gray-600 text-lg">three simple steps to actually understanding your material</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, i) => (
              <div
                key={i}
                data-animate
                id={`step-${i}`}
                className={`card-warm rounded-3xl p-6 md:p-8 text-center transition-all duration-500 ${
                  isVisible[`step-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-8 h-8 text-violet-500" />
                </div>
                <div className="text-sm font-semibold text-violet-500 mb-2">Step {i + 1}</div>
                <h3 className="text-lg font-bold mb-2">{step.label}</h3>
                <p className="text-gray-500 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">built for students who hate studying</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">we get it. that's why we made this feel less like homework and more like getting help from a smart friend.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                data-animate
                id={`feature-${i}`}
                className={`card-feature rounded-3xl p-6 md:p-8 transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${
                  isVisible[`feature-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-amber-400 rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-violet-50/30 to-amber-50/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">students are actually studying</h2>
            <p className="text-gray-600 text-lg">real quotes from real people who finally get it</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                data-animate
                id={`testimonial-${i}`}
                className={`card-warm rounded-3xl p-6 md:p-8 transition-all duration-500 ${
                  isVisible[`testimonial-${i}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-400 to-amber-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{t.name}</div>
                    <div className="text-sm text-gray-500">{t.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card-warm rounded-[2rem] p-8 md:p-12">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              stop rereading the same paragraph.
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-lg mx-auto">
              just upload it. we'll explain it, quiz you, and give you proof you actually did the work.
            </p>
            <Link to="/app" className="btn-primary text-white px-10 py-4 rounded-full font-semibold text-lg inline-block">
              get started free
            </Link>
            <p className="text-sm text-gray-400 mt-4">no credit card needed</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-violet-100 bg-white/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-amber-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">StudyProof</span>
          </Link>
          <p className="text-sm text-gray-500">
            powered by{' '}
            <span className="font-semibold text-violet-600">0G</span>
            {' '}storage layer
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
