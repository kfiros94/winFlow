import { useState, useEffect, createContext, useContext } from 'react';

// ─────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────
const TRANSLATIONS = {
  he: {
    tagline:          'הימורי ספורט חי ותחזיות',
    login:            'כניסה',
    register:         'הרשמה',
    username:         'שם משתמש',
    email:            'אימייל',
    password:         'סיסמה',
    pleaseWait:       'אנא המתן...',
    createAccount:    'צור חשבון',
    welcomeBonus:     '!תקבל 1,000 WinCoins להתחלה',
    welcome:          (name) => `!ברוך הבא, ${name}`,
    balance:          'יתרה',
    sync:             'סנכרון 🔄',
    syncing:          '...מסנכרן',
    logout:           'התנתקות',
    soccer:           'כדורגל',
    nba:              'NBA',
    allLeagues:       'כל הליגות',
    stake:            ':הימור',
    minBetError:      'הימור מינימלי הוא 10 מטבעות',
    noMatches:        'אין משחקים קרובים ב-5 הימים הבאים.',
    today:            'היום',
    tomorrow:         'מחר',
    matchCount:       (n) => `${n} ${n === 1 ? 'משחק' : 'משחקים'}`,
    home:             'בית',
    draw:             'תיקו',
    away:             'חוץ',
    betPlaced:        (n, team) => `!הימרת ${n} WinCoins על ${team}`,
    notEnoughCoins:   '!אין מספיק WinCoins',
    minBetAlert:      '!הימור מינימלי הוא 10 מטבעות',
    syncFailed:       (msg) => `הסנכרון נכשל: ${msg}`,
    betError:         (msg) => `שגיאה: ${msg}`,
    somethingWrong:   'משהו השתבש',
  },
  en: {
    tagline:          'Live Sports Odds & Predictions',
    login:            'Login',
    register:         'Register',
    username:         'Username',
    email:            'Email',
    password:         'Password',
    pleaseWait:       'Please wait...',
    createAccount:    'Create Account',
    welcomeBonus:     "You'll receive 1,000 WinCoins to start!",
    welcome:          (name) => `Welcome, ${name}`,
    balance:          'Balance',
    sync:             '🔄 Sync',
    syncing:          'Syncing...',
    logout:           'Logout',
    soccer:           'Soccer',
    nba:              'NBA',
    allLeagues:       'All Leagues',
    stake:            'Stake:',
    minBetError:      'Minimum bet is 10 coins',
    noMatches:        'No upcoming matches in the next 5 days.',
    today:            'Today',
    tomorrow:         'Tomorrow',
    matchCount:       (n) => `${n} match${n !== 1 ? 'es' : ''}`,
    home:             'HOME',
    draw:             'DRAW',
    away:             'AWAY',
    betPlaced:        (n, team) => `Placed ${n} WinCoins on ${team}!`,
    notEnoughCoins:   'Not enough WinCoins!',
    minBetAlert:      'Minimum bet is 10 coins!',
    syncFailed:       (msg) => `Sync failed: ${msg}`,
    betError:         (msg) => `Error: ${msg}`,
    somethingWrong:   'Something went wrong',
  },
};

// ─────────────────────────────────────────────
// LANGUAGE CONTEXT
// ─────────────────────────────────────────────
const LangContext = createContext(null);
const useLang = () => useContext(LangContext);

function LangProvider({ children }) {
  const [lang, setLang] = useState('he');
  const t = TRANSLATIONS[lang];
  const dir = lang === 'he' ? 'rtl' : 'ltr';
  const toggleLang = () => setLang(l => l === 'he' ? 'en' : 'he');
  return (
    <LangContext.Provider value={{ lang, t, dir, toggleLang }}>
      {children}
    </LangContext.Provider>
  );
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const LEAGUE_META = {
  'NBA':                     { emoji: '🏀' },
  'Premier League':          { emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'La Liga':                 { emoji: '🇪🇸' },
  'Serie A':                 { emoji: '🇮🇹' },
  'Ligue 1':                 { emoji: '🇫🇷' },
  'Bundesliga':              { emoji: '🇩🇪' },
  'Israeli Premier League':  { emoji: '🇮🇱' },
  'UEFA Nations League':     { emoji: '🏆' },
  'FIFA World Cup':          { emoji: '🌍' },
};

function dayLabel(dateStr, t, lang) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(date, today))    return t.today;
  if (sameDay(date, tomorrow)) return t.tomorrow;
  const locale = lang === 'he' ? 'he-IL' : 'en-GB';
  return date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' });
}

function groupByDay(matches, t, lang) {
  const groups = {};
  for (const match of matches) {
    const key = new Date(match.startTime).toDateString();
    if (!groups[key]) groups[key] = { label: dayLabel(match.startTime, t, lang), matches: [] };
    groups[key].matches.push(match);
  }
  return Object.values(groups);
}

