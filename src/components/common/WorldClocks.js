import React, { useState, useEffect } from 'react';

const cities = [
  { name: 'Hanoi', timeZone: 'Asia/Ho_Chi_Minh', lat: 21.0285, lon: 105.8542 },
  { name: 'New York', timeZone: 'America/New_York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', timeZone: 'Europe/London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', timeZone: 'Europe/Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', timeZone: 'Asia/Tokyo', lat: 35.6762, lon: 139.6503 },
];

const WorldClocks = () => {
  const [time, setTime] = useState(new Date());
  const [temperatures, setTemperatures] = useState({});

  useEffect(() => {
    // Update the time every second
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Fetch temperatures for all cities from Open-Meteo (free API, no key required)
    const fetchTemperatures = async () => {
      try {
        const temps = {};
        await Promise.all(
          cities.map(async (city) => {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`);
            const data = await response.json();
            if (data.current_weather) {
              temps[city.name] = Math.round(data.current_weather.temperature);
            }
          })
        );
        setTemperatures(temps);
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };
    
    fetchTemperatures();
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8 mb-4">
      {cities.map((city) => {
        // Format the time for the specific timezone
        const timeString = new Intl.DateTimeFormat('en-US', {
          timeZone: city.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(time);
        
        return (
          <div key={city.name} className="flex flex-col items-center bg-surface-container-lowest/50 backdrop-blur-sm px-8 py-5 rounded-3xl shadow-md border border-outline-variant/30 min-w-[160px] hover:scale-105 hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{city.name}</span>
              {temperatures[city.name] !== undefined && (
                <div className="flex items-center text-xs font-black text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md shadow-sm">
                  {temperatures[city.name]}°C
                </div>
              )}
            </div>
            <span className="text-3xl font-headline font-extrabold text-on-surface group-hover:text-primary transition-colors tracking-tight">{timeString}</span>
          </div>
        );
      })}
    </div>
  );
};

export default WorldClocks;
