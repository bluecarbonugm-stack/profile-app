/**
 * Blue Carbon Research Group — profile content API.
 *
 * Publishes the sheets of the bound spreadsheet as a single JSON document that
 * the website reads at render time. Deploy this as a Web App (Execute as: Me,
 * Who has access: Anyone) and put the resulting /exec URL in the site's
 * PROFILE_CONTENT_ENDPOINT environment variable.
 *
 * Setup and sheet structure: see README.md next to this file.
 */

/**
 * Optional shared secret. Leave empty to serve the content publicly.
 * If set, the site must send the same value in PROFILE_CONTENT_TOKEN.
 *
 * Note this only gates *reads* of already-public profile content; it is a way
 * to keep the endpoint out of scrapers, not a security boundary.
 */
var SHARED_TOKEN = "";

/** Response is cached this long so bursts of traffic do not hit the sheet. */
var CACHE_SECONDS = 300;

/**
 * Column -> output key mapping per sheet.
 *
 * The header row in each sheet drives this: a header cell reading "Nama Foto"
 * becomes the key "namafoto" after normalization, so the aliases below let
 * editors use friendly Indonesian headers without breaking the API.
 */
var FIELD_ALIASES = {
  // site
  namaorganisasi: "organizationName",
  organizationname: "organizationName",
  fakultas: "faculty",
  faculty: "faculty",
  departemen: "department",
  department: "department",
  badge: "badge",
  judul: "headline",
  headline: "headline",
  judulmiring: "headlineEmphasis",
  headlineemphasis: "headlineEmphasis",
  judullanjutan: "headlineSuffix",
  headlinesuffix: "headlineSuffix",
  intro: "intro",
  pengantar: "intro",
  judultentang: "aboutTitle",
  abouttitle: "aboutTitle",
  tentang: "aboutParagraphs",
  aboutparagraphs: "aboutParagraphs",
  alamat: "address",
  address: "address",
  email: "email",
  telepon: "phone",
  phone: "phone",
  maps: "mapsUrl",
  mapsurl: "mapsUrl",
  fotohero: "heroImage",
  heroimage: "heroImage",
  tahunberdiri: "foundedYear",
  foundedyear: "foundedYear",

  // shared
  urutan: "order",
  order: "order",
  nama: "name",
  name: "name",
  judulitem: "title",
  title: "title",
  nilai: "value",
  value: "value",
  label: "label",
  ikon: "icon",
  icon: "icon",
  isi: "body",
  body: "body",
  peran: "role",
  role: "role",
  bidang: "field",
  field: "field",
  foto: "photo",
  photo: "photo",
  bio: "bio",
  scholar: "scholarUrl",
  scholarurl: "scholarUrl",
  orcid: "orcid",
  tahun: "year",
  year: "year",
  tipe: "type",
  type: "type",
  penulis: "authors",
  authors: "authors",
  venue: "venue",
  jurnal: "venue",
  tautan: "url",
  url: "url",
  doi: "doi",
  keterangan: "caption",
  caption: "caption",
  gambar: "image",
  image: "image",
  lokasi: "location",
  location: "location",
  logo: "logo",
  kategori: "category",
  category: "category",
};

/** Sheets read as a list of rows. */
var LIST_SHEETS = ["stats", "focus", "team", "publications", "gallery", "partners"];

/** Sheet read as a single record (key/value pairs down two columns). */
var SITE_SHEET = "site";

function doGet(e) {
  try {
    if (SHARED_TOKEN) {
      var provided = e && e.parameter ? e.parameter.token : "";
      if (provided !== SHARED_TOKEN) {
        return jsonResponse({ error: "unauthorized" });
      }
    }

    var refresh = e && e.parameter && e.parameter.refresh === "1";
    var cache = CacheService.getScriptCache();
    if (!refresh) {
      var cached = cache.get("profile-content");
      if (cached) return jsonResponse(JSON.parse(cached));
    }

    var payload = buildPayload();
    cache.put("profile-content", JSON.stringify(payload), CACHE_SECONDS);
    return jsonResponse(payload);
  } catch (err) {
    // Returning an error object instead of throwing keeps the response valid
    // JSON, which the site reports clearly rather than as a parse failure.
    return jsonResponse({ error: String(err && err.message ? err.message : err) });
  }
}

function buildPayload() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var payload = {
    site: readSiteSheet(spreadsheet.getSheetByName(SITE_SHEET)),
    updatedAt: Utilities.formatDate(new Date(), spreadsheet.getSpreadsheetTimeZone(), "d MMM yyyy"),
  };

  for (var i = 0; i < LIST_SHEETS.length; i++) {
    var name = LIST_SHEETS[i];
    payload[name] = readListSheet(spreadsheet.getSheetByName(name));
  }

  return payload;
}

