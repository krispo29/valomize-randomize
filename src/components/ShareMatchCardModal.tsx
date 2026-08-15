import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, Image as ImageIcon, Trophy } from 'lucide-react';
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
  result: initialResult = 'WIN',
  scoreTeam: initialScoreTeam = 13,
  scoreEnemy: initialScoreEnemy = 9,
  matchMvpName: initialMatchMvp,
}: ShareMatchCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(true);

  // User-customizable card fields (QoL Feature)
  const [result, setResult] = useState<'WIN' | 'LOSS'>(initialResult);
  const [scoreTeam, setScoreTeam] = useState<number>(initialScoreTeam);
  const [scoreEnemy, setScoreEnemy] = useState<number>(initialScoreEnemy);
  const [customMvp, setCustomMvp] = useState<string>(
    initialMatchMvp || players.find((_, i) => playerStatuses[i] === 'MVP') || players[0] || ''
  );

  // Sync state when modal opens
  useEffect(() => {
    if (show) {
      setResult(initialResult);
      setScoreTeam(initialScoreTeam);
      setScoreEnemy(initialScoreEnemy);
      setCustomMvp(
        initialMatchMvp || players.find((_, i) => playerStatuses[i] === 'MVP') || players[0] || ''
      );
    }
  }, [show, initialResult, initialScoreTeam, initialScoreEnemy, initialMatchMvp, players, playerStatuses]);

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
      // Valorant diagonal color geometric slash
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
      ctx.font = '900 36px sans-serif';
      ctx.fillText('VALOMIZE RANDOMIZER', 50, 65);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`MAP: ${(selectedMap || 'RANDOM').toUpperCase()} • ${new Date().toLocaleDateString()}`, 50, 98);

      // Score / Result Badge
      const isWin = result === 'WIN';
      const bannerX = canvas.width - 320;
      const bannerY = 35;
      ctx.fillStyle = isWin ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bannerX, bannerY, 270, 70, 12) : ctx.rect(bannerX, bannerY, 270, 70);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(isWin ? 'VICTORY' : 'DEFEAT', bannerX + 135, bannerY + 32);

      ctx.font = '900 22px sans-serif';
      ctx.fillText(`${scoreTeam} - ${scoreEnemy}`, bannerX + 135, bannerY + 58);
      ctx.textAlign = 'left';

      // 5 Player Cards Grid
      const cardWidth = 200;
      const cardHeight = 450;
      const startX = 60;
      const startY = 150;
      const gap = 25;

      players.slice(0, 5).forEach((playerName, index) => {
        const x = startX + index * (cardWidth + gap);
        const y = startY;
        const agent = assignments[index];
        const status = playerStatuses[index];
        const prof = profiles[index];
        const isMvp = customMvp === playerName || (!customMvp && status === 'MVP');

        // Card container
        ctx.save();
        ctx.fillStyle = '#18202c';
        ctx.strokeStyle = isMvp ? '#eab308' : status === 'BOTTOM' ? '#3b82f6' : '#334155';
        ctx.lineWidth = isMvp ? 3 : 1.5;
        ctx.beginPath();
        ctx.roundRect ? ctx.roundRect(x, y, cardWidth, cardHeight, 14) : ctx.rect(x, y, cardWidth, cardHeight);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Card header (Player Name)
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(playerName, x + cardWidth / 2, y + 38);

        // Status / MVP Badge
        if (isMvp) {
          ctx.fillStyle = '#eab308';
          ctx.font = '900 12px sans-serif';
          ctx.fillText('👑 MATCH MVP', x + cardWidth / 2, y + 62);
        } else if (status === 'BOTTOM') {
          ctx.fillStyle = '#60a5fa';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('💀 BOT FRAG', x + cardWidth / 2, y + 62);
        }

        // Rank Name
        if (prof?.rankName && prof.rankTier !== 0) {
          ctx.fillStyle = prof.rankColor || '#94a3b8';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(prof.rankName, x + cardWidth / 2, y + (isMvp || status ? 82 : 68));
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
            ctx.drawImage(img, x + 35, y + 105, 130, 130);
          };
          img.src = agent.image;
        }

        ctx.textAlign = 'left';
      });

      // Watermark
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('Generated by VALOMIZE Squad Randomizer', 50, canvas.height - 20);

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
  }, [show, players, assignments, playerStatuses, selectedMap, profiles, result, scoreTeam, scoreEnemy, customMvp]);

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
    } catch {
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
            className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[96vh] flex flex-col shadow-2xl shadow-red-500/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:px-6 md:py-3.5 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-500">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-black uppercase text-white tracking-wider">
                    สร้างการ์ดผลแมตช์ (Share Match Card)
                  </h2>
                  <p className="text-xs text-zinc-400">
                    ปรับแต่งสกอร์และผลการแข่ง แล้วดาวน์โหลดหรือคัดลอกส่งเข้า Discord / LINE ได้ทันที
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
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {/* Quick Customization Toolbar (QoL Controls) */}
              <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* Result Toggle */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-400 uppercase text-[11px]">ผลการแข่ง:</span>
                  <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => {
                        setResult('WIN');
                        if (scoreTeam <= scoreEnemy) {
                          setScoreTeam(13);
                          setScoreEnemy(9);
                        }
                      }}
                      className={`px-3 py-1 rounded font-bold uppercase transition ${
                        result === 'WIN' ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      VICTORY
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResult('LOSS');
                        if (scoreEnemy <= scoreTeam) {
                          setScoreTeam(9);
                          setScoreEnemy(13);
                        }
                      }}
                      className={`px-3 py-1 rounded font-bold uppercase transition ${
                        result === 'LOSS' ? 'bg-rose-600 text-white shadow' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      DEFEAT
                    </button>
                  </div>
                </div>

                {/* Score Controls & Presets */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-400 uppercase text-[11px]">สกอร์:</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={scoreTeam}
                      onChange={(e) => setScoreTeam(Number(e.target.value))}
                      className="w-12 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-center font-bold text-white text-sm"
                    />
                    <span className="text-zinc-500 font-bold">-</span>
                    <input
                      type="number"
                      min={0}
                      max={25}
                      value={scoreEnemy}
                      onChange={(e) => setScoreEnemy(Number(e.target.value))}
                      className="w-12 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-center font-bold text-white text-sm"
                    />
                  </div>

                  {/* 1-Click Score Presets */}
                  <div className="hidden sm:flex gap-1">
                    {[
                      { label: '13-5', t: 13, e: 5, r: 'WIN' as const },
                      { label: '13-9', t: 13, e: 9, r: 'WIN' as const },
                      { label: '13-11', t: 13, e: 11, r: 'WIN' as const },
                      { label: '14-12', t: 14, e: 12, r: 'WIN' as const },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setScoreTeam(preset.t);
                          setScoreEnemy(preset.e);
                          setResult(preset.r);
                        }}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-300 transition"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* MVP Picker */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-400 uppercase text-[11px] flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-yellow-400" /> MVP:
                  </span>
                  <select
                    value={customMvp}
                    onChange={(e) => setCustomMvp(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-bold focus:outline-none focus:border-yellow-400"
                  >
                    {players.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Canvas Preview Container */}
              <div className="w-full max-w-3xl mx-auto rounded-xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900 flex items-center justify-center">
                <canvas ref={canvasRef} className="w-full h-auto object-contain" />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 md:px-6 border-t border-zinc-800 bg-zinc-900/40 flex flex-wrap gap-3 justify-end items-center">
              <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-300">
                ปิด (Close)
              </Button>

              <Button
                onClick={handleCopyToClipboard}
                disabled={generating}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center gap-2 text-xs py-2 px-4"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" /> คัดลอกภาพแล้ว! (กด Ctrl+V ใน Discord ได้ทันที)
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
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold flex items-center gap-2 text-xs py-2 px-5 shadow-lg shadow-red-500/20"
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
