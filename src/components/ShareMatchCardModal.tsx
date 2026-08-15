import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { type Agent, type ValorantMap, MAPS_DATA } from '@/data/valorant';
import { type PlayerProfile } from '@/types/player';

interface ShareMatchCardModalProps {
  show: boolean;
  onClose: () => void;
  players: string[];
  assignments: Record<number, Agent | null>;
  playerStatuses: Record<number, 'MVP' | 'BOTTOM' | null>;
  selectedMap: ValorantMap | null;
  profiles: Record<number, PlayerProfile>;
  result?: 'WIN' | 'LOSS';
  scoreTeam?: number;
  scoreEnemy?: number;
  matchMvpName?: string;
}

export function ShareMatchCardModal({
  show,
  onClose,
  players,
  assignments,
  playerStatuses,
  selectedMap,
  profiles,
  result = 'WIN',
  scoreTeam = 13,
  scoreEnemy = 9,
  matchMvpName,
}: ShareMatchCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(true);

  // Generate canvas card
  useEffect(() => {
    if (!show) return;
    setGenerating(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dimensions: 1200 x 675 (16:9 standard for Discord/Twitter)
    canvas.width = 1200;
    canvas.height = 675;

    // 1. Draw dark background
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw map splash background if available
    const currentMapData = MAPS_DATA.find((m) => m.name === selectedMap);
    const mapImgUrl = currentMapData?.image;

    const renderRemaining = () => {
      // Valorant diagonal red geometric slash
      ctx.save();
      ctx.fillStyle = result === 'WIN' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.moveTo(canvas.width * 0.45, 0);
      ctx.lineTo(canvas.width, 0);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(canvas.width * 0.25, canvas.height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Top Title Bar
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('VALOMIZE RANDOMIZER', 50, 65);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`MAP: ${(selectedMap || 'RANDOM').toUpperCase()} • ${new Date().toLocaleDateString()}`, 50, 100);

      // Score / Result Badge
      const isWin = result === 'WIN';
      const bannerX = canvas.width - 320;
      const bannerY = 40;
      ctx.fillStyle = isWin ? '#10b981' : '#ef4444';
      ctx.roundRect ? ctx.roundRect(bannerX, bannerY, 270, 65, 10) : ctx.fillRect(bannerX, bannerY, 270, 65);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isWin ? 'VICTORY' : 'DEFEAT', bannerX + 135, bannerY + 32);

      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`${scoreTeam} - ${scoreEnemy}`, bannerX + 135, bannerY + 56);
      ctx.textAlign = 'left';

      // 5 Player Cards Grid
      const cardWidth = 200;
      const cardHeight = 440;
      const startX = 60;
      const startY = 160;
      const gap = 25;

      players.slice(0, 5).forEach((playerName, index) => {
        const x = startX + index * (cardWidth + gap);
        const y = startY;
        const agent = assignments[index];
        const status = playerStatuses[index];
        const prof = profiles[index];
        const isMvp = matchMvpName === playerName || status === 'MVP';

        // Card container
        ctx.save();
        ctx.fillStyle = '#18202c';
        ctx.strokeStyle = isMvp ? '#eab308' : status === 'BOTTOM' ? '#3b82f6' : '#334155';
        ctx.lineWidth = isMvp ? 3 : 2;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, cardWidth, cardHeight, 12) : ctx.rect(x, y, cardWidth, cardHeight);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Card header (Player Name)
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(playerName, x + cardWidth / 2, y + 40);

        // Status badge
        if (status) {
          ctx.fillStyle = status === 'MVP' ? '#eab308' : '#3b82f6';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(status === 'MVP' ? '★ WHEEL MVP' : '💀 BOT FRAG', x + cardWidth / 2, y + 65);
        }

        // Rank Name
        if (prof?.rankName && prof.rankTier !== 0) {
          ctx.fillStyle = prof.rankColor || '#94a3b8';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(prof.rankName, x + cardWidth / 2, y + (status ? 85 : 70));
        }

        // Agent Name & Role
        if (agent) {
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 22px sans-serif';
          ctx.fillText(agent.name.toUpperCase(), x + cardWidth / 2, y + cardHeight - 55);

          ctx.fillStyle = '#94a3b8';
          ctx.font = 'bold 13px sans-serif';
          ctx.fillText(agent.role.toUpperCase(), x + cardWidth / 2, y + cardHeight - 30);
        }

        // Agent image
        if (agent?.image) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.drawImage(img, x + 35, y + 110, 130, 130);
          };
          img.src = agent.image;
        }

        ctx.textAlign = 'left';
      });

      // Watermark
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Generated by Valomize Squad Randomizer', 50, canvas.height - 20);

      setGenerating(false);
    };

    if (mapImgUrl) {
      const mapImg = new Image();
      mapImg.crossOrigin = 'anonymous';
      mapImg.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.drawImage(mapImg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
        renderRemaining();
      };
      mapImg.onerror = () => {
        renderRemaining();
      };
      mapImg.src = mapImgUrl;
    } else {
      renderRemaining();
    }
  }, [show, players, assignments, playerStatuses, selectedMap, profiles, result, scoreTeam, scoreEnemy, matchMvpName]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `valomize-match-${selectedMap || 'custom'}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } catch (err) {
      console.warn('Could not copy image to clipboard, downloading instead:', err);
      handleDownload();
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl shadow-red-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:px-6 md:py-4 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase text-white tracking-wider">
                    สร้างการ์ดผลแมตช์ (Share Match Card)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    ดาวน์โหลดหรือคัดลอกรูปภาพไปแชร์ใน Discord หรือ LINE ได้ทันที
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col items-center justify-center space-y-4">
              <div className="w-full max-w-3xl rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-auto object-contain" />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 md:px-6 border-t border-zinc-800 bg-zinc-900/40 flex flex-wrap gap-3 justify-end">
              <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
                ปิด
              </Button>

              <Button
                onClick={handleCopyToClipboard}
                disabled={generating}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center gap-2 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" /> คัดลอกภาพแล้ว! (Ctrl+V ใน Discord)
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> คัดลอกภาพ (Copy Image)
                  </>
                )}
              </Button>

              <Button
                onClick={handleDownload}
                disabled={generating}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold flex items-center gap-2 text-xs shadow-lg shadow-red-500/20"
              >
                <Download className="h-4 w-4" /> ดาวน์โหลดภาพ (PNG)
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