/**
 * `site` is laid out as two columns — field name, value — because one wide row
 * of 15 columns is miserable to edit.
 */
function readSiteSheet(sheet) {
  var site = { aboutParagraphs: [] };
  if (!sheet) return site;

  var values = sheet.getDataRange().getValues();
  for (var r = 0; r < values.length; r++) {
    var key = normalizeKey(values[r][0]);
    if (!key) continue;

    var mapped = FIELD_ALIASES[key];
    if (!mapped) continue;

    var raw = values[r][1];
    if (raw === "" || raw === null || raw === undefined) continue;

    if (mapped === "aboutParagraphs") {
      // Blank lines separate paragraphs inside one cell (Alt+Enter).
      site.aboutParagraphs = String(raw)
        .split(/\n\s*\n|\n/)
        .map(function (part) {
          return part.trim();
        })
        .filter(function (part) {
          return part.length > 0;
        });
    } else {
      site[mapped] = String(raw).trim();
    }
  }

  return site;
}

/** Reads a header-row sheet into an array of objects, skipping blank rows. */
function readListSheet(sheet) {
  if (!sheet) return [];

  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  var headers = values[0].map(function (header) {
    var key = normalizeKey(header);
    return FIELD_ALIASES[key] || key;
  });

  var rows = [];
  for (var r = 1; r < values.length; r++) {
    var row = {};
    var hasContent = false;

    for (var c = 0; c < headers.length; c++) {
      var key = headers[c];
      if (!key) continue;

      var cell = values[r][c];
      if (cell === "" || cell === null || cell === undefined) continue;

      if (key === "order") {
        row.order = Number(cell);
      } else if (cell instanceof Date) {
        row[key] = Utilities.formatDate(cell, Session.getScriptTimeZone(), "yyyy");
      } else {
        row[key] = String(cell).trim();
      }
      hasContent = true;
    }

    if (hasContent) rows.push(row);
  }

  rows.sort(function (a, b) {
    var left = typeof a.order === "number" ? a.order : Number.MAX_SAFE_INTEGER;
    var right = typeof b.order === "number" ? b.order : Number.MAX_SAFE_INTEGER;
    return left - right;
  });

  return rows;
}

/** "Nama Foto " -> "namafoto" so header formatting does not matter. */
function normalizeKey(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .toLowerCase()
    .replace(/[\s_\-().]/g, "")
    .trim();
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Run once from the Apps Script editor to create every sheet with its header
 * row already in place. Existing sheets are left untouched.
 */
function setupSheets() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  var templates = {
    site: null, // key/value, seeded below
    stats: ["value", "label", "order"],
    focus: ["icon", "title", "body", "order"],
    team: ["name", "role", "field", "photo", "bio", "email", "scholarUrl", "orcid", "order"],
    publications: ["year", "type", "title", "authors", "venue", "url", "doi", "order"],
    gallery: ["title", "caption", "image", "location", "order"],
    partners: ["name", "url", "logo", "category", "order"],
  };

  Object.keys(templates).forEach(function (name) {
    var sheet = spreadsheet.getSheetByName(name);
    if (sheet) return;

    sheet = spreadsheet.insertSheet(name);
    var headers = templates[name];

    if (headers) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
      sheet.setFrozenRows(1);
    } else {
      var siteKeys = [
        ["organizationName", "Blue Carbon Research Group"],
        ["faculty", "Fakultas Geografi UGM"],
        ["department", "Departemen Sains Informasi Geografi"],
        ["badge", "Fakultas Geografi UGM"],
        ["headline", "Memetakan ekosistem"],
        ["headlineEmphasis", "blue carbon"],
        ["headlineSuffix", "Indonesia dengan penginderaan jauh dan machine learning."],
        ["intro", ""],
        ["aboutTitle", "Riset yang berpijak pada laut Indonesia."],
        ["aboutParagraphs", ""],
        ["address", ""],
        ["email", ""],
        ["phone", ""],
        ["mapsUrl", ""],
        ["heroImage", ""],
        ["foundedYear", ""],
      ];
      sheet.getRange(1, 1, siteKeys.length, 2).setValues(siteKeys);
      sheet.getRange(1, 1, siteKeys.length, 1).setFontWeight("bold");
      sheet.setColumnWidth(2, 520);
    }
  });
}
