import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Copy, Check, X, AlertTriangle, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'valomize_dismiss_inapp_banner_v1';

interface InAppBrowserBannerProps {
  roomCode?: string | null;
}

interface InAppDetectResult {
  isInApp: boolean;
  appName: string;
  isIOS: boolean;
  isAndroid: boolean;
}

export function detectInAppBrowser(): InAppDetectResult {
  if (typeof window === 'undefined' || !navigator.userAgent) {
    return { isInApp: false, appName: '', isIOS: false, isAndroid: false };
  }

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);

  let appName = '';
  if (ua.includes('line/')) {
    appName = 'LINE';
  } else if (ua.includes('discord')) {
    appName = 'Discord';
  } else if (ua.includes('fban') || ua.includes('fbav') || ua.includes('fb_iab')) {
    appName = 'Facebook';
  } else if (ua.includes('messenger')) {
    appName = 'Messenger';
  } else if (ua.includes('instagram')) {
    appName = 'Instagram';
  } else if (ua.includes('tiktok') || ua.includes('bytedance')) {
    appName = 'TikTok';
  } else if (ua.includes('twitter')) {
    appName = 'X (Twitter)';
  } else if (ua.includes('micromessenger')) {
    appName = 'WeChat';
  } else if (/wv|webview/.test(ua)) {
    appName = 'In-App Browser';
  }

  return {
    isInApp: Boolean(appName),
    appName: appName || 'In-App Browser',
    isIOS,
    isAndroid,
  };
}

export function InAppBrowserBanner({ roomCode }: InAppBrowserBannerProps) {
  const [detectInfo, setDetectInfo] = useState<InAppDetectResult | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem(DISMISS_KEY) === 'true';
    if (!isDismissed) {
      const res = detectInAppBrowser();
      setDetectInfo(res);
      setDismissed(!res.isInApp);
    }
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // ignore
    }
    setDismissed(true);
  };

  const getFullShareUrl = (): string => {
    try {
      const url = new URL(window.location.href);
      if (roomCode) {
        url.searchParams.set('room', roomCode);
      }
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const handleCopyLink = async () => {
    const url = getFullShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback prompt
      window.prompt('คัดลอกลิงก์ห้อง:', url);
    }
  };

  if (dismissed || !detectInfo || !detectInfo.isInApp) {
    return null;
  }

  // LINE supports automatic breakout with ?openExternalBrowser=1
  const isLine = detectInfo.appName === 'LINE';
  const lineBreakoutUrl = isLine ? `${getFullShareUrl()}${getFullShareUrl().includes('?') ? '&' : '?'}openExternalBrowser=1` : null;

  return (
    <AnimatePresence>
      <motion.aside
        aria-label="In-App Browser Guidance Banner"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full bg-gradient-to-r from-amber-950/90 via-zinc-900 to-amber-950/80 border-b border-amber-500/40 text-amber-200 text-xs shadow-lg backdrop-blur-md relative z-40 overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Info section */}
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-300 uppercase tracking-wide flex items-center gap-1 text-[11px] sm:text-xs">
                  <Smartphone className="w-3.5 h-3.5" /> ตรวจพบเปิดผ่าน {detectInfo.appName}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-bold rounded border border-amber-500/30">
                  แนะนำเปิดในเบราว์เซอร์จริง
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                {detectInfo.isIOS ? (
                  <>
                    เบราว์เซอร์ในแอพอาจปิดเสียงหรือตัดการเชื่อมต่อ แตะ <span className="font-bold text-white">"..."</span> หรือไอคอนเข็มทิศด้านล่างขวา แล้วเลือก <span className="font-bold text-amber-300">เปิดใน Safari / Chrome</span>
                  </>
                ) : (
                  <>
                    เบราว์เซอร์ในแอพอาจปิดเสียงหรือตัดการเชื่อมต่อ แตะปุ่ม <span className="font-bold text-white">3 จุด (⋮)</span> ที่มุมบนขวา แล้วเลือก <span className="font-bold text-amber-300">เปิดในเบราว์เซอร์ภายนอก / Chrome</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {lineBreakoutUrl ? (
              <a
                href={lineBreakoutUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิด Safari / Chrome</span>
              </a>
            ) : null}

            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 font-bold rounded-lg text-xs flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">คัดลอกแล้ว!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>คัดลอกลิงก์</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              title="ปิดการแจ้งเตือนนี้"
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
