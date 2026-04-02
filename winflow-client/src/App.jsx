import { useState, useEffect, createContext, useContext } from 'react';
import winflowLogo from './assets/winflowLogo.png';

// ─────────────────────────────────────────────
// TRANSLATIONS
// ─────────────────────────────────────────────
const TRANSLATIONS = {
  he: {
    // Auth
    tagline:          'הימורי ספורט חי ותחזיות',
    login:            'כניסה',
    register:         'הרשמה',
    username:         'שם משתמש',
    email:            'אימייל',
    password:         'סיסמה',
    pleaseWait:       'אנא המתן...',
    createAccount:    'צור חשבון',
    welcomeBonus:     '!תקבל 1,000 WinCoins להתחלה',
    somethingWrong:   'משהו השתבש',
    // Nav
    navMatches:       'משחקים',
    navMyBets:        'ההימורים שלי',
    balance:          'יתרה',
    sync:             'סנכרון 🔄',
    syncing:          '...מסנכרן',
    logout:           'התנתקות',
    // Matches page
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
    // My Bets page
    allBets:          'הכל',
    pendingBets:      'ממתין',
    wonBets:          'ניצחונות',
    lostBets:         'הפסדים',
    totalBets:        'סה"כ הימורים',
    netPnl:           'רווח/הפסד',
    predictionLabel:  'תחזית',
    oddsLabel:        'מכפיל',
    payoutLabel:      'תשלום',
    potentialLabel:   'פוטנציאל',
    noBets:           'אין הימורים עדיין',
    noBetsHint:       'לך למשחקים והמר על המשחק הראשון שלך!',
    loadingBets:      '...טוען הימורים',
    status_PENDING:   'ממתין',
    status_WIN:       'ניצחון',
    status_LOSS:      'הפסד',
    status_REFUNDED:  'הוחזר',
    pred_HOME_WIN:    'בית',
    pred_AWAY_WIN:    'חוץ',
    pred_DRAW:        'תיקו',
  },
  en: {
    // Auth
    tagline:          'Live Sports Odds & Predictions',
    login:            'Login',
    register:         'Register',
    username:         'Username',
    email:            'Email',
    password:         'Password',
    pleaseWait:       'Please wait...',
    createAccount:    'Create Account',
    welcomeBonus:     "You'll receive 1,000 WinCoins to start!",
    somethingWrong:   'Something went wrong',
    // Nav
    navMatches:       'Matches',
    navMyBets:        'My Bets',
    balance:          'Balance',
    sync:             '🔄 Sync',
    syncing:          'Syncing...',
    logout:           'Logout',
    // Matches page
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
    // My Bets page
    allBets:          'All',
    pendingBets:      'Pending',
    wonBets:          'Won',
    lostBets:         'Lost',
    totalBets:        'Total Bets',
    netPnl:           'Net P&L',
    predictionLabel:  'Pick',
    oddsLabel:        'Odds',
    payoutLabel:      'Payout',
    potentialLabel:   'Potential',
    noBets:           'No bets yet',
    noBetsHint:       'Head to Matches and place your first bet!',
    loadingBets:      'Loading bets...',
    status_PENDING:   'Pending',
    status_WIN:       'Won',
    status_LOSS:      'Lost',
    status_REFUNDED:  'Refunded',
    pred_HOME_WIN:    'Home',
    pred_AWAY_WIN:    'Away',
    pred_DRAW:        'Draw',
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
// GMT CLOCK
// ─────────────────────────────────────────────
function GmtClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');

  return (
    <span className="font-mono text-sm tabular-nums text-gray-400 tracking-wider">
      {hh}:{mm}:{ss}
    </span>
  );
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

      <img src={winflowLogo} alt="WinFlow" className="h-64 w-auto mb-6" />
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
// MY BETS PAGE
// ─────────────────────────────────────────────
const STATUS_STYLE = {
  PENDING:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  WIN:      'bg-green-500/10  text-green-400  border-green-500/30',
  LOSS:     'bg-red-500/10    text-red-400    border-red-500/30',
  REFUNDED: 'bg-gray-500/10  text-gray-400   border-gray-500/30',
};

function MyBetsPage({ currentUser }) {
  const { t, lang } = useLang();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL | PENDING | WIN | LOSS

  useEffect(() => {
    fetch(`http://localhost:8080/api/guesses/user/${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        // Newest first
        setBets(data.sort((a, b) => new Date(b.guessTime) - new Date(a.guessTime)));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [currentUser.id]);

  const filtered = filter === 'ALL' ? bets : bets.filter(b => b.status === filter);

  // Summary stats
  const totalBets  = bets.length;
  const wins       = bets.filter(b => b.status === 'WIN').length;
  const losses     = bets.filter(b => b.status === 'LOSS').length;
  const pending    = bets.filter(b => b.status === 'PENDING').length;
  const netPnl     = bets.reduce((acc, b) => {
    if (b.status === 'WIN')  return acc + (b.rewardAmount - b.coinAmount);
    if (b.status === 'LOSS') return acc - b.coinAmount;
    return acc;
  }, 0);

  const locale = lang === 'he' ? 'he-IL' : 'en-GB';

  const filters = [
    { key: 'ALL',     label: t.allBets },
    { key: 'PENDING', label: t.pendingBets },
    { key: 'WIN',     label: t.wonBets },
    { key: 'LOSS',    label: t.lostBets },
  ];

  return (
    <main className="max-w-4xl mx-auto px-8 py-8">

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: t.totalBets,   value: totalBets, color: 'text-white' },
          { label: t.wonBets,     value: wins,      color: 'text-green-400' },
          { label: t.lostBets,    value: losses,    color: 'text-red-400' },
          { label: t.pendingBets, value: pending,   color: 'text-yellow-400' },
          {
            label: t.netPnl,
            value: `${netPnl >= 0 ? '+' : ''}${Math.round(netPnl)} 🪙`,
            color: netPnl >= 0 ? 'text-green-400' : 'text-red-400',
          },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors cursor-pointer ${
              filter === f.key
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Bet List */}
      {loading ? (
        <div className="flex justify-center items-center mt-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 mt-24">
          <p className="text-5xl mb-4">🎲</p>
          <p className="text-lg font-semibold text-gray-400">{t.noBets}</p>
          <p className="text-sm mt-2">{t.noBetsHint}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(bet => {
            const meta = LEAGUE_META[bet.leagueName] || { emoji: '⚽' };
            const predKey = `pred_${bet.predictionOutcome}`;
            const statusKey = `status_${bet.status}`;
            const isWin = bet.status === 'WIN';
            const isPending = bet.status === 'PENDING';
            const potential = bet.coinAmount * (bet.odds || 1);

            return (
              <div key={bet.id}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5 hover:border-gray-600 transition-colors">

                {/* Top row: league + date + status */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                    {meta.emoji} {bet.leagueName || 'NBA'}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">
                      {new Date(bet.guessTime).toLocaleDateString(locale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_STYLE[bet.status] || STATUS_STYLE.PENDING}`}>
                      {t[statusKey] || bet.status}
                    </span>
                  </div>
                </div>

                {/* Match name */}
                <p className="font-bold text-white text-base mb-4">
                  {bet.homeTeam} <span className="text-gray-500 font-normal text-sm">vs</span> {bet.awayTeam}
                </p>

                {/* Bet details row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-gray-900 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{t.predictionLabel}</p>
                    <p className="font-bold text-blue-400">{t[predKey] || bet.predictionOutcome}</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">{t.oddsLabel}</p>
                    <p className="font-bold text-white">{bet.odds?.toFixed(2) ?? '—'}</p>
                  </div>
                  <div className="bg-gray-900 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      {isWin ? t.payoutLabel : t.potentialLabel}
                    </p>
                    <p className={`font-bold ${isWin ? 'text-green-400' : isPending ? 'text-yellow-400' : 'text-gray-500'}`}>
                      {isWin
                        ? `+${Math.round(bet.rewardAmount)} 🪙`
                        : isPending
                          ? `${Math.round(potential)} 🪙`
                          : `—`}
                    </p>
                  </div>
                </div>

                {/* Stake */}
                <p className="text-xs text-gray-500 mt-3 text-end">
                  {t.stake} <span className="text-white font-semibold">{bet.coinAmount} 🪙</span>
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────
// BETTING APP
// ─────────────────────────────────────────────
function BettingApp({ currentUser, onLogout, onBalanceUpdate }) {
  const { t, dir, lang } = useLang();
  const [currentPage, setCurrentPage] = useState('matches'); // 'matches' | 'my-bets'
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

      {/* Navbar */}
      <nav className="sticky top-0 z-10 bg-[#0d0d0d] border-b border-white/5 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Left: Logo + divider + clock */}
          <div className="flex items-center gap-3 shrink-0">
            <img src={winflowLogo} alt="WinFlow" className="h-16 w-auto" />
            <span className="w-px h-4 bg-gray-700" />
            <GmtClock />
          </div>

          {/* Center: Page tabs */}
          <div className="flex bg-gray-900/80 rounded-lg p-0.5 gap-0.5">
            {[
              { key: 'matches', label: t.navMatches },
              { key: 'my-bets', label: t.navMyBets },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setCurrentPage(key)}
                className={`px-5 py-1.5 rounded-md text-sm font-semibold transition-all cursor-pointer ${
                  currentPage === key
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {label}
              </button>
            ))}
          </div>

          {/* Right: Balance + controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Balance */}
            <div className="flex items-center gap-2 bg-gray-900 border border-yellow-500/20 rounded-lg px-4 py-1.5">
              <span className="text-yellow-400 font-bold tabular-nums">{Math.floor(currentUser.coinBalance).toLocaleString()}</span>
              <span className="text-yellow-500 text-base">🪙</span>
            </div>

            {/* Username */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800">
              <span className="text-[10px] text-gray-600">▼</span>
              <span className="text-sm text-gray-300 font-medium">{currentUser.username}</span>
            </div>

            {/* Divider */}
            <span className="w-px h-5 bg-gray-800 mx-1" />

            {/* Sync */}
            <button onClick={handleSync} disabled={syncing} title={syncing ? t.syncing : t.sync}
              className="text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-40">
              <span className={`text-base ${syncing ? 'animate-spin inline-block' : ''}`}>🔄</span>
            </button>

            {/* Lang */}
            <LangToggle />

            {/* Logout */}
            <button onClick={onLogout}
              className="text-gray-500 hover:text-red-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer">
              {t.logout}
            </button>
          </div>

        </div>
      </nav>

      {currentPage === 'my-bets' && <MyBetsPage currentUser={currentUser} />}

      <main className={`max-w-7xl mx-auto px-8 py-8 ${currentPage === 'my-bets' ? 'hidden' : ''}`}>

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
