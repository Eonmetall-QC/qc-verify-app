/* =====================================================================
   IPQC FORM LISTS  -  BACKUP COPY ONLY.

   The Inspector and Colour lists are now kept in the "Lists" tab of the
   QC Submissions Inbox (Google Sheet). Edit them THERE: every form loads
   that tab when it opens, and new colours typed by inspectors are added
   to it automatically.

   This file is used only by a form that has never been online yet.
   You do not need to edit it.
   ===================================================================== */
window.QC_LISTS = {

  inspectors: [
    "DAHAMAN",
    "IQBAL",
    "RASHID",
    "REZA",
  ],

  colours: [
    "Apple Green",
    "Beige",
    "Black",
    "Blue",
    "Dim Grey",
    "Em Silver",
    "GI",
    "Grey",
    "Green",
    "Lt Beige",
    "Lt Grey",
    "Lavender",
    "Matt Red",
    "Matt Yellow",
    "Matt Grey",
    "Mini Black",
    "Mx Grey",
    "Orange",
    "Pink",
    "Red",
    "Rod Grey",
    "Sg Beige",
    "Sky Blue",
    "Sand Black",
    "Sage Green",
    "Silver",
    "White",
    "Yellow",
  ],

};

/* =====================================================================
   QC TABLET TIME TRACKER  (added for the QC Monitor dashboard project)

   Records, per tablet per day: each time a form is opened, and the total
   time the form is on screen. It sends tiny messages to a SEPARATE Google
   Sheet. It does NOT touch the inspection form, its submission, signatures,
   or the QC Submissions Inbox. If anything here fails, the form keeps
   working normally.

   SET THIS ONCE: paste the Web app URL of your "QC Tablet Time Log"
   Apps Script between the quotes below (see the setup guide).
   ===================================================================== */
window.QC_TIME_LOG_URL = "https://script.google.com/macros/s/AKfycbxqGkEZ321LYUcdswRfLceJ39XRPgoarOoY5zsxKPrsZzHsyEG_ytmwt3nZkKFYzz7c/exec";

(function () {
  try {
    var URL = window.QC_TIME_LOG_URL;
    // Do nothing until the URL is filled in (keeps forms safe before setup).
    if (!URL || URL.indexOf("PASTE_YOUR") !== -1 || URL.indexOf("/exec") === -1) return;

    // Each tablet names itself once; the name is remembered in this browser.
    var KEY = "qcTabletName";
    var device = "";
    try { device = (localStorage.getItem(KEY) || "").trim(); } catch (e) {}
    if (!device) {
      var entered = "";
      try { entered = (window.prompt("One-time setup for time tracking.\nEnter this tablet's name (e.g. TAB-IPQC-2):") || "").trim(); } catch (e) {}
      if (!entered) return;                 // cancelled: skip; ask again next open
      device = entered.slice(0, 60);
      try { localStorage.setItem(KEY, device); } catch (e) {}
    }

    var form = ((document.title || "") + "").trim().slice(0, 120) ||
               (location.pathname.split("/").pop() || "form");

    function send(payload) {
      try {
        payload.device = device;
        payload.form = form;
        payload.t = Date.now();
        var body = JSON.stringify(payload);
        if (navigator && navigator.sendBeacon) {
          navigator.sendBeacon(URL, body);           // best for page close
        } else {
          fetch(URL, { method: "POST", mode: "no-cors", keepalive: true,
                       headers: { "Content-Type": "text/plain" }, body: body });
        }
      } catch (e) { /* never break the form */ }
    }

    // 1) Form opened.
    send({ event: "open" });

    // 2) Time on screen. Count only while the page is visible.
    var activeMs = 0, lastTick = Date.now(), visible = !document.hidden;
    function tick() {
      var now = Date.now();
      if (visible) activeMs += Math.min(now - lastTick, 30000); // cap guards sleep gaps
      lastTick = now;
    }
    function flush() { tick(); if (activeMs > 0) { send({ event: "time", ms: activeMs }); activeMs = 0; } }

    setInterval(function () { tick(); if (activeMs >= 60000) flush(); }, 15000);
    document.addEventListener("visibilitychange", function () {
      tick(); visible = !document.hidden; if (!visible) flush();
    });
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
  } catch (e) { /* tracking is optional; forms must never be affected */ }
})();
