"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, Pause, Play } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { formatDuration, type InboxMedia } from "./inbox";

const SPEEDS = [1, 1.5, 2] as const;
const BARS = 40;

/** Stand-in bars (stable per message) when the server had no waveform. */
function fallbackPeaks(seed: string): number[] {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: BARS }, (_, i) => 0.25 + (((h >> (i % 24)) ^ (i * 2654435761)) >>> 0) % 70 / 100);
}

/**
 * WhatsApp voice note. Plays the AAC copy the server made (every browser,
 * incl. iPhone Safari); if conversion wasn't possible it still tries the
 * original and always offers Download. preload="none" - nothing is fetched
 * until Play.
 */
export function VoicePlayer({ id, media, outgoing }: { id: string; media: InboxMedia; outgoing?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(media.duration ?? 0);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [failed, setFailed] = useState(false);
  const peaks = useMemo(() => (media.peaks?.length ? media.peaks : fallbackPeaks(id)), [media.peaks, id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  if (media.status === "pending") {
    return <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Voice note is downloading…</p>;
  }
  if (!media.url) {
    return <p className="text-sm text-muted-foreground">🎤 Voice note could not be downloaded from WhatsApp.</p>;
  }

  const progress = duration ? Math.min(1, current / duration) : 0;
  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      return;
    }
    setLoading(true);
    try {
      audio.playbackRate = speed;
      await audio.play();
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    setCurrent(audio.currentTime);
  };

  return (
    <div className="w-[260px] max-w-full" data-testid="voice-player">
      <audio
        ref={audioRef}
        src={media.url}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDuration(e.currentTarget.duration)}
        onError={() => setFailed(true)}
      />
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? "Pause voice note" : "Play voice note"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F7A4A] text-white hover:bg-[#1F7A4A]/90 dark:bg-primary dark:text-primary-foreground"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </button>
        <div
          className="flex h-8 flex-1 cursor-pointer items-center gap-[2px]"
          onClick={seek}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(current)}
          tabIndex={0}
        >
          {peaks.map((p, i) => (
            <span
              key={i}
              className={cn(
                "w-[3px] rounded-full",
                i / peaks.length < progress
                  ? "bg-[#1F7A4A] dark:bg-primary"
                  : outgoing ? "bg-[#1F7A4A]/30 dark:bg-primary/30" : "bg-muted-foreground/35"
              )}
              style={{ height: `${Math.max(12, Math.round(p * 100))}%` }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length])}
          className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
          aria-label={`Playback speed ${speed}x`}
        >
          {speed}x
        </button>
      </div>
      <div className="mt-1 flex items-center justify-between pl-11 text-[11px] text-muted-foreground">
        <span data-testid="voice-time">{formatDuration(playing || current ? current : duration)}</span>
        {(failed || media.transcode !== "ok") && media.download_url && (
          <a href={media.download_url} download className="flex items-center gap-1 font-medium text-[#1F7A4A] hover:underline dark:text-primary">
            <Download className="h-3 w-3" />
            {failed ? "Can't play here - Download" : "Download"}
          </a>
        )}
      </div>
    </div>
  );
}
