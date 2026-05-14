import { useState, useEffect, useRef, createContext, useContext } from 'react';
import winflowLogo from './assets/winflowLogo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const fetchWithTimeout = async (url, options = {}, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

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
    navStartingSoon:  'מתחיל בקרוב',
    navMyBets:        'ההימורים שלי',
    noStartingSoon:   'אין משחקים שמתחילים ב-3 השעות הקרובות',
    balance:          'יתרה',
    sync:             'סנכרון 🔄',
    syncing:          '...מסנכרן',
    logout:           'התנתקות',
    // Matches page
    soccer:           'כדורגל',
    nba:              'NBA',
    allLeagues:       'כל הליגות',
    selectedLeagues:  (n) => `${n} ליגות נבחרו`,
    clearLeagues:     'נקה בחירה',
    done:             'בוצע',
    searchLeagues:    'חפש ליגה...',
    noLeaguesFound:   'לא נמצאו ליגות',
    close:            'סגור',
    stake:            ':הימור',
    minBetError:      'הימור מינימלי הוא 10 מטבעות',
    sportLabel:       'ספורט',
    leagueLabel:      'ליגה',
    noMatches:        'אין משחקים קרובים ב-5 הימים הבאים.',
    selectLeague:     'בחר ליגה מהתפריט כדי לראות משחקים 👇',
    today:            'היום',
    tomorrow:         'מחר',
    matchCount:       (n) => `${n} ${n === 1 ? 'משחק' : 'משחקים'}`,
    israelTime:       'שעון ישראל',
    searchPlaceholder:'חפש קבוצה או ליגה...',
    boardTitle:       'לוח משחקים חכם',
    boardSubtitle:    'משחקים מסודרים לפי יום, מדינה וליגה — עם מכפילים בזמן אמת',
    hotMarkets:       'שווקים חמים',
    home:             'בית',
    draw:             'תיקו',
    away:             'חוץ',
    betPlaced:        (n, team) => `!הימרת ${n} WinCoins על ${team}`,
    notEnoughCoins:   '!אין מספיק WinCoins',
    minBetAlert:      '!הימור מינימלי הוא 10 מטבעות',
    syncFailed:       (msg) => `הסנכרון נכשל: ${msg}`,
    betError:         (msg) => `שגיאה: ${msg}`,
    // Bet modal
    betSummary:       'סיכום הימור',
    yourPick:         'הבחירה שלך',
    confirmBetBtn:    'אשר הימור ✓',
    cancel:           'ביטול',
    processing:       '...מעבד',
    potentialWin:     'רווח פוטנציאלי',
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
    navStartingSoon:  'Starting Soon',
    navMyBets:        'My Bets',
    noStartingSoon:   'No matches starting in the next 3 hours',
    balance:          'Balance',
    sync:             '🔄 Sync',
    syncing:          'Syncing...',
    logout:           'Logout',
    // Matches page
    soccer:           'Soccer',
    nba:              'NBA',
    allLeagues:       'All Leagues',
    selectedLeagues:  (n) => `${n} leagues selected`,
    clearLeagues:     'Clear selection',
    done:             'Done',
    searchLeagues:    'Search leagues...',
    noLeaguesFound:   'No leagues found',
    close:            'Close',
    stake:            'Stake:',
    minBetError:      'Minimum bet is 10 coins',
    sportLabel:       'Sport',
    leagueLabel:      'League',
    noMatches:        'No upcoming matches in the next 5 days.',
    selectLeague:     'Select a league from the dropdown to see matches 👇',
    today:            'Today',
    tomorrow:         'Tomorrow',
    matchCount:       (n) => `${n} match${n !== 1 ? 'es' : ''}`,
    israelTime:       'Israel time',
    searchPlaceholder:'Search team or league...',
    boardTitle:       'Smart Match Board',
    boardSubtitle:    'Matches grouped by day, country and league — with live market odds',
    hotMarkets:       'Hot markets',
    home:             'HOME',
    draw:             'DRAW',
    away:             'AWAY',
    betPlaced:        (n, team) => `Placed ${n} WinCoins on ${team}!`,
    notEnoughCoins:   'Not enough WinCoins!',
    minBetAlert:      'Minimum bet is 10 coins!',
    syncFailed:       (msg) => `Sync failed: ${msg}`,
    betError:         (msg) => `Error: ${msg}`,
    // Bet modal
    betSummary:       'Bet Summary',
    yourPick:         'Your Pick',
    confirmBetBtn:    'Confirm Bet ✓',
    cancel:           'Cancel',
    processing:       'Processing...',
    potentialWin:     'Potential Win',
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
  // ── More API-supported competitions ──
  'Copa Libertadores':             { country: 'International', flagUrl: null },
  'Copa Sudamericana':             { country: 'International', flagUrl: null },
  'Austrian Bundesliga':           { country: 'Austria',       flagUrl: 'https://flagcdn.com/at.svg' },
  'Swiss Super League':            { country: 'Switzerland',   flagUrl: 'https://flagcdn.com/ch.svg' },
  'Polish Ekstraklasa':            { country: 'Poland',        flagUrl: 'https://flagcdn.com/pl.svg' },
  'Finnish Veikkausliiga':         { country: 'Finland',       flagUrl: 'https://flagcdn.com/fi.svg' },
  'League of Ireland':             { country: 'Ireland',       flagUrl: 'https://flagcdn.com/ie.svg' },
  'Chilean Primera División':      { country: 'Chile',         flagUrl: 'https://flagcdn.com/cl.svg' },
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
  if (l.includes('austria') || l.includes('austrian'))
    return { country: 'Austria',       flagUrl: 'https://flagcdn.com/at.svg' };
  if (l.includes('switzerland') || l.includes('swiss'))
    return { country: 'Switzerland',   flagUrl: 'https://flagcdn.com/ch.svg' };
  if (l.includes('poland') || l.includes('polish') || l.includes('ekstraklasa'))
    return { country: 'Poland',        flagUrl: 'https://flagcdn.com/pl.svg' };
  if (l.includes('finland') || l.includes('finnish') || l.includes('veikkausliiga'))
    return { country: 'Finland',       flagUrl: 'https://flagcdn.com/fi.svg' };
  if (l.includes('ireland') || l.includes('irish'))
    return { country: 'Ireland',       flagUrl: 'https://flagcdn.com/ie.svg' };
  if (l.includes('chile') || l.includes('chilean'))
    return { country: 'Chile',         flagUrl: 'https://flagcdn.com/cl.svg' };
  if (l.includes('libertadores') || l.includes('sudamericana') || l.includes('uefa') || l.includes('fifa') || l.includes('world cup') || l.includes('nations'))
    return { country: 'International', flagUrl: null };
  return { country: 'Other', flagUrl: null };
}

