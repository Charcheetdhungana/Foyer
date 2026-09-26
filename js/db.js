/* ============================================================
   Foyer — browser database (temporary)
   Everything is kept in localStorage until the real back end is
   ready. Pages only ever call the functions on window.Foyer, so
   this file can later be swapped for API calls without touching
   the pages. The tables match schema.sql.
   ============================================================ */
(function () {

  var DB_KEY = 'foyer.db.v2';   /* bump when the demo data changes shape */
  var SESSION_KEY = 'foyer.session';

  /* ---------- storage ---------- */
  function load() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) { return null; }
  }
  function save(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  }
  function table(name) { return load()[name]; }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* Ticket codes skip 0/O and 1/I so they are easy to read out at the door. */
  function ticketCode() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return 'FY-' + s;
  }

  /* Passwords are never stored as typed. The real server will use a proper
     slow hash (bcrypt/argon2); this is a stand-in for the browser. */
  function hash(password, salt) {
    var text = salt + ':' + password;
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
      });
    }
    var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return Promise.resolve('fnv' + (h >>> 0).toString(16));
  }

  /* ---------- venues ----------
     Venues are fixed reference data, so they live in code, not in storage.
     Photos are from Wikimedia Commons; see images/venues/CREDITS.txt. */
  var VENUES = [
    { name: 'UTS Broadway', address: '15 Broadway, Ultimo NSW 2007', photo: 'images/venues/uts-broadway.jpg',
      credit: 'Photo: Andrew Worssam, CC BY-SA 4.0, via Wikimedia Commons',
      blurb: 'University campus on Broadway, a short walk from Central Station.' },
    { name: 'Parramatta Square', address: 'Parramatta Square, Parramatta NSW 2150', photo: 'images/venues/parramatta-square.jpg',
      credit: 'Photo: CrossingLights, CC BY 4.0, via Wikimedia Commons',
      blurb: 'Civic and business precinct in the heart of Parramatta.' },
    { name: 'NAPS Parramatta', address: 'Church Street, Parramatta NSW 2150', photo: 'images/venues/parramatta-cbd.jpg',
      credit: 'Photo of Church Street: Nick-D, CC BY-SA 4.0, via Wikimedia Commons',
      blurb: 'Teaching rooms and a lecture theatre just off Church Street.' },
    { name: 'Sydney Town Hall', address: '483 George Street, Sydney NSW 2000', photo: 'images/venues/sydney-town-hall.jpg',
      credit: 'Photo: Tibor Kovacs, CC BY 2.0, via Wikimedia Commons',
      blurb: 'Heritage halls above Town Hall Station, right in the city centre.' },
    { name: 'State Library of NSW', address: '1 Shakespeare Place, Sydney NSW 2000', photo: 'images/venues/state-library-nsw.jpg',
      credit: 'Photo: Geoff Barker, CC BY-SA 4.0, via Wikimedia Commons',
      blurb: 'Auditorium and meeting rooms opposite the Royal Botanic Garden.' }
  ];
  function venue(name) {
    return VENUES.filter(function (v) { return v.name.toLowerCase() === String(name).trim().toLowerCase(); })[0] || null;
  }

  /* ---------- demo data ---------- */
  var NAMES = ['Aarav Sharma', 'Olivia Chen', 'Jack Wilson', 'Priya Patel', 'Liam Nguyen',
    'Mia Thompson', 'Noah Kim', 'Isla Brown', 'Ethan Singh', 'Chloe Martin', 'Lucas Rossi',
    'Ava Walker', 'Kiran Gurung', 'Zoe Taylor', 'Hugo Lee', 'Ruby Evans', 'Sita Karki', 'Leo Adams'];

  function seed() {
    var salt1 = uid('s'), salt2 = uid('s'), salt3 = uid('s');
    return Promise.all([hash('password123', salt1), hash('password123', salt2), hash('password123', salt3)]).then(function (h) {
      var business = {
        id: 'u_naps', role: 'business', email: 'demo@naps.com', salt: salt1, passwordHash: h[0],
        businessName: 'NAPS Events', phone: '0400 000 111', createdAt: '2026-06-01T09:00:00Z'
      };
      var person = {
        id: 'u_sam', role: 'personal', email: 'sam@example.com', salt: salt2, passwordHash: h[1],
        firstName: 'Sam', lastName: 'Rai', phone: '0400 222 333', createdAt: '2026-06-24T09:00:00Z'
      };
      var meetups = {
        id: 'u_wstm', role: 'business', email: 'meetups@example.com', salt: salt3, passwordHash: h[2],
        businessName: 'Western Sydney Tech Meetups', phone: '0400 444 555', createdAt: '2026-05-02T09:00:00Z'
      };

      var events = [
        { id: 'e_django', ownerId: 'u_naps', title: 'Sydney Django Conference 2026',
          description: 'A one-day conference on building web applications, with five talks and a workshop.',
          date: '2026-09-12', time: '09:00', venue: 'UTS Broadway', room: 'Building 11, Level 3, Room CB11.03.200',
          capacity: 120, price: 50, catering: true, cateringPrice: 18,
          recordingUrl: 'https://example.com/recordings/django-2026', status: 'published' },
        { id: 'e_cyber', ownerId: 'u_naps', title: 'Cyber Security Night',
          description: 'Short talks on penetration testing and incident response, followed by networking.',
          date: '2026-09-28', time: '18:00', venue: 'Parramatta Square', room: 'Level 2, Community Hall',
          capacity: 100, price: 0, catering: true, cateringPrice: 0, recordingUrl: '', status: 'published' },
        { id: 'e_pitch', ownerId: 'u_naps', title: 'Student Startup Pitch Day',
          description: 'Ten student teams pitch their ideas to a panel of local founders and investors.',
          date: '2026-10-14', time: '13:00', venue: 'NAPS Parramatta', room: 'Ground floor, Lecture Theatre 1',
          capacity: 80, price: 15, catering: false, cateringPrice: 0, recordingUrl: '', status: 'published' },
        { id: 'e_show', ownerId: 'u_naps', title: 'End of Year Showcase',
          description: 'Final-year students demo their capstone projects to industry guests.',
          date: '2026-12-04', time: '17:00', venue: 'NAPS Parramatta', room: 'Level 1, Exhibition Space',
          capacity: 150, price: 0, catering: true, cateringPrice: 12, recordingUrl: '', status: 'draft' },
        { id: 'e_hack', ownerId: 'u_wstm', title: 'Parramatta Hack Night',
          description: 'Bring a laptop and an idea. Build something in four hours with people from across Western Sydney.',
          date: '2026-07-18', time: '17:30', venue: 'Parramatta Square', room: 'Level 1, Innovation Hub',
          capacity: 60, price: 0, catering: true, cateringPrice: 0,
          recordingUrl: 'https://example.com/recordings/hack-night', status: 'published' },
        { id: 'e_cloud', ownerId: 'u_wstm', title: 'Cloud Skills Workshop',
          description: 'A hands-on morning deploying a small web app to the cloud, from zero to live.',
          date: '2026-08-08', time: '10:00', venue: 'State Library of NSW', room: 'Level 1, Learning Centre',
          capacity: 40, price: 25, catering: true, cateringPrice: 10,
          recordingUrl: 'https://example.com/recordings/cloud-workshop', status: 'published' },
        { id: 'e_ai', ownerId: 'u_wstm', title: 'AI in Healthcare Panel',
          description: 'Clinicians and engineers talk about what AI is really doing in Australian hospitals today.',
          date: '2026-10-22', time: '18:00', venue: 'State Library of NSW', room: 'Ground floor, Metcalfe Auditorium',
          capacity: 120, price: 10, catering: true, cateringPrice: 8, recordingUrl: '', status: 'published' },
        { id: 'e_expo', ownerId: 'u_wstm', title: 'Sydney Startup Expo',
          description: 'Forty early-stage startups, one hall. Meet founders, try products and hear five short keynotes.',
          date: '2026-11-06', time: '11:00', venue: 'Sydney Town Hall', room: 'Lower Town Hall',
          capacity: 300, price: 20, catering: false, cateringPrice: 0, recordingUrl: '', status: 'published' }
      ];

      var regs = [];
      /* Demo check-ins happen in the 20 minutes before the event starts (local time). */
      function arrival(id, i) {
        var e = events.filter(function (x) { return x.id === id; })[0];
        var h = ('0' + (parseInt(e.time, 10) - 1)).slice(-2);
        return e.date + 'T' + h + ':' + (40 + (i % 20)) + ':00';
      }
      function fill(eventId, count, checkedIn, day) {
        for (var i = 0; i < count; i++) {
          var name = NAMES[i % NAMES.length];
          regs.push({
            id: uid('r'), eventId: eventId, userId: null, code: ticketCode(),
            name: name, email: name.toLowerCase().replace(' ', '.') + '@example.com',
            createdAt: day + 'T1' + (i % 10) + ':00:00Z',
            checkedInAt: i < checkedIn ? arrival(eventId, i) : null
          });
        }
      }
      fill('e_django', 18, 15, '2026-08-20');
      fill('e_cyber', 11, 0, '2026-09-15');
      fill('e_pitch', 6, 0, '2026-09-18');
      fill('e_hack', 16, 13, '2026-07-05');
      fill('e_cloud', 12, 10, '2026-07-25');
      fill('e_ai', 14, 0, '2026-09-10');
      fill('e_expo', 17, 0, '2026-09-12');

      regs.push({ id: uid('r'), eventId: 'e_django', userId: 'u_sam', code: 'FY-SAM26D',
        name: 'Sam Rai', email: person.email, createdAt: '2026-08-18T10:00:00Z',
        checkedInAt: '2026-09-12T08:52:00' });
      regs.push({ id: uid('r'), eventId: 'e_hack', userId: 'u_sam', code: 'FY-SAM26H',
        name: 'Sam Rai', email: person.email, createdAt: '2026-07-02T10:00:00Z',
        checkedInAt: '2026-07-18T17:21:00' });
      regs.push({ id: uid('r'), eventId: 'e_cloud', userId: 'u_sam', code: 'FY-SAM26W',
        name: 'Sam Rai', email: person.email, createdAt: '2026-07-20T10:00:00Z', checkedInAt: null });
      regs.push({ id: uid('r'), eventId: 'e_cyber', userId: 'u_sam', code: 'FY-SAM26C',
        name: 'Sam Rai', email: person.email, createdAt: '2026-09-16T10:00:00Z', checkedInAt: null });

      save({ users: [business, person, meetups], events: events, registrations: regs, messages: [] });
    });
  }

  /* When the demo data is rebuilt, keep accounts people made themselves
     (and their events and tickets) from the older version. */
  var OLD_KEYS = ['foyer.db.v1'];
  function carryOver() {
    var db = load(), changed = false;
    OLD_KEYS.forEach(function (key) {
      var old;
      try { old = JSON.parse(localStorage.getItem(key)); } catch (e) { old = null; }
      if (!old || !old.users) return;
      var ids = {}, emails = {};
      db.users.forEach(function (u) { ids[u.id] = true; emails[u.email] = true; });
      var kept = old.users.filter(function (u) { return !ids[u.id] && !emails[u.email]; });
      var keptIds = {};
      kept.forEach(function (u) { keptIds[u.id] = true; db.users.push(u); });
      var evIds = {};
      (old.events || []).forEach(function (e) {
        if (keptIds[e.ownerId]) { db.events.push(e); evIds[e.id] = true; }
      });
      var liveEvents = {};
      db.events.forEach(function (e) { liveEvents[e.id] = true; });
      (old.registrations || []).forEach(function (r) {
        if ((keptIds[r.userId] || evIds[r.eventId]) && liveEvents[r.eventId]) db.registrations.push(r);
      });
      localStorage.removeItem(key);
      changed = true;
    });
    if (changed) save(db);
  }

  var ready = (load() ? Promise.resolve() : seed()).then(carryOver);

  /* ---------- helpers ---------- */
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }
  function isPast(ev) { return ev.date < today(); }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtDate(iso, withDay) {
    var d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-AU', withDay
      ? { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
      : { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function fmtTime(t) {
    if (!t) return '';
    var p = t.split(':'), h = +p[0];
    return (h % 12 || 12) + ':' + p[1] + (h < 12 ? ' am' : ' pm');
  }
  function fmtMoney(n) {
    return n > 0 ? '$' + Number(n).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Free';
  }
  function daysUntil(iso) {
    return Math.round((new Date(iso + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 86400000);
  }
  function displayName(u) {
    return u.role === 'business' ? u.businessName : (u.firstName + ' ' + u.lastName);
  }
  function initials(u) {
    return displayName(u).split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function publicUser(u) {
    if (!u) return null;
    var c = {}; for (var k in u) if (k !== 'passwordHash' && k !== 'salt') c[k] = u[k];
    return c;
  }

  /* ---------- accounts ---------- */
  function findByEmail(email) {
    email = String(email).trim().toLowerCase();
    return table('users').filter(function (u) { return u.email === email; })[0];
  }

  function signup(data) {
    return ready.then(function () {
      var email = String(data.email || '').trim().toLowerCase();
      if (findByEmail(email)) throw new Error('An account with this email already exists. Try logging in.');
      if (!data.password || data.password.length < 8) throw new Error('Password must be at least 8 characters.');
      var salt = uid('s');
      return hash(data.password, salt).then(function (h) {
        var user = { id: uid('u'), role: data.role, email: email, salt: salt, passwordHash: h,
          phone: data.phone || '', createdAt: new Date().toISOString() };
        if (data.role === 'business') user.businessName = data.businessName;
        else { user.firstName = data.firstName; user.lastName = data.lastName; }
        var db = load(); db.users.push(user); save(db);
        localStorage.setItem(SESSION_KEY, user.id);
        return publicUser(user);
      });
    });
  }

  function login(email, password, role) {
    return ready.then(function () {
      var user = findByEmail(email);
      if (!user) throw new Error('Email or password is incorrect.');
      return hash(password, user.salt).then(function (h) {
        if (h !== user.passwordHash) throw new Error('Email or password is incorrect.');
        if (role && user.role !== role) {
          throw new Error('This is a ' + (user.role === 'business' ? 'Business' : 'Personal') +
            ' account. Choose "' + (user.role === 'business' ? 'Business' : 'Personal') + '" above and try again.');
        }
        localStorage.setItem(SESSION_KEY, user.id);
        return publicUser(user);
      });
    });
  }

  function logout() { localStorage.removeItem(SESSION_KEY); }

  function currentUser() {
    var db = load(), id = localStorage.getItem(SESSION_KEY);
    if (!db || !id) return null;
    return publicUser(db.users.filter(function (u) { return u.id === id; })[0]);
  }

  /* Sends visitors to the login page if they are not signed in with the right account type. */
  function requireUser(role) {
    return ready.then(function () {
      var u = currentUser();
      if (!u || u.role !== role) {
        location.replace('login.html?role=' + role + '&next=' + encodeURIComponent(location.pathname.split('/').pop() + location.hash));
        throw new Error('redirecting');
      }
      return u;
    });
  }

  function homeFor(user) { return user.role === 'business' ? 'business.html' : 'personal.html'; }

  /* Where to go after logging in. "next" is only followed if it is one of
     our own pages, so a link cannot bounce people to another site. */
  function afterLogin(user, next) {
    var home = homeFor(user);
    if (next && (next.indexOf(home) === 0 || /^event\.html\?id=[\w-]+$/.test(next))) return next;
    return home;
  }

  function updateUser(id, fields) {
    var db = load();
    db.users.forEach(function (u) {
      if (u.id !== id) return;
      ['businessName', 'firstName', 'lastName', 'phone'].forEach(function (k) {
        if (k in fields) u[k] = String(fields[k]).trim();
      });
    });
    save(db);
    return currentUser();
  }

  /* ---------- events ---------- */
  function getEvent(id) { return table('events').filter(function (e) { return e.id === id; })[0]; }

  function eventsByOwner(ownerId) {
    return table('events').filter(function (e) { return e.ownerId === ownerId; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }

  function publicEvents() {
    return table('events').filter(function (e) { return e.status === 'published' && !isPast(e); })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
  }

  function saveEvent(ev) {
    var db = load();
    if (ev.id) {
      db.events = db.events.map(function (e) {
        return (e.id === ev.id && e.ownerId === ev.ownerId) ? Object.assign({}, e, ev) : e;
      });
    } else {
      ev.id = uid('e');
      db.events.push(ev);
    }
    save(db);
    return ev.id;
  }

  function deleteEvent(id, ownerId) {
    var db = load();
    db.events = db.events.filter(function (e) { return !(e.id === id && e.ownerId === ownerId); });
    db.registrations = db.registrations.filter(function (r) { return r.eventId !== id; });
    save(db);
  }

  /* ---------- registrations ---------- */
  function registrationsForEvent(eventId) {
    return table('registrations').filter(function (r) { return r.eventId === eventId; })
      .sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
  }
  function registrationsForUser(userId) {
    return table('registrations').filter(function (r) { return r.userId === userId; });
  }
  /* What an attendee pays: the ticket plus catering per head, if any. */
  function ticketTotal(ev) { return Number(ev.price) + (ev.catering ? Number(ev.cateringPrice) : 0); }
  function organiserName(ev) {
    var u = table('users').filter(function (x) { return x.id === ev.ownerId; })[0];
    return u ? u.businessName : '';
  }

  function seatsLeft(ev) { return Math.max(0, ev.capacity - registrationsForEvent(ev.id).length); }

  function register(eventId, user) {
    var ev = getEvent(eventId);
    if (!ev || ev.status !== 'published') throw new Error('This event is not open for registration.');
    if (isPast(ev)) throw new Error('This event has already happened.');
    if (registrationsForUser(user.id).some(function (r) { return r.eventId === eventId; }))
      throw new Error('You already have a ticket for this event.');
    if (seatsLeft(ev) === 0) throw new Error('Sorry, this event is sold out.');
    var reg = { id: uid('r'), eventId: eventId, userId: user.id, code: ticketCode(),
      name: user.firstName + ' ' + user.lastName, email: user.email,
      createdAt: new Date().toISOString(), checkedInAt: null };
    var db = load(); db.registrations.push(reg); save(db);
    return reg;
  }

  function cancelRegistration(id, userId) {
    var db = load();
    db.registrations = db.registrations.filter(function (r) { return !(r.id === id && r.userId === userId); });
    save(db);
  }

  /* Only the business that owns the event can check its attendees in. */
  function checkIn(code, eventId, ownerId) {
    code = String(code).trim().toUpperCase();
    if (code && code.indexOf('FY-') !== 0) code = 'FY-' + code;
    var db = load();
    var ev = db.events.filter(function (e) { return e.id === eventId && e.ownerId === ownerId; })[0];
    if (!ev) throw new Error('Choose one of your events first.');
    var reg = db.registrations.filter(function (r) { return r.code === code && r.eventId === eventId; })[0];
    if (!reg) throw new Error('No ticket ' + code + ' found for ' + ev.title + '.');
    if (reg.checkedInAt) throw new Error(reg.name + ' was already checked in at ' +
      new Date(reg.checkedInAt).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }) + '.');
    reg.checkedInAt = new Date().toISOString();
    save(db);
    return reg;
  }

  /* ---------- add to calendar ----------
     Builds a standard .ics file (Google, Apple and Outlook calendars all open it).
     Events have no end time yet, so the calendar entry assumes two hours. */
  function icsText(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n'); }

  function downloadCalendar(ev, reg) {
    var v = venue(ev.venue);
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var start = ev.date.replace(/-/g, '') + 'T' + ev.time.replace(':', '') + '00';
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Foyer//Tickets//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + (reg ? reg.id : ev.id) + '@foyer',
      'DTSTAMP:' + stamp,
      'DTSTART;TZID=Australia/Sydney:' + start,
      'DURATION:PT2H',
      'SUMMARY:' + icsText(ev.title),
      'LOCATION:' + icsText(ev.room + ', ' + (v && v.address.indexOf(ev.venue) === 0 ? v.address : ev.venue + (v ? ', ' + v.address : ''))),
      'DESCRIPTION:' + icsText('Go to: ' + ev.room + (reg ? '\nTicket code: ' + reg.code : '') + '\nHosted by ' + organiserName(ev)),
      'END:VEVENT', 'END:VCALENDAR'
    ];
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }));
    a.download = ev.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------- contact messages ---------- */
  function sendMessage(msg) {
    var db = load();
    db.messages = db.messages || [];
    db.messages.push({ id: uid('m'), name: msg.name, email: msg.email, message: msg.message, createdAt: new Date().toISOString() });
    save(db);
  }

  function reset() { localStorage.removeItem(DB_KEY); logout(); location.reload(); }

  window.Foyer = {
    ready: ready, signup: signup, login: login, logout: logout, currentUser: currentUser,
    requireUser: requireUser, updateUser: updateUser, homeFor: homeFor, afterLogin: afterLogin,
    getEvent: getEvent, eventsByOwner: eventsByOwner, publicEvents: publicEvents,
    saveEvent: saveEvent, deleteEvent: deleteEvent,
    registrationsForEvent: registrationsForEvent, registrationsForUser: registrationsForUser,
    seatsLeft: seatsLeft, register: register, cancelRegistration: cancelRegistration, checkIn: checkIn,
    isPast: isPast, today: today, daysUntil: daysUntil, displayName: displayName, initials: initials,
    ticketTotal: ticketTotal, organiserName: organiserName, downloadCalendar: downloadCalendar, venues: VENUES, venue: venue, sendMessage: sendMessage,
    esc: esc, fmtDate: fmtDate, fmtTime: fmtTime, fmtMoney: fmtMoney, reset: reset
  };
})();
