import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { Printer, Shield, Sparkles, Lock, ScanLine, Bell, ArrowRight, Check, Zap, Smartphone, ChevronDown, ChevronUp, Star, LayoutDashboard, FileImage } from 'lucide-react';

// Reusable FadeIn component for scroll animations
function FadeIn({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);

  useEffect(() => {
    setIsHeroLoaded(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
      
      const sections = ['home', 'how-it-works', 'pricing', 'features'];
      let current = 'home';
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 100,
        behavior: 'smooth'
      });
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Printify Free',
      price: 'Free',
      subtitle: 'Everything you need to digitize your print shop.',
      badge: 'Forever Free',
      gradient: 'from-blue-500 to-indigo-400',
      features: [
        'Unlimited QR code scans',
        'Unlimited orders processing',
        'Complete order dashboard',
        'Standard file types (PDF, JPG, PNG)'
      ],
      benefits: [
        'No credit card required',
        'Files are auto-deleted after 24 hours',
        'Community support access',
        'Mobile-friendly customer upload page'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[800px] h-[800px] rounded-full bg-indigo-900/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/10 blur-[150px]" />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTEwIDB2NDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] opacity-50" />
      </div>

      {/* Main Top Nav */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-12 py-6 bg-transparent">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollToSection('home')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Printify
          </span>
        </div>
        <div className="flex items-center space-x-5">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 px-6 py-2.5 text-sm font-semibold text-white bg-white/10 border border-white/10 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <Lock className="w-4 h-4" />
            <span>Shop Owner</span>
          </button>
        </div>
      </nav>

      {/* Sticky Jump Links Nav (Appears on scroll) */}
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${isScrolled ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="flex items-center p-1.5 space-x-1 bg-[#1a1a1d]/90 backdrop-blur-xl rounded-full shadow-2xl border border-white/10">
          <div className="hidden md:flex items-center space-x-1">
            {['How it works', 'Pricing', 'Features'].map((item) => {
              const id = item.toLowerCase().replace(/\s+/g, '-');
              const isActive = activeSection === id;
              return (
                <button
                  key={item}
                  onClick={() => scrollToSection(id)}
                  className={`whitespace-nowrap px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                    isActive ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
          {/* Mobile identifier logo */}
          <div className="md:hidden flex items-center pl-3 pr-2" onClick={() => scrollToSection('home')}>
             <Printer className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="pl-1 pr-1">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center space-x-2 px-6 py-2 text-sm font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/25"
            >
              <Lock className="w-4 h-4" />
              <span>Shop Owner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative z-10 pt-16 md:pt-24 pb-32 px-6 flex flex-col items-center">
        <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${isHeroLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 mb-8 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-sm text-indigo-200">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Power your print shop with next-gen tools</span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-[1.05]">
            <span className="block text-white mb-2">Your print shop,</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent pb-2">
              digitized.
            </span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Stop taking print orders over WhatsApp. Let your customers scan a QR code, upload files, and you manage everything from a beautiful dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="group relative flex items-center justify-center space-x-2 px-8 py-4 text-base font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:-translate-y-0.5"
            >
              <Lock className="w-4 h-4" />
              <span>Shop Owner Login</span>
            </button>
            <button
              onClick={() => navigate('/upload')}
              className="group relative flex items-center justify-center space-x-2 px-8 py-4 text-base font-bold text-white bg-white/10 rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              <FileImage className="w-4 h-4" />
              <span>Try Customer Portal</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          {/* Trust Markers */}
          <div className="mt-14 flex flex-col items-center opacity-80">
            <div className="flex -space-x-2 mb-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0a0a0b] bg-gray-800 flex items-center justify-center overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=transparent`} alt="avatar" className="w-full h-full" />
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-1 text-yellow-500 mb-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-gray-400 font-medium">Trusted by 100+ local print shops</p>
          </div>
        </div>
      </section>

      {/* Alternating Feature Tiles with Mockups */}
      <section id="how-it-works" className="relative z-10 py-32 px-6 bg-gradient-to-b from-[#0a0a0b] via-[#111116] to-[#0a0a0b]">
        <div className="max-w-6xl mx-auto space-y-32">
          
          {/* Tile 1: Customer Upload Flow (Mobile Mockup) */}
          <FadeIn>
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 order-2 md:order-1">
                <h3 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
                  Tackle busy hours with<br /><span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">QR-based uploads</span>
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Place your unique QR code at the counter. Customers simply scan it with their phone camera to open your upload portal instantly — no apps required.
                </p>
                <ul className="space-y-5">
                  <li className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                      <ScanLine className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Instant access</h4>
                      <p className="text-sm text-gray-400">Opens directly via smartphone camera.</p>
                    </div>
                  </li>
                  <li className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">No account needed</h4>
                      <p className="text-sm text-gray-400">Frictionless experience for customers.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="flex-1 order-1 md:order-2 relative w-full flex justify-center">
                {/* CSS Mobile Phone Mockup */}
                <div className="relative w-[280px] h-[580px] bg-black rounded-[3rem] border-[8px] border-[#2a2a30] shadow-2xl overflow-hidden shadow-blue-900/20">
                  <div className="absolute top-0 inset-x-0 h-6 bg-[#2a2a30] rounded-b-3xl w-40 mx-auto" /> {/* Notch */}
                  
                  {/* Fake App Content */}
                  <div className="w-full h-full bg-[#121212] p-6 pt-12 flex flex-col">
                    <div className="flex items-center space-x-2 mb-8">
                      <Printer className="w-6 h-6 text-indigo-500" />
                      <span className="font-bold text-lg text-white">Your Print Shop</span>
                    </div>
                    <div className="border-2 border-dashed border-gray-700 rounded-2xl flex-1 flex flex-col items-center justify-center text-center p-6 bg-gray-900/50">
                      <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4">
                        <FileImage className="w-8 h-8 text-indigo-400" />
                      </div>
                      <p className="font-medium text-white">Tap to upload files</p>
                      <p className="text-xs text-gray-500 mt-2">Support PDF, JPG, PNG</p>
                    </div>
                    <div className="mt-6 space-y-4">
                      <div className="h-12 bg-gray-800 rounded-xl w-full animate-pulse" />
                      <div className="h-12 bg-indigo-600 rounded-xl w-full" />
                    </div>
                  </div>
                </div>
                {/* Decorative floating QR code */}
                <div className="absolute -left-6 bottom-12 w-24 h-24 bg-white p-2 rounded-2xl shadow-xl shadow-black/50 rotate-[-10deg] animate-bounce" style={{ animationDuration: '4s' }}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example`} alt="QR Code" className="w-full h-full" />
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Tile 2: Dashboard Flow (Desktop Mockup) */}
          <FadeIn delay={200}>
            <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24">
              <div className="flex-1 relative w-full">
                 {/* CSS Desktop Browser Mockup */}
                 <div className="w-full rounded-2xl bg-[#1e1e24] border border-gray-800 shadow-2xl overflow-hidden shadow-violet-900/20">
                    <div className="h-10 bg-[#2a2a30] flex items-center px-4 space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div className="ml-4 h-5 bg-black/30 rounded-md flex-1 max-w-xs" />
                    </div>
                    <div className="p-6 bg-[#0a0a0b] h-80 flex">
                      {/* Sidebar fake */}
                      <div className="w-16 h-full border-r border-gray-800 flex flex-col items-center py-4 space-y-6">
                        <Printer className="w-6 h-6 text-indigo-500" />
                        <LayoutDashboard className="w-5 h-5 text-gray-500" />
                        <Bell className="w-5 h-5 text-gray-500" />
                      </div>
                      {/* Main content fake */}
                      <div className="flex-1 pl-6 pt-2">
                        <div className="h-6 w-32 bg-gray-800 rounded mb-8" />
                        <div className="space-y-4">
                          {[1,2,3].map(i => (
                            <div key={i} className="h-14 bg-[#141419] rounded-xl border border-gray-800 flex items-center px-4 justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-gray-800 rounded-lg" />
                                <div className="space-y-2">
                                  <div className="h-2.5 w-24 bg-gray-700 rounded" />
                                  <div className="h-2 w-16 bg-gray-800 rounded" />
                                </div>
                              </div>
                              <div className="h-6 w-20 bg-indigo-500/20 rounded-full border border-indigo-500/30" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
              <div className="flex-1">
                <h3 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">
                  Manage everything from a<br /><span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">unified dashboard</span>
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Say goodbye to scattered WhatsApp messages and emails. See every pending print job, customer details, and file specifications in one clean interface.
                </p>
                <ul className="space-y-5">
                  <li className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                      <Bell className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">Real-time alerts</h4>
                      <p className="text-sm text-gray-400">Get notified instantly when new orders arrive.</p>
                    </div>
                  </li>
                  <li className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium">One-click status updates</h4>
                      <p className="text-sm text-gray-400">Move orders from 'Printing' to 'Ready' instantly.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* Plans Section (Google AI style) */}
      <section id="pricing" className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">
                Choose the right plan for your shop
              </h2>
              <p className="text-gray-400 text-lg">Simple, transparent pricing. Upgrade anytime.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 max-w-lg mx-auto">
            {plans.map((plan, idx) => (
              <FadeIn key={plan.id} delay={idx * 150}>
                <div className="relative rounded-3xl bg-[#121215] border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl">
                  {/* Highlight Glow */}
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${plan.gradient}`} />
                  
                  <div className="p-8 sm:p-10">
                    <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300 mb-6">
                      {plan.badge}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="text-4xl font-bold text-white mb-4">{plan.price}</div>
                    <p className="text-gray-400 text-sm mb-8 h-10">{plan.subtitle}</p>

                    <div className="mb-8">
                      <p className="text-sm font-semibold text-white mb-4">Includes:</p>
                      <ul className="space-y-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start space-x-3 text-sm text-gray-300">
                            <Check className="w-5 h-5 text-white shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => navigate('/login')}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-sm font-bold rounded-full transition-all duration-300 bg-white text-black hover:bg-gray-100"
                    >
                      <span>Shop Owner Login</span>
                    </button>
                  </div>

                  {/* Expandable Benefits Drawer */}
                  <div className="border-t border-white/5 bg-[#0a0a0b]/50">
                    <button
                      onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                      className="w-full flex items-center justify-between px-8 py-4 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                      <span>{expandedPlan === plan.id ? 'Hide' : 'View'} plan benefits</span>
                      {expandedPlan === plan.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedPlan === plan.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="px-8 pb-8 pt-2">
                        <ul className="space-y-3">
                          {plan.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start space-x-3 text-sm text-gray-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-2 shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section id="features" className="relative z-10 py-32 px-6 bg-[#080809] border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Everything you need to scale
              </h2>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Secure Handling', desc: 'Files are encrypted and automatically deleted after 24 hours.' },
              { icon: Zap, title: 'Instant Pricing', desc: 'Customers see real-time price estimates based on your rates.' },
              { icon: Printer, title: 'Print Options', desc: 'Support for color, B&W, duplex, and custom paper sizes.' }
            ].map((feature, i) => (
              <FadeIn key={i} delay={i * 100}>
                <div className="p-8 rounded-3xl bg-[#111115] border border-white/5 hover:border-white/10 transition-colors hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{feature.title}</h4>
                  <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative z-10 py-32 px-6 bg-[#0a0a0b]">
        <FadeIn>
          <div className="max-w-5xl mx-auto text-center bg-gradient-to-br from-[#1a1a24] to-[#0a0a0b] rounded-[3rem] p-12 md:p-24 border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 blur-[120px] rounded-full" />
            
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 relative z-10 text-white">
              Ready to manage your print shop?
            </h2>
            <button
              onClick={() => navigate('/login')}
              className="relative z-10 inline-flex items-center space-x-2 px-10 py-5 text-lg font-bold text-white bg-indigo-600 rounded-full hover:bg-indigo-500 transition-all duration-300 hover:scale-105 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
            >
              <Lock className="w-5 h-5" />
              <span>Shop Owner Login</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </FadeIn>
      </section>

      {/* WIDE MINIMAL "PRINTED RECEIPT" FOOTER */}
      <div className="relative z-0 pt-20 px-6 flex justify-center pb-0 bg-transparent overflow-hidden">
        {/* The printer slot/shadow */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-6xl h-12 bg-black rounded-full shadow-[0_20px_40px_rgba(0,0,0,1)] z-20 blur-md pointer-events-none" />
        
        <FadeIn delay={100} className="w-full max-w-5xl">
          <footer className="relative bg-[#f4f4f0] text-black font-mono px-8 py-6 pb-8 rounded-t-sm shadow-2xl mx-auto transform-gpu origin-bottom">
            {/* Serrated top edge */}
            <div className="absolute top-[-8px] left-0 w-full h-[8px]" 
                 style={{
                   background: 'linear-gradient(135deg, #f4f4f0 25%, transparent 25%) -8px 0, linear-gradient(225deg, #f4f4f0 25%, transparent 25%) -8px 0, linear-gradient(315deg, #f4f4f0 25%, transparent 25%), linear-gradient(45deg, #f4f4f0 25%, transparent 25%)',
                   backgroundSize: '16px 16px',
                   backgroundColor: 'transparent'
                 }} 
            />

            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Logo Section */}
              <div className="flex items-center space-x-3 shrink-0">
                <Printer className="w-6 h-6 text-black" strokeWidth={2} />
                <h2 className="text-xl font-bold tracking-widest">* PRINTIFY *</h2>
              </div>
              
              {/* Links Section */}
              <div className="flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm font-semibold">
                <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollToSection('how-it-works'); }} className="hover:underline">How it works</a>
                <span className="hidden sm:inline">|</span>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToSection('pricing'); }} className="hover:underline">Pricing</a>
                <span className="hidden sm:inline">|</span>
                <a href="#features" onClick={(e) => { e.preventDefault(); scrollToSection('features'); }} className="hover:underline">Features</a>
                <span className="hidden sm:inline">|</span>
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:underline">Support</a>
              </div>

              {/* Copyright Section */}
              <div className="flex flex-col items-end text-xs text-gray-500 font-medium shrink-0 text-center md:text-right border-t-2 md:border-t-0 border-dashed border-gray-400 w-full md:w-auto pt-4 md:pt-0">
                <span>© {new Date().getFullYear()} Printify</span>
                <span>All rights reserved.</span>
              </div>
            </div>
            
            {/* Torn bottom edge */}
            <div className="absolute bottom-[-8px] left-0 w-full h-[8px]" 
                 style={{
                   background: 'linear-gradient(135deg, transparent 25%, #f4f4f0 25%) -8px 0, linear-gradient(225deg, transparent 25%, #f4f4f0 25%) -8px 0, linear-gradient(315deg, transparent 25%, #f4f4f0 25%), linear-gradient(45deg, transparent 25%, #f4f4f0 25%)',
                   backgroundSize: '16px 16px',
                   backgroundColor: 'transparent'
                 }} 
            />
          </footer>
        </FadeIn>
      </div>
    </div>
  );
}