// ── 3. GROUP + SORT a flat list of league names ───────────────────────────────
// These 5 countries always appear at the top of the dropdown, in this exact order.
const PRIORITY_REGIONS = ['International', 'England', 'Spain', 'Germany', 'Italy'];

// Returns: [{ country, flagUrl, leagues: [name, ...] }, ...]
// Priority regions first (in defined order) → rest A–Z → Other last
function groupLeaguesByCountry(leagueNames) {
  const groups = {};
  for (const name of leagueNames) {
    const { country, flagUrl } = getLeagueMeta(name);
    if (!groups[country]) groups[country] = { country, flagUrl, leagues: [] };
    groups[country].leagues.push(name);
  }
  // Sort leagues within each country alphabetically
  for (const g of Object.values(groups)) g.leagues.sort();

  return Object.values(groups).sort((a, b) => {
    const ai = PRIORITY_REGIONS.indexOf(a.country);
    const bi = PRIORITY_REGIONS.indexOf(b.country);
    // Both in priority list → use priority order
    if (ai !== -1 && bi !== -1) return ai - bi;
    // Only a is priority → a comes first
    if (ai !== -1) return -1;
    // Only b is priority → b comes first
    if (bi !== -1) return 1;
    // Neither is priority: Other always last, rest A–Z
    if (a.country === 'Other') return 1;
    if (b.country === 'Other') return -1;
    return a.country.localeCompare(b.country);
  });
}

