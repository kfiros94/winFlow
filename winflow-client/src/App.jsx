import { useState, useEffect, useRef, createContext, useContext } from 'react';
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
    sportLabel:       'ספורט',
    leagueLabel:      'ליגה',
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
    sportLabel:       'Sport',
    leagueLabel:      'League',
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
// Emoji used on match cards (works everywhere)
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

// ── 1. EXACT LEAGUE → COUNTRY MAPPING ────────────────────────────────────────
// Maps every known league name to its country and flagcdn.com image URL.
// Add any new league here and the dropdown groups itself automatically.
const LEAGUE_TO_COUNTRY = {
  // ── International ──
  'UEFA Champions League':         { country: 'International', flagUrl: null },
  'UEFA Europa League':            { country: 'International', flagUrl: null },
  'UEFA Europa Conference League': { country: 'International', flagUrl: null },
  'UEFA Nations League':           { country: 'International', flagUrl: null },
  'FIFA World Cup':                { country: 'International', flagUrl: null },
  'International Friendlies':      { country: 'International', flagUrl: null },
  // ── England ──
  'Premier League':                { country: 'England',       flagUrl: 'https://flagcdn.com/gb-eng.svg' },
  'Championship':                  { country: 'England',       flagUrl: 'https://flagcdn.com/gb-eng.svg' },
  'League One':                    { country: 'England',       flagUrl: 'https://flagcdn.com/gb-eng.svg' },
  'League Two':                    { country: 'England',       flagUrl: 'https://flagcdn.com/gb-eng.svg' },
  // ── Spain ──
  'La Liga':                       { country: 'Spain',         flagUrl: 'https://flagcdn.com/es.svg' },
  'La Liga 2':                     { country: 'Spain',         flagUrl: 'https://flagcdn.com/es.svg' },
  // ── Italy ──
  'Serie A':                       { country: 'Italy',         flagUrl: 'https://flagcdn.com/it.svg' },
  'Serie B':                       { country: 'Italy',         flagUrl: 'https://flagcdn.com/it.svg' },
  // ── France ──
  'Ligue 1':                       { country: 'France',        flagUrl: 'https://flagcdn.com/fr.svg' },
  'Ligue 2':                       { country: 'France',        flagUrl: 'https://flagcdn.com/fr.svg' },
  // ── Germany ──
  'Bundesliga':                    { country: 'Germany',       flagUrl: 'https://flagcdn.com/de.svg' },
  '2. Bundesliga':                 { country: 'Germany',       flagUrl: 'https://flagcdn.com/de.svg' },
  '3. Liga':                       { country: 'Germany',       flagUrl: 'https://flagcdn.com/de.svg' },
  // ── Netherlands ──
  'Eredivisie':                    { country: 'Netherlands',   flagUrl: 'https://flagcdn.com/nl.svg' },
  'Eerste Divisie':                { country: 'Netherlands',   flagUrl: 'https://flagcdn.com/nl.svg' },
  // ── Portugal ──
  'Primeira Liga':                 { country: 'Portugal',      flagUrl: 'https://flagcdn.com/pt.svg' },
  'Liga Portugal 2':               { country: 'Portugal',      flagUrl: 'https://flagcdn.com/pt.svg' },
  // ── Scotland ──
  'Scottish Premiership':          { country: 'Scotland',      flagUrl: 'https://flagcdn.com/gb-sct.svg' },
  'Scottish Championship':         { country: 'Scotland',      flagUrl: 'https://flagcdn.com/gb-sct.svg' },
  // ── Belgium ──
  'Belgian First Division A':      { country: 'Belgium',       flagUrl: 'https://flagcdn.com/be.svg' },
  'Belgian First Division B':      { country: 'Belgium',       flagUrl: 'https://flagcdn.com/be.svg' },
  // ── Turkey ──
  'Super Lig':                     { country: 'Turkey',        flagUrl: 'https://flagcdn.com/tr.svg' },
  // ── Israel ──
  'Israeli Premier League':        { country: 'Israel',        flagUrl: 'https://flagcdn.com/il.svg' },
  // ── Brazil ──
  'Brazil Série A':                { country: 'Brazil',        flagUrl: 'https://flagcdn.com/br.svg' },
  'Brazil Série B':                { country: 'Brazil',        flagUrl: 'https://flagcdn.com/br.svg' },
  // ── Argentina ──
  'Primera División':              { country: 'Argentina',     flagUrl: 'https://flagcdn.com/ar.svg' },
  // ── Mexico ──
  'Liga MX':                       { country: 'Mexico',        flagUrl: 'https://flagcdn.com/mx.svg' },
  // ── USA ──
  'MLS':                           { country: 'USA',           flagUrl: 'https://flagcdn.com/us.svg' },
  'NBA':                           { country: 'USA',           flagUrl: 'https://flagcdn.com/us.svg' },
  // ── Australia ──
  'A-League Men':                  { country: 'Australia',     flagUrl: 'https://flagcdn.com/au.svg' },
  'A-League':                      { country: 'Australia',     flagUrl: 'https://flagcdn.com/au.svg' },
  // ── Sweden ──
  'Allsvenskan':                   { country: 'Sweden',        flagUrl: 'https://flagcdn.com/se.svg' },
  'Superettan':                    { country: 'Sweden',        flagUrl: 'https://flagcdn.com/se.svg' },
  // ── Norway ──
  'Eliteserien':                   { country: 'Norway',        flagUrl: 'https://flagcdn.com/no.svg' },
  // ── Denmark ──
  'Superliga':                     { country: 'Denmark',       flagUrl: 'https://flagcdn.com/dk.svg' },
  // ── Greece ──
  'Super League Greece':           { country: 'Greece',        flagUrl: 'https://flagcdn.com/gr.svg' },
  // ── Russia ──
  'Russian Premier League':        { country: 'Russia',        flagUrl: 'https://flagcdn.com/ru.svg' },
  // ── Ukraine ──
  'Ukrainian Premier League':      { country: 'Ukraine',       flagUrl: 'https://flagcdn.com/ua.svg' },
  // ── Saudi Arabia ──
  'Saudi Pro League':              { country: 'Saudi Arabia',  flagUrl: 'https://flagcdn.com/sa.svg' },
  // ── Japan ──
  'J1 League':                     { country: 'Japan',         flagUrl: 'https://flagcdn.com/jp.svg' },
  // ── South Korea ──
  'K League 1':                    { country: 'South Korea',   flagUrl: 'https://flagcdn.com/kr.svg' },
  // ── China ──
  'Chinese Super League':          { country: 'China',         flagUrl: 'https://flagcdn.com/cn.svg' },
};

