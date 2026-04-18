import { 
  User, 
  ListTodo, 
  Settings, 
  Filter, 
  MapPin, 
  Globe, 
  Clock,
  ExternalLink,
  ShoppingBag,
  Heart,
  Zap,
  Calendar,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth, signInWithGoogle, handleFirestoreError } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy, updateDoc, doc, increment, getDoc, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Need } from '../types';

export default function VolunteerPortal() {
  const [user, setUser] = useState(auth.currentUser);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Seed data if empty
    const seedData = async () => {
      const q = query(collection(db, 'needs'), where('status', '==', 'Open'));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        const dummyTasks = [
          {
            title: "Community Kitchen Service",
            description: "Help prepare and serve nutritious meals to community members in need. No experience required, just a willingness to help.",
            location: "Downtown Metro Center",
            urgency: "High",
            status: "Open",
            requiredSkills: ["Food Prep", "Service"],
            dateRequired: "2026-04-20",
            ngoId: "demo-ngo-1",
            volunteerCount: 2,
            maxVolunteers: 10,
            createdAt: serverTimestamp()
          },
          {
            title: "Digital Literacy for Seniors",
            description: "Teach basic smartphone and computer skills to senior citizens. Help them stay connected with their families in the digital age.",
            location: "North District Library",
            urgency: "Medium",
            status: "Open",
            requiredSkills: ["Tech Support", "Patience"],
            dateRequired: "2026-04-22",
            ngoId: "demo-ngo-2",
            volunteerCount: 0,
            maxVolunteers: 5,
            createdAt: serverTimestamp()
          },
          {
            title: "Urban Park Clean-Up",
            description: "Join us for a morning of landscaping and restoration at Riverside Park. Tools and refreshments provided.",
            location: "East Riverside Park",
            urgency: "Low",
            status: "Open",
            requiredSkills: ["Gardening", "Maintenance"],
            dateRequired: "2026-04-25",
            ngoId: "demo-ngo-3",
            volunteerCount: 5,
            maxVolunteers: 20,
            createdAt: serverTimestamp()
          }
        ];

        for (const task of dummyTasks) {
          await addDoc(collection(db, 'needs'), task);
        }
      }
    };
    seedData();

    // We want all open needs for the volunteer to browse
    const q = query(
      collection(db, 'needs'), 
      where('status', '==', 'Open'),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setNeeds(docs);
      setLoading(false);
    }, (err) => {
      console.error("Snapshot error:", err);
      setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  const handleJoin = async (need: Need) => {
    if (need.volunteerCount >= need.maxVolunteers) return alert("This task is already filled!");
    
    setJoiningId(need.id!);
    try {
      // 1. Create a match record
      await addDoc(collection(db, 'matches'), {
        volunteerId: user?.uid || 'public-demo-volunteer',
        volunteerName: user?.displayName || 'Public Guest Volunteer',
        ngoId: need.ngoId,
        needId: need.id,
        needTitle: need.title,
        urgency: need.urgency,
        matchDate: serverTimestamp(),
        confidenceScore: 0.95 // Direct join is high confidence
      });

      // 2. Update the need's volunteer count
      const needRef = doc(db, 'needs', need.id!);
      await updateDoc(needRef, {
        volunteerCount: increment(1)
      });

      // 3. Optional: Check if need is now filled
      const updatedSnap = await getDoc(needRef);
      if (updatedSnap.exists() && updatedSnap.data().volunteerCount >= updatedSnap.data().maxVolunteers) {
        await updateDoc(needRef, { status: 'Filled' });
      }

      alert(`Successfully joined: ${need.title}!`);
    } catch (err) {
      handleFirestoreError(err, 'write');
    } finally {
      setJoiningId(null);
    }
  };

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
  //       <div className="no-border-card p-12 max-w-md">
  //         <Heart className="w-16 h-16 text-primary mx-auto mb-6" />
  //         <h1 className="text-3xl font-extrabold font-headline mb-4">Volunteer Portal</h1>
  //         <p className="text-on-surface-variant mb-8">Join HelpGrid to discover high-impact volunteer opportunities tailored to your skills.</p>
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
    <div className="flex min-h-screen bg-background text-on-surface">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 fixed left-0 top-0 h-screen bg-surface-container-low py-8 pr-4 z-40 border-r border-outline-variant">
        <Link to="/" className="px-6 mb-10 flex flex-col gap-1 hover:opacity-80 transition-opacity">
          <h1 className="text-xl font-extrabold font-headline text-primary tracking-tight">HelpGrid</h1>
          <p className="text-xs text-outline font-medium">Volunteer Portal</p>
        </Link>
        
        <nav className="flex-1 flex flex-col gap-1">
          {[
            { icon: User, label: 'My Profile' },
            { icon: ListTodo, label: 'Available Tasks', active: true },
            { icon: Zap, label: 'My Skills' },
            { icon: Calendar, label: 'Availability' },
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
              {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />}
              <item.icon className="w-5 h-5" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-auto px-4 pb-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-3 mb-4 ambient-shadow overflow-hidden">
            <img src={user?.photoURL || ""} alt={user?.displayName || "Volunteer"} className="w-10 h-10 rounded-full bg-surface-container-high object-cover" />
            <div>
              <div className="font-bold text-sm text-on-surface truncate w-32">{user?.displayName || 'Guest User'}</div>
              <div className="flex items-center gap-1 text-[10px] text-primary font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available
              </div>
            </div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs py-2.5 rounded-lg transition-colors mb-2"
          >
            Logout
          </button>
          <button className="w-full border border-primary/20 text-primary font-semibold text-xs py-2.5 rounded-lg transition-colors">
            Update Skills
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-60 px-8 lg:px-12 py-12 max-w-7xl mx-auto w-full">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold font-headline text-on-surface tracking-tight mb-3">Available Tasks</h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">Discover high-impact opportunities in your area. Your skills are needed.</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest p-1.5 rounded-xl shadow-sm">
            <button className="bg-primary text-white px-5 py-2 rounded-lg font-medium text-sm">All Tasks</button>
            <button className="text-on-surface-variant hover:bg-surface-container-high px-5 py-2 rounded-lg font-medium text-sm transition-colors">Recommended</button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {needs.map((need, idx) => (
              <motion.div 
                key={need.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
                className={`no-border-card p-8 flex flex-col justify-between group relative overflow-hidden ${
                  need.urgency === 'High' ? 'lg:col-span-2 md:col-span-2' : ''
                }`}
              >
                {need.urgency === 'High' && <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary-container" />}
                
                <div className="flex justify-between items-start mb-6 gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`${
                        need.urgency === 'High' ? 'bg-tertiary-container/10 text-tertiary-container' : 'bg-surface-container-high text-on-surface-variant'
                      } px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                        {need.urgency} Priority
                      </span>
                      <span className="text-outline text-xs flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" /> {need.dateRequired}
                      </span>
                    </div>
                    <h3 className={`font-bold text-on-surface mb-3 leading-tight group-hover:text-primary transition-colors ${
                      need.urgency === 'High' ? 'text-2xl lg:text-3xl' : 'text-lg'
                    }`}>
                      {need.title}
                    </h3>
                    <p className="text-on-surface-variant text-sm max-w-lg leading-relaxed line-clamp-3">
                      {need.description}
                    </p>
                  </div>
                  <div className={`rounded-xl bg-surface-container-high flex items-center justify-center shrink-0 ${
                    need.urgency === 'High' ? 'w-16 h-16' : 'w-12 h-12'
                  }`}>
                    {need.urgency === 'High' ? <ShoppingBag className="w-8 h-8 text-primary" /> : <Heart className="w-6 h-6 text-primary" />}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mt-auto">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant font-medium">
                      <MapPin className="w-4 h-4" /> {need.location}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {need.requiredSkills?.map(tag => (
                        <span key={tag} className="bg-surface-container-low text-on-surface px-3 py-1 rounded-full text-[10px] font-bold uppercase">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button 
                    disabled={joiningId === need.id}
                    onClick={() => handleJoin(need)}
                    className="signature-gradient-bg text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-95 shrink-0 disabled:opacity-50"
                  >
                    {joiningId === need.id ? 'Joining...' : 'Join Task'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <div className="col-span-full py-20 text-center text-outline font-medium animate-pulse">
              Scanning HelpGrid for urgent community needs...
            </div>
          )}
          
          {!loading && needs.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="text-outline mb-4">No open tasks found. Check back soon!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

