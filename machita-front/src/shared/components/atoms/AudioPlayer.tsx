import { useState, useRef } from "react";
import { SpeakerLoudIcon, SpeakerOffIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function AudioPlayer({ audioUrl, size = "md", variant = "outline" }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handlePlay = async () => {
    if (!audioRef.current || !audioUrl) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {}
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }[size];

  const buttonSize = {
    sm: "sm" as const,
    md: "default" as const,
    lg: "lg" as const,
  }[size];

  if (!audioUrl) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={buttonSize}
        onClick={handlePlay}
        className="gap-1"
        aria-label={isPlaying ? "Detener audio" : "Reproducir audio"}
      >
        {isPlaying ? (
          <SpeakerLoudIcon className={iconSize} />
        ) : (
          <SpeakerOffIcon className={iconSize} />
        )}
        <span className="sr-only">{isPlaying ? "Reproduciendo" : "Reproducir pronunciación"}</span>
      </Button>
      <audio ref={audioRef} src={audioUrl} onEnded={handleEnded} preload="none" />
    </>
  );
}