// ── 2. FUZZY FALLBACK — for leagues not in the exact map above ────────────────
function getLeagueMeta(leagueName) {
  if (LEAGUE_TO_COUNTRY[leagueName]) return LEAGUE_TO_COUNTRY[leagueName];
  const l = leagueName.toLowerCase();
  if (l.includes('england') || l.includes('english') || l.includes('fa cup'))
    return { country: 'England',       flagUrl: 'https://flagcdn.com/gb-eng.svg' };
  if (l.includes('spain') || l.includes('spanish') || l.includes('laliga'))
    return { country: 'Spain',         flagUrl: 'https://flagcdn.com/es.svg' };
  if (l.includes('germany') || l.includes('german') || l.includes('bundesliga') || l.includes('liga - germany'))
    return { country: 'Germany',       flagUrl: 'https://flagcdn.com/de.svg' };
  if (l.includes('france') || l.includes('french') || l.includes('ligue'))
    return { country: 'France',        flagUrl: 'https://flagcdn.com/fr.svg' };
  if (l.includes('italy') || l.includes('italian') || l.includes('serie'))
    return { country: 'Italy',         flagUrl: 'https://flagcdn.com/it.svg' };
  if (l.includes('netherlands') || l.includes('dutch') || l.includes('eredivisie'))
    return { country: 'Netherlands',   flagUrl: 'https://flagcdn.com/nl.svg' };
  if (l.includes('portugal') || l.includes('portuguese') || l.includes('primeira'))
    return { country: 'Portugal',      flagUrl: 'https://flagcdn.com/pt.svg' };
  if (l.includes('scotland') || l.includes('scottish'))
    return { country: 'Scotland',      flagUrl: 'https://flagcdn.com/gb-sct.svg' };
  if (l.includes('belgium') || l.includes('belgian'))
    return { country: 'Belgium',       flagUrl: 'https://flagcdn.com/be.svg' };
  if (l.includes('turkey') || l.includes('turkish') || l.includes('süper') || l.includes('super lig'))
    return { country: 'Turkey',        flagUrl: 'https://flagcdn.com/tr.svg' };
  if (l.includes('israel') || l.includes('israeli'))
    return { country: 'Israel',        flagUrl: 'https://flagcdn.com/il.svg' };
  if (l.includes('brazil') || l.includes('brasileiro') || l.includes('série'))
    return { country: 'Brazil',        flagUrl: 'https://flagcdn.com/br.svg' };
  if (l.includes('argentina') || l.includes('argentine'))
    return { country: 'Argentina',     flagUrl: 'https://flagcdn.com/ar.svg' };
  if (l.includes('mexico') || l.includes('mexican') || l.includes('liga mx'))
    return { country: 'Mexico',        flagUrl: 'https://flagcdn.com/mx.svg' };
  if (l.includes('mls') || l.includes('major league soccer') || l.includes('usa'))
    return { country: 'USA',           flagUrl: 'https://flagcdn.com/us.svg' };
  if (l.includes('australia') || l.includes('a-league'))
    return { country: 'Australia',     flagUrl: 'https://flagcdn.com/au.svg' };
  if (l.includes('sweden') || l.includes('swedish') || l.includes('allsvenskan'))
    return { country: 'Sweden',        flagUrl: 'https://flagcdn.com/se.svg' };
  if (l.includes('norway') || l.includes('norwegian') || l.includes('eliteserien'))
    return { country: 'Norway',        flagUrl: 'https://flagcdn.com/no.svg' };
  if (l.includes('denmark') || l.includes('danish') || l.includes('superliga'))
    return { country: 'Denmark',       flagUrl: 'https://flagcdn.com/dk.svg' };
  if (l.includes('greece') || l.includes('greek'))
    return { country: 'Greece',        flagUrl: 'https://flagcdn.com/gr.svg' };
  if (l.includes('russia') || l.includes('russian'))
    return { country: 'Russia',        flagUrl: 'https://flagcdn.com/ru.svg' };
  if (l.includes('ukraine') || l.includes('ukrainian'))
    return { country: 'Ukraine',       flagUrl: 'https://flagcdn.com/ua.svg' };
  if (l.includes('saudi') || l.includes('arabic'))
    return { country: 'Saudi Arabia',  flagUrl: 'https://flagcdn.com/sa.svg' };
  if (l.includes('japan') || l.includes('j1') || l.includes('j-league'))
    return { country: 'Japan',         flagUrl: 'https://flagcdn.com/jp.svg' };
  if (l.includes('korea') || l.includes('k league'))
    return { country: 'South Korea',   flagUrl: 'https://flagcdn.com/kr.svg' };
  if (l.includes('china') || l.includes('chinese'))
    return { country: 'China',         flagUrl: 'https://flagcdn.com/cn.svg' };
  if (l.includes('uefa') || l.includes('fifa') || l.includes('world cup') || l.includes('nations'))
    return { country: 'International', flagUrl: null };
  return { country: 'Other', flagUrl: null };
}

