import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  BarChart3, 
  Settings, 
  UserPlus, 
  Search, 
  Bell, 
  Plus,
  ChevronRight,
  Send,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth, signInWithGoogle, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Need } from '../types';

export default function NGOPortal() {
  const [selectedUrgency, setSelectedUrgency] = useState('Medium');
  const [user, setUser] = useState(auth.currentUser);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateRequired, setDateRequired] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    // In public mode, we fetch all needs if no user is logged in
    const q = user 
      ? query(collection(db, 'needs'), where('ngoId', '==', user.uid), orderBy('createdAt', 'desc'))
      : query(collection(db, 'needs'), orderBy('createdAt', 'desc'), limit(20));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setNeeds(docs);
    }, (err) => {
      console.error("Snapshot error:", err);
    });
    
    return () => unsub();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'needs'), {
        title,
        description,
        location,
        dateRequired,
        urgency: selectedUrgency,
        ngoId: user?.uid || 'public-demo-ngo',
        status: 'Open',
        volunteerCount: 0,
        maxVolunteers: 10,
        createdAt: serverTimestamp(),
        requiredSkills: ['Logistics', 'General'] // Mock skills for now
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setLocation('');
      setDateRequired('');
      alert("Need broadcasted successfully!");
    } catch (err) {
      handleFirestoreError(err, 'create', 'needs');
    } finally {
      setLoading(false);
    }
  };

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
  //       <div className="no-border-card p-12 text-center max-w-md">
  //         <ListTodo className="w-16 h-16 text-primary mx-auto mb-6" />
  //         <h1 className="text-3xl font-extrabold font-headline mb-4">NGO Portal</h1>
  //         <p className="text-on-surface-variant mb-8">Sign in to broadcast community needs and manage your volunteer network.</p>
  //         <button 
  //           onClick={signInWithGoogle}
  //           className="signature-gradient-bg text-white w-full py-4 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
  //         >
  //           Sign in with Google
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 fixed left-0 top-0 h-screen bg-surface-container-low py-8 pr-4 z-40 border-r border-outline-variant">
        <Link to="/" className="px-6 mb-10 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg">
            <ListTodo className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold font-headline text-primary tracking-tight">HelpGrid</h1>
            <p className="text-[10px] text-outline font-bold uppercase tracking-wider">NGO Portal</p>
          </div>
        </Link>
        
        <nav className="flex-1 flex flex-col gap-2">
          {[
            { icon: LayoutDashboard, label: 'Dashboard' },
            { icon: ListTodo, label: 'Needs Registry', active: true },
            { icon: Users, label: 'Volunteer Pool' },
            { icon: BarChart3, label: 'Analytics' },
          ].map((item) => (
            <a 
              key={item.label}
              href="#" 
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-r-lg ${
                item.active 
                  ? 'nav-link-active shadow-sm' 
                  : 'text-outline hover:bg-white/50'
              }`}
            >
              {item.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
              <item.icon className="w-5 h-5" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto px-4 flex flex-col gap-4">
          <button 
            onClick={() => auth.signOut()}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-outline hover:bg-white/50 rounded-r-full transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
          <button className="w-full bg-secondary-container text-on-secondary-container py-3 px-4 rounded-xl font-medium text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <UserPlus className="w-4 h-4" />
            Invite Team
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 flex flex-col w-full">
        {/* Top Navbar */}
        <header className="sticky top-0 w-full z-30 bg-background/80 backdrop-blur-xl h-20 px-8 flex items-center justify-between border-b border-outline-variant/10">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search needs, volunteers..." 
              className="w-full bg-surface-container-highest border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all placeholder:text-outline"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-outline hover:bg-surface-container-high rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-background" />
            </button>
            <div className="w-px h-8 bg-outline-variant/30 md:block hidden" />
            <button className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Post Need
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border-2 border-surface-container-high" />
          </div>
        </header>

        <main className="flex-1 px-8 lg:px-12 py-10 max-w-7xl mx-auto w-full">
          <div className="mb-12">
            <div className="flex items-center gap-2 text-sm text-outline mb-3 font-medium">
              <span className="hover:text-primary cursor-pointer transition-colors">Needs Registry</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-on-surface">Post New Need</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold font-headline tracking-tight text-on-surface mb-4">Post Community Need</h2>
            <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">Broadcast your urgent requirements to our vetted volunteer network.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Form Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 no-border-card p-10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              
              <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-8">
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Need Title</label>
                  <input 
                    required
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Emergency Food Distribution Support"
                    className="w-full bg-surface-container-highest border-b-2 border-outline/30 focus:border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-4 py-3.5 focus:ring-0 focus:bg-primary/5 transition-all outline-none font-medium text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Detailed Description</label>
                  <textarea 
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the tasks, physical requirements..."
                    className="w-full bg-surface-container-highest border-b-2 border-outline/30 focus:border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg px-4 py-3.5 focus:ring-0 focus:bg-primary/5 transition-all outline-none text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                      <input 
                        required
                        type="text" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Address or neighborhood"
                        className="w-full bg-surface-container-highest border-b-2 border-outline/30 focus:border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg pl-12 pr-4 py-3.5 focus:ring-0 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-on-surface mb-2">Date Required</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                      <input 
                        required
                        type="date" 
                        value={dateRequired}
                        onChange={(e) => setDateRequired(e.target.value)}
                        className="w-full bg-surface-container-highest border-b-2 border-outline/30 focus:border-primary border-t-0 border-l-0 border-r-0 rounded-t-lg pl-12 pr-4 py-3.5 focus:ring-0 transition-all outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-3">Urgency Level</label>
                  <div className="flex flex-wrap gap-2 bg-surface-container-low p-1 rounded-xl w-fit">
                    {['Low', 'Medium', 'High'].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedUrgency(lvl)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                          selectedUrgency === lvl 
                            ? 'bg-white text-on-surface shadow-sm' 
                            : 'text-outline hover:bg-white/50'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${
                          lvl === 'High' ? 'bg-tertiary-container' : lvl === 'Medium' ? 'bg-tertiary-fixed-dim' : 'bg-secondary-fixed-dim'
                        }`} />
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <button type="button" className="px-6 py-3 font-semibold text-primary hover:bg-surface-container-high rounded-xl transition-colors">Save Draft</button>
                  <button 
                    disabled={loading}
                    type="submit" 
                    className={`signature-gradient-bg text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Processing...' : 'Broadcast Need'}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>

            {/* Sidebar Stats */}
            <div className="flex flex-col gap-8">
              <div className="bg-surface-container-low rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2 flex items-center gap-2">
                  <Bell className="text-primary w-5 h-5" />
                  Network Status
                </h3>
                <p className="text-sm text-on-surface-variant mb-4 font-medium">
                  You currently have <strong className="text-primary">{needs.length}</strong> active needs broadcasted. Response rate is high today.
                </p>
                <a href="#" className="text-primary font-bold text-sm flex items-center gap-1 group hover:gap-2 transition-all">
                  View Analytics <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div>
                <h4 className="font-headline font-bold text-base text-on-surface mb-4 px-2 tracking-tight">Recent Broadcasts</h4>
                <div className="flex flex-col gap-3">
                  <AnimatePresence>
                    {needs.map((need) => (
                      <motion.div 
                        key={need.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        whileHover={{ scale: 1.02 }}
                        className="no-border-card p-4 flex flex-col gap-2 cursor-pointer transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            need.urgency === 'High' ? 'bg-tertiary-container text-white' : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {need.urgency} Priority
                          </span>
                          <span className="text-xs text-outline">
                            {need.createdAt ? new Date((need.createdAt as any).toDate()).toLocaleDateString() : 'Just now'}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-on-surface">{need.title}</h5>
                        <div className="flex items-center gap-4 text-xs">
                           <span className={`flex items-center gap-1 font-medium ${need.volunteerCount >= need.maxVolunteers ? 'text-primary' : 'text-on-surface-variant'}`}>
                             {need.volunteerCount >= need.maxVolunteers ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                             {need.volunteerCount}/{need.maxVolunteers} Filled
                           </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {needs.length === 0 && (
                    <div className="p-8 text-center text-outline text-sm">No needs broadcasted yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}
