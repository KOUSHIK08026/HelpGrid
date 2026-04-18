import { motion } from 'motion/react';
import { ArrowRight, Globe, HeartHandshake, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Globe className="text-primary w-8 h-8" />
            <span className="text-2xl font-bold tracking-tighter text-primary font-headline">HelpGrid</span>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <Link to="/ngo" className="text-outline font-medium hover:text-primary transition-colors">NGO Portal</Link>
            <Link to="/volunteer" className="text-outline font-medium hover:text-primary transition-colors">Volunteer Portal</Link>
            <Link to="/admin" className="text-outline font-medium hover:text-primary transition-colors font-bold border-l border-outline-variant pl-8">Admin Dashboard</Link>
          </nav>
          <div className="hidden md:block">
            <Link 
              to="/volunteer"
              className="signature-gradient-bg text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        <section className="relative min-h-[90vh] flex items-center bg-surface-container-low overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-container/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          
          <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10 py-20 lg:py-0">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-6 flex flex-col gap-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-full w-fit ambient-shadow text-primary font-medium text-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Connecting 500+ NGOs globally
              </div>
              <h1 className="text-5xl lg:text-7xl font-headline font-extrabold text-on-surface leading-[1.1] tracking-tight">
                Right help, <br />
                <span className="signature-gradient-text">right place,</span><br />
                right time.
              </h1>
              <p className="text-lg lg:text-xl text-on-surface-variant leading-relaxed max-w-lg">
                We bridge the gap between crucial NGO initiatives and skilled volunteers. An architectural approach to humanitarian logistics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link 
                  to="/ngo"
                  className="signature-gradient-bg text-white px-8 py-4 rounded-lg font-medium text-center hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  I'm an NGO
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/volunteer"
                  className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-lg font-medium text-center hover:bg-secondary-fixed-dim transition-colors active:scale-95"
                >
                  I'm a Volunteer
                </Link>
                <Link 
                  to="/admin"
                  className="bg-surface-container-high text-on-surface px-8 py-4 rounded-lg font-medium text-center border border-outline-variant hover:bg-surface-container-highest transition-colors active:scale-95"
                >
                  Admin Access
                </Link>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6 relative h-[600px] hidden lg:block"
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-xl overflow-hidden ambient-shadow z-10">
                <img 
                  src="https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Volunteers collaborating on community project" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Stat Card */}
              <div className="absolute left-0 bottom-[10%] w-[280px] bg-surface-container-lowest p-6 rounded-xl ambient-shadow z-20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center text-white">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-on-surface">Live Impact</h3>
                    <p className="text-sm text-on-surface-variant">Last 24 hours</p>
                  </div>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-headline font-extrabold text-primary tracking-tight">1,240</span>
                  <span className="text-sm text-on-surface-variant pb-1">hours logged</span>
                </div>
              </div>

              {/* Need Card */}
              <div className="absolute left-10 top-[15%] w-[240px] bg-surface-container-lowest p-5 rounded-xl ambient-shadow z-20">
                <div className="inline-flex px-2 py-1 bg-tertiary-container text-white rounded text-xs font-bold mb-3 uppercase tracking-wide">
                  High Priority
                </div>
                <h4 className="font-headline font-bold text-on-surface text-sm mb-1">Medical Supplies Sort</h4>
                <p className="text-xs text-on-surface-variant mb-3">Downtown Hub • Starts in 2h</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-surface-container-lowest bg-surface-container-high" />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-primary cursor-pointer hover:underline">Join</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-primary w-6 h-6" />
              <span className="text-xl font-bold text-primary font-headline">HelpGrid</span>
            </div>
            <p className="text-sm text-outline max-w-xs">
              © 2026 HelpGrid. Empowering impact through architectural design.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="#" className="text-sm text-outline hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-outline hover:text-primary transition-colors">Terms of Service</a>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/ngo" className="text-sm text-outline hover:text-primary transition-colors">NGO Portal</Link>
            <Link to="/volunteer" className="text-sm text-outline hover:text-primary transition-colors">Volunteer Portal</Link>
            <Link to="/admin" className="text-sm text-outline hover:text-primary transition-colors font-bold">Admin Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
