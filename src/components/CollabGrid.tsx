'use client';

import { motion } from 'framer-motion';

const collabs = [
  { name: 'Marvel', color: 'from-red-600 to-red-800', icon: '⚡' },
  { name: 'Anime', color: 'from-orange-500 to-pink-600', icon: '🔥' },
  { name: 'DC', color: 'from-blue-600 to-blue-900', icon: '🦇' },
  { name: 'Rick & Morty', color: 'from-green-500 to-teal-700', icon: '🧪' },
];

export default function CollabGrid() {
  return (
    <section className="bg-dark-accent py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-white text-2xl sm:text-3xl font-black uppercase tracking-wider text-center mb-2">
          Official Collaborations
        </h2>
        <p className="text-gray-400 text-sm text-center mb-10 max-w-md mx-auto">
          Authentic officially licensed merchandise from the biggest pop culture brands
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {collabs.map((collab, i) => (
            <motion.div
              key={collab.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br ${collab.color} p-6 sm:p-8 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[260px]`}
            >
              <span className="text-5xl sm:text-6xl mb-4 select-none">{collab.icon}</span>
              <h3 className="text-white text-lg sm:text-xl font-black uppercase tracking-wider text-center">
                {collab.name}
              </h3>
              <p className="text-white/60 text-xs mt-1 uppercase tracking-wider font-medium">
                Official Collection
              </p>
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