// ─────────────────────────────────────────────
// LANG TOGGLE BUTTON
// ─────────────────────────────────────────────
function LangToggle() {
  const { lang, toggleLang } = useLang();
  return (
    <button onClick={toggleLang}
      className="text-xs font-bold border border-gray-600 hover:border-gray-400 text-gray-400 hover:text-white px-3 py-1.5 rounded-full transition-colors cursor-pointer">
      {lang === 'he' ? 'EN' : 'עב'}
    </button>
  );
}

// ─────────────────────────────────────────────
// AUTH SCREEN
// ─────────────────────────────────────────────
function AuthScreen({ onAuthSuccess }) {
  const { t, dir } = useLang();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const url = mode === 'login'
      ? 'http://localhost:8080/api/users/login'
      : 'http://localhost:8080/api/users/register';
    const body = mode === 'login'
      ? { username, password }
      : { username, email, password };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text() || t.somethingWrong);
      onAuthSuccess(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-8">
      {/* Lang toggle */}
      <div className="absolute top-4 end-4">
        <LangToggle />
      </div>

      <h1 className="text-6xl font-extrabold text-blue-500 mb-2 tracking-tight">WinFlow</h1>
      <p className="text-gray-400 mb-10">{t.tagline}</p>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-xl w-full max-w-sm p-8">
        <div className="flex mb-6 bg-gray-900 rounded-xl p-1">
          <button onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.login}
          </button>
          <button onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {t.register}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">{t.username}</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
          </div>
          {mode === 'register' && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">{t.email}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">{t.password}</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2 rounded-xl mt-2 transition-colors cursor-pointer">
            {loading ? t.pleaseWait : mode === 'login' ? t.login : t.createAccount}
          </button>
        </form>

        {mode === 'register' && (
          <p className="text-gray-500 text-xs text-center mt-4">{t.welcomeBonus}</p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MATCH CARD
// ─────────────────────────────────────────────
function MatchCard({ match, betAmount, onBet }) {
  const { t, lang } = useLang();
  const isSoccer = match.sportType === 'SOCCER';
  const meta = LEAGUE_META[match.leagueName] || { emoji: '⚽' };
  const time = new Date(match.startTime).toLocaleTimeString(lang === 'he' ? 'he-IL' : 'en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-gray-800 p-5 rounded-2xl border border-gray-700 shadow-xl hover:border-blue-500/60 transition-all duration-300">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
          {meta.emoji} {match.leagueName}
        </span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>

      <div className="flex justify-between items-center text-base font-bold mb-5">
        <span className="w-[42%] truncate text-start">{match.homeTeam}</span>
        <span className="text-xs text-gray-500 w-[16%] text-center">VS</span>
        <span className="w-[42%] truncate text-end">{match.awayTeam}</span>
      </div>

      <div className={`grid gap-2 ${isSoccer && match.drawOdds ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <button onClick={() => onBet(match.id, 'HOME_WIN', match.homeTeam)}
          className="bg-gray-700/50 hover:bg-blue-600 text-white py-2.5 rounded-xl font-bold transition-colors border border-gray-600 hover:border-blue-500 flex flex-col items-center cursor-pointer">
          <span className="text-[10px] text-gray-400 mb-0.5">{t.home}</span>
          <span>{match.homeWinOdds}</span>
        </button>

        {isSoccer && match.drawOdds && (
          <button onClick={() => onBet(match.id, 'DRAW', t.draw)}
            className="bg-gray-700/50 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-bold transition-colors border border-gray-600 hover:border-yellow-500 flex flex-col items-center cursor-pointer">
            <span className="text-[10px] text-gray-400 mb-0.5">{t.draw}</span>
            <span>{match.drawOdds}</span>
          </button>
        )}

        <button onClick={() => onBet(match.id, 'AWAY_WIN', match.awayTeam)}
          className="bg-gray-700/50 hover:bg-blue-600 text-white py-2.5 rounded-xl font-bold transition-colors border border-gray-600 hover:border-blue-500 flex flex-col items-center cursor-pointer">
          <span className="text-[10px] text-gray-400 mb-0.5">{t.away}</span>
          <span>{match.awayWinOdds}</span>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BETTING APP
// ─────────────────────────────────────────────
function BettingApp({ currentUser, onLogout, onBalanceUpdate }) {
  const { t, dir, lang } = useLang();
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [betAmount, setBetAmount] = useState(10);
  const [betAmountError, setBetAmountError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [selectedSport, setSelectedSport] = useState('SOCCER');
  const [selectedLeague, setSelectedLeague] = useState('All');

  const loadMatches = () => {
    setLoadingMatches(true);
    fetch('http://localhost:8080/api/matches')
      .then(res => res.json())
      .then(data => { setMatches(data); setLoadingMatches(false); })
      .catch(() => setLoadingMatches(false));
  };

  useEffect(() => { loadMatches(); }, []);

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setSelectedLeague('All');
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('http://localhost:8080/api/admin/sync', { method: 'POST' });
      loadMatches();
    } catch (err) {
      alert(t.syncFailed(err.message));
    } finally {
      setSyncing(false);
    }
  };

  const soccerLeagues = ['All', ...new Set(
    matches.filter(m => m.sportType === 'SOCCER').map(m => m.leagueName).filter(Boolean)
  )];

  const filteredMatches = matches
    .filter(m => m.sportType === selectedSport)
    .filter(m => selectedSport === 'NBA' || selectedLeague === 'All' || m.leagueName === selectedLeague);

  const dayGroups = groupByDay(filteredMatches, t, lang);

  const handleBetAmountChange = (e) => {
    const val = Number(e.target.value);
    setBetAmount(val);
    setBetAmountError(val < 10 ? t.minBetError : '');
  };

  const handleBet = async (matchId, prediction, teamName) => {
    if (betAmount < 10) { alert(t.minBetAlert); return; }
    if (currentUser.coinBalance < betAmount) { alert(t.notEnoughCoins); return; }
    try {
      const res = await fetch('http://localhost:8080/api/guesses/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, prediction, coinAmount: betAmount, userId: currentUser.id }),
      });
      if (!res.ok) throw new Error(await res.text() || t.somethingWrong);
      alert(t.betPlaced(betAmount, teamName));
      const updatedUser = await (await fetch(`http://localhost:8080/api/users/${currentUser.id}`)).json();
      onBalanceUpdate(updatedUser.coinBalance);
    } catch (err) {
      alert(t.betError(err.message));
    }
  };

  return (
    <div dir={dir} className="min-h-screen bg-[#121212] text-white font-sans">

      {/* Top Nav */}
      <nav className="sticky top-0 z-10 bg-[#121212]/95 backdrop-blur border-b border-gray-800 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-blue-500 tracking-tight">WinFlow</h1>
          <div className="flex items-center gap-3">
            <div className="bg-gray-800 border border-yellow-500/30 px-5 py-1.5 rounded-full">
              <span className="text-gray-400 text-sm">{t.balance}: </span>
              <span className="text-yellow-400 font-bold">{Math.floor(currentUser.coinBalance)} 🪙</span>
            </div>
            <span className="text-gray-500 text-sm hidden sm:block">{currentUser.username}</span>
            <button onClick={handleSync} disabled={syncing}
              className="text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors cursor-pointer disabled:opacity-50">
              {syncing ? t.syncing : t.sync}
            </button>
            <LangToggle />
            <button onClick={onLogout}
              className="text-gray-400 hover:text-white text-sm border border-gray-700 hover:border-gray-400 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
              {t.logout}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-8">

        {/* Sport Selector */}
        <div className="flex gap-3 mb-6">
          {[
            { key: 'SOCCER', label: t.soccer, emoji: '⚽' },
            { key: 'NBA',    label: t.nba,    emoji: '🏀' },
          ].map(({ key, label, emoji }) => (
            <button key={key} onClick={() => handleSportChange(key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer border ${
                selectedSport === key
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
              }`}>
              <span className="text-xl">{emoji}</span> {label}
            </button>
          ))}
        </div>

        {/* League Sub-tabs (Soccer only) */}
        {selectedSport === 'SOCCER' && !loadingMatches && (
          <div className="flex flex-wrap gap-2 mb-6">
            {soccerLeagues.map(league => {
              const meta = LEAGUE_META[league] || { emoji: '⚽' };
              return (
                <button key={league} onClick={() => setSelectedLeague(league)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    selectedLeague === league
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}>
                  {league === 'All' ? `🌍 ${t.allLeagues}` : `${meta.emoji} ${league}`}
                </button>
              );
            })}
          </div>
        )}

        {/* Bet Amount */}
        <div className="flex items-center gap-3 mb-8">
          <label className="text-gray-400 text-sm">{t.stake}</label>
          <input type="number" min={10} value={betAmount} onChange={handleBetAmountChange}
            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-white w-24 text-sm focus:outline-none focus:border-blue-500" />
          <span className="text-yellow-500 text-sm">🪙</span>
          {betAmountError && <span className="text-red-400 text-xs">{betAmountError}</span>}
        </div>

        {/* Match List */}
        {loadingMatches ? (
          <div className="flex justify-center items-center mt-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : dayGroups.length === 0 ? (
          <div className="text-center text-gray-500 mt-32">
            <p className="text-4xl mb-4">{selectedSport === 'NBA' ? '🏀' : '⚽'}</p>
            <p className="text-lg">{t.noMatches}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {dayGroups.map(group => (
              <section key={group.label}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-white">{group.label}</h2>
                  <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                    {t.matchCount(group.matches.length)}
                  </span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.matches.map(match => (
                    <MatchCard key={match.id} match={match} betAmount={betAmount} onBet={handleBet} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
function App() {
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <LangProvider>
      {currentUser
        ? <BettingApp
            currentUser={currentUser}
            onLogout={() => setCurrentUser(null)}
            onBalanceUpdate={(newBalance) => setCurrentUser(prev => ({ ...prev, coinBalance: newBalance }))}
          />
        : <AuthScreen onAuthSuccess={setCurrentUser} />
      }
    </LangProvider>
  );
}

export default App;
