'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import Link from 'next/link';
import { getFirebaseDB } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import Navbar from '@/components/Navbar';

// Mock Feeds (Fallback)
const STATIC_FEEDS = [
  {
    id: "ADIS_embed_1",
    url: "https://www.instagram.com/p/C-fGZqWSttY/", 
    title: "Marvel x ADIS Exclusive",
    description: "The ultimate superhero drop is here. Check out the new collection. #Marvel #ADIS",
    thumbnail: "",
    date: "June 6, 2026",
    timestamp: 1749108800000,
    useEmbed: true
  }
];

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<any[]>(STATIC_FEEDS);

  useEffect(() => {
    // Load or process Instagram's embed.js
    const win = window as any;
    if (win.instgrm && win.instgrm.Embeds) {
      win.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    // Fetch live feeds from Firebase
    let unsub = () => {};
    getFirebaseDB().then(db => {
       if(!db) return;
       const feedsRef = ref(db, 'feeds');
       unsub = onValue(feedsRef, (snapshot) => {
           const val = snapshot.val();
           if(val) {
               const raw = Array.isArray(val) ? val : Object.values(val);
               const formatted = raw.map((f: any, i) => ({
                   id: 'feed_' + i,
                   url: f.url,
                   type: f.type,
                   useEmbed: true,
                   title: f.type === 'reel' ? 'Latest Reel' : 'Latest Post',
                   description: 'Check out our latest update on Instagram!',
                   date: new Date(f.createdAt || Date.now()).toLocaleDateString()
               }));
               setFeeds(formatted);
               
               // Reprocess embeds after state update
               setTimeout(() => {
                   const win2 = window as any;
                   if (win2.instgrm && win2.instgrm.Embeds) {
                       win2.instgrm.Embeds.process();
                   }
               }, 500);
           }
       });
    });

    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <main className="flex-1 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <div className="inline-flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-full mb-6">
              <Camera className="w-8 h-8 text-[#FFE600]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
              Latest Feeds
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Stay connected with our latest drops, behind-the-scenes content, and community updates.
            </p>
          </motion.div>

          {/* Grid Container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max items-start">
            {feeds.map((feed, idx) => (
              <motion.div
                key={feed.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                {feed.useEmbed ? (
                  // Embed Card
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-0 shadow-2xl flex justify-center">
                    {feed.type === 'embed' ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: feed.url }} 
                        className="w-full flex justify-center overflow-hidden bg-black"
                      />
                    ) : (
                      <blockquote
                        className="instagram-media"
                        data-instgrm-permalink={feed.url}
                        data-instgrm-version="14"
                        style={{ background: '#000', border: '0', borderRadius: '16px', margin: '0', maxWidth: '100%', minWidth: '100%', padding: '0', width: '100%' }}
                      />
                    )}
                  </div>
                ) : (
                  // Thumbnail Card
                  <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col group transition-transform duration-300 hover:-translate-y-2">
                    <a href={feed.url} target="_blank" rel="noopener noreferrer" className="relative block overflow-hidden aspect-square">
                      <img 
                        src={feed.thumbnail} 
                        alt={feed.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#f09433]/80 via-[#dc2743]/80 to-[#bc1888]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Camera className="w-12 h-12 text-white drop-shadow-md" />
                      </div>
                    </a>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{feed.title}</h3>
                      <p className="text-white/60 text-sm mb-6 flex-1 line-clamp-3">
                        {feed.description}
                      </p>
                      <a 
                        href={feed.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] text-white font-bold text-sm hover:opacity-90 transition-opacity self-start"
                      >
                        <Camera className="w-4 h-4" /> View on Instagram
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
