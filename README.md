# Golden Pavilion

A modern auction house application built with Vite, Vanilla JavaScript, and Bootstrap 5.
It connects to the Noroff v2 Auction API for authentication, listings, bidding, and profile management.

Live page - https://goldenpavilion.netlify.app/

## Features

- Email/password auth with JWT (restricted to @stud.noroff.no)
- User profiles with customizable avatar, banner, and bio
- Credits system visible across all pages when logged in
- Create, edit, and delete auction listings with media galleries
- Place bids on active listings with real-time validation
- Bid history tracking on all listings
- Quick bid feature directly from listing cards
- Search and filter by tags/keywords
- Pagination with mobile-responsive design
- Profile tabs: Listings, Bids, and Wins
- Browse and search available for unregistered users

## Tech Stack

- **Frontend**: Vanilla JS (ES modules) + Vite
- **Styling**: Bootstrap 5.3.2 + Custom CSS (Cinzel & Inter fonts)
- **API**: Noroff v2 Auction API (base: https://v2.api.noroff.dev)
- **Build Tool**: Vite for development and production builds
- **State Management**: LocalStorage for auth tokens and user data

## Project Structure

```
├── index.html                 # Home page with all listings
├── src/
│   ├── pages/                 # HTML pages
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── listings.html
│   │   ├── listing.html       # Single listing detail
│   │   ├── create-listing.html
│   │   ├── edit-listing.html
│   │   └── profile.html
│   ├── js/
│   │   ├── api/               # API client and endpoints
│   │   ├── pages/             # Page-specific JavaScript
│   │   ├── ui/                # UI rendering functions
│   │   └── utils/             # Auth, storage, validation, date helpers
│   └── styles/
│       └── main.css           # Custom styles
├── Logo/                      # Brand assets
└── vite.config.js             # Vite configuration
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/JMaager/semester-project-2.git
cd semester-project-2
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## API Configuration

The app uses the Noroff v2 Auction API. Your API key is stored in `.env`:

```env
VITE_API_KEY=your-api-key-here
```

**Note**: The `.env` file is included in `.gitignore` for security.

## Deployment

The project is configured for deployment to:

- **Netlify**: Drag & drop the `dist/` folder or connect your Git repository
- **GitHub Pages**: Push the `dist/` folder to a `gh-pages` branch

## User Flow

### Unregistered Users

- Browse all listings
- Search and filter by tags
- View individual listing details
- See bid history on listings

### Registered Users

- All unregistered user features, plus:
- Create auction listings with title, description, tags, media, and deadline
- Edit and delete own listings
- Place bids on other users' listings
- Quick bid from listing cards
- View and edit profile (bio, avatar, banner)
- Track own listings, bids, and wins in profile dashboard
- See available credits on every page

## Color Scheme

- **Primary**: #00372B (Dark green)
- **Accent**: #D9B847 (Gold)
- **Background**: #EAE7DC (Cream)
- **Text**: #2C4A42 (Muted green)

## Fonts

- **Headings**: Cinzel (serif)
- **Body**: Inter (sans-serif)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