const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

function israelDateParts(dateStr) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISRAEL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(formatter.formatToParts(new Date(dateStr)).map(p => [p.type, p.value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day), key: `${parts.year}-${parts.month}-${parts.day}` };
}

function israelTodayParts(offsetDays = 0) {
  const base = new Date();
  base.setDate(base.getDate() + offsetDays);
  return israelDateParts(base.toISOString());
}

function dayLabel(dateStr, t, lang) {
  const matchDay = israelDateParts(dateStr);
  const today = israelTodayParts(0);
  const tomorrow = israelTodayParts(1);
  if (matchDay.key === today.key) return t.today;
  if (matchDay.key === tomorrow.key) return t.tomorrow;
  const locale = lang === 'he' ? 'he-IL' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    timeZone: ISRAEL_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date(dateStr));
}

function formatIsraelTime(dateStr, lang) {
  const locale = lang === 'he' ? 'he-IL' : 'en-GB';
  return new Intl.DateTimeFormat(locale, {
    timeZone: ISRAEL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function minutesUntil(dateStr) {
  return Math.round((new Date(dateStr).getTime() - Date.now()) / 60000);
}

function groupByDayAndLeague(matches, t, lang) {
  const groups = {};
  const sorted = [...matches].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  for (const match of sorted) {
    const key = israelDateParts(match.startTime).key;
    if (!groups[key]) groups[key] = { key, label: dayLabel(match.startTime, t, lang), matches: [], leagues: {} };
    groups[key].matches.push(match);

    const leagueName = match.leagueName || (match.sportType === 'NBA' ? 'NBA' : 'Other');
    if (!groups[key].leagues[leagueName]) {
      groups[key].leagues[leagueName] = {
        leagueName,
        ...getLeagueMeta(leagueName),
        matches: [],
      };
    }
    groups[key].leagues[leagueName].matches.push(match);
  }

  return Object.values(groups).map(group => ({
    ...group,
    leagues: Object.values(group.leagues).sort((a, b) => a.leagueName.localeCompare(b.leagueName)),
  }));
}

// Returns matches starting between now and 3 hours from now
function getStartingSoonMatches(matches) {
  const now = new Date();
  const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return matches.filter(m => {
    const start = new Date(m.startTime);
    return start > now && start <= in3Hours;
  });
}

// ─────────────────────────────────────────────
// ISRAEL CLOCK
// ─────────────────────────────────────────────
function IsraelClock() {
  const { t, lang } = useLang();
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const locale = lang === 'he' ? 'he-IL' : 'en-GB';
  const formatted = new Intl.DateTimeFormat(locale, {
    timeZone: ISRAEL_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(time);

  return (
    <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1">
      <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
      <span className="font-mono text-xs tabular-nums text-emerald-200 tracking-wider">{formatted}</span>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/70">{t.israelTime}</span>
    </div>
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
  const [leagueSearch, setLeagueSearch] = useState('');
  const ref = useRef(null);
  const selectedLeagues = Array.isArray(value) ? value : [];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (!isMobile) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  const search = leagueSearch.trim().toLowerCase();
  const filteredLeagues = search
    ? leagues.filter(name => name.toLowerCase().includes(search) || getLeagueMeta(name).country.toLowerCase().includes(search))
    : leagues;
  const grouped = groupLeaguesByCountry(filteredLeagues);

  const selectedLabel = selectedLeagues.length === 0
    ? t.allLeagues
    : selectedLeagues.length === 1
      ? selectedLeagues[0]
      : t.selectedLeagues(selectedLeagues.length);

  const toggleLeague = (leagueName) => {
    onChange(selectedLeagues.includes(leagueName)
      ? selectedLeagues.filter(name => name !== leagueName)
      : [...selectedLeagues, leagueName]);
  };

  const clearSelection = () => {
    onChange([]);
    setLeagueSearch('');
  };

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full min-w-0 bg-gray-800 border border-gray-700 hover:border-gray-500 rounded-xl px-4 py-2.5 text-white text-sm font-semibold focus:outline-none cursor-pointer sm:min-w-[260px] flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-base">🌍</span>
          <span className="truncate">{selectedLabel}</span>
        </span>
        <span className="text-gray-500 text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
        <button type="button" aria-label={t.close} onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden" />
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[78dvh] flex-col overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-2xl lg:absolute lg:bottom-auto lg:start-0 lg:top-full lg:mt-2 lg:max-h-[30rem] lg:min-w-[340px] lg:rounded-2xl">

          <div className="sticky top-0 z-10 border-b border-gray-800 bg-gray-900/95 p-3 backdrop-blur">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold text-white">{t.leagueLabel}</span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={clearSelection} className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-gray-300 hover:border-red-300/40 hover:text-red-200">
                  {t.clearLeagues}
                </button>
                <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  {t.done}
                </button>
              </div>
            </div>
            <input
              value={leagueSearch}
              onChange={e => setLeagueSearch(e.target.value)}
              placeholder={t.searchLeagues}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70"
            />
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
          {grouped.map(group => (
            <div key={group.country}>
              <div className="px-4 py-1.5 flex items-center gap-2 bg-gray-800/70 border-t border-gray-800">
                {group.flagUrl
                  ? <img src={group.flagUrl} alt={group.country} className="w-5 h-3.5 object-cover rounded-sm shrink-0" />
                  : <span className="text-sm">🌐</span>}
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {group.country}
                </span>
              </div>

              {group.leagues.map(name => {
                const meta = getLeagueMeta(name);
                const checked = selectedLeagues.includes(name);
                return (
                  <button key={name} type="button" onClick={() => toggleLeague(name)}
                    className={`w-full px-4 py-3 ps-8 text-start text-sm flex items-center gap-3 hover:bg-gray-800 transition-colors ${checked ? 'text-blue-300 bg-blue-500/10' : 'text-gray-300'}`}>
                    <span className={`flex h-5 w-5 items-center justify-center rounded-md border text-[11px] font-black ${checked ? 'border-blue-300 bg-blue-500 text-white' : 'border-gray-600 text-transparent'}`}>
                      ✓
                    </span>
                    {meta.flagUrl
                      ? <img src={meta.flagUrl} alt="" className="w-6 h-4 object-cover rounded-sm shrink-0" />
                      : <span className="text-base">🏆</span>}
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                  </button>
                );
              })}
            </div>
          ))}

          {grouped.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-500">{t.noLeaguesFound}</div>
          )}
          </div>
        </div>
        </>
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
      ? `${API_BASE_URL}/api/users/login`
      : `${API_BASE_URL}/api/users/register`;
    const body = mode === 'login'
      ? { username, password }
      : { username, email, password };
    try {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      };

      let res;
      try {
        res = await fetchWithTimeout(url, requestOptions, 35000);
      } catch (networkErr) {
        if (mode !== 'login') throw networkErr;
        // Render free instances can be slow on the first request. Retry login once
        // so the button does not feel permanently stuck during backend wake-up.
        await new Promise(resolve => setTimeout(resolve, 1500));
        res = await fetchWithTimeout(url, requestOptions, 35000);
      }

      if (!res.ok) throw new Error(await res.text() || t.somethingWrong);
      onAuthSuccess(await res.json());
    } catch (err) {
      const message = err instanceof TypeError || err.name === 'AbortError'
        ? 'The server did not respond. Please refresh and try again in a few seconds.'
        : err.message;
      setError(message);
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

function OddButton({ label, odds, onClick, accent = 'blue' }) {
  const accentClasses = accent === 'yellow'
    ? 'hover:border-yellow-300/70 hover:bg-yellow-400/15 hover:text-yellow-100'
    : 'hover:border-emerald-300/70 hover:bg-emerald-400/15 hover:text-emerald-100';
  return (
    <button type="button" onClick={onClick}
      className={`group rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-white shadow-inner shadow-white/5 transition-all duration-200 hover:-translate-y-0.5 ${accentClasses} cursor-pointer`}>
      <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 group-hover:text-current">{label}</span>
      <span className="mt-1 block text-xl font-black tabular-nums">{Number(odds).toFixed(2)}</span>
    </button>
  );
}

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// MATCH CARD
// ─────────────────────────────────────────────
function MatchCard({ match, onBet }) {
  const { t, lang } = useLang();
  const isSoccer = match.sportType === 'SOCCER';
  const leagueMeta = getLeagueMeta(match.leagueName || (match.sportType === 'NBA' ? 'NBA' : 'Other'));
  const sportMeta = LEAGUE_META[match.leagueName] || { emoji: match.sportType === 'NBA' ? '🏀' : '⚽' };
  const time = formatIsraelTime(match.startTime, lang);
  const mins = minutesUntil(match.startTime);
  const startingSoon = mins > 0 && mins <= 180;

  return (
    <div className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/30 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300/40 hover:shadow-emerald-950/30">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500" />
      <div className="absolute -end-12 -top-16 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {leagueMeta.flagUrl
              ? <img src={leagueMeta.flagUrl} alt={leagueMeta.country} className="h-4 w-6 rounded-[3px] object-cover shadow" />
              : <span className="text-base">{sportMeta.emoji}</span>}
            <span className="truncate text-xs font-black uppercase tracking-[0.18em] text-sky-200">{match.leagueName || 'NBA'}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">{leagueMeta.country} · {t.israelTime}</p>
        </div>

        <div className="text-end">
          <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 font-mono text-sm font-bold text-white tabular-nums">
            {time}
          </div>
          {startingSoon && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">🔥 {t.navStartingSoon}</p>}
        </div>
      </div>

      <div className="relative mb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl border border-white/5 bg-black/20 p-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo src={match.homeTeamLogo} name={match.homeTeam} className="h-14 w-14" />
          <span className="min-h-[2.2rem] text-sm font-black leading-tight text-white line-clamp-2">{match.homeTeam}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-black tracking-[0.22em] text-slate-500">VS</span>
          <span className="text-[10px] text-slate-600">{sportMeta.emoji}</span>
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo src={match.awayTeamLogo} name={match.awayTeam} className="h-14 w-14" />
          <span className="min-h-[2.2rem] text-sm font-black leading-tight text-white line-clamp-2">{match.awayTeam}</span>
        </div>
      </div>

      <div className={`grid gap-2 ${isSoccer && match.drawOdds ? 'grid-cols-3' : 'grid-cols-2'}`}>
        <OddButton label={t.home} odds={match.homeWinOdds} onClick={() => onBet(match.id, 'HOME_WIN', match.homeTeam)} />
        {isSoccer && match.drawOdds && (
          <OddButton label={t.draw} odds={match.drawOdds} accent="yellow" onClick={() => onBet(match.id, 'DRAW', t.draw)} />
        )}
        <OddButton label={t.away} odds={match.awayWinOdds} onClick={() => onBet(match.id, 'AWAY_WIN', match.awayTeam)} />
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
    fetch(`${API_BASE_URL}/api/guesses/user/${currentUser.id}`)
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
// STARTING SOON PAGE
// ─────────────────────────────────────────────
function StartingSoonPage({ matches, betAmount, onBet, onBetAmountChange, betAmountError }) {
  const { t, dir } = useLang();
  const soonMatches = getStartingSoonMatches(matches);

  return (
    <main dir={dir} className="max-w-7xl mx-auto px-8 py-8">
      {/* Bet amount input — same as main page */}
      <div className="flex items-center gap-3 mb-8">
        <label className="text-gray-400 text-sm">{t.stake}</label>
        <input type="number" min={10} value={betAmount} onChange={onBetAmountChange}
          className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-white w-24 text-sm focus:outline-none focus:border-blue-500" />
        <span className="text-yellow-500 text-sm">🪙</span>
        {betAmountError && <span className="text-red-400 text-xs">{betAmountError}</span>}
      </div>

      {soonMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-gray-500">
          <span className="text-5xl mb-4">⏱️</span>
          <p className="text-lg font-semibold text-gray-400">{t.noStartingSoon}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {soonMatches.map(match => (
            <MatchCard key={match.id} match={match} onBet={onBet} />
          ))}
        </div>
      )}
    </main>
  );
}

// ─────────────────────────────────────────────
// TOAST — auto-dismissing success notification
// ─────────────────────────────────────────────
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-6 end-6 z-[60] flex items-center gap-3 bg-gray-900 border border-green-500/40 text-green-300 px-5 py-3.5 rounded-2xl shadow-2xl">
      <span className="flex items-center justify-center w-6 h-6 bg-green-500/20 rounded-full text-green-400 text-sm shrink-0">✓</span>
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onDismiss} className="text-gray-600 hover:text-gray-400 ms-2 text-xs cursor-pointer">✕</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// BET CONFIRM MODAL
// ─────────────────────────────────────────────
function BetConfirmModal({ pendingBet, match, betAmount, onConfirm, onCancel, loading, t, dir }) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const { prediction, teamName } = pendingBet;
  const odds = prediction === 'HOME_WIN' ? match.homeWinOdds
             : prediction === 'AWAY_WIN' ? match.awayWinOdds
             : match.drawOdds;
  const potentialWin = Math.round(betAmount * (odds || 1));
  const predLabel = { HOME_WIN: t.home, AWAY_WIN: t.away, DRAW: t.draw }[prediction] || prediction;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — click to cancel */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onCancel} />

      {/* Panel */}
      <div dir={dir} className="relative bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="text-base font-bold text-white">{t.betSummary}</h2>
          <button onClick={onCancel}
            className="text-gray-600 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-800 transition-colors cursor-pointer text-lg leading-none">
            ✕
          </button>
        </div>

        {/* Match display */}
        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-800">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-1 w-[42%]">
              <TeamLogo src={match.homeTeamLogo} name={match.homeTeam} className="w-10 h-10" />
              <span className="text-xs font-semibold text-white text-center line-clamp-2 leading-tight">{match.homeTeam}</span>
            </div>
            <span className="text-xs font-bold text-gray-600 shrink-0">VS</span>
            <div className="flex flex-col items-center gap-1 w-[42%]">
              <TeamLogo src={match.awayTeamLogo} name={match.awayTeam} className="w-10 h-10" />
              <span className="text-xs font-semibold text-white text-center line-clamp-2 leading-tight">{match.awayTeam}</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-600 text-center mt-2">{match.leagueName}</p>
        </div>

        {/* Bet summary rows */}
        <div className="px-6 py-2">
          <SummaryRow label={t.yourPick}    value={`${predLabel} — ${teamName}`} />
          <SummaryRow label={t.oddsLabel}   value={odds?.toFixed(2) ?? '—'} />
          <SummaryRow label={t.stake}       value={`${betAmount} 🪙`} />
          <SummaryRow label={t.potentialWin} value={`${potentialWin} 🪙`} highlight />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-800">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-40 cursor-pointer">
            {t.cancel}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t.processing}</>
              : t.confirmBetBtn}
          </button>
        </div>
      </div>
    </div>
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
  const [selectedLeagues, setSelectedLeagues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiLeagues, setApiLeagues] = useState([]);
  // Modal + toast state
  const [pendingBet, setPendingBet] = useState(null); // { matchId, prediction, teamName }
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [toast, setToast] = useState(null); // string message

  // Load matches for selected leagues — empty selection shows the "pick a league" hint
  const loadMatchesForLeagues = (leagues) => {
    if (!leagues.length) {
      setMatches([]);
      setLoadingMatches(false);
      return;
    }
    setLoadingMatches(true);
    const leagueParam = leagues.join(',');
    const url = `${API_BASE_URL}/api/matches?league=${encodeURIComponent(leagueParam)}`;
    fetch(url)
      .then(res => res.json())
      .then(data => { setMatches(data); setLoadingMatches(false); })
      .catch(() => setLoadingMatches(false));
  };

  // Fetch matches when selected leagues change
  useEffect(() => { loadMatchesForLeagues(selectedLeagues); }, [selectedLeagues]);

  useEffect(() => {
    if (selectedSport !== 'SOCCER') { setApiLeagues([]); return; }
    fetch(`${API_BASE_URL}/api/matches/leagues?sport=SOCCER`)
      .then(res => res.json())
      .then(data => setApiLeagues(data))
      .catch(() => setApiLeagues([]));
  }, [selectedSport]);

  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    setSelectedLeagues(sport === 'NBA' ? ['NBA'] : []);
    setSearchQuery('');
  };

  const handleLeagueChange = (leagues) => {
    setSelectedLeagues(leagues);
    setSearchQuery('');
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch(`${API_BASE_URL}/api/admin/sync`, { method: 'POST' });
      loadMatchesForLeagues(selectedLeagues);
    } catch (err) {
      alert(t.syncFailed(err.message));
    } finally {
      setSyncing(false);
    }
  };

  // Matches already filtered by league via API; search still applies client-side
  const searchedMatches = matches.filter(m => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return [m.homeTeam, m.awayTeam, m.leagueName].filter(Boolean).some(value => value.toLowerCase().includes(query));
  });

  const dayGroups = groupByDayAndLeague(searchedMatches, t, lang);
  const startingSoonCount = getStartingSoonMatches(searchedMatches).length;

  const handleBetAmountChange = (e) => {
    const val = Number(e.target.value);
    setBetAmount(val);
    setBetAmountError(val < 10 ? t.minBetError : '');
  };

  // Opens the confirmation modal — no API call yet
  const handleBet = (matchId, prediction, teamName) => {
    if (betAmount < 10) { setToast(t.minBetAlert); return; }
    if (currentUser.coinBalance < betAmount) { setToast(t.notEnoughCoins); return; }
    setPendingBet({ matchId, prediction, teamName });
  };

  // Called when the user clicks "Confirm" inside the modal
  const confirmBet = async () => {
    if (!pendingBet) return;
    const { matchId, prediction, teamName } = pendingBet;
    setConfirmLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/guesses/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, prediction, coinAmount: betAmount, userId: currentUser.id }),
      });
      if (!res.ok) throw new Error(await res.text() || t.somethingWrong);
      setPendingBet(null);
      setToast(t.betPlaced(betAmount, teamName));
      const updatedUser = await (await fetch(`${API_BASE_URL}/api/users/${currentUser.id}`)).json();
      onBalanceUpdate(updatedUser.coinBalance);
    } catch (err) {
      setPendingBet(null);
      setToast(t.betError(err.message));
    } finally {
      setConfirmLoading(false);
    }
  };

  // Resolve the full match object for the modal
  const pendingMatch = pendingBet ? matches.find(m => m.id === pendingBet.matchId) : null;

  return (
    <div dir={dir} className="min-h-screen bg-[radial-gradient(circle_at_top_left,#123124_0,#0f172a_28%,#05070c_68%)] text-white font-sans">

      {/* Bet confirmation modal */}
      {pendingBet && pendingMatch && (
        <BetConfirmModal
          pendingBet={pendingBet}
          match={pendingMatch}
          betAmount={betAmount}
          onConfirm={confirmBet}
          onCancel={() => setPendingBet(null)}
          loading={confirmLoading}
          t={t}
          dir={dir}
        />
      )}

      {/* Success / error toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      {/* Navbar */}
      <nav className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/85 shadow-lg shadow-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

          {/* Left: Logo + divider + clock */}
          <div className="flex items-center gap-3 shrink-0">
            <img src={winflowLogo} alt="WinFlow" className="h-16 w-auto" />
            <span className="w-px h-4 bg-gray-700" />
            <IsraelClock />
          </div>

          {/* Center: Page tabs */}
          <div className="flex bg-gray-900/80 rounded-lg p-0.5 gap-0.5">
            {[
              { key: 'matches',       label: t.navMatches },
              { key: 'starting-soon', label: t.navStartingSoon },
              { key: 'my-bets',       label: t.navMyBets },
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

      {currentPage === 'starting-soon' && (
        <StartingSoonPage matches={matches} betAmount={betAmount} onBet={handleBet}
          onBetAmountChange={handleBetAmountChange} betAmountError={betAmountError} />
      )}

      <main className={`max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8 ${currentPage !== 'matches' ? 'hidden' : ''}`}>

        {/* Premium board header */}
        <section className="relative z-20 mb-8 overflow-visible rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 shadow-2xl shadow-black/30 md:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                {t.hotMarkets}
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">{t.boardTitle}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">{t.boardSubtitle}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Matches</p>
                <p className="text-2xl font-black text-white tabular-nums">{searchedMatches.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Soon</p>
                <p className="text-2xl font-black text-amber-300 tabular-nums">{startingSoonCount}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stake</p>
                <p className="text-2xl font-black text-emerald-300 tabular-nums">{betAmount}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[auto_auto_1fr_auto] lg:items-end">
            {/* Sport Dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.sportLabel}</label>
              <select value={selectedSport} onChange={e => handleSportChange(e.target.value)}
                className="min-w-[150px] cursor-pointer rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-bold text-white outline-none transition hover:border-emerald-300/50 focus:border-emerald-300/70">
                <option value="SOCCER">⚽ {t.soccer}</option>
                <option value="NBA">🏀 {t.nba}</option>
              </select>
            </div>

            {/* League Dropdown (Soccer only) */}
            {selectedSport === 'SOCCER' && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.leagueLabel}</label>
                <LeagueDropdown value={selectedLeagues} onChange={handleLeagueChange} t={t} leagues={apiLeagues} />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Search</label>
              <input type="search" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder}
                className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 hover:border-sky-300/40 focus:border-sky-300/70" />
            </div>

            {/* Bet Amount */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">{t.stake}</label>
              <div className="flex items-center gap-2 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 px-3 py-2">
                <input type="number" min={10} value={betAmount} onChange={handleBetAmountChange}
                  className="w-20 bg-transparent text-sm font-black text-white outline-none" />
                <span className="text-yellow-300">🪙</span>
              </div>
              {betAmountError && <span className="text-red-400 text-xs">{betAmountError}</span>}
            </div>
          </div>
        </section>

        {/* Match List */}
        {loadingMatches ? (
          <div className="flex justify-center items-center mt-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : selectedLeagues.length === 0 || matches.length === 0 ? (
          <div className="text-center text-gray-500 mt-32">
            <p className="text-4xl mb-4">{selectedSport === 'NBA' ? '🏀' : '⚽'}</p>
            <p className="text-lg font-semibold text-gray-400">
              {selectedLeagues.length === 0 ? t.selectLeague : t.noMatches}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {dayGroups.map(group => (
              <section key={group.key}>
                <div className="mb-5 flex items-center gap-3">
                  <h2 className="text-xl font-black text-white">{group.label}</h2>
                  <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-bold text-slate-400">
                    {t.matchCount(group.matches.length)}
                  </span>
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                    {t.israelTime}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                <div className="space-y-6">
                  {group.leagues.map(league => (
                    <div key={`${group.key}-${league.leagueName}`} className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-3 md:p-4">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          {league.flagUrl
                            ? <img src={league.flagUrl} alt={league.country} className="h-4 w-6 rounded-[3px] object-cover" />
                            : <span>🌐</span>}
                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-black text-sky-100">{league.leagueName}</h3>
                            <p className="text-[11px] text-slate-500">{league.country}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-slate-400">{t.matchCount(league.matches.length)}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {league.matches.map(match => (
                          <MatchCard key={match.id} match={match} onBet={handleBet} />
                        ))}
                      </div>
                    </div>
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
