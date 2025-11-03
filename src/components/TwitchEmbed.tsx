"use client";

import React from 'react';

interface TwitchEmbedProps {
  channel: string;
}

const TwitchEmbed: React.FC<TwitchEmbedProps> = ({ channel }) => {
  // Get the current hostname for the 'parent' parameter required by Twitch embeds
  const parentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  return (
    <div className="w-full max-w-4xl mx-auto bg-[hsl(240,21%,15%)] rounded-lg overflow-hidden shadow-lg border border-[hsl(235,13%,30%)]">
      <div className="relative" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
        <iframe
          src={`https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}&autoplay=false&muted=true`}
          height="100%"
          width="100%"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
          title={`${channel} Twitch Stream`}
        ></iframe>
      </div>
      <div className="p-4 text-center">
        <p className="text-lg font-semibold text-[hsl(220,17%,92%)]">
          Watch <a href={`https://twitch.tv/${channel}`} target="_blank" rel="noopener noreferrer" className="text-[#cba6f7] hover:underline">{channel}</a> live on Twitch!
        </p>
        <p className="text-sm text-[hsl(222,15%,60%)] mt-1">
          (Stream is muted by default. Click the player to unmute.)
        </p>
      </div>
    </div>
  );
};

export default TwitchEmbed;