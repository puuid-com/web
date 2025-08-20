import { useState, useEffect } from "react";

export default function LoadingScreen() {
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = [
    "Connecting to Riot Games API...",
    "Fetching summoner data...",
    "Analyzing match history...",
    "Loading...",
  ];

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % loadingTexts.length);
    }, 1200);

    return () => {
      clearInterval(textInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      {/* Main loading content */}
      <div className="text-center max-w-md mx-auto px-6">
        {/* Logo/Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-50 mb-2">
            championmastery.lol
          </h1>
          <p className="text-neutral-500 text-sm">
            League of Legends Statistics
          </p>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-3 border-neutral-800 rounded-full"></div>
            <div className="absolute top-0 left-0 w-12 h-12 border-3 border-transparent border-t-neutral-400 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="h-6">
          <p className="text-neutral-400 animate-pulse transition-opacity duration-300">
            {loadingTexts[currentText]}
          </p>
        </div>
      </div>
    </div>
  );
}
