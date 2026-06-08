'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getFirebaseDB } from '@/lib/firebase';
import { ref, push, set, update, get } from 'firebase/database';

function getVisitorId() {
    if (typeof window === 'undefined') return 'unknown';
    try {
        let vid = localStorage.getItem('ADIS_visitorId');
        if (!vid) {
            vid = 'v_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('ADIS_visitorId', vid);
        }
        return vid;
    } catch(e) {
        // Fallback if localStorage is blocked (e.g. strict incognito)
        return 'v_incog_' + Math.random().toString(36).substr(2, 9);
    }
}

function getDeviceData() {
    if (typeof window === 'undefined') return { ua: 'unknown', screen: 'unknown', platform: 'unknown' };
    return {
        ua: navigator.userAgent,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        platform: navigator.platform || 'Unknown'
    };
}

export default function AnalyticsTracker() {
    const pathname = usePathname();
    const vidRef = useRef(getVisitorId()); // Persist across renders without localstorage crash

    useEffect(() => {
        const vid = vidRef.current;
        const device = getDeviceData();

        const trackPageView = async () => {
            try {
                const db = await getFirebaseDB();
                if (!db) return;

                const dateStr = new Date().toISOString().slice(0, 10);
                
                // 1. Record Page View
                const pageViewRef = ref(db, `pageViews/${dateStr}`);
                await push(pageViewRef, {
                    page: pathname,
                    referrer: document.referrer || 'direct',
                    device,
                    time: Date.now()
                });

                // 2. Update Living Visitor
                const visitorRef = ref(db, `living_visitors/${vid}`);
                
                // Track session retention
                const isNewSession = !sessionStorage.getItem('ADIS_sessionLogged');
                if (isNewSession) {
                    const snap = await get(visitorRef);
                    if (!snap.exists() || !snap.val().firstSeen) {
                        await update(visitorRef, { firstSeen: new Date().toISOString() });
                    }
                    const historyRef = ref(db, `living_visitors/${vid}/visitHistory`);
                    await push(historyRef, {
                        time: Date.now(),
                        page: pathname,
                        referrer: document.referrer || 'direct'
                    });
                    sessionStorage.setItem('ADIS_sessionLogged', 'true');
                }

                await update(visitorRef, {
                    lastSeen: new Date().toISOString(),
                    page: pathname,
                    device: navigator.userAgent
                });
            } catch(e) {
                console.error("Tracking Error:", e);
            }
        };

        trackPageView();

        // Track Push Conversions
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const utmSource = searchParams.get('utm_source');
            const campaignId = searchParams.get('campaignId');
            if (utmSource === 'push' && campaignId && !sessionStorage.getItem('pushLogged_' + campaignId)) {
                sessionStorage.setItem('pushLogged_' + campaignId, 'true');
                getFirebaseDB().then(db => {
                    if (db) {
                        push(ref(db, `push_analytics/${campaignId}/converted`), {
                            visitorId: vid,
                            time: Date.now()
                        });
                    }
                });
            }
        }

        // Track Exit Intent
        let exitIntentTriggered = false;
        const loadTime = Date.now();
        const handleMouseLeave = async (e: MouseEvent) => {
            if (e.clientY < 50 && !exitIntentTriggered) {
                exitIntentTriggered = true;
                try {
                    const db = await getFirebaseDB();
                    if (!db) return;
                    const timeSpent = Date.now() - loadTime;
                    await push(ref(db, 'exit_intents'), {
                        page: pathname,
                        timeSpent,
                        visitorId: vid,
                        timestamp: Date.now()
                    });
                } catch(err) {}
            }
        };
        document.addEventListener('mouseleave', handleMouseLeave);

        // Setup global click listener to track user activity
        // Use true (capture phase) to catch clicks before React stopPropagation can block them!
        const handleClick = async (e: MouseEvent) => {
            try {
                const target = e.target as HTMLElement;
                // Track clicks on buttons, links, or elements with text
                const clickable = target.closest('button, a, [role="button"]');
                
                let elementDesc = '';
                if (clickable) {
                    elementDesc = (clickable.textContent || '').trim().slice(0, 50) || clickable.tagName;
                } else {
                    elementDesc = (target.textContent || '').trim().slice(0, 50) || target.tagName;
                }

                if (!elementDesc) return; // Skip empty clicks

                const db = await getFirebaseDB();
                if (!db) return;

                await push(ref(db, `clicks`), {
                    element: `Clicked: ${elementDesc}`,
                    page: pathname,
                    time: Date.now(),
                    device,
                    x: e.clientX,
                    y: e.clientY,
                    w: window.innerWidth,
                    h: window.innerHeight
                });
                
                // Also bump living visitor lastSeen
                const visitorRef = ref(db, `living_visitors/${vid}`);
                await update(visitorRef, {
                    lastSeen: new Date().toISOString(),
                    page: pathname,
                    device: navigator.userAgent
                });
            } catch(err) {
                // Silently ignore tracking failures so app doesn't crash
            }
        };

        document.addEventListener('click', handleClick, true); // <--- Capture phase is critical!

        // Ping every 3 minutes if they are just reading
        const interval = setInterval(async () => {
            try {
                const db = await getFirebaseDB();
                if (!db) return;
                const visitorRef = ref(db, `living_visitors/${vid}`);
                await update(visitorRef, {
                    lastSeen: new Date().toISOString(),
                    page: pathname,
                    device: navigator.userAgent
                });
            } catch(err) {}
        }, 3 * 60 * 1000);

        return () => {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearInterval(interval);
        };
    }, [pathname]);

    return null;
}
