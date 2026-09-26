# Foyer

Foyer is an event platform that brings everything an event needs into one place. Businesses can
create and publish events, sell tickets and check guests in at the door. Attendees can browse
events, register and keep all their tickets in one account.

Built by **Team Foyer** in Sydney, Australia, as our final project for Capstone Experience.

## Features

- **Two account types.** Business accounts run events, and Personal accounts attend them.
- **Event pages.** Each event page shows the date, time, venue, room, catering and ticket price.
- **Digital tickets.** Attendees receive a ticket with a QR code as soon as they register.
- **Check-in.** Businesses scan a ticket's QR code, or enter its ticket code, to check guests in.
- **Calendar export.** Attendees can add an event to their calendar.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home page: upcoming events, services, team, pricing and contact |
| `event.html` | Details and registration for a single event |
| `signup.html` / `login.html` | Create an account or log in (Business or Personal) |
| `business.html` | Business portal: create events, view guests, check guests in |
| `personal.html` | Personal portal: view tickets and profile |
| `team.html` | About Team Foyer |

## Running the project

Foyer is a static website with no build step or installation.

1. Download or clone this repository.
2. Open `index.html` in a web browser.

The QR check-in scanner needs camera access. Browsers only allow that on `https://` or
`localhost`, so to test scanning, serve the folder locally, for example:

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

### Demo accounts

The site creates sample data the first time it loads. All demo accounts use the password
`password123`.

| Account type | Email |
| --- | --- |
| Business | `demo@naps.com` |
| Business | `meetups@example.com` |
| Personal | `sam@example.com` |

## How data is stored

For now, all data is kept in the browser's `localStorage` by `js/db.js`, so it stays on the device
you are using. Pages only talk to the functions in `js/db.js`, so it can later be replaced with
calls to a real server without changing the pages. `schema.sql` contains the matching database
tables for a PostgreSQL server.

## Project structure

```
├── index.html, event.html, login.html, signup.html,
│   business.html, personal.html, team.html
├── css/style.css        # All styles
├── js/db.js             # Browser database, accounts and tickets
├── js/site.js           # Shared page behaviour (navigation, header)
├── images/team/         # Team photos
├── images/venues/       # Venue photos (see CREDITS.txt)
└── schema.sql           # Database schema for the production server
```

## Team

| Name | Role |
| --- | --- |
| Charchit Dhungana | Founder · Front end and security |
| Prithvi Shrestha | Database and back end |
| Abiral Tiwari | Testing and documentation |

## Credits

Venue photos are from Wikimedia Commons; see `images/venues/CREDITS.txt` for details. QR codes are
generated with [QRCode.js](https://github.com/davidshimjs/qrcodejs) and scanned with
[html5-qrcode](https://github.com/mebjas/html5-qrcode).
