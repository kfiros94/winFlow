import { useState, useEffect } from 'react';

function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // This hook runs the exact moment the page loads
  useEffect(() => {
    fetch('http://localhost:8080/api/matches')
      .then(response => response.json())
      .then(data => {
        setMatches(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching matches:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8 font-sans">

      <header className="text-center mb-12 mt-8">
        <h1 className="text-6xl font-extrabold text-blue-500 mb-4 tracking-tight">
          WinFlow
        </h1>
        <p className="text-xl text-gray-400">Live NBA Odds & Predictions</p>
      </header>

      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {matches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl hover:border-blue-500 hover:shadow-blue-900/20 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-400 font-medium">
                  {new Date(match.startTime).toLocaleDateString()}
                </span>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {match.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-xl font-bold mb-8">
                <span className="text-center w-2/5 truncate">{match.homeTeam}</span>
                <span className="text-sm text-gray-500 w-1/5 text-center">VS</span>
                <span className="text-center w-2/5 truncate">{match.awayTeam}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="bg-gray-700/50 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-colors border border-gray-600 hover:border-blue-500 flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-1">HOME WIN</span>
                  <span className="text-lg">{match.homeWinOdds}</span>
                </button>
                <button className="bg-gray-700/50 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-colors border border-gray-600 hover:border-blue-500 flex flex-col items-center">
                  <span className="text-xs text-gray-400 mb-1">AWAY WIN</span>
                  <span className="text-lg">{match.awayWinOdds}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;