// ── 3. GROUP + SORT a flat list of league names ───────────────────────────────
// Returns: [{ country, flagUrl, leagues: [name, ...] }, ...]
// International first → rest alphabetical → Other last
function groupLeaguesByCountry(leagueNames) {
  const groups = {};
  for (const name of leagueNames) {
    const { country, flagUrl } = getLeagueMeta(name);
    if (!groups[country]) groups[country] = { country, flagUrl, leagues: [] };
    groups[country].leagues.push(name);
  }
  // Sort leagues within each country alphabetically
  for (const g of Object.values(groups)) g.leagues.sort();
  // Sort countries: International → A–Z → Other
  return Object.values(groups).sort((a, b) => {
    if (a.country === 'International') return -1;
    if (b.country === 'International') return 1;
    if (a.country === 'Other')         return 1;
    if (b.country === 'Other')         return -1;
    return a.country.localeCompare(b.country);
  });
}

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
// LEAGUE DROPDOWN (custom — supports flag images)
// ─────────────────────────────────────────────
function LeagueDropdown({ value, onChange, t, leagues }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Group the API-returned league names by country using our mapping
  const grouped = groupLeaguesByCountry(leagues);

  // Resolve the selected league's flag for the trigger button
  const selectedMeta = value !== 'All' ? getLeagueMeta(value) : null;
  const selectedFlag = selectedMeta?.flagUrl ?? null;
  const selectedLabel = value !== 'All' ? value : t.allLeagues;

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button onClick={() => setOpen(o => !o)}
        className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none cursor-pointer min-w-[230px] flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          {selectedFlag
            ? <img src={selectedFlag} alt="" className="w-6 h-4 object-cover rounded-sm shrink-0" />
            : <span className="text-base">🌍</span>}
          <span className="truncate">{selectedLabel}</span>
        </span>
        <span className="text-gray-500 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full mt-1 start-0 z-50 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden min-w-[240px] max-h-96 overflow-y-auto">

          {/* All Leagues row */}
          <button onClick={() => { onChange('All'); setOpen(false); }}
            className={`w-full px-4 py-2.5 text-start text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors ${value === 'All' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}>
            <span className="text-base">🌍</span>
            {t.allLeagues}
          </button>

          {/* One section per country, sorted International → A–Z → Other */}
          {grouped.map(group => (
            <div key={group.country}>
              {/* Country header */}
              <div className="px-4 py-1.5 flex items-center gap-2 bg-gray-800/70 border-t border-gray-800">
                {group.flagUrl
                  ? <img src={group.flagUrl} alt={group.country} className="w-5 h-3.5 object-cover rounded-sm shrink-0" />
                  : <span className="text-sm">🌐</span>}
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {group.country}
                </span>
              </div>

              {/* League rows — indented under their country */}
              {group.leagues.map(name => {
                const meta = getLeagueMeta(name);
                return (
                  <button key={name} onClick={() => { onChange(name); setOpen(false); }}
                    className={`w-full px-4 py-2.5 ps-8 text-start text-sm flex items-center gap-2 hover:bg-gray-800 transition-colors ${value === name ? 'text-blue-400 bg-blue-500/10' : 'text-gray-300'}`}>
                    {meta.flagUrl
                      ? <img src={meta.flagUrl} alt="" className="w-6 h-4 object-cover rounded-sm shrink-0" />
                      : <span className="text-base">🏆</span>}
                    {name}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
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
// TEAM LOGO — graceful fallback to initials
// ─────────────────────────────────────────────
function TeamLogo({ src, name, className = 'w-10 h-10' }) {
  const [broken, setBroken] = useState(false);
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  if (!src || broken) {
    return (
      <div className={`${className} rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-[10px] font-bold text-gray-400 shrink-0`}>
        {initials}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      className={`${className} object-contain shrink-0`}
      onError={() => setBroken(true)}
    />
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
      {/* League + time */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
          {meta.emoji} {match.leagueName}
        </span>
        <span className="text-xs text-gray-500">{time}</span>
      </div>

      {/* Teams row with logos */}
      <div className="flex items-center justify-between mb-5 gap-2">
        {/* Home team */}
        <div className="flex flex-col items-center gap-1.5 w-[42%]">
          <TeamLogo src={match.homeTeamLogo} name={match.homeTeam} />
          <span className="text-xs font-bold text-white text-center leading-tight line-clamp-2">
            {match.homeTeam}
          </span>
        </div>

        <span className="text-xs font-bold text-gray-600 shrink-0">VS</span>

        {/* Away team */}
        <div className="flex flex-col items-center gap-1.5 w-[42%]">
          <TeamLogo src={match.awayTeamLogo} name={match.awayTeam} />
          <span className="text-xs font-bold text-white text-center leading-tight line-clamp-2">
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* Bet buttons */}
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
  const [apiLeagues, setApiLeagues] = useState([]);

  const loadMatches = () => {
    setLoadingMatches(true);
    fetch('http://localhost:8080/api/matches')
      .then(res => res.json())
      .then(data => { setMatches(data); setLoadingMatches(false); })
      .catch(() => setLoadingMatches(false));
  };

  useEffect(() => { loadMatches(); }, []);

  useEffect(() => {
    if (selectedSport !== 'SOCCER') { setApiLeagues([]); return; }
    fetch(`http://localhost:8080/api/matches/leagues?sport=SOCCER`)
      .then(res => res.json())
      .then(data => setApiLeagues(data))
      .catch(() => setApiLeagues([]));
  }, [selectedSport]);

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

        {/* Sport & League Dropdowns */}
        <div className="flex flex-wrap items-end gap-4 mb-8">
          {/* Sport Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">{t.sportLabel}</label>
            <select value={selectedSport} onChange={e => handleSportChange(e.target.value)}
              className="bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none focus:border-blue-500 cursor-pointer min-w-[140px]">
              <option value="SOCCER">⚽ {t.soccer}</option>
              <option value="NBA">🏀 {t.nba}</option>
            </select>
          </div>

          {/* League Dropdown (Soccer only) */}
          {selectedSport === 'SOCCER' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">{t.leagueLabel}</label>
              <LeagueDropdown value={selectedLeague} onChange={setSelectedLeague} t={t} leagues={apiLeagues} />
            </div>
          )}
        </div>

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
