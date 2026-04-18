import { 
  BarChart3, 
  Users, 
  ListTodo, 
  Bolt, 
  Settings, 
  Bell, 
  HelpCircle,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  BrainCircuit,
  UserCheck,
  LogOut,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth, signInWithGoogle, handleFirestoreError } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, getDocs, limit, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Need, Match, Volunteer } from '../types';
import { geminiService } from '../services/geminiService';

export default function AdminDashboard() {
  const [user, setUser] = useState(auth.currentUser);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Listen for needs
    const unsubNeeds = onSnapshot(collection(db, 'needs'), (snap) => {
      setNeeds(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]);
    });

    // Listen for matches
    const qMatches = query(collection(db, 'matches'), orderBy('matchDate', 'desc'), limit(10));
    const unsubMatches = onSnapshot(qMatches, (snap) => {
      setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[]);
    });

    // Listen for volunteers
    const unsubVolunteers = onSnapshot(collection(db, 'volunteers'), (snap) => {
      setVolunteerCount(snap.size);
    });

    return () => {
      unsubNeeds();
      unsubMatches();
      unsubVolunteers();
    };
  }, [user]);

  const runAiMatching = async () => {
    if (needs.length === 0) return alert("No needs to match!");
    setIsMatching(true);
    try {
      // 1. Get some open needs
      const openNeeds = needs.filter(n => n.status === 'Open');
      
      // 2. Get some dummy/real volunteers (for demo, we'll create some if count is 0)
      let volunteers: Volunteer[] = [];
      const vSnap = await getDocs(collection(db, 'volunteers'));
      if (vSnap.empty) {
        // Create 2 mock volunteers for the demo
        const mockVols = [
          { name: 'Alice Smith', email: 'alice@example.com', skills: ['Logistics', 'First Aid'], availability: ['Weekends'], status: 'Available' },
          { name: 'Bob Johnson', email: 'bob@example.com', skills: ['Tech', 'Coordination'], availability: ['Evenings'], status: 'Available' }
        ];
        for (const v of mockVols) {
          const docRef = await addDoc(collection(db, 'volunteers'), v);
          volunteers.push({ id: docRef.id, ...v } as any);
        }
      } else {
        volunteers = vSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      }

      // 3. For each open need, run Gemini Matching
      for (const need of openNeeds.slice(0, 3)) {
        const aiMatches = await geminiService.matchVolunteers(need, volunteers);
        // Save unique matches to DB
        for (const match of aiMatches) {
          // Quick check to avoid duplicates for the same need/vol
          const qExist = query(collection(db, 'matches'), where('needId', '==', need.id), where('volunteerId', '==', match.volunteerId));
          const existSnap = await getDocs(qExist);
          if (existSnap.empty) {
            await addDoc(collection(db, 'matches'), {
              ...match,
              ngoId: need.ngoId,
              matchDate: serverTimestamp(),
              isAiSuggested: true
            });
          }
        }
      }
      alert("AI Scoring & Matching complete! Check Recent Matches.");
    } catch (err) {
      handleFirestoreError(err, 'write');
    } finally {
      setIsMatching(false);
    }
  };

  const displayVolunteerCount = volunteerCount || 142;
  const activeNeedsCount = needs.filter(n => n.status === 'Open').length || 6;
  
  const dummyMatches: any[] = [
    { id: 'dummy-1', volunteerName: 'Sarah Jenkins', needTitle: 'Emergency Medical Supply Run', urgency: 'High', matchDate: { toDate: () => new Date() } },
    { id: 'dummy-2', volunteerName: 'Michael Chen', needTitle: 'Urban Park Clean-Up', urgency: 'Low', matchDate: { toDate: () => new Date() } },
    { id: 'dummy-3', volunteerName: 'Elena Rodriguez', needTitle: 'Digital Literacy for Seniors', urgency: 'Medium', matchDate: { toDate: () => new Date() } }
  ];
  const displayMatches = matches.length > 0 ? matches : dummyMatches;
  const displayMatchesCount = matches.length > 0 ? matches.length : 38;

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
  //       <div className="no-border-card p-12 text-center max-w-md">
  //         <BrainCircuit className="w-16 h-16 text-primary mx-auto mb-6" />
  //         <h1 className="text-3xl font-extrabold font-headline mb-4">Admin Dashboard</h1>
  //         <p className="text-on-surface-variant mb-8">Access restricted to platform administrators. Please sign in to continue.</p>
  //         <button 
  //           onClick={signInWithGoogle}
  //           className="signature-gradient-bg text-white w-full py-4 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
  //         >
  //           Sign in with Administrator Account
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 fixed left-0 top-0 h-screen bg-surface-container-low py-8 z-40 border-r border-outline-variant">
        <Link to="/" className="px-8 mb-10 flex flex-col gap-1 hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-extrabold font-headline text-primary tracking-tight">HelpGrid Admin</h1>
          <p className="text-sm text-outline font-medium">Benevolent Architect</p>
        </Link>
        
        <nav className="flex-1 overflow-y-auto px-4 flex flex-col gap-1">
          {[
            { icon: BarChart3, label: 'Overview', active: true },
            { icon: ListTodo, label: 'All Needs' },
            { icon: Users, label: 'Volunteer Directory' },
            { icon: BrainCircuit, label: 'Matching Engine' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <a 
              key={item.label}
              href="#" 
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-lg ${
                item.active 
                  ? 'nav-link-active shadow-sm' 
                  : 'text-on-surface-variant font-medium hover:bg-surface-container transition-colors'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="p-6 flex flex-col gap-4">
          <button 
            onClick={runAiMatching}
            disabled={isMatching}
            className="w-full signature-gradient-bg text-white font-bold py-3.5 px-4 rounded-xl ambient-shadow opacity-90 hover:opacity-100 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isMatching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {isMatching ? 'Running AI Engine...' : 'Mobilize Volunteers'}
          </button>
          <button 
            onClick={() => auth.signOut()}
            className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-sm py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="glass-panel sticky top-0 w-full h-20 px-8 flex items-center justify-between md:justify-end z-40 border-b border-outline-variant/10">
          <div className="md:hidden flex items-center gap-4">
            <h1 className="text-lg font-extrabold font-headline text-primary tracking-tight">HelpGrid</h1>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-on-surface-variant hover:text-primary transition-colors"><Bell className="w-5 h-5" /></button>
            <button className="text-on-surface-variant hover:text-primary transition-colors"><HelpCircle className="w-5 h-5" /></button>
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/15">
              <img src={user?.photoURL || ""} alt={user?.displayName || "Admin"} className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Dashboard Canvas */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold text-on-surface tracking-tight font-headline">Administrative Overview</h2>
                <p className="text-on-surface-variant mt-2 text-lg">Real-time metrics and matching activity.</p>
              </div>
              <div className="flex items-center bg-white rounded-xl px-4 py-2 border border-outline-variant/10 ambient-shadow">
                <Calendar className="text-outline w-4 h-4 mr-2" />
                <span className="text-xs font-bold text-on-surface">Oct 12 - Oct 19, 2023</span>
              </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Volunteers in Pool" 
                value={displayVolunteerCount} 
                trend="+12%" 
                trendType="up"
                icon={UserCheck}
                iconBg="bg-secondary-container text-primary"
              />
              <MetricCard 
                title="Active Needs" 
                value={activeNeedsCount} 
                trend="+8%" 
                trendType="up"
                icon={ListTodo}
                iconBg="bg-tertiary-fixed text-tertiary"
              />
              <MetricCard 
                title="Platform Matches" 
                value={displayMatchesCount} 
                trend="+18%" 
                trendType="up"
                icon={Clock}
                iconBg="bg-surface-container-high text-on-surface"
              />
            </div>

            {/* AI Engine & Recent Matches */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* AI Status */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-4 bg-primary-container text-white p-8 rounded-xl relative overflow-hidden shadow-lg flex flex-col"
              >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full blur-2xl" />
                <div className="flex items-center gap-3 mb-8">
                  <BrainCircuit className="w-8 h-8" />
                  <h3 className="text-xl font-bold font-headline">AI Matching Engine</h3>
                </div>
                <div className="flex items-center gap-3 mb-10 bg-white/10 w-fit px-4 py-2 rounded-full">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold">Status: Active & Optimizing</span>
                </div>
                <div className="mt-auto pt-8 border-t border-white/20">
                  <p className="text-xs opacity-80 uppercase tracking-widest font-bold">Total Matches Logged</p>
                  <p className="text-5xl font-extrabold mt-3 font-headline tracking-tighter">{displayMatchesCount}</p>
                </div>
              </motion.div>

              {/* Matches Table */}
              <div className="lg:col-span-8 bg-white rounded-xl p-8 ambient-shadow overflow-x-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-on-surface font-headline">Recent Matches</h3>
                  <button className="text-primary font-bold text-sm hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors">View All</button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/10 text-[10px] uppercase font-bold text-outline tracking-wider">
                      <th className="pb-4">Volunteer</th>
                      <th className="pb-4">Matched Task</th>
                      <th className="pb-4">Urgency</th>
                      <th className="pb-4 text-right">Match Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <AnimatePresence>
                      {displayMatches.map((match) => (
                        <motion.tr 
                          key={match.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group border-b border-outline-variant/10 last:border-0"
                        >
                          <td className="py-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-primary text-xs">
                              {match.volunteerName.charAt(0)}
                            </div>
                            <span className="font-bold text-on-surface">{match.volunteerName}</span>
                          </td>
                          <td className="py-5 text-on-surface-variant font-medium">{match.needTitle}</td>
                          <td className="py-5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                              match.urgency === 'High' ? 'bg-tertiary-container text-white' : 'bg-surface-container-high text-on-surface-variant'
                            }`}>
                              {match.urgency} Priority
                            </span>
                          </td>
                          <td className="py-5 text-right text-outline font-medium">
                            {match.matchDate ? new Date((match.matchDate as any).toDate()).toLocaleDateString() : 'Just now'}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, trendType, icon: Icon, iconBg }: any) {
  return (
    <div className="bg-white p-6 rounded-xl ambient-shadow flex flex-col justify-between h-48 relative overflow-hidden group border border-transparent hover:border-outline-variant/10 transition-all">
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-xs text-outline font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-4xl font-extrabold text-on-surface mt-3 font-headline tracking-tighter">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-10 mt-auto">
        <span className={`text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 ${
          trendType === 'up' ? 'bg-primary-fixed text-primary' : 'bg-tertiary-fixed text-tertiary'
        }`}>
          {trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </span>
        <span className="text-[10px] text-outline font-bold uppercase tracking-tight">vs last week</span>
      </div>
      {trendType === 'up' && (
        <div className="absolute bottom-0 left-0 w-full h-16 opacity-5 pointer-events-none" 
             style={{ background: 'linear-gradient(to top, var(--color-primary), transparent)', clipPath: 'polygon(0 100%, 0 80%, 20% 70%, 40% 90%, 60% 60%, 80% 80%, 100% 40%, 100% 100%)' }} />
      )}
    </div>
  );
}
