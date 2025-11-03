"use client";

import React from 'react';

const Live = () => {
  // Get the current hostname for the 'parent' parameter required by Twitch embeds
  const parentDomain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const channel = 'lsw1live';

  return (
    <div className="min-h-screen bg-[hsl(240,21%,15%)] text-[hsl(220,17%,92%)] py-4">
      <div className="w-full px-2">
        {/* Stream and Chat Container - Full width, maximized */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-4 h-[calc(100vh-80px)]">
          {/* Stream Player - Takes remaining space */}
          <div className="w-full h-full min-h-[400px]">
            <div className="bg-[hsl(240,21%,15%)] rounded-lg overflow-hidden shadow-lg border border-[hsl(235,13%,30%)] w-full h-full">
              <iframe
                src={`https://player.twitch.tv/?channel=${channel}&parent=${parentDomain}&autoplay=false&muted=false`}
                height="100%"
                width="100%"
                allowFullScreen
                className="w-full h-full"
                title={`${channel} Twitch Stream`}
              ></iframe>
            </div>
          </div>

          {/* Chat - Fixed width, full height */}
          <div className="w-full h-full min-h-[400px] hidden lg:block">
            <div className="bg-[hsl(240,21%,15%)] rounded-lg overflow-hidden shadow-lg border border-[hsl(235,13%,30%)] w-full h-full">
              <iframe
                src={`https://www.twitch.tv/embed/${channel}/chat?parent=${parentDomain}&darkpopout`}
                height="100%"
                width="100%"
                className="w-full h-full"
                title={`${channel} Twitch Chat`}
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live;

