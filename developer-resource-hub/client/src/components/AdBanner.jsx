import React, { useState, useEffect } from "react";
import { ExternalLink, Rss } from "lucide-react";
import client from "../api/client";

export default function AdBanner({ position, variant = "horizontal" }) {
  const [ad, setAd] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        let res = await client.get(`/ads?position=${position}&onlyActive=true`);
        
        // Fallback logic: If no ads for specific gutter, check SIDEBAR
        if ((!res.data.data || res.data.data.length === 0) && (position === "LEFT_GUTTER" || position === "RIGHT_GUTTER")) {
          res = await client.get(`/ads?position=SIDEBAR&onlyActive=true`);
        }

        if (res.data.data && res.data.data.length > 0) {
          const randomAd = res.data.data[Math.floor(Math.random() * res.data.data.length)];
          setAd(randomAd);
          setIsVisible(true);
        } else {
          setAd(null);
          setIsVisible(false);
        }
      } catch (err) {
        console.error("Ad Fetch Error:", err);
      }
    };
    fetchAd();
  }, [position]);

  const handleClick = async () => {
    if (!ad) return;
    try {
      await client.post(`/ads/click/${ad.id}`);
    } catch (err) {
      console.error("Ad Click Track Error:", err);
    }
  };

  if (!isVisible || !ad) return null;

  if (variant === "skyscraper") {
    return (
      <div className="hidden xl:block w-48 animate-in fade-in slide-in-from-bottom-10 duration-1000">
         <div className="text-[10px] font-black text-cyan-500/40 tracking-[0.3em] mb-4 uppercase rotate-90 origin-left translate-x-4">
           SECURE_PARTNER_LINK
         </div>
         <a 
           href={ad.targetUrl} 
           target="_blank" 
           rel="noopener noreferrer"
           onClick={handleClick}
           className="block relative h-[650px] w-full overflow-hidden rounded-2xl border border-cyan-500/20 group hover:border-cyan-500/50 transition-all shadow-[0_0_30px_rgba(34,211,238,0.1)] hover:shadow-[0_0_50px_rgba(34,211,238,0.2)] bg-[#161b22]/40 backdrop-blur-sm"
         >
           <img 
             src={ad.imageUrl} 
             alt={ad.title} 
             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] opacity-30 group-hover:opacity-60"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-[#10131a] via-transparent to-transparent flex flex-col justify-end p-6">
              <div className="bg-cyan-500/10 text-cyan-400 text-[8px] font-black px-2 py-1 rounded border border-cyan-500/20 w-fit mb-3 uppercase tracking-tighter">
                Ad_Discovery
              </div>
              <h3 className="text-white font-black text-sm uppercase leading-tight group-hover:text-cyan-400 transition-colors tracking-tighter">
                {ad.title}
              </h3>
           </div>
         </a>
      </div>
    );
  }

  return (
    <div className="my-6 animate-in fade-in zoom-in duration-700 max-w-[1400px] mx-auto px-6 lg:px-8">
      <div className="text-[10px] font-black text-slate-600 tracking-[0.2em] mb-4 uppercase flex items-center gap-2">
        <span className="h-px w-8 bg-[#3b494b]" /> Sponsored Content <span className="h-px w-8 bg-[#3b494b]" />
      </div>
      <a 
        href={ad.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block relative h-32 md:h-40 w-full overflow-hidden rounded-2xl border border-[#3b494b] group shadow-2xl"
      >
        <img 
          src={ad.imageUrl} 
          alt={ad.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#10131a] via-transparent to-transparent flex flex-col justify-center px-12">
          <div className="bg-cyan-500 text-[#10131a] text-[9px] font-black px-3 py-1 rounded-full w-fit mb-3 uppercase tracking-widest">
            Special Offer
          </div>
          <h3 className="text-white font-black text-xl md:text-2xl tracking-tight max-w-md group-hover:text-cyan-400 transition-colors">
            {ad.title}
          </h3>
          <div className="mt-4 flex items-center gap-2 text-cyan-400 font-black text-[10px] uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
            Learn More <ExternalLink size={12} />
          </div>
        </div>
        <div className="absolute top-4 right-4 opacity-20">
          <Rss size={48} className="text-white" />
        </div>
      </a>
    </div>
  );
}
