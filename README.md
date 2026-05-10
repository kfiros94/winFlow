# WinFlow

WinFlow is a fullstack sports betting simulation app. Users can register, receive a starting WinCoins balance, browse upcoming football/NBA matches, filter leagues, place predictions on home/draw/away outcomes, and track their betting history and profit/loss.

## Why this project exists

The project was built as a practical fullstack exercise that combines a polished React UI with a Java Spring Boot backend, database persistence, external sports/odds data, and real product flows such as authentication, balance updates, bet placement, and result settlement.

## Main features

- User registration and login
- Starting wallet balance with virtual WinCoins
- Live/upcoming match list
- Football and NBA support
- League filtering with country grouping and flags
- Home/draw/away betting flow with a confirmation modal
- Minimum bet validation and balance checks
- User betting history with pending, won, and lost states
- Net profit/loss and total-bets summary
- Admin sync endpoint for fetching external match data
- Admin match-resolution flow for calculating winners and payouts
- Hebrew/English UI language toggle
- Responsive dark UI built for a product-like experience

## Tech stack

### Frontend

- React
- Vite
- Tailwind CSS
- JavaScript

### Backend

- Java 17
- Spring Boot
- Spring Web MVC
- Spring WebFlux
- Spring Data JPA
- PostgreSQL
- Lombok

### External integrations

- The Odds API for sports odds
- TheSportsDB-style service layer for sports metadata/logos

## Repository structure

```text
winFlow/
├── winflow-client/          # React + Vite frontend
└── winflow/winflow/         # Spring Boot backend
```

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/users/register` | Create a user account |
| POST | `/api/users/login` | Log in an existing user |
| GET | `/api/users/{id}` | Get a user profile |
| GET | `/api/matches` | List available matches |
| GET | `/api/matches/leagues?sport=SOCCER` | List leagues by sport |
| POST | `/api/guesses/place` | Place a prediction/bet |
| GET | `/api/guesses/user/{userId}` | Get a user’s bets |
| POST | `/api/admin/sync` | Sync matches from external APIs |
| POST | `/api/admin/resolve/{matchId}` | Resolve a match and pay winners |

## Getting started

### Prerequisites

- Node.js 20+
- npm
- Java 17+
- PostgreSQL
- An Odds API key

### 1. Clone the repository

```bash
git clone https://github.com/kfiros94/winFlow.git
cd winFlow
```

### 2. Configure the backend

Create a PostgreSQL database named `winflow`.

Set the required environment variables:

```bash
export DB_PASSWORD="your_postgres_password"
export ODDS_API_KEY="your_odds_api_key"
```

The backend configuration lives in:

```text
winflow/winflow/src/main/resources/application.properties
```

Default backend settings:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/winflow
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD}
odds.api.key=${ODDS_API_KEY}
```

### 3. Run the backend

```bash
cd winflow/winflow
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### 4. Run the frontend

In a second terminal:

```bash
cd winflow-client
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Build

Frontend production build:

```bash
cd winflow-client
npm run build
```

Backend tests/build:

```bash
cd winflow/winflow
./mvnw test
```

## Notes

- This is a virtual-coins sports prediction project, not a real-money gambling platform.
- The frontend currently expects the backend at `http://localhost:8080`.
- The backend expects PostgreSQL to be running locally.
- API keys and database passwords should be provided via environment variables and never committed to Git.

## Portfolio value

WinFlow demonstrates fullstack product thinking: frontend UX, backend APIs, database modeling, transactional business logic, external API integration, and bilingual UI support. It is a strong portfolio project for Junior Fullstack roles because it shows both user-facing implementation and backend domain logic.
