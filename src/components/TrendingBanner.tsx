'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { convertGDriveUrl, parseImageLinks } from '@/utils/drive';

import BannerCarousel from '@/components/BannerCarousel';

export default function TrendingBanner() {
  const { landingConfig } = useStore();
  
  const rawLinks = landingConfig?.latestDrop || landingConfig?.collection4 || "https://drive.google.com/thumbnail?id=1bSy7yII0kjuJpK-vw9q2oYJ9oPbJsTu0&sz=s3000";
  const images = parseImageLinks(rawLinks);

  return (
    <section className="py-12 sm:py-16 bg-black/50 relative z-10 backdrop-blur-sm">
      <div className="w-full mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-black uppercase tracking-[0.15em] text-center mb-2 text-white"
        >
          LATEST DROPS
        </motion.h2>
        <div className="h-0.5 w-12 bg-[#FFE600] mx-auto mb-8 rounded-full" />
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full relative group"
        >
          <Link href="/sneakers" className="block w-full relative overflow-hidden bg-[#0a0a0a]">
            {/* Absolute overlay for "Shop Now" */}
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-12 sm:pb-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
              <span className="text-[#FFE600] border-2 border-[#FFE600] px-8 py-3 text-sm font-bold tracking-[0.2em] uppercase backdrop-blur-md hover:bg-[#FFE600] hover:text-black transition-colors pointer-events-auto">
                Explore Collection
              </span>
            </div>
            
            <BannerCarousel 
              images={images} 
              className="w-full min-h-[40vh] sm:h-[60vh] lg:h-[75vh] relative" 
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
