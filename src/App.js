\import React, { useState, useEffect, useRef } from 'react';
// Corrected import syntax for lucide-react, added Play for videos
import { Menu, X, MessageSquare, Heart, BookOpen, TrendingUp, Instagram, Phone, Mail, Send, FileText, Wind, Smile, Music, Activity, Play, LifeBuoy, AlertCircle, Home, Brain, MessageSquareText, Shield, Dribbble } from 'lucide-react'; // Added more icons for crisis lines

// Define navLinks globally so it can be used by App component for routing
const appNavLinks = [
  { name: 'Home', page: 'home' },
  { name: 'AI Chat', page: 'ai-chat' },
  { name: 'Wellness Tools', page: 'wellness-tools' },
  { name: 'Journal', page: 'journal' },
  { name: 'Mood Tracker', page: 'mood-tracker' },
  { name: 'Summary', page: 'summary' },
  { name: 'Contact', page: 'contact' }, // Keep Contact in navLinks
];

// Initialize Supabase Client with your actual URL and Key
const supabaseUrl = "https://koewtjukwszehdeqmyjf.supabase.co"; // Your actual Supabase Project URL
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZXd0anVrd3N6ZWhkZXFteWpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDc4NzgsImV4cCI6MjA2ODg4Mzg3OH0.X-D5dC5tYrOwgSwV01tYYt8wUYD_nXpg2NETbXhxhZQ"; // Your actual Supabase Anon Key

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('home'); // This state controls which page is shown
  const [showFeatureOptions, setShowFeatureOptions] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState(null); // State to hold the Supabase client instance

  // OneSignal Integration for Push Notifications
  // IMPORTANT: Replace "YOUR_ONESIGNAL_APP_ID_HERE" and "YOUR_SAFARI_WEB_ID_HERE" with your actual OneSignal IDs
  useEffect(() => {
    if (!window.OneSignal) {
      const script = document.createElement('script');
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.async = true;
      script.onload = () => {
        if (window.OneSignal) {
          window.OneSignal.init({
            appId: "YOUR_ONESIGNAL_APP_ID_HERE", // Replace with your OneSignal App ID
            safari_web_id: "YOUR_SAFARI_WEB_ID_HERE", // Replace with your OneSignal Safari Web ID
            notifyButton: { enable: true },
            allowLocalhostAsSecureOrigin: true,
          });
          console.log("OneSignal script loaded and initialized.");
        }
      };
      document.head.appendChild(script);
    } else {
      console.log("OneSignal already present, initializing.");
      window.OneSignal.init({
        appId: "YOUR_ONESIGNAL_APP_ID_HERE", // Replace with your OneSignal App ID
        safari_web_id: "YOUR_SAFARI_WEB_ID_HERE", // Replace with your OneSignal Safari Web ID
        notifyButton: { enable: true },
        allowLocalhostAsSecureOrigin: true,
      });
    }
  }, []);

  // Supabase Client Initialization and Auth State Listener
  useEffect(() => {
    // Dynamically load Supabase client library from CDN
    if (!window.supabase) {
      const script = document.createElement('script');
      // Using a specific stable version to avoid unexpected breaking changes from 2.x.x
      script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js";
      script.async = true;
      script.onload = () => {
        if (window.supabase && window.supabase.createClient) {
          // Use the directly defined supabaseUrl and supabaseAnonKey
          const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
          setSupabaseClient(client);
          console.log("Supabase client loaded and initialized via CDN.");
        } else {
          console.error("Supabase client or createClient method not found on window after script load.");
        }
      };
      script.onerror = (e) => {
        console.error("Failed to load Supabase CDN script:", e);
      };
      document.head.appendChild(script);
    } else {
      // If already loaded (e.g., from a previous render or external script)
      // Use the directly defined supabaseUrl and supabaseAnonKey
      const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
      setSupabaseClient(client);
      console.log("Supabase client already present and initialized.");
    }
  }, []); // Run once on mount to load Supabase client

  // Supabase Auth State Listener (depends on supabaseClient being set)
  useEffect(() => {
    if (!supabaseClient) {
      console.log("Waiting for Supabase client to be initialized for auth listener...");
      return;
    }

    // Correctly get the subscription object from onAuthStateChange
    const { data: { subscription: authSubscription } = {} } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUserId(session.user.id);
        console.log("Supabase User ID:", session.user.id);
      } else {
        let anonSessionId = localStorage.getItem('anonSessionId');
        if (!anonSessionId) {
          anonSessionId = crypto.randomUUID();
          localStorage.setItem('anonSessionId', anonSessionId);
        }
        setUserId(anonSessionId);
        console.log("Using anonymous session ID:", anonSessionId);
      }
      setIsAuthReady(true);
    });

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
      } else {
        let anonSessionId = localStorage.getItem('anonSessionId');
        if (!anonSessionId) {
          anonSessionId = crypto.randomUUID();
          localStorage.setItem('anonSessionId', anonSessionId);
        }
        setUserId(anonSessionId);
      }
      setIsAuthReady(true);
    }).catch(error => {
      console.error("Error getting initial Supabase session:", error);
      setIsAuthReady(true); // Still mark as ready even if error, to proceed with anon ID
    });

    return () => {
      // Correctly unsubscribe from the auth listener
      if (authSubscription && typeof authSubscription.unsubscribe === 'function') {
        authSubscription.unsubscribe();
      }
    };
  }, [supabaseClient]); // Rerun when supabaseClient changes


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 font-inter text-gray-800">
      <Navbar setCurrentPage={setCurrentPage} setShowFeatureOptions={setShowFeatureOptions} navLinks={appNavLinks} />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          {showFeatureOptions ? (
            <FeatureSelection setCurrentPage={setCurrentPage} setShowFeatureOptions={setShowFeatureOptions} />
          ) : (
            // This is the main routing logic that renders pages based on 'currentPage'
            (() => {
              switch (currentPage) {
                case 'home':
                  return (
                    <>
                      <HeroSection setShowFeatureOptions={setShowFeatureOptions} />
                      <FeatureSection />
                      <AboutSection />
                    </>
                  );
                case 'ai-chat':
                  // Pass supabaseClient to AIChat
                  return <AIChat supabase={supabaseClient} userId={userId} isAuthReady={isAuthReady} />;
                case 'wellness-tools':
                  return <WellnessToolsPage />; // Render the WellnessToolsPage
                case 'music-player':
                  return <MusicPlayer />; // Render the MusicPlayer
                case 'gentle-movement-player':
                  return <GentleMovementPlayer />; // Render the GentleMovementPlayer
                case 'contact': // Render the new ContactPage for the 'contact' route
                  return <ContactPage onBack={() => setCurrentPage('home')} />;
                // All other pages will use the ComingSoonPage
                case 'journal':
                case 'mood-tracker':
                case 'summary':
                case 'about': // 'about' page still exists as a case, but no longer linked in nav
                  const feature = appNavLinks.find(link => link.page === currentPage);
                  return <ComingSoonPage featureName={feature ? feature.name : "Feature"} />;
                default:
                  return <ComingSoonPage featureName="Unknown Page" />; // Fallback for undefined pages
              }
            })()
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
}

// Navbar Component
function Navbar({ setCurrentPage, setShowFeatureOptions, navLinks }) { // navLinks passed as prop
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavLinkClick = (page) => {
    console.log("Navigating to page:", page); // ADDED FOR DEBUGGING
    setCurrentPage(page); // This function updates the 'currentPage' state in App.js
    setShowFeatureOptions(false); // Hide feature options if navigating from navbar
    setIsMenuOpen(false); // Close menu on click
  };

  return (
    <nav className="bg-white shadow-sm py-4 px-6 md:px-12 sticky top-0 z-50 rounded-b-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Text */}
        <a href="/" onClick={() => handleNavLinkClick('home')} className="text-2xl font-bold text-indigo-600">
          Unmute Your Mind
        </a>

        {/* Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 focus:outline-none">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href="/" // This is for ESLint/accessibility, onClick handles the actual page change
              onClick={(e) => { // Added event parameter to prevent default behavior
                e.preventDefault(); // Prevent default link behavior
                handleNavLinkClick(link.page);
              }}
              className="text-gray-600 hover:text-indigo-600 font-medium transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white mt-4 rounded-lg shadow-lg py-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href="/" // This is for ESLint/accessibility, onClick handles the actual page change
              className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-200"
              onClick={(e) => { // Added event parameter to prevent default behavior
                e.preventDefault(); // Prevent default link behavior
                handleNavLinkClick(link.page);
              }}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

// Hero Section Component
function HeroSection({ setShowFeatureOptions }) {
  return (
    <section className="relative flex items-center justify-center h-screen bg-cover bg-center text-center px-4 py-16 md:py-24"
      style={{ backgroundImage: "url('https://placehold.co/1920x1080/6366F1/6366F1')" }}>
      <div className="absolute inset-0 bg-indigo-900 opacity-70"></div>
      <div className="relative z-10 max-w-4xl mx-auto text-white">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
          Unmute Your Mind – Your Personal Mental Wellness Companion
        </h1>
        <p className="text-lg md:text-xl mb-10 opacity-90 drop-shadow-md">
          An AI-powered platform with tools for journaling, mindfulness, mood tracking, and emotional support.
        </p>
        <button
          onClick={() => setShowFeatureOptions(true)} // Modified to show feature options
          className="bg-white text-indigo-700 hover:bg-indigo-100 px-8 py-4 rounded-full text-lg font-semibold shadow-xl transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
        >
          Get Started
        </button>
      </div>
    </section>
  );
}

// Feature Card Component (reusable for each feature)
function FeatureCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center text-center bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 border border-indigo-100 group w-full"
    >
      <div className="p-4 bg-indigo-100 rounded-full mb-6 group-hover:bg-indigo-200 transition-colors duration-200">
        <Icon size={48} className="text-indigo-600 group-hover:text-indigo-700 transition-colors duration-200" />
      </div>
      <h3 className="text-2xl font-bold text-indigo-700 mb-3 group-hover:text-indigo-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </button>
  );
}

// Feature Section Component (for landing page showcase)
function FeatureSection() {
  const features = [
    { icon: MessageSquare, title: "AI Chat", description: "Talk to a supportive AI whenever you need to express or process thoughts." },
    { icon: Heart, title: "Wellness Toolkit", description: "Breathing exercises, gratitude logs, guided movement/music, grounding tools." },
    { icon: BookOpen, title: "Private Journal", description: "Write freely or use prompts. Stored securely in your private account." },
    { icon: TrendingUp, title: "Mood Tracker", description: "Track how you're feeling daily, visualize trends over time." },
  ];

  return (
    <section className="py-16 md:py-24 bg-white px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-indigo-800 mb-16">
          Empower Your Journey
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} />
          ))}
        </div>
      </div>
    </section>
  );
}

// About Section Component
function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-indigo-50 px-4">
      <div className="container mx-auto max-w-3xl text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-8">
          Our Mission
        </h2>
        <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
          Built by students, for students. Unmute Your Mind empowers youth to take charge of their emotional wellbeing with private, tech-enabled tools. We believe in fostering a supportive community where every mind feels heard and valued.
        </p>
      </div>
    </section>
  );
}

// Footer Component (Note: This is the global footer, not the dedicated ContactPage)
function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-10 px-4 rounded-t-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start text-center md:text-left">
        {/* Your Contact Info */}
        <div className="mb-8 md:mb-0 md:w-1/3">
          <h3 className="text-xl font-bold text-white mb-4">Connect With Us</h3>
          <p className="flex items-center justify-center md:justify-start text-lg mb-2">
            <Instagram size={24} className="mr-2" />
            <a href="https://www.instagram.com/unmuteyourmindinitiative" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">
              @unmuteyourmindinitiative
            </a>
          </p>
          <p className="flex items-center justify-center md:justify-start text-lg mb-2">
            <Mail size={20} className="mr-2" />
            <a href="mailto:unmuteyourmind123@gmail.com" className="hover:text-white transition-colors duration-200">
              unmuteyourmind123@gmail.com
            </a>
          </p>
          <p className="flex items-center justify-center md:justify-start text-lg">
            <Phone size={20} className="mr-2" /> 919-726-8173
          </p>
        </div>

        {/* Legal Links & Copyright */}
        <div className="md:w-1/3 text-sm flex flex-col items-center md:items-end">
          <div className="flex justify-center md:justify-end space-x-4 mb-2">
            <a href="https://drive.google.com/file/d/1llk5a4AIiyZTvOKnk9yuqr5_curBQKJo/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="https://drive.google.com/file/d/1WyzGiTdUo__MzSu9LVZTd0vj7A-hzjoF/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-200">Terms of Service</a>
          </div>
          <p>&copy; {new Date().getFullYear()} Unmute Your Mind by Pranavsai Dodla. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Feature Selection Component (for initial "Get Started" button)
function FeatureSelection({ setCurrentPage, setShowFeatureOptions }) {
  const featureOptions = [
    { name: 'AI Chat', icon: MessageSquare, page: 'ai-chat', description: 'Talk to your AI companion.' },
    { name: 'Wellness Tools', icon: Heart, page: 'wellness-tools', description: 'Access exercises and grounding tools.' },
    { name: 'Journal', icon: BookOpen, page: 'journal', description: 'Write and reflect privately.' },
    { name: 'Mood Tracker', icon: TrendingUp, page: 'mood-tracker', description: 'Track your feelings over time.' },
    { name: 'Summary', icon: FileText, page: 'summary', description: 'See an overview of your wellness journey.' },
  ];

  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 to-indigo-100 px-4 py-16">
      <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-12 text-center">
        Choose Your Path to Wellness
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl w-full">
        {featureOptions.map((feature) => (
          <FeatureCard
            key={feature.name}
            icon={feature.icon}
            title={feature.name}
            description={feature.description}
            onClick={() => {
              setCurrentPage(feature.page);
              setShowFeatureOptions(false); // Hide feature options after selection
            }}
          />
        ))}
      </div>
      <button
        onClick={() => setShowFeatureOptions(false)} // Go back to landing page
        className="mt-12 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center transition-colors duration-200"
      >
        <X size={20} className="mr-2" /> Back to Home
      </button>
    </section>
  );
}

// Placeholder for Coming Soon Pages
function ComingSoonPage({ featureName }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 to-indigo-100 text-gray-800 p-4 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-6">
        {featureName} Coming Soon!
      </h2>
      <p className="text-lg md:text-xl text-gray-700 mb-8">
        We're working hard to bring you the full {featureName} experience. Stay tuned!
      </p>
      <MessageSquare size={80} className="text-indigo-400 mb-8 animate-bounce" />
      <button
        onClick={() => window.location.reload()} // Simple way to go back to home for now
        className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:bg-indigo-700 transition-colors duration-300"
      >
        Go Back
      </button>
    </div>
  );
}

// WellnessToolsPage Component - Now acts as a hub for sub-features
function WellnessToolsPage() {
  const [selectedTool, setSelectedTool] = useState(null); // State to manage which sub-tool is active

  const tools = [
    { icon: Wind, title: "Breathing Exercise", description: "Calm your mind with guided breathing.", action: () => alert("Breathing Exercise coming soon!") },
    { icon: Smile, title: "Gratitude Practice", description: "Focus on positive moments.", action: () => alert("Gratitude Practice coming soon!") },
    { icon: Heart, title: "Mindful Moment", description: "Ground yourself in the present.", action: () => alert("Mindful Moment coming soon!") },
    { icon: Music, title: "Music", description: "Listen to calming playlists.", action: () => setSelectedTool('music') },
    { icon: Activity, title: "Gentle Movement", description: "Simple stretches for stress relief.", action: () => setSelectedTool('gentle-movement') },
  ];

  if (selectedTool === 'music') {
    return <MusicPlayer onBack={() => setSelectedTool(null)} />;
  }

  if (selectedTool === 'gentle-movement') {
    return <GentleMovementPlayer onBack={() => setSelectedTool(null)} />;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-indigo-100 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-indigo-800 mb-6">
          Wellness Tools
        </h2>
        <p className="text-lg md:text-xl text-center text-gray-700 mb-12">
          Simple practices to help you feel better.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tools.map((tool, index) => (
            <FeatureCard
              key={index}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              onClick={tool.action} // Use the action defined for each tool
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// MusicPlayer Component
function MusicPlayer({ onBack }) {
  const playlists = [
    { name: "Calm Vibes", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWXe9gFZP0gtP?utm_source=generator" },
    { name: "Mood Booster", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWVTkoPB1rnwz?utm_source=generator" },
    { name: "Deep Focus", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX1s9knjP51Oa?utm_source=generator" },
  ];

  const [activePlaylistIndex, setActivePlaylistIndex] = useState(0);
  const [fade, setFade] = useState(false); // For fade transition

  useEffect(() => {
    // When activePlaylistIndex changes, trigger fade out, then change content, then fade in
    setFade(true);
    const timer = setTimeout(() => {
      setFade(false);
    }, 300); // Duration of fade-out animation
    return () => clearTimeout(timer);
  }, [activePlaylistIndex]);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-indigo-100 px-4 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="container mx-auto text-center max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-6">Music for Your Mood</h2>
        <p className="text-lg md:text-xl text-gray-700 mb-12">
          Choose a playlist to relax, focus, or uplift your spirits.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {playlists.map((playlist, index) => (
            <button
              key={index}
              onClick={() => setActivePlaylistIndex(index)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md
                ${activePlaylistIndex === index
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50'
                }`}
            >
              {playlist.name}
            </button>
          ))}
        </div>

        <div className={`relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-xl transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
          <iframe
            style={{ borderRadius: '12px' }}
            src={playlists[activePlaylistIndex].url}
            width="100%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={playlists[activePlaylistIndex].name}
          ></iframe>
        </div>

        <button
          onClick={onBack}
          className="mt-12 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-center mx-auto transition-colors duration-200"
        >
          <X size={20} className="mr-2" /> Back to Wellness Tools
        </button>
      </div>
    </section>
  );
}

// GentleMovementPlayer Component
function GentleMovementPlayer({ onBack }) {
  const videoCategories = {
    yoga: {
      name: "Everyday Yoga & Breathing",
      videos: [
        { name: "10-Minute Morning Yoga", url: "https://www.youtube-nocookie.com/embed/yPK7ISPEu3M?si=A8r3w_-XXzkSiDf" },
        { name: "5-Minute Breathwork", url: "https://www.youtube-nocookie.com/embed/B4kNiCWTl7M?si=uwQ46n1VxCkSQyPx" },
        { name: "Gentle Evening Stretch", url: "https://www.youtube-nocookie.com/embed/s2NQhpFGIOg?si=fxR1rSVXzsUdf0X8" },
        { name: "Quick Desk Stretches", url: "https://www.youtube-nocookie.com/embed/RiMb2Bw4Ae8?si=um_gVcm9Dpesf5Yh" },
      ]
    },
    exercise: {
      name: "Light Exercise",
      videos: [
        { name: "10-Minute Full Body", url: "https://www.youtube-nocookie.com/embed/bO6NNfX_1ns?si=GtLXRE0wK_v_Z1tc" },
        { name: "Quick Cardio Blast", url: "https://www.youtube-nocookie.com/embed/LnCQ-MECZSw?si=K6IAd1vQyzpXawxg" },
        { name: "Beginner Strength", url: "https://www.youtube-nocookie.com/embed/LCyP3F7gRC4?si=UhvwED0p1_kkdb7p" },
        { name: "Dance Workout", url: "https://www.youtube-nocookie.com/embed/FI51zRzgIe4?si=77DPMet1nFyas_oU" },
      ]
    }
  };

  const [activeCategory, setActiveCategory] = useState('yoga');
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [fade, setFade] = useState(false); // For fade transition

  // Reset video index when category changes
  useEffect(() => {
    setActiveVideoIndex(0);
    setFade(true);
    const timer = setTimeout(() => {
      setFade(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  useEffect(() => {
    setFade(true);
    const timer = setTimeout(() => {
      setFade(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeVideoIndex]);


  const currentVideos = videoCategories[activeCategory].videos;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-indigo-100 px-4 min-h-[calc(100vh-80px)] flex flex-col items-center">
      <div className="container mx-auto text-center max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-6">Gentle Movement</h2>
        <p className="text-lg md:text-xl text-gray-700 mb-12">
          Find a movement practice that suits your energy and needs.
        </p>

        {/* Category Selection Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.keys(videoCategories).map((categoryKey) => (
            <button
              key={categoryKey}
              onClick={() => setActiveCategory(categoryKey)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md
                ${activeCategory === categoryKey
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50'
                }`}
            >
              {videoCategories[categoryKey].name}
            </button>
          ))}
        </div>

        {/* Video Selection Buttons for Active Category */}
        {currentVideos.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {currentVideos.map((video, index) => (
              <button
                key={index}
                onClick={() => setActiveVideoIndex(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                  ${activeVideoIndex === index
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
              >
                <Play size={16} className="inline-block mr-1" /> {video.name}
              </button>
            ))}
          </div>
        )}

        {/* Embedded Video Player */}
        {currentVideos.length > 0 && (
          <div className={`relative w-full max-w-3xl mx-auto rounded-xl overflow-hidden shadow-xl aspect-video transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}>
            <iframe
              width="100%"
              height="100%"
              src={currentVideos[activeVideoIndex].url}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={currentVideos[activeVideoIndex].name}
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        )}
        {currentVideos.length === 0 && (
          <p className="text-gray-600 text-lg">No videos available for this category yet.</p>
        )}

        <button
          onClick={onBack}
          className="mt-12 text-indigo-600 hover:text-indigo-800 font-semibold flex items-center justify-center mx-auto transition-colors duration-200"
        >
          <X size={20} className="mr-2" /> Back to Wellness Tools
        </button>
      </div>
    </section>
  );
}

// New ContactPage Component
function ContactPage({ onBack }) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-purple-50 to-indigo-100 px-4 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-gray-800">
      <div className="container mx-auto max-w-4xl text-center md:text-left bg-white p-8 rounded-xl shadow-lg border border-indigo-100">
        <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-8 text-center">
          Get In Touch & Find Support
        </h2>

        {/* Your Contact Info */}
        <div className="mb-12 text-center md:text-left">
          <h3 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center justify-center md:justify-start">
            <Mail size={32} className="mr-3 text-indigo-600" /> Connect With Us
          </h3>
          <p className="text-lg text-gray-700 mb-2 flex items-center justify-center md:justify-start">
            <Instagram size={24} className="mr-2 text-pink-500" />
            <a href="https://www.instagram.com/unmuteyourmindinitiative" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors duration-200">
              @unmuteyourmindinitiative
            </a>
          </p>
          <p className="text-lg text-gray-700 mb-2 flex items-center justify-center md:justify-start">
            <Mail size={20} className="mr-2 text-blue-500" />
            <a href="mailto:unmuteyourmind123@gmail.com" className="hover:text-indigo-600 transition-colors duration-200">
              unmuteyourmind123@gmail.com
            </a>
          </p>
          <p className="text-lg text-gray-700 flex items-center justify-center md:justify-start">
            <Phone size={20} className="mr-2 text-green-500" /> 919-726-8173
          </p>
        </div>

        {/* Emergency & Crisis Support */}
        <div className="mb-12 text-center md:text-left">
          <h3 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center justify-center md:justify-start">
            <LifeBuoy size={32} className="mr-3 text-red-600" /> Emergency & Crisis Support
          </h3>
          <p className="text-base text-gray-600 mb-4">
            If you or someone you know needs immediate help, please reach out to these resources. You are not alone.
          </p>
          <ul className="space-y-3 list-none p-0">
            <li className="flex items-center justify-center md:justify-start text-lg">
              <Phone size={20} className="mr-2 text-red-500" />
              <strong className="text-gray-800 mr-1">National Suicide & Crisis Lifeline:</strong>
              <a href="tel:988" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">988</a> (Call or Text)
            </li>
            <li className="flex items-center justify-center md:justify-start text-lg">
              <MessageSquareText size={20} className="mr-2 text-yellow-500" /> {/* Changed AlertCircle to MessageSquareText */}
              <strong className="text-gray-800 mr-1">Crisis Text Line:</strong> Text HOME to
              <a href="sms:741741" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">741741</a>
            </li>
            <li className="flex items-center justify-center md:justify-start text-lg">
              <AlertCircle size={20} className="mr-2 text-red-500" /> {/* Reused AlertCircle for 911 */}
              <strong className="text-gray-800 mr-1">Emergency Services:</strong>
              <a href="tel:911" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">911</a> (For immediate danger)
            </li>
            <li className="flex items-center justify-center md:justify-start text-lg">
              <Brain size={20} className="mr-2 text-purple-500" />
              <strong className="text-gray-800 mr-1">NAMI (Mental Health) Helpline:</strong>
              <a href="tel:18009506264" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">1-800-950-NAMI (6264)</a>
            </li>
            <li className="flex items-center justify-center md:justify-start text-lg">
              <LifeBuoy size={20} className="mr-2 text-teal-500" /> {/* Reused LifeBuoy */}
              <strong className="text-gray-800 mr-1">SAMHSA National Helpline:</strong>
              <a href="tel:18006624357" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">1-800-662-HELP (4357)</a>
            </li>
            <li className="flex items-center justify-center md:justify-start text-lg">
              <Heart size={20} className="mr-2 text-pink-500" /> {/* Reused Heart */}
              <strong className="text-gray-800 mr-1">The Trevor Project (LGBTQ Youth):</strong>
              <a href="tel:18664887386" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">1-866-488-7386</a> (Call) / Text START to <a href="sms:678678" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-duration-200">678-678</a>
            </li>
             <li className="flex items-center justify-center md:justify-start text-lg">
              <Dribbble size={20} className="mr-2 text-orange-500" /> {/* Using Dribbble as a placeholder for NEDA */}
              <strong className="text-gray-800 mr-1">NEDA (Eating Disorders) Helpline:</strong>
              <a href="tel:18009312237" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">1-800-931-2237</a>
            </li>
            <li className="flex items-center justify-center md:justify-start text-lg">
              <Shield size={20} className="mr-2 text-indigo-500" /> {/* Using Shield for safety */}
              <strong className="text-gray-800 mr-1">National Domestic Violence Hotline:</strong>
              <a href="tel:18007997233" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">1-800-799-SAFE (7233)</a>
            </li>
            <li className="flex items-center justify-center md:justify-start text-lg">
              <Shield size={20} className="mr-2 text-indigo-500" /> {/* Using Shield for safety */}
              <strong className="text-gray-800 mr-1">RAINN (Sexual Assault) Hotline:</strong>
              <a href="tel:18006564673" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">1-800-656-HOPE (4673)</a>
            </li>
            <li className="flex items-center justify-center md:justify-start text-lg">
              <Home size={20} className="mr-2 text-brown-500" /> {/* Reusing Home icon */}
              <strong className="text-gray-800 mr-1">National Runaway Safeline:</strong>
              <a href="tel:18007862929" className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200">1-800-RUNAWAY (786-2929)</a>
            </li>
            <li className="text-sm text-gray-500 mt-4 text-center md:text-left">
              *Please note: These are U.S. based resources. If you are outside the U.S., please search for local emergency and crisis services in your country.
            </li>
          </ul>
        </div>

        <button
          onClick={onBack}
          className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center mx-auto"
        >
          <Home size={20} className="mr-2" /> Back to Home
        </button>
      </div>
    </section>
  );
}


// AI Chat Component
function AIChat({ supabase, userId, isAuthReady }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Supabase message fetching and subscription
  useEffect(() => {
    if (!supabase || !userId || !isAuthReady) {
      console.log("Supabase or userId not ready for chat.");
      return;
    }

    // Use supabase.channel for real-time updates
    const channel = supabase
      .channel(`chat_messages_channel_${userId}`) // Unique channel name per user/session
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `user_id=eq.${userId}` // Filter for relevant messages
      }, payload => {
        setMessages(prevMessages => {
          // Prevent duplicates if already optimistically added
          if (!prevMessages.some(msg => msg.id === payload.new.id)) {
            return [...prevMessages, payload.new];
          }
          return prevMessages;
        });
      })
      .subscribe();

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error("Error fetching chat messages from Supabase:", error);
      } else {
        setMessages(data || []);
      }
    };

    fetchMessages();

    return () => {
      // Clean up the channel subscription
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, userId, isAuthReady]); // Add userId to dependencies to re-run fetch/channel if it changes

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '' || isLoading || !userId) return;

    const userMessage = {
      user_id: userId,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };

    // Optimistically add user message to UI
    setMessages((prevMessages) => [...prevMessages, { ...userMessage, id: crypto.randomUUID() }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Save user message to Supabase
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert([userMessage]);

      if (insertError) {
        console.error("Error saving user message to Supabase:", insertError);
        throw new Error("Failed to save user message.");
      }

      let aiResponseText = "I'm sorry, I'm having trouble connecting to the AI right now. Please try again later.";

      try {
        // Prepare chat history for the backend, ensuring 'role' is correct
        const chatHistoryForBackend = messages.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model', // Map 'ai' to 'model'
          parts: [{ text: m.text }]
        }));

        // Add the current user message to history for the AI's context
        chatHistoryForBackend.push({ role: 'user', parts: [{ text: userMessage.text }] });


        const backendResponse = await fetch('/.netlify/functions/gemini-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userMessage.text, // Send the current prompt
            chatHistory: chatHistoryForBackend // Send the full history
          }),
        });

        if (backendResponse.ok) {
          const result = await backendResponse.json();
          aiResponseText = result.response || "I received an empty response from the AI.";
        } else {
          console.error("Backend error:", backendResponse.status, backendResponse.statusText);
          aiResponseText = `Oops! There was an error getting a response from the AI (${backendResponse.status}).`;
        }
      } catch (geminiError) {
        console.error("Error calling Gemini backend:", geminiError);
        aiResponseText = "There was an issue processing your request with the AI. Please try again.";
      }

      const aiMessage = {
        user_id: userId,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toISOString(),
      };

      // Save AI message to Supabase
      const { error: aiInsertError } = await supabase
        .from('chat_messages')
        .insert([aiMessage]);

      if (aiInsertError) {
        console.error("Error saving AI message to Supabase:", aiInsertError);
        throw new Error("Failed to save AI response.");
      }

    } catch (error) {
      console.error("Error during message handling:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "An error occurred. Please check your connection or try again.", sender: 'ai', timestamp: new Date().toISOString(), user_id: userId },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 rounded-lg shadow-lg m-4 md:m-8 overflow-hidden">
      <div className="flex-none bg-indigo-600 text-white p-4 text-center font-bold text-xl rounded-t-lg">
        AI Chat Companion
        {userId && (
          <div className="text-sm text-indigo-200 mt-1">
            User ID: <span className="font-normal text-xs break-all">{userId}</span>
          </div>
        )}
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-white">
        {!isAuthReady && (
          <div className="text-center text-gray-500 py-10">
            Loading chat...
          </div>
        )}
        {isAuthReady && messages.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-10">
            Start a conversation with your AI companion!
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md ${
                msg.sender === 'user'
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Sending...'}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-gray-200 text-gray-800 rounded-bl-none">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce mr-1"></div>
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce mr-1" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none p-4 bg-gray-100 border-t border-gray-200 rounded-b-lg">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-grow p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all duration-200"
            disabled={isLoading || !isAuthReady}
          />
          <button
            onClick={handleSendMessage}
            className="bg-indigo-600 text-white p-3 rounded-full shadow-md hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center"
            disabled={isLoading || !isAuthReady}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
