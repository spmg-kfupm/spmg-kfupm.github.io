/* SPMG website: shared script for every page.
   Content comes from content/*.json (edited in the admin panel at app.pagescms.org).
   Each page has <body data-page="..."> and only renders the parts it contains. */
(function () {
  var PAGES = [
    ["home", "index.html", "Home", "", ""],
    ["research", "research.html", "Research", "Research Areas", "Our work spans sustainable processing, composites, coatings and data-driven manufacturing."],
    ["equipment", "equipment.html", "Equipment", "Machines & Facilities", "Printing, recycling, testing and inspection equipment available in the lab."],
    ["materials", "materials.html", "Materials", "Polymer Feedstocks", "Standard, reinforced and high-performance feedstocks for additive manufacturing and recycling studies."],
    ["people", "people.html", "People", "Our Team", "Researchers and students working in the group, and our alumni."],
    ["publications", "publications.html", "Publications", "Publications", "Selected recent journal articles and conference papers."],
    ["news", "news.html", "News & Events", "News & Events", "Lab news, upcoming events, awards and visits."],
    ["collaborate", "collaborate.html", "Collaborate", "Work With Us", "Partnerships with academic and industrial researchers."],
    ["global", "global-collaboration.html", "Global Collaboration", "Global Collaboration", "Our partners and joint work with universities, institutes and industry around the world."],
    ["join", "join.html", "Join Us", "Join the Group", "For prospective MS and PhD students, postdocs and undergraduates."],
    ["contact", "contact.html", "Contact", "Get in Touch", "Contact details and research profiles."]
  ];
  var FILES = ["settings", "research", "equipment", "materials", "people", "publications", "events", "collaborations"];
  var page = document.body.getAttribute("data-page") || "home";

  // Old single-page links (e.g. /#people) open the matching page.
  if (page === "home" && location.hash) {
    var h = location.hash.slice(1);
    var map = { about: null, publications: "publications", news: "news", collaborate: "collaborate", join: "join", contact: "contact", people: "people", equipment: "equipment", materials: "materials", research: "research" };
    if (map[h]) { location.replace(map[h] + ".html"); return; }
  }

  function $(id) { return document.getElementById(id); }
  function has(id) { return !!document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function src(p) { return String(p || "").replace(/^\/+/, ""); }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function safeUrl(u) { u = String(u || "").trim(); return /^(https?:|mailto:)/i.test(u) ? u : ""; }
  function initials(name) {
    var parts = String(name || "").replace(/^(Dr|Prof|Eng)\.?\s+/i, "").split(/\s+/).filter(Boolean);
    return (((parts[0] || "")[0] || "") + ((parts.length > 1 ? parts[parts.length - 1] : "")[0] || "")).toUpperCase();
  }
  function avatar(name, photo) {
    var ini = '<span class="initials">' + esc(initials(name)) + '</span>';
    if (!photo) return '<div class="avatar">' + ini + '</div>';
    return '<div class="avatar"><img src="' + esc(src(photo)) + '" alt="' + esc(name) + '" loading="lazy" data-fallback="1"></div>';
  }
  function link(text, url) { var u = safeUrl(url); return u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener">' + esc(text) + '</a>' : esc(text); }
  function fmtDate(d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ""); if (!m) return esc(d || "");
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return Number(m[3]) + " " + months[Number(m[2]) - 1] + " " + m[1];
  }
  function showError(msg) { var e = $("error"); if (e) { e.innerHTML = msg; e.hidden = false; } }
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.getAttribute("data-fallback")) {
      var box = t.parentNode;
      if (box.classList.contains("avatar")) box.innerHTML = '<span class="initials">' + esc(initials(t.alt)) + '</span>';
      else { box.classList.add("empty-photo"); box.innerHTML = '<span>Photo coming soon</span>' + (box.getAttribute("data-badge") || ""); }
    }
  }, true);

  // ---------- Header, navigation, footer (built before content loads) ----------
  var current = PAGES.filter(function (p) { return p[0] === page; })[0] || PAGES[0];
  var navHtml = '<nav class="nav" aria-label="Main"><div class="wrap">' + PAGES.map(function (p) {
    return '<a href="' + p[1] + '"' + (p[0] === page ? ' aria-current="page"' : '') + '>' + esc(p[2]) + '</a>';
  }).join("") + '</div></nav>';
  var headHtml;
  if (page === "home") {
    headHtml = '<header class="hero"><div class="wrap">' +
      '<div class="logo" id="logo"><span class="mono">SPMG</span></div>' +
      '<h1 id="groupName">Sustainable Polymer Manufacturing Group</h1>' +
      '<p class="tagline" id="tagline"></p><p class="dept" id="dept"></p>' +
      '<div class="ctas"><a class="btn primary" href="collaborate.html">Collaborate with us</a><a class="btn ghost" href="join.html">Join the group</a></div>' +
      '</div></header>';
  } else {
    headHtml = '<header class="pagehead"><div class="wrap">' +
      '<a class="brand" href="index.html"><div class="logo" id="logo"><span class="mono">SPMG</span></div><span id="groupName">Sustainable Polymer Manufacturing Group</span></a>' +
      '<div><h1>' + esc(current[3]) + '</h1></div><p>' + esc(current[4]) + '</p></div></header>';
    document.title = current[2] + " | Sustainable Polymer Manufacturing Group | KFUPM";
  }
  $("site-header").innerHTML = headHtml + navHtml;
  var navWrap = document.querySelector(".nav .wrap"), active = document.querySelector('.nav a[aria-current="page"]');
  if (navWrap && active && window.innerWidth < 900) navWrap.scrollLeft = active.offsetLeft - 16;

  // ---------- Load content ----------
  Promise.all(FILES.map(function (f) {
    return fetch("content/" + f + ".json", { cache: "no-cache" }).then(function (r) {
      if (!r.ok) { if (f === "collaborations" && r.status === 404) return "[]"; throw new Error(f + ".json could not be loaded (" + r.status + ")"); }
      return r.text();
    }).then(function (t) {
      try { return JSON.parse(t); } catch (e) { throw new Error("content/" + f + ".json has a formatting mistake: " + e.message); }
    });
  })).then(function (d) {
    render({ s: d[0] || {}, research: arr(d[1]), equipment: arr(d[2]), materials: arr(d[3]), people: arr(d[4]), pubs: arr(d[5]), events: arr(d[6]), collabs: arr(d[7]) });
  }).catch(function (e) {
    if (location.protocol === "file:") {
      showError("<strong>This page loads its content from the <code>content</code> folder, which browsers block when a file is opened directly.</strong> Open the online address instead: https://spmg-kfupm.github.io");
    } else {
      showError("<strong>Some content could not be loaded.</strong> " + esc(e.message) + ". If you just edited it in the admin panel, open that item again and save it.");
    }
  });

  function render(D) {
    var S = D.s, K = S.contact || {};

    // Header details
    if (S.logo) $("logo").innerHTML = '<img src="' + esc(src(S.logo)) + '" alt="' + esc(S.group_name || "") + ' logo">';
    if (S.group_name) { $("groupName").textContent = S.group_name; if (page === "home") document.title = S.group_name + " | KFUPM"; }
    if (has("tagline")) $("tagline").textContent = S.tagline || "";
    if (has("dept")) $("dept").textContent = S.department || "";
    if (has("stats")) {
      var current = D.people.filter(function (p) { return p.name && p.status !== "Alumni"; }).length;
      var stats = [[D.equipment.length, "Instruments & machines", "equipment.html"], [D.materials.length, "Polymer feedstocks", "materials.html"],
        [current, "Team members", "people.html"], [D.pubs.length, "Recent publications", "publications.html"]].filter(function (x) { return x[0] > 0; });
      $("stats").innerHTML = stats.map(function (x) { return '<a class="stat" href="' + x[2] + '" style="color:inherit;text-decoration:none"><b>' + x[0] + '</b><span>' + x[1] + '</span></a>'; }).join("");
    }

    // About (home)
    var A = S.about || {};
    if (has("aboutText")) $("aboutText").textContent = A.text || "";
    if (has("keywords")) $("keywords").innerHTML = arr(A.keywords).filter(Boolean).map(function (k) { return '<span class="chip">' + esc(k) + '</span>'; }).join("");

    // Research
    if (has("researchList")) $("researchList").innerHTML = D.research.map(function (r) {
      return '<article class="card"><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p></article>';
    }).join("");

    // Equipment
    function machineCard(m) {
      var badge = m.is_new ? '<span class="badge">New</span>' : '';
      var photo = m.photo
        ? '<div class="photo" data-badge="' + esc(badge) + '"><img src="' + esc(src(m.photo)) + '" alt="' + esc(m.name) + '" loading="lazy" data-fallback="1">' + badge + '</div>'
        : '<div class="photo empty-photo"><span>Photo coming soon</span>' + badge + '</div>';
      return '<article class="machine">' + photo + '<div class="body"><span class="cat">' + esc(m.category) + '</span><h3>' + esc(m.name) + '</h3>' +
        (S.show_model_names && m.model ? '<span class="model">' + esc(m.model) + '</span>' : '') +
        '<p>' + esc(m.description) + '</p></div></article>';
    }
    if (has("equipmentList")) {
      var eq = D.equipment, cats = ["All"], cur = "All";
      eq.forEach(function (m) { if (m.category && cats.indexOf(m.category) === -1) cats.push(m.category); });
      var renderEq = function () {
        $("equipmentList").innerHTML = eq.filter(function (m) { return cur === "All" || m.category === cur; }).map(machineCard).join("");
      };
      if (has("filters")) {
        $("filters").innerHTML = cats.map(function (c, i) {
          var n = c === "All" ? eq.length : eq.filter(function (m) { return m.category === c; }).length;
          return '<button type="button" id="filter-' + i + '" data-cat="' + esc(c) + '" aria-pressed="' + (c === "All") + '">' + esc(c) + '<span class="count">' + n + '</span></button>';
        }).join("");
        $("filters").addEventListener("click", function (e) {
          var b = e.target.closest("button"); if (!b) return;
          cur = b.getAttribute("data-cat");
          Array.prototype.forEach.call(this.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b); });
          renderEq();
        });
      }
      renderEq();
    }
    if (has("homeEquipment")) {
      var withPhoto = D.equipment.filter(function (m) { return m.photo; });
      $("homeEquipment").innerHTML = (withPhoto.length >= 3 ? withPhoto : D.equipment).slice(0, 3).map(machineCard).join("");
      if (has("equipCount")) $("equipCount").textContent = "See all " + D.equipment.length + " machines →";
    }

    // Materials
    if (has("materialsList")) $("materialsList").innerHTML = D.materials.map(function (m) {
      return '<tr><td class="mat">' + esc(m.name) + (m.is_new ? '<span class="newtag">New</span>' : '') + '</td><td>' + esc(m.form) + '</td><td>' + esc(m.type) + '</td></tr>';
    }).join("");

    // People
    if (has("groups")) {
      var cur2 = D.people.filter(function (p) { return p.name && p.status !== "Alumni"; });
      var alum = D.people.filter(function (p) { return p.name && p.status === "Alumni"; });
      $("piCards").innerHTML = cur2.filter(function (p) { return p.category === "Principal Investigator"; }).map(function (p) {
        return '<article class="pi">' + avatar(p.name, p.photo) + '<div class="text"><p class="eyebrow">Principal Investigator</p>' +
          '<h3 style="font-size:22px">' + esc(p.name) + '</h3><p class="muted">' + esc(p.title) + '</p>' +
          (p.bio ? '<p>' + esc(p.bio) + '</p>' : '') +
          (safeUrl(p.link) ? '<p><a href="' + esc(safeUrl(p.link)) + '" target="_blank" rel="noopener">Publications and profile →</a></p>' : '') +
          '</div></article>';
      }).join("");
      var GROUPS = [
        ["Postdoctoral Researchers & Research Staff", ["Postdoctoral Researcher", "Research Staff", "Visiting Researcher"]],
        ["Graduate Students", ["PhD Student", "MS Student"]],
        ["Undergraduate Students", ["Undergraduate Student"]],
        ["Mawhiba & Ibdaa Students", ["Mawhiba Student", "Ibdaa Student"]]
      ];
      $("groups").innerHTML = GROUPS.map(function (g) {
        var ms = cur2.filter(function (p) { return g[1].indexOf(p.category) !== -1; });
        if (!ms.length && !S.show_empty_groups) return "";
        var inner = ms.length ? '<div class="members">' + ms.map(function (m) {
          return '<div class="member">' + avatar(m.name, m.photo) + '<div class="text"><div class="name">' + link(m.name, m.link) + '</div>' +
            '<div class="role">' + esc(m.title || m.category) + '</div>' + (m.topic ? '<div class="topic">' + esc(m.topic) + '</div>' : '') + '</div></div>';
        }).join("") + '</div>' : '<p class="empty">Names to be added.</p>';
        return '<div class="group"><h3 class="sub">' + esc(g[0]) + '</h3>' + inner + '</div>';
      }).join("");
      if (alum.length) {
        $("alumniWrap").hidden = false;
        $("alumniList").innerHTML = alum.map(function (p) {
          return '<tr><td>' + link(p.name, p.link) + '</td><td>' + esc(p.title || p.category) + '</td><td>' + esc(p.years) + '</td><td>' + esc(p.now_at) + '</td></tr>';
        }).join("");
      }
    }

    // Publications
    var byYear = {};
    D.pubs.forEach(function (p) { var y = p.year || "Other"; (byYear[y] = byYear[y] || []).push(p); });
    var years = Object.keys(byYear).sort(function (a, b) { return (Number(b) || 0) - (Number(a) || 0); });
    function pubItem(p) {
      var meta = [p.authors ? esc(p.authors) : "", p.journal ? '<i>' + esc(p.journal) + '</i>' : ""].filter(Boolean).join(" · ");
      return '<li><div class="pub-title">' + link(p.title, p.link) + '</div><div class="pub-meta">' + meta + '</div></li>';
    }
    if (has("pubList")) {
      var limitYears = page === "home" ? 1 : 99;
      $("pubList").innerHTML = years.slice(0, limitYears).map(function (y) {
        var list = page === "home" ? byYear[y].slice(0, 4) : byYear[y];
        return '<div class="year"><div class="y">' + esc(y) + '<small>' + byYear[y].length + (byYear[y].length === 1 ? " paper" : " papers") + '</small></div><ol>' + list.map(pubItem).join("") + '</ol></div>';
      }).join("");
    }
    if (has("scholarNote")) {
      var scholar = arr(S.profiles).filter(function (p) { return /scholar/i.test(p.label || "") && safeUrl(p.url); })[0];
      if (scholar) $("scholarNote").innerHTML = 'Full publication list on <a href="' + esc(scholar.url) + '" target="_blank" rel="noopener">Google Scholar</a>.';
    }

    // News & events
    if (has("newsList")) {
      var today = new Date().toISOString().slice(0, 10);
      var ev = D.events.filter(function (e) { return e.title; }).slice().sort(function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); });
      var upcoming = ev.filter(function (e) { return (e.date || "") > today; }).reverse();
      var past = ev.filter(function (e) { return (e.date || "") <= today; });
      var ordered = upcoming.concat(past);
      if (page === "home") ordered = ordered.slice(0, 3);
      $("newsList").innerHTML = ordered.length ? ordered.map(function (e) {
        var isSoon = (e.date || "") > today;
        return '<article class="item">' + (e.photo ? '<div class="photo"><img src="' + esc(src(e.photo)) + '" alt="" loading="lazy" data-fallback="1"></div>' : '<div></div>') +
          '<div class="body"><div class="meta"><span class="kind">' + esc(e.category || "News") + '</span><span>' + fmtDate(e.date) + '</span>' +
          (e.location ? '<span>' + esc(e.location) + '</span>' : '') + (isSoon ? '<span class="soon">Upcoming</span>' : '') + '</div>' +
          '<h3>' + link(e.title, e.link) + '</h3>' + (e.summary ? '<p>' + esc(e.summary) + '</p>' : '') + '</div></article>';
      }).join("") : '<p class="empty">News and events will appear here.</p>';
    }

    // Collaborate
    var C = S.collaborate || {};
    if (has("collabIntro")) $("collabIntro").textContent = C.intro || "";
    if (has("expertise")) $("expertise").innerHTML = arr(C.expertise).map(function (x) { return '<article class="card"><h3>' + esc(x.title) + '</h3><p>' + esc(x.text) + '</p></article>'; }).join("");
    if (has("ways")) $("ways").innerHTML = arr(C.ways).filter(Boolean).map(function (w) { return '<li><span>' + esc(w) + '</span></li>'; }).join("");
    if (has("partners")) {
      var partners = arr(C.partners).filter(Boolean);
      if (partners.length) { $("partnersWrap").hidden = false; $("partners").innerHTML = partners.map(function (p) { return '<span class="chip">' + esc(p) + '</span>'; }).join(""); }
    }
    if (has("collabName")) $("collabName").textContent = K.name || "";
    if (has("collabEmail")) $("collabEmail").textContent = K.email || "";

    // Global collaboration
    if (has("collabList")) {
      var cl = D.collabs.filter(function (c) { return c.partner; });
      var countries = [];
      cl.forEach(function (c) { if (c.country && countries.indexOf(c.country) === -1) countries.push(c.country); });
      countries.sort();
      if (has("collabSummary")) $("collabSummary").textContent = cl.length ? cl.length + (cl.length === 1 ? " partner" : " partners") + " in " + countries.length + (countries.length === 1 ? " country" : " countries") : "";
      var curC = "All";
      var renderCollab = function () {
        var list = cl.filter(function (c) { return curC === "All" || c.country === curC; });
        list.sort(function (a, b) { return (a.status === "Completed") - (b.status === "Completed") || String(a.country || "").localeCompare(String(b.country || "")) || String(a.partner).localeCompare(String(b.partner)); });
        $("collabList").innerHTML = list.length ? list.map(function (c) {
          var logo = '<div class="plogo">' + (c.logo ? '<img src="' + esc(src(c.logo)) + '" alt="' + esc(c.partner) + ' logo" loading="lazy">' : '<span>' + esc(initials(c.partner)) + '</span>') + '</div>';
          var meta = [c.country, c.type, c.since ? "Since " + c.since : ""].filter(Boolean).map(esc).join(" · ");
          return '<article class="partner">' + logo + '<div class="text"><div class="pmeta">' + meta + (c.status === "Completed" ? '<span class="done">Completed</span>' : '') + '</div>' +
            '<h3>' + link(c.partner, c.link) + '</h3>' +
            (c.department ? '<p class="pdept">' + esc(c.department) + '</p>' : '') +
            (c.collaborators ? '<p class="pwho">' + esc(c.collaborators) + '</p>' : '') +
            (c.description ? '<p>' + esc(c.description) + '</p>' : '') + '</div></article>';
        }).join("") : '<p class="empty">Our international collaborations will be listed here.</p>';
      };
      if (has("collabFilters") && countries.length > 1) {
        $("collabFilters").innerHTML = ["All"].concat(countries).map(function (c, i) {
          var n = c === "All" ? cl.length : cl.filter(function (x) { return x.country === c; }).length;
          return '<button type="button" id="cfilter-' + i + '" data-c="' + esc(c) + '" aria-pressed="' + (c === "All") + '">' + esc(c) + '<span class="count">' + n + '</span></button>';
        }).join("");
        $("collabFilters").addEventListener("click", function (e) {
          var b = e.target.closest("button"); if (!b) return;
          curC = b.getAttribute("data-c");
          Array.prototype.forEach.call(this.querySelectorAll("button"), function (x) { x.setAttribute("aria-pressed", x === b); });
          renderCollab();
        });
      }
      renderCollab();
    }

    // Join
    var J = S.join || {};
    if (has("joinIntro")) $("joinIntro").textContent = J.intro || "";
    if (has("positions")) {
      var open = arr(J.positions).filter(function (p) { return p.title && p.open !== false; });
      $("positions").innerHTML = open.length ? open.map(function (p) {
        return '<div class="position"><span class="cat">' + esc(p.level || "") + '</span><h3>' + esc(p.title) + '</h3>' + (p.description ? '<p>' + esc(p.description) + '</p>' : '') + '</div>';
      }).join("") : '<p class="empty">No specific openings are listed right now. Strong applicants are always welcome to get in touch.</p>';
    }
    if (has("lookingFor")) $("lookingFor").innerHTML = arr(J.looking_for).filter(Boolean).map(function (w) { return '<li><span>' + esc(w) + '</span></li>'; }).join("");
    if (has("howToApply")) $("howToApply").textContent = J.how_to_apply || "";
    if (has("programsLink") && safeUrl(J.programs_link)) $("programsLink").innerHTML = '<a href="' + esc(J.programs_link) + '" target="_blank" rel="noopener">KFUPM Mechanical Engineering graduate programs →</a>';

    // Contact
    if (has("contactCard")) {
      $("contactCard").innerHTML = '<div><h3>' + esc(K.name) + '</h3><p class="muted" style="margin:4px 0 0">' + esc(K.title) + '</p></div><dl>' +
        (K.email ? '<dt>Email</dt><dd><span id="emailText">' + esc(K.email) + '</span><button type="button" class="copy" id="copyEmail">Copy</button></dd>' : '') +
        (K.phone ? '<dt>Phone</dt><dd>' + esc(K.phone) + '</dd>' : '') +
        (K.location ? '<dt>Office</dt><dd>' + esc(K.location) + '</dd>' : '') +
        (K.address ? '<dt>Address</dt><dd>' + esc(K.address) + '</dd>' : '') + '</dl>';
      var cb = $("copyEmail");
      if (cb) cb.addEventListener("click", function () {
        function selectIt() { var r = document.createRange(); r.selectNodeContents($("emailText")); var s = getSelection(); s.removeAllRanges(); s.addRange(r); cb.textContent = "Selected"; }
        try { navigator.clipboard.writeText(K.email).then(function () { cb.textContent = "Copied"; }, selectIt); } catch (e) { selectIt(); }
      });
    }
    if (has("profileLinks")) {
      var profs = arr(S.profiles).filter(function (p) { return p.label && safeUrl(p.url); });
      $("profileLinks").innerHTML = profs.map(function (p) { return '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.label) + '<span>↗</span></a>'; }).join("");
      if (profs[0] && window.QRCode && has("qr")) {
        new QRCode($("qr"), { text: profs[0].url, width: 132, height: 132, colorDark: "#0F3324", colorLight: "#FFFFFF", correctLevel: QRCode.CorrectLevel.M });
        $("qrLabel").textContent = "Scan for " + profs[0].label;
      } else if (has("qrWrap")) { $("qrWrap").hidden = true; }
    }

    // Footer
    $("site-footer").innerHTML = '<footer><div class="wrap stack"><div class="cols">' +
      '<div><b>' + esc(S.group_name || "") + '</b><span>' + esc(S.department || "") + '</span></div>' +
      '<div><b>Contact</b><span>' + esc(K.name || "") + '</span><span>' + esc(K.email || "") + '</span><span>' + esc(K.phone || "") + '</span></div>' +
      '<div><b>Explore</b><a href="collaborate.html">Collaborate with us</a><a href="global-collaboration.html">Global collaboration</a><a href="join.html">Join the group</a><a href="publications.html">Publications</a></div>' +
      '</div><div class="base"><span>© ' + new Date().getFullYear() + ' ' + esc(S.group_name || "") + ', KFUPM. All rights reserved.</span>' +
      '<a href="https://app.pagescms.org" target="_blank" rel="noopener">Admin</a></div></div></footer>';
  }
})();
