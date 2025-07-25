import React, { useState, useEffect, useRef } from 'react';
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