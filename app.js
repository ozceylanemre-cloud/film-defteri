"use strict";
/* Film Defteri — ortak film değerlendirme defteri.
   - Her film defterde bir kez görünür; o filme yazılan tüm değerlendirmeler film sayfasında yan yana durur.
   - Bir filmi kendin değerlendirene kadar başkalarının puanları ve cevapları gizli kalır.
   - Sıradaki film listesi (öneri + oylama), film sohbeti, kişi sayfaları ve zevk uyumu.
   - config.js'te TMDB anahtarı varsa film adı yazınca afiş ve bilgiler otomatik gelir.
   config.js içinde Firebase ayarı varsa veriler Firestore'da herkesle paylaşılır;
   yoksa site yerel deneme modunda (yalnızca bu tarayıcıda) çalışır. */

const CFG = window.FIREBASE_CONFIG;
const ONLINE = !!(CFG && CFG.apiKey);
const TMDB_KEY = String(window.TMDB_KEY || "").trim();
const FB_SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const IMG = "https://image.tmdb.org/t/p/";
const LS = {films: "film-defteri-yerel-v2", wish: "film-defteri-yerel-liste", comments: "film-defteri-yerel-sohbet"};
const DRAFT_KEY = "film-defteri-taslak";
const GENRES = ["Dram","Gerilim","Bilim Kurgu","Komedi","Romantik","Animasyon","Belgesel","Korku","Aksiyon","Fantastik","Suç","Tarih","Müzikal","Macera","Aile","Gizem","Savaş"];
const WITH = ["Yalnız","Arkadaşlar","Kulüp","Aile","Sevgili"];
const ACT = ["Mükemmel","Başarılı","Ortalama","Zayıf"];
const PACE = ["Sürükleyici","Dengeli","Ağır İlerleyen","Sıkıcı"];
const REC = ["Evet","Belki","Hayır"];
const TEXT_MAX = 3000;

const SAMPLE = [
  {t:"Bir Zamanlar Anadolu'da",d:"Nuri Bilge Ceylan",y:2011,c:"Türkiye",g:"Dram",date:"2026-09-14",with:["Kulüp"],
   char:"Doktor Cemal",act:"Mükemmel",
   dev:"Doktor Cemal başta olaylara dışarıdan bakan mesafeli bir gözlemci. Gecenin sonunda öğrendiği gerçeği rapora yazmamayı seçiyor; sessiz ama büyük bir dönüşüm.",
   theme:"Gerçeğin hiçbir zaman tam bilinemeyişi, taşranın yalnızlığı ve erkeklerin dile getiremediği acılar.",
   pace:"Ağır İlerleyen",quote:"",
   visual:"Araba farlarının karanlık bozkırı aydınlattığı uzun gece planları. Dereye yuvarlanan elma sahnesi akılda kalıyor.",
   music:"Neredeyse hiç müzik yok; rüzgâr, köpek havlamaları ve motor sesi gerilimi taşıyor.",
   emotion:"Hüzün ve huzursuzluk",
   scene:"Muhtarın evinde elektrik kesildiğinde kızın lambayla içeri girdiği an. Bütün adamlar bir anlığına susuyor ve herkes kendi kaybını düşünüyor.",
   rec:"Evet",recWhy:"Sabırlı izleyiciye çok şey veriyor. Aceleci biri için değil.",sV:5,sS:5,sA:5,score:9.5},
  {t:"Parazit",d:"Bong Joon-ho",y:2019,c:"Güney Kore",g:"Gerilim",date:"2026-08-02",with:["Arkadaşlar"],
   char:"Kim Ki-taek",act:"Mükemmel",
   dev:"Ki-taek her şeyi gülümseyerek kabullenen bir baba. Aşağılandığını fark ettiği anda o sakinlik çatlıyor.",
   theme:"Sınıf farkı ve görünmez sınırlar. Zenginlerin kokuya dair küçük yorumları bile bir aşağılama aracına dönüşüyor.",
   pace:"Sürükleyici",quote:"",
   visual:"Merdivenler ve sürekli yukarı-aşağı hareket. Zengin evin geniş camları ile bodrum katın küçük penceresi arasındaki karşıtlık.",
   music:"Barok tınılı müzik kaosa ironik bir ciddiyet katıyor.",
   emotion:"Gerginlik",
   scene:"Sel gecesi eve dönüş. Aynı yağmur bir aile için güzel bir manzara, diğeri için felaket.",
   rec:"Evet",recWhy:"Hem eğlenceli hem düşündürücü; Kore sinemasına iyi bir giriş.",sV:5,sS:5,sA:4,score:9},
  {t:"Ruhların Kaçışı",d:"Hayao Miyazaki",y:2001,c:"Japonya",g:"Animasyon",date:"2026-06-20",with:["Aile"],
   char:"Yüzsüz",act:"Başarılı",
   dev:"Chihiro her şeyden korkan bir çocukken başkalarının sorumluluğunu alan birine dönüşüyor.",
   theme:"Çocukluktan çıkış, açgözlülük ve ismini (kimliğini) unutmamak.",
   pace:"Dengeli",quote:"",
   visual:"Elle çizilmiş arka planlar, hamamın gece ışıkları ve suyun üstünde ilerleyen tren.",
   music:"Joe Hisaishi'nin piyano temaları sahneleri masalsı ama hüzünlü kılıyor.",
   emotion:"Merak",
   scene:"Su üstündeki tren yolculuğu. Neredeyse hiçbir şey olmuyor ama her şey değişiyor.",
   rec:"Evet",recWhy:"Her yaştan izleyiciye uygun.",sV:5,sS:5,sA:4,score:9.5},
  {t:"Kış Uykusu",d:"Nuri Bilge Ceylan",y:2014,c:"Türkiye",g:"Dram",date:"2026-03-11",with:["Yalnız"],
   char:"Aydın",act:"Mükemmel",
   dev:"Aydın kendini hep haklı görüyor; karısı ve kız kardeşiyle yaptığı uzun tartışmalarda bu kabuk parça parça kırılıyor.",
   theme:"Vicdan, kibir ve iyilik yapmanın da bir güç gösterisi olabileceği.",
   pace:"Ağır İlerleyen",quote:"",
   visual:"Kapadokya'nın karla kaplı kayalıkları ve iç mekânlarda loş, sıcak ışık.",
   music:"Schubert'in piyano sonatı az ama yerinde kullanılmış.",
   emotion:"Rahatsızlık",
   scene:"Nihal'in parayı ateşe atan adamı izlediği sahne. İyilik ile onur arasındaki çizgiyi sorgulatıyor.",
   rec:"Belki",recWhy:"Üç saatlik bir diyalog filmi; ruh haline bağlı.",sV:4,sS:5,sA:5,score:8.5},
  {t:"Arrival",d:"Denis Villeneuve",y:2016,c:"ABD",g:"Bilim Kurgu",date:"2026-01-24",with:["Yalnız"],
   char:"Louise Banks",act:"Başarılı",
   dev:"Louise'in dili öğrendikçe zamanı da farklı algılamaya başlaması filmin asıl dönüşümü.",
   theme:"Dil düşünceyi nasıl biçimlendirir; sonunu bilerek bir hayatı seçmek.",
   pace:"Dengeli",quote:"",
   visual:"Gri, sisli palet ve dev uzay gemisinin içindeki beyaz perde.",
   music:"Jóhann Jóhannsson'un vokal ağırlıklı müziği yabancılık hissini artırıyor.",
   emotion:"Hüzün",
   scene:"Kızının adının neden tersten de aynı okunduğunu anladığım an.",
   rec:"Evet",recWhy:"Uzaylı filmi beklerken bambaşka bir şey buluyorsunuz.",sV:4,sS:4,sA:4,score:8},
  {t:"Babam ve Oğlum",d:"Çağan Irmak",y:2005,c:"Türkiye",g:"Dram",date:"2025-12-28",with:["Aile"],
   char:"Hüseyin Efendi",act:"Başarılı",
   dev:"Babanın kırgınlığı, torunuyla kurduğu bağ sayesinde yumuşuyor.",
   theme:"Baba-oğul arasındaki söylenmemiş sözler ve 1980 darbesinin bir aileye bıraktığı iz.",
   pace:"Dengeli",quote:"",
   visual:"Ege köyünün sıcak renkleri.",
   music:"Duygusal sahnelerde müzik biraz fazla yönlendirici.",
   emotion:"Hüzün",
   scene:"Deniz'in çiftlikte babasını beklediği sahneler.",
   rec:"Evet",recWhy:"Ailece izlenir; mendil hazırlayın.",sV:3,sS:4,sA:4,score:7.5}
];

/* Deneme modunda aynı filme birden çok kişinin yazdığını göstermek için ek örnekler */
const SAMPLE_EXTRA = [
  {o:1,t:"Bir Zamanlar Anadolu'da",d:"Nuri Bilge Ceylan",y:2011,c:"Türkiye",g:"Dram",date:"2026-09-14",with:["Kulüp"],
   char:"Savcı Nusret",act:"Mükemmel",
   dev:"Savcının gece boyunca anlattığı 'bir tanıdığın karısı' hikâyesinin aslında kendi hikâyesi olduğu yavaş yavaş anlaşılıyor.",
   theme:"Suçluluk duygusu ve geçmişle yüzleşememek.",pace:"Ağır İlerleyen",quote:"",
   visual:"Bozkırda yan yana duran üç araba farı adeta bir tablo gibi.",music:"Sessizlik çok etkili kullanılmış.",
   emotion:"Merak",scene:"Otopsi sahnesi. Soğuk ve klinik ama bütün filmin cevabı orada.",
   rec:"Belki",recWhy:"Ağır tempoya hazır olan biri için.",sV:5,sS:4,sA:5,score:8.5},
  {o:2,t:"Bir Zamanlar Anadolu'da",d:"Nuri Bilge Ceylan",y:2011,c:"Türkiye",g:"Dram",date:"2026-09-14",with:["Kulüp"],
   char:"Komiser Naci",act:"Başarılı",dev:"",
   theme:"Taşrada bürokrasinin ve can sıkıntısının içinde kaybolan insanlar.",pace:"Sıkıcı",quote:"",
   visual:"",music:"",emotion:"Yorgunluk",
   scene:"Yolda mola verip yoğurt üzerine konuştukları sahne. Komik ama bir o kadar da boş.",
   rec:"Hayır",recWhy:"Bence fazla uzun; kısaltılsa çok daha güçlü olurdu.",sV:4,sS:3,sA:4,score:6.5},
  {o:0,t:"Parazit",d:"Bong Joon-ho",y:2019,c:"Güney Kore",g:"Gerilim",date:"2026-08-02",with:["Arkadaşlar"],
   char:"Kim Ki-jeong",act:"Mükemmel",dev:"Ki-jeong en özgüvenli görünen ama aslında en kırılgan karakter.",
   theme:"Yoksulluğun insanları birbirine düşürmesi. Aşağıdakiler birbiriyle savaşırken yukarıdakiler hiçbir şeyin farkında değil.",
   pace:"Sürükleyici",quote:"",visual:"Kamera yatay çizgilerle sınıfları sürekli ayırıyor.",
   music:"Sahnelerle tezat oluşturan klasik müzik çok iyi seçilmiş.",emotion:"Şaşkınlık",
   scene:"Bodrum katın ilk açıldığı an. Film orada türünü değiştiriyor.",
   rec:"Evet",recWhy:"Hiçbir şey okumadan izlemek en iyisi.",sV:5,sS:5,sA:5,score:9.5},
  {o:2,t:"Parazit",d:"Bong Joon-ho",y:2019,c:"Güney Kore",g:"Gerilim",date:"2026-08-05",with:["Yalnız"],
   char:"Bayan Park",act:"Başarılı",dev:"",theme:"Saflık da bir ayrıcalık.",pace:"Dengeli",quote:"",
   visual:"",music:"",emotion:"Huzursuzluk",scene:"Doğum günü partisi; kaosun ortasındaki o tuhaf sessizlik.",
   rec:"Evet",recWhy:"Üzerine uzun uzun konuşulabilecek bir film.",sV:4,sS:4,sA:4,score:8}
];
const SAMPLE_PEOPLE = [{uid:"ornek-ayse",name:"Ayşe"},{uid:"ornek-mert",name:"Mert"},{uid:"ornek-deniz",name:"Deniz"}];

const SAMPLE_WISH = [
  {o:0,t:"Geçmiş Yaşamlar",d:"Celine Song",y:2023,votes:[0,1,2],note:"Çok sakin bir film ama izleyenin içinde kaldığı söyleniyor."},
  {o:1,t:"Kuru Otlar Üstüne",d:"Nuri Bilge Ceylan",y:2023,votes:[1,0],note:"Ceylan serisine devam edelim."},
  {o:2,t:"Aftersun",d:"Charlotte Wells",y:2022,votes:[2],note:""},
  {o:2,t:"Parazit",d:"Bong Joon-ho",y:2019,votes:[2],note:""}
];
const SAMPLE_COMMENTS = [
  {fk:"bir-zamanlar-anadoluda",o:2,text:"Tamam, 'sıkıcı' demek biraz haksızlıktı. Ama yine de 40 dakika kısa olabilirdi."},
  {fk:"bir-zamanlar-anadoluda",o:0,text:"Bence o uzunluk filmin kendisi. O gecenin bitmeyişini hissetmemiz gerekiyordu."},
  {fk:"parazit",o:1,text:"Merdiven sahnelerini ikinci izleyişte fark ettim; film baştan sona yukarı-aşağı hareket ediyor."}
];

/* ---------- yardımcılar ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nl = s => esc(s).replace(/\n/g, "<br>");
const num = n => String(n).replace(".", ",");
const enc = encodeURIComponent;
const app = $("#app");

function toast(m){
  const t = $("#toast"); t.textContent = m; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 2600);
}
function hue(s){ let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
function fmtDate(d){
  if (!d) return "";
  const x = new Date(d + "T12:00:00");
  return isNaN(x) ? d : x.toLocaleDateString("tr-TR", {day:"numeric", month:"long", year:"numeric"});
}
function relTime(t){
  const s = (Date.now() - t) / 1000;
  if (s < 60) return "az önce";
  if (s < 3600) return Math.floor(s / 60) + " dk önce";
  if (s < 86400) return Math.floor(s / 3600) + " sa önce";
  if (s < 86400 * 7) return Math.floor(s / 86400) + " gün önce";
  return new Date(t).toLocaleDateString("tr-TR", {day: "numeric", month: "short", year: "numeric"});
}
const slug = s => String(s || "").toLocaleLowerCase("tr")
  .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’`]/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "film";
const fkOf = r => r.fk || slug(r.t);
const mean = arr => { const v = arr.filter(x => x != null && x !== 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };
const avgTxt = v => v != null ? num((Math.round(v * 10) / 10).toFixed(1)).replace(",0", "") : "–";
const av = (name, big) => `<span class="av${big ? " big" : ""}" style="background:hsl(${hue(name)} 42% 42%)" aria-hidden="true">${esc(String(name || "?").trim().charAt(0).toLocaleUpperCase("tr"))}</span>`;
const plink = (uid, name) => `<a class="plink" href="#/kisi/${enc(uid)}">${esc(name || "—")}</a>`;
const stars = n => n ? `<span class="stars" aria-label="${n} / 5">${"★".repeat(n)}<span class="off">${"★".repeat(5 - n)}</span></span>` : '<span class="unrated">—</span>';

function poster(g, size){
  const cls = "poster" + (size ? " " + size : "");
  if (g.poster) return `<div class="${cls} img"><img src="${IMG}${size === "big" ? "w500" : "w342"}${esc(g.poster)}" alt="${esc(g.t)} afişi" loading="lazy">${g.ornek ? '<span class="ex">Örnek</span>' : ""}</div>`;
  const h = hue(g.t);
  return `<div class="${cls}" style="background:linear-gradient(160deg,hsl(${h} 45% 42%),hsl(${(h + 40) % 360} 55% 17%))">
    ${g.ornek ? '<span class="ex">Örnek</span>' : ""}<span class="yr">${esc(g.y)}</span>
    <div class="pt">${esc(g.t)}</div><div class="pd">${esc(g.d)}</div></div>`;
}

/* ---------- veri katmanı ---------- */
const DB = {films: [], wish: [], comments: []};
let ready = false, user = null, loadError = null, auth = null, fs = null;
const byId = id => DB.films.find(f => f.id === id);
const canEdit = r => !!(user && r && r.ownerUid === user.uid);

function groups(){
  const m = new Map();
  for (const r of DB.films) { const k = fkOf(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }
  return [...m.entries()].map(([fk, revs]) => {
    revs.sort((a, b) => (a.at || 0) - (b.at || 0));
    const base = revs[0];
    return {
      fk, revs, base, t: base.t, d: base.d, y: base.y, c: base.c, g: base.g,
      poster: (revs.find(r => r.poster) || {}).poster || "",
      tmdbId: (revs.find(r => r.tmdbId) || {}).tmdbId || null,
      ornek: revs.every(r => r.ornek),
      avg: mean(revs.map(r => r.score)),
      last: revs.reduce((m, r) => (r.date || "") > m ? r.date : m, ""),
      lastAt: Math.max(...revs.map(r => r.at || 0)),
      mine: user ? revs.find(r => r.ownerUid === user.uid) : null
    };
  });
}
const groupOf = fk => groups().find(g => g.fk === fk);
/* Aynı film mi? Önce TMDB numarasına, sonra Türkçe ya da orijinal adına bakar. */
function findGroup(d){
  const gs = groups();
  if (d.tmdbId) { const g = gs.find(g => g.revs.some(r => r.tmdbId === d.tmdbId)); if (g) return g; }
  const keys = [slug(d.t), d.orig && slug(d.orig)].filter(k => k && k !== "film");
  return gs.find(g => keys.includes(g.fk) || keys.includes(slug(g.t)) || g.revs.some(r => r.orig && keys.includes(slug(r.orig)))) || null;
}

/* Önce yaz, sonra gör: giriş yapmış ve bu filmi henüz değerlendirmemiş kişiye diğerlerinin puanları gizli */
const revealed = new Set();
const gated = g => !!(user && g && !g.mine && !revealed.has(g.fk));
const avgTag = g => gated(g) ? '<span class="score hid">?<small>/10</small></span>'
  : g.avg != null ? `<span class="score">${avgTxt(g.avg)}<small>/10</small></span>` : '<span class="unrated">puanlanmadı</span>';

function people(){
  const m = new Map();
  for (const r of DB.films) {
    if (!m.has(r.ownerUid)) m.set(r.ownerUid, {uid: r.ownerUid, name: r.ownerName, revs: [], lastAt: 0});
    const p = m.get(r.ownerUid); p.revs.push(r);
    if ((r.at || 0) >= p.lastAt) { p.lastAt = r.at || 0; p.name = r.ownerName; }
  }
  return [...m.values()];
}
/* Zevk uyumu: ikisinin de puanladığı filmlerdeki genel puan farkının ortalamasından */
function taste(uidA, uidB){
  const a = new Map(DB.films.filter(r => r.ownerUid === uidA && r.score != null).map(r => [fkOf(r), r.score]));
  const diffs = DB.films.filter(r => r.ownerUid === uidB && r.score != null && a.has(fkOf(r))).map(r => Math.abs(a.get(fkOf(r)) - r.score));
  if (!diffs.length) return null;
  const d = diffs.reduce((x, y) => x + y, 0) / diffs.length;
  return {n: diffs.length, pct: Math.max(0, Math.round(100 - d / 9 * 100))};
}

function loadLocal(){
  const get = k => { try { const d = JSON.parse(localStorage.getItem(LS[k])); return Array.isArray(d) ? d : null; } catch (e) { return null; } };
  const P = SAMPLE_PEOPLE, t0 = Date.now();
  DB.films = get("films") || [...SAMPLE.map((f, i) => ({...f, o: i % 2})), ...SAMPLE_EXTRA].map((f, i) => {
    const {o, ...r} = f;
    return {...r, fk: slug(r.t), id: "ornek" + i, ornek: true, ownerUid: P[o].uid, ownerName: P[o].name, at: t0 - 900000 + i * 1000};
  });
  DB.wish = get("wish") || SAMPLE_WISH.map((w, i) => {
    const {o, votes, ...r} = w;
    return {...r, id: "oliste" + i, ornek: true, ownerUid: P[o].uid, ownerName: P[o].name, votes: votes.map(v => P[v].uid), at: t0 - 500000 + i * 1000};
  });
  DB.comments = get("comments") || SAMPLE_COMMENTS.map((c, i) => {
    const {o, ...r} = c;
    return {...r, id: "osohbet" + i, ornek: true, ownerUid: P[o].uid, ownerName: P[o].name, at: t0 - 7200000 + i * 1800000};
  });
}
function saveLocal(c){
  try { localStorage.setItem(LS[c], JSON.stringify(DB[c])); }
  catch (e) { toast("Kaydedilemedi: tarayıcı depolaması kapalı"); }
}
const localChanged = () => { if (!ONLINE && view !== "form") route(false); };
async function add(c, data){
  if (ONLINE) return (await fs.collection(c).add(data)).id;
  const id = c + Date.now() + Math.random().toString(36).slice(2, 5);
  DB[c].push({...data, id}); saveLocal(c); return id;
}
async function upd(c, id, data){
  if (ONLINE) return fs.collection(c).doc(id).update(data);
  const x = DB[c].find(d => d.id === id); Object.assign(x, data); delete x.ornek; saveLocal(c);
}
async function del(c, id){
  if (ONLINE) return fs.collection(c).doc(id).delete();
  DB[c] = DB[c].filter(d => d.id !== id); saveLocal(c);
}
async function vote(w, on){
  if (ONLINE) {
    const F = firebase.firestore.FieldValue;
    return fs.collection("wish").doc(w.id).update({votes: on ? F.arrayUnion(user.uid) : F.arrayRemove(user.uid)});
  }
  w.votes = on ? [...new Set([...(w.votes || []), user.uid])] : (w.votes || []).filter(u => u !== user.uid);
  saveLocal("wish");
}

function loadScript(src){
  return new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src;
    s.onload = res; s.onerror = () => rej(new Error("Yüklenemedi: " + src));
    document.head.appendChild(s);
  });
}
async function init(){
  if (TMDB_KEY) $("#tmdbnote").hidden = false;
  if (!ONLINE) {
    loadLocal(); user = {uid: "yerel", name: "Sen"}; ready = true;
    $("#demo").hidden = false; renderAuth(); route(); return;
  }
  route();
  try {
    await loadScript(FB_SDK + "firebase-app-compat.js");
    await Promise.all([loadScript(FB_SDK + "firebase-auth-compat.js"), loadScript(FB_SDK + "firebase-firestore-compat.js")]);
    firebase.initializeApp(CFG);
    auth = firebase.auth(); fs = firebase.firestore();
    auth.getRedirectResult().catch(() => {});
    auth.onAuthStateChanged(u => {
      user = u ? {uid: u.uid, name: u.displayName || (u.email || "").split("@")[0] || "İsimsiz"} : null;
      renderAuth(); if (ready && view !== "form") route(false);
    });
    fs.collection("films").onSnapshot(snap => {
      DB.films = snap.docs.map(d => ({...d.data(), id: d.id}));
      ready = true; loadError = null;
      if (view !== "form") route(false);
    }, err => { loadError = err.message; ready = true; route(false); });
    for (const c of ["wish", "comments"]) {
      fs.collection(c).onSnapshot(snap => {
        DB[c] = snap.docs.map(d => ({...d.data(), id: d.id}));
        if (ready && view !== "form") route(false);
      }, err => console.warn(c, err.message));
    }
  } catch (e) { loadError = e.message; ready = true; route(false); }
}

/* ---------- TMDB (afiş ve film bilgisi) ---------- */
let regionNames = null;
try { regionNames = new Intl.DisplayNames(["tr"], {type: "region"}); } catch (e) {}
async function tmdb(path, params = {}){
  const u = new URL("https://api.themoviedb.org/3" + path);
  u.searchParams.set("api_key", TMDB_KEY); u.searchParams.set("language", "tr-TR");
  for (const k in params) u.searchParams.set(k, params[k]);
  const r = await fetch(u);
  if (!r.ok) throw new Error("TMDB " + r.status);
  return r.json();
}
async function tmdbDetails(id){
  const d = await tmdb("/movie/" + id, {append_to_response: "credits"});
  return {
    tmdbId: d.id, t: d.title || d.original_title, orig: d.original_title || "",
    y: +(d.release_date || "").slice(0, 4) || "",
    d: ((d.credits && d.credits.crew) || []).filter(p => p.job === "Director").map(p => p.name).slice(0, 2).join(", "),
    c: (d.production_countries || []).slice(0, 2).map(c => (regionNames && regionNames.of(c.iso_3166_1)) || c.name).join(", "),
    g: ((d.genres || [])[0] || {}).name || "",
    poster: d.poster_path || ""
  };
}
/* Bir metin kutusuna TMDB önerileri bağlar. Seçilince onPick(filmBilgisi) çağrılır. */
function tmdbAttach(input, box, onPick){
  if (!TMDB_KEY || !input || !box) return;
  let timer, seq = 0;
  input.setAttribute("autocomplete", "off");
  input.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { box.hidden = true; return; }
    timer = setTimeout(async () => {
      const my = ++seq;
      try {
        const res = (await tmdb("/search/movie", {query: q, include_adult: "false"})).results.slice(0, 6);
        if (my !== seq) return;
        box.innerHTML = res.length ? res.map(r => `<button type="button" class="sres" data-id="${r.id}">
            ${r.poster_path ? `<img src="${IMG}w92${esc(r.poster_path)}" alt="">` : '<span class="noimg"></span>'}
            <span><b>${esc(r.title)}</b><small>${esc((r.release_date || "").slice(0, 4))}${r.original_title && r.original_title !== r.title ? " · " + esc(r.original_title) : ""}</small></span></button>`).join("")
          : '<p class="note">TMDB\'de bulunamadı. Bilgileri elle girebilirsin.</p>';
        box.hidden = false;
      } catch (e) { box.hidden = true; }
    }, 350);
  });
  box.addEventListener("click", async e => {
    const b = e.target.closest(".sres"); if (!b) return;
    box.innerHTML = '<p class="note">Bilgiler getiriliyor…</p>';
    try { const d = await tmdbDetails(+b.dataset.id); box.hidden = true; onPick(d); }
    catch (err) { box.innerHTML = '<p class="note">Bilgiler alınamadı. Elle girebilirsin.</p>'; }
  });
}

/* ---------- giriş ---------- */
async function login(){
  if (!ONLINE || !auth) return;
  const provider = new firebase.auth.GoogleAuthProvider();
  try { await auth.signInWithPopup(provider); toast("Giriş yapıldı"); }
  catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") return auth.signInWithRedirect(provider);
    if (e.code === "auth/unauthorized-domain") return toast("Bu alan adı Firebase'de yetkili değil.");
    if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") toast("Giriş yapılamadı: " + e.message);
  }
}
function renderAuth(){
  const box = $("#authbox");
  if (!ONLINE) { box.innerHTML = ""; return; }
  box.innerHTML = user
    ? `<a class="who" href="#/kisi/${enc(user.uid)}" title="Sayfam">${av(user.name)}<span>${esc(user.name.split(" ")[0])}</span></a><button class="link" id="logout">Çıkış</button>`
    : `<button class="navlogin" id="loginbtn">Giriş yap</button>`;
  const lb = $("#loginbtn"); if (lb) lb.onclick = login;
  const lo = $("#logout"); if (lo) lo.onclick = () => { auth.signOut(); toast("Çıkış yapıldı"); };
}
function loginGate(msg){
  app.innerHTML = `<div class="empty"><p>${esc(msg)}</p><button class="btn" id="gate">Google ile giriş yap</button>
    <p class="note">Adın, yazdıklarının yanında görünür. E-posta adresin gösterilmez.</p></div>`;
  $("#gate").onclick = login;
}

/* ---------- yönlendirme ---------- */
let view = "";
function route(scroll = true){
  const [a, b] = location.hash.replace(/^#\/?/, "").split("/").map(x => { try { return decodeURIComponent(x || ""); } catch (e) { return x || ""; } });
  const tab = a === "kisi" ? "kisiler" : (a || "defter");
  $$(".tabs a").forEach(x => x.classList.toggle("on", x.dataset.r === tab));
  // ekran yeniden çizilirken yazılmakta olan metni koru
  const keep = $$("[data-keep]").map(el => ({id: el.id, v: el.value, f: document.activeElement === el}));
  if (loadError) { view = "error"; errorView(); }
  else if (!ready) { view = "loading"; app.innerHTML = '<div class="empty"><p>Defter yükleniyor…</p></div>'; }
  else if (a === "film") {
    const g = groupOf(b);
    if (g) { view = "detail"; detail(g); }
    else if (byId(b)) { location.replace("#/film/" + enc(fkOf(byId(b)))); return; }
    else { view = "detail"; missing(); }
  }
  else if (a === "yeni") {
    const g = b ? groupOf(b) : null;
    if (b && !g) { view = "detail"; missing(); }
    else if (!user) { view = "gate"; loginGate("Değerlendirme yazmak için giriş yap."); }
    else if (g && g.mine) { location.replace("#/duzenle/" + enc(g.mine.id)); return; }
    else { view = "form"; form(g ? {mode: "join", group: g} : {mode: "new"}); }
  }
  else if (a === "duzenle") {
    const r = byId(b);
    if (!r) { view = "detail"; missing(); }
    else if (!user) { view = "gate"; loginGate("Düzenlemek için giriş yap."); }
    else if (!canEdit(r)) { location.replace("#/film/" + enc(fkOf(r))); return; }
    else { view = "form"; form({mode: "edit", review: r, group: groupOf(fkOf(r))}); }
  }
  else if (a === "siradaki") { view = "wish"; wishView(); }
  else if (a === "kisiler") { view = "people"; peopleView(); }
  else if (a === "kisi") { view = "person"; personView(b); }
  else if (a === "istatistik") { view = "stats"; stats(); }
  else { view = "home"; home(); }
  for (const k of keep) { const el = k.id && $("#" + k.id); if (el && "value" in el) { el.value = k.v; if (k.f) el.focus(); } }
  if (scroll) window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => route());
function missing(){ app.innerHTML = '<div class="empty"><p>Bu sayfa bulunamadı. Silinmiş olabilir.</p><a class="btn" href="#/">Deftere dön</a></div>'; }
function errorView(){
  app.innerHTML = `<div class="empty"><p><b>Defter yüklenemedi.</b></p><p class="note">${esc(loadError)}</p>
    <p class="note">Firestore kurallarını yayınladığından ve config.js bilgilerinin doğru olduğundan emin ol.</p></div>`;
}
const confirmTap = (btn, fn, label = "Emin misin? Tekrar dokun") => {
  if (!btn) return;
  btn.onclick = async () => {
    if (!btn.dataset.ok) { btn.dataset.ok = 1; btn.textContent = label; return; }
    btn.disabled = true;
    try { await fn(); } catch (e) { btn.disabled = false; toast("İşlem yapılamadı: " + e.message); }
  };
};

/* ---------- defter (ana sayfa) ---------- */
let q = "", genre = "Tümü", sort = "date", who = "";
function home(){
  document.title = "Film Defteri";
  const gs = groups();
  const ppl = people().sort((a, b) => String(a.name).localeCompare(String(b.name), "tr"));
  const genres = ["Tümü", ...[...new Set(gs.map(g => g.g).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"))];
  if (!genres.includes(genre)) genre = "Tümü";
  const whoOpts = ["", ...(user ? ["@mine", "@todo"] : []), ...ppl.map(p => p.uid)];
  if (!whoOpts.includes(who)) who = "";
  const next = topWish();
  app.innerHTML = `
    <section class="hero">
      <h1>İzledik,<br><span>düşündük,</span><br>yazdık.</h1>
      <div class="stats">
        <div><b>${gs.length}</b>film</div>
        <div><b>${DB.films.length}</b>değerlendirme</div>
        <div><b>${ppl.length}</b>kişi</div>
      </div>
    </section>
    ${next ? `<a class="nextbar" href="#/siradaki">${next.poster ? `<img src="${IMG}w92${esc(next.poster)}" alt="">` : ""}<span><small>Sıradaki film</small><b>${esc(next.t)}</b></span><span class="votes">${(next.votes || []).length} oy</span></a>` : ""}
    ${gs.length ? `
    <div class="toolbar">
      <input id="q" type="search" placeholder="Film, yönetmen, tür veya kişi ara" value="${esc(q)}" aria-label="Ara">
      <select id="who" aria-label="Kimin">
        <option value="">Herkesin</option>
        ${user ? '<option value="@mine">Benim yazdıklarım</option><option value="@todo">Henüz yazmadıklarım</option>' : ""}
        ${ppl.filter(p => !user || p.uid !== user.uid).map(p => `<option value="${esc(p.uid)}">${esc(p.name)} yazdı</option>`).join("")}
      </select>
      <select id="sort" aria-label="Sırala">
        <option value="date">Son izlenen</option>
        <option value="score">En yüksek ortalama</option>
        <option value="count">En çok yazılan</option>
        <option value="year">Yapım yılı</option>
        <option value="title">İsim (A–Z)</option>
      </select>
    </div>
    <div class="chips" id="chips">${genres.map(g => `<button class="chip" aria-pressed="${g === genre}" data-g="${esc(g)}">${esc(g)}</button>`).join("")}</div>
    <div class="grid" id="grid"></div>
    ${user && gs.some(gated) ? '<p class="note">"?" olan filmleri henüz değerlendirmedin. Kendi değerlendirmeni yazınca diğerlerinin puanları açılır.</p>' : ""}
    ${gs.some(g => g.revs.some(r => r.ornek)) ? '<p class="note">Ayşe, Mert ve Deniz\'in yazdıkları deneme amaçlı örneklerdir.</p>' : ""}
    ` : `<div class="empty"><p>Defter henüz boş.</p><a class="btn" href="#/yeni">İlk değerlendirmeyi yaz</a></div>`}`;
  if (!gs.length) return;
  $("#sort").value = sort; $("#who").value = who;
  $("#q").oninput = e => { q = e.target.value; grid(); };
  $("#sort").onchange = e => { sort = e.target.value; grid(); };
  $("#who").onchange = e => { who = e.target.value; grid(); };
  $("#chips").onclick = e => {
    const c = e.target.closest(".chip"); if (!c) return;
    genre = c.dataset.g; $$(".chip", $("#chips")).forEach(x => x.setAttribute("aria-pressed", x === c)); grid();
  };
  grid();
}
function card(g, extra){
  return `<a class="card" href="#/film/${enc(g.fk)}">
      ${poster(g)}
      <div class="ct">${esc(g.t)}</div>
      ${extra || `<div class="meta">${avgTag(g)}<span>${g.revs.length} kişi</span></div>
      <div class="faces">${g.revs.slice(0, 6).map(r => av(r.ownerName)).join("")}${g.revs.length > 6 ? `<span class="more">+${g.revs.length - 6}</span>` : ""}${user && g.mine ? '<span class="mine">sen de yazdın</span>' : ""}</div>`}
    </a>`;
}
function grid(){
  const s = q.trim().toLocaleLowerCase("tr");
  const list = groups().filter(g =>
    (genre === "Tümü" || g.g === genre) &&
    (!who || (who === "@mine" ? !!g.mine : who === "@todo" ? !g.mine : g.revs.some(r => r.ownerUid === who))) &&
    (!s || [g.t, g.d, g.g, g.c, ...g.revs.map(r => r.ownerName), ...g.revs.map(r => r.orig)].join(" ").toLocaleLowerCase("tr").includes(s)));
  const sc = g => gated(g) ? -1 : (g.avg ?? -1);
  const cmp = {
    date: (a, b) => b.last.localeCompare(a.last) || b.lastAt - a.lastAt,
    score: (a, b) => sc(b) - sc(a),
    count: (a, b) => b.revs.length - a.revs.length || sc(b) - sc(a),
    year: (a, b) => (b.y || 0) - (a.y || 0),
    title: (a, b) => String(a.t).localeCompare(String(b.t), "tr")
  }[sort];
  list.sort(cmp);
  $("#grid").innerHTML = list.length ? list.map(g => card(g)).join("") : '<div class="empty" style="grid-column:1/-1">Bu seçime uyan film yok.</div>';
}

/* ---------- film sayfası ---------- */
function detail(g){
  document.title = g.t + " · Film Defteri";
  const hidden = gated(g);
  const revs = [...g.revs].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const isMe = r => user && r.ownerUid === user.uid;
  const cell = v => v ? `${v}<span class="st">★</span>` : '<span class="unrated">–</span>';
  const rowMeta = r => [r.date ? fmtDate(r.date) : "", (r.with || []).join(", ")].filter(Boolean).map(esc).join(" · ");
  const answers = (label, get) => {
    const items = revs.map(r => ({r, v: get(r)})).filter(x => x.v);
    return `<div class="q"><h3>${label}</h3>${items.length ? `<ul class="ans">${items.map(({r, v}) =>
      `<li class="${isMe(r) ? "me" : ""}"><span class="by">${av(r.ownerName)}${plink(r.ownerUid, r.ownerName)}</span><div>${v}</div></li>`).join("")}</ul>`
      : '<p class="unrated">Kimse yazmamış.</p>'}</div>`;
  };
  const tally = key => {
    const m = {}; revs.forEach(r => { if (r[key]) m[r[key]] = (m[r[key]] || 0) + 1; });
    const e = Object.entries(m).sort((a, b) => b[1] - a[1]);
    return e.length ? `<p class="tally">${e.map(([k, n]) => `<span class="pill">${esc(k)}${n > 1 ? " ×" + n : ""}</span>`).join(" ")}</p>` : "";
  };
  const pill = v => v ? `<span class="pill">${esc(v)}</span>` : "";
  const scores = revs.map(r => r.score).filter(x => x != null);
  const spread = scores.length > 1 ? Math.max(...scores) - Math.min(...scores) : 0;
  const cs = DB.comments.filter(c => c.fk === g.fk).sort((a, b) => (a.at || 0) - (b.at || 0));
  const addHref = "#/yeni/" + enc(g.fk);

  const body = hidden ? `
      <section class="locked">
        <p class="lockicon" aria-hidden="true">✎</p>
        <h2>Önce sen yaz</h2>
        <p>${g.revs.length} kişinin puanları, cevapları ve ${cs.length ? cs.length + " mesajlık " : ""}sohbet, sen bu filmi değerlendirince açılacak. Böylece kimsenin görüşü seninkini etkilemez.</p>
        <div class="dact" style="justify-content:center"><a class="btn" href="${addHref}">Değerlendirmeni yaz</a></div>
        <button class="link" id="reveal">Yine de göster</button>
      </section>` : `
      <section class="sec"><h2>Puanlar</h2>
        <div class="tablewrap"><table class="cmp">
          <thead><tr><th scope="col">Kim</th><th scope="col">Görsel</th><th scope="col">Hikâye</th><th scope="col">Oyunculuk</th><th scope="col">Genel</th></tr></thead>
          <tbody>
            ${revs.map(r => `<tr class="${isMe(r) ? "me" : ""}">
              <th scope="row"><span class="by">${av(r.ownerName)}<span>${plink(r.ownerUid, r.ownerName)}${isMe(r) ? " (sen)" : ""}<small>${rowMeta(r)}</small></span></span></th>
              <td>${cell(r.sV)}</td><td>${cell(r.sS)}</td><td>${cell(r.sA)}</td>
              <td class="gen">${r.score != null ? num(r.score) : '<span class="unrated">–</span>'}</td></tr>`).join("")}
          </tbody>
          ${revs.length > 1 ? `<tfoot><tr><th scope="row">Ortalama</th>
            <td>${avgTxt(mean(revs.map(r => r.sV)))}</td><td>${avgTxt(mean(revs.map(r => r.sS)))}</td><td>${avgTxt(mean(revs.map(r => r.sA)))}</td>
            <td class="gen">${avgTxt(g.avg)}</td></tr></tfoot>` : ""}
        </table></div>
      </section>
      <section class="sec"><h2>Karakterler ve Oyunculuk</h2>
        ${answers("En etkileyici karakter", r => esc(r.char))}
        <div class="q"><h3>Oyunculuk performansları</h3>${tally("act") || '<p class="unrated">Kimse seçmemiş.</p>'}</div>
        ${answers("Karakter gelişimi", r => nl(r.dev))}
      </section>
      <section class="sec"><h2>Senaryo, Hikâye ve Temalar</h2>
        ${answers("Ana tema / mesaj", r => nl(r.theme))}
        <div class="q"><h3>Hikâye akışı ve tempo</h3>${tally("pace") || '<p class="unrated">Kimse seçmemiş.</p>'}</div>
        ${answers("Unutulmaz replik / diyalog", r => r.quote ? `<blockquote>${nl(r.quote)}</blockquote>` : "")}
      </section>
      <section class="sec"><h2>Teknik ve Estetik</h2>
        ${answers("Görsel dil ve sinematografi", r => nl(r.visual))}
        ${answers("Müzik ve ses tasarımı", r => nl(r.music))}
      </section>
      <section class="sec"><h2>Kişisel Etki</h2>
        ${answers("En çok uyandırdığı duygu", r => esc(r.emotion))}
        ${answers("En çok sarsan / düşündüren sahne", r => nl(r.scene))}
        <div class="q"><h3>Arkadaşına önerir misin?</h3>${tally("rec")}</div>
        ${answers("Neden?", r => r.rec || r.recWhy ? `${pill(r.rec)} ${nl(r.recWhy)}` : "")}
      </section>
      <section class="sec" id="sohbet"><h2>Sohbet <span class="count">${cs.length || ""}</span></h2>
        ${cs.length ? `<ul class="cmts">${cs.map(c => `<li class="${isMe(c) ? "me" : ""}">${av(c.ownerName)}<div>
            <p class="cmeta">${plink(c.ownerUid, c.ownerName)} · ${esc(relTime(c.at || 0))}${isMe(c) ? ` · <button class="link" data-delc="${esc(c.id)}">sil</button>` : ""}</p>
            <p class="ctext">${nl(c.text)}</p></div></li>`).join("")}</ul>` : '<p class="unrated">Henüz kimse yazmadı. Sohbeti sen başlat.</p>'}
        ${user ? `<form id="cform" class="cform"><label for="cmt" class="lbl">Yorum yaz</label>
            <textarea id="cmt" data-keep maxlength="1000" placeholder="Bu film hakkında ne düşünüyorsun?"></textarea>
            <div><button class="btn" id="csend">Gönder</button></div></form>`
          : `<button class="btn ghost" id="clogin">Yazmak için giriş yap</button>`}
      </section>`;

  app.innerHTML = `
    <a href="#/" class="back">← Deftere dön</a>
    <article>
      <div class="dhead">
        <div>${poster(g, "big")}</div>
        <div>
          <p class="sub">${[g.g, g.y, g.c].filter(Boolean).map(esc).join(" · ")}</p>
          <h1 class="dt">${esc(g.t)}</h1>
          <p class="dir">Yönetmen: ${esc(g.d) || "—"}</p>
          <div class="bigscore">${hidden ? "?" : avgTxt(g.avg)}<small>/10</small></div>
          <p class="byline">${g.revs.length} kişinin ortalaması${!hidden && spread >= 2 ? ` · <span class="warnpill">Görüşler ayrışıyor</span>` : ""}</p>
          <div class="faces lg">${g.revs.map(r => `<a href="#/kisi/${enc(r.ownerUid)}" title="${esc(r.ownerName)}">${av(r.ownerName, true)}</a>`).join("")}</div>
          <div class="dact">
            ${g.mine ? `<a class="btn" href="#/duzenle/${enc(g.mine.id)}">Değerlendirmeni düzenle</a><button class="btn danger" id="del">Değerlendirmeni sil</button>`
                     : hidden ? "" : `<a class="btn" href="${addHref}">${user ? "Değerlendirmeni ekle" : "Giriş yapıp değerlendir"}</a>`}
          </div>
        </div>
      </div>
      ${body}
    </article>`;

  const rv = $("#reveal"); if (rv) rv.onclick = () => { revealed.add(g.fk); route(false); };
  const cl = $("#clogin"); if (cl) cl.onclick = login;
  confirmTap($("#del"), async () => {
    await del("films", g.mine.id); toast("Değerlendirmen silindi");
    if (g.revs.length === 1) location.hash = "#/"; else localChanged();
  }, "Silmek için tekrar dokun");
  $$("[data-delc]").forEach(b => confirmTap(b, async () => { await del("comments", b.dataset.delc); toast("Yorum silindi"); localChanged(); }, "emin misin?"));
  const cf = $("#cform");
  if (cf) cf.onsubmit = async e => {
    e.preventDefault();
    const ta = $("#cmt"), text = ta.value.trim();
    if (!text) { ta.focus(); return; }
    const b = $("#csend"); b.disabled = true;
    try {
      await add("comments", {fk: g.fk, text, ownerUid: user.uid, ownerName: user.name, at: Date.now()});
      ta.value = ""; b.disabled = false; toast("Yorum eklendi"); localChanged();
    } catch (err) { b.disabled = false; toast("Gönderilemedi: " + err.message); }
  };
}

/* ---------- değerlendirme formu ---------- */
const choice = (name, opts, val, multi) =>
  `<div class="choices" data-name="${name}" ${multi ? 'data-multi="1"' : ""} role="group">${opts.map(o =>
    `<button type="button" class="chip" data-v="${esc(o)}" aria-pressed="${multi ? (val || []).includes(o) : val === o}">${esc(o)}</button>`).join("")}</div>`;
const starIn = (name, val) =>
  `<div class="starin" data-name="${name}" data-v="${val || 0}">${[1,2,3,4,5].map(i =>
    `<button type="button" data-i="${i}" class="${i <= (val || 0) ? "on" : ""}" aria-label="${i} / 5">★</button>`).join("")}</div>`;
const field = (id, label, val, opt = {}) => `
  <div class="${opt.wide ? "wide" : ""}">
    <label for="${id}">${label}${opt.req ? ' <span class="req">*</span>' : ""}${opt.hint ? ` <small>${opt.hint}</small>` : ""}</label>
    ${opt.area ? `<textarea id="${id}" maxlength="${TEXT_MAX}" placeholder="${esc(opt.ph || "")}">${esc(val)}</textarea>`
               : `<input id="${id}" type="${opt.type || "text"}" value="${esc(val)}" placeholder="${esc(opt.ph || "")}" ${opt.attrs || 'maxlength="150"'}>`}
    ${opt.after || ""}
    ${opt.req ? `<p class="err" id="${id}-err" hidden></p>` : ""}
  </div>`;

/* mode: "new" (yeni film), "join" (var olan filme değerlendirme), "edit" (kendi değerlendirmeni düzenle) */
function form({mode, group, review}){
  const isNew = mode !== "edit";
  const draftKey = DRAFT_KEY + ":" + (mode === "join" ? group.fk : "yeni");
  let draft = null;
  if (isNew) { try { draft = JSON.parse(localStorage.getItem(draftKey)); } catch (e) {} }
  const f = review || draft || {};
  // Filmin temel bilgilerini yalnızca filmi deftere ilk ekleyen kişi değiştirebilir
  const basicEditable = mode === "new" || (mode === "edit" && (!group || group.base.id === review.id));
  const film = group ? group : f;
  let tm = {tmdbId: f.tmdbId || null, poster: f.poster || "", orig: f.orig || ""};
  let scoreSet = f.score != null;
  const backHref = group ? "#/film/" + enc(group.fk) : "#/";
  document.title = (mode === "edit" ? "Değerlendirmeni düzenle" : "Yeni değerlendirme") + " · Film Defteri";

  app.innerHTML = `
    <a href="${backHref}" class="back">← Vazgeç</a>
    <div class="formhead">
      <h1>${mode === "new" ? "Yeni değerlendirme" : esc(film.t)}</h1>
      <p>${mode === "join" ? `${group.revs.length} kişi bu filmi değerlendirdi; onların görüşleri sen kaydedince açılacak. ` : ""}${mode === "new" ? "Yalnızca film adı zorunlu. " : ""}Değerlendirmen <b>${esc(user.name)}</b> adıyla görünecek.</p>
      ${isNew ? `<div class="draft" id="draftbar">${draft ? 'Kaldığın taslak yüklendi. <button type="button" class="link" id="cleardraft">Taslağı temizle</button>' : "Yazdıkların bu cihazda taslak olarak otomatik saklanır."}</div>` : ""}
    </div>
    <form id="form" novalidate>
      <fieldset class="fs"><legend><em>1</em>Temel Bilgiler</legend><div class="fields">
        ${basicEditable ? `
          ${field("t", "Film adı", f.t, {req: 1, wide: 1, hint: TMDB_KEY ? "Yazmaya başla, listeden seçince bilgiler ve afiş gelir" : "",
              after: '<div class="sresults" id="tmres" hidden></div><div id="tmchip"></div>'})}
          <div class="wide hintbox" id="duphint" hidden></div>
          ${field("d", "Yönetmen", f.d)}
          ${field("g", "Tür", f.g, {ph: "Dram, Gerilim, Bilim Kurgu…", attrs: 'list="genres" maxlength="40"'})}
          ${field("y", "Yapım yılı", f.y, {type: "number", attrs: 'inputmode="numeric" min="1888" max="2100"'})}
          ${field("c", "Ülke", f.c)}
        ` : `
          <div class="wide filmsum">${poster(group, "mini")}<div><b>${esc(film.t)}</b><p class="sub">${[film.d, film.y, film.c, film.g].filter(Boolean).map(esc).join(" · ")}</p>
          <p class="note" style="margin:6px 0 0">Filmin bilgilerini, deftere ilk ekleyen kişi (${esc(group.base.ownerName)}) düzenleyebilir.</p></div></div>
        `}
        ${field("date", "İzleme tarihi", f.date || (isNew ? new Date().toISOString().slice(0, 10) : ""), {type: "date", attrs: " "})}
        <div><span class="lbl">Eşlik edenler</span>${choice("with", WITH, f.with, true)}</div>
      </div><datalist id="genres">${GENRES.map(g => `<option value="${g}">`).join("")}</datalist></fieldset>

      <fieldset class="fs"><legend><em>2</em>Karakterler ve Oyunculuk</legend><div class="fields">
        ${field("char", "En etkileyici karakter", f.char)}
        <div><span class="lbl">Oyunculuk performansları</span>${choice("act", ACT, f.act)}</div>
        ${field("dev", "Karakter gelişimi", f.dev, {area: 1, wide: 1, hint: "Ana karakterlerin dönüşümü ve içsel çatışmaları"})}
      </div></fieldset>

      <fieldset class="fs"><legend><em>3</em>Senaryo, Hikâye ve Temalar</legend><div class="fields">
        ${field("theme", "Filmin ana teması / mesajı", f.theme, {area: 1, wide: 1, hint: "Alt metinde işlenen toplumsal ya da felsefi konular"})}
        <div class="wide"><span class="lbl">Hikâye akışı ve tempo</span>${choice("pace", PACE, f.pace)}</div>
        ${field("quote", "Unutulmaz replik / diyalog", f.quote, {area: 1, wide: 1})}
      </div></fieldset>

      <fieldset class="fs"><legend><em>4</em>Teknik ve Estetik Değerlendirme</legend><div class="fields">
        ${field("visual", "Görsel dil ve sinematografi", f.visual, {area: 1, hint: "Işık, renk paleti, kamera açıları"})}
        ${field("music", "Müzik ve ses tasarımı", f.music, {area: 1, hint: "Atmosfere ve duygulara katkısı"})}
      </div></fieldset>

      <fieldset class="fs"><legend><em>5</em>Kişisel Etki ve Analiz</legend><div class="fields">
        ${field("emotion", "Sende en çok uyandırdığı duygu", f.emotion, {wide: 1})}
        ${field("scene", "En çok sarsan / düşündüren sahne ve nedeni", f.scene, {area: 1, wide: 1})}
        <div class="wide"><span class="lbl">Bu filmi bir arkadaşına önerir misin?</span>${choice("rec", REC, f.rec)}</div>
        ${field("recWhy", "Neden?", f.recWhy, {area: 1, wide: 1})}
      </div></fieldset>

      <fieldset class="fs"><legend><em>6</em>Sonuç ve Puanlama</legend><div class="fields">
        <div><span class="lbl">Görsel / teknik başarı (1–5)</span>${starIn("sV", f.sV)}</div>
        <div><span class="lbl">Hikâye / senaryo (1–5)</span>${starIn("sS", f.sS)}</div>
        <div><span class="lbl">Oyunculuklar (1–5)</span>${starIn("sA", f.sA)}</div>
        <div class="wide">
          <label for="score">Genel puan (10 üzerinden)</label>
          <div class="scorebox">
            <div class="scoreval" id="scoreval"></div>
            <input id="score" type="range" min="1" max="10" step="0.5" value="${f.score ?? 5}">
          </div>
          <p class="draft" style="margin-top:8px"><span id="sugg"></span> <button type="button" class="link" id="clearscore">Puanı kaldır</button></p>
        </div>
      </div></fieldset>

      <div class="formact">
        <a class="btn ghost" href="${backHref}">Vazgeç</a>
        <button class="btn" type="submit" id="submit">${mode === "edit" ? "Değişiklikleri kaydet" : mode === "join" ? "Değerlendirmemi ekle" : "Deftere ekle"}</button>
      </div>
    </form>`;

  const fm = $("#form");
  const showChip = () => {
    const c = $("#tmchip"); if (!c) return;
    c.innerHTML = tm.tmdbId ? `<div class="tmchip">${tm.poster ? `<img src="${IMG}w92${esc(tm.poster)}" alt="">` : ""}<span>TMDB'den alındı${tm.orig ? " · " + esc(tm.orig) : ""}</span><button type="button" class="link" id="tmclear">Bağlantıyı kaldır</button></div>` : "";
    const x = $("#tmclear"); if (x) x.onclick = () => { tm = {tmdbId: null, poster: "", orig: ""}; showChip(); checkDup(); persist(); };
  };
  let dupBlock = null;
  const checkDup = () => {
    if (mode !== "new") return;
    const box = $("#duphint"), t = $("#t").value.trim();
    const g = t ? findGroup({t, ...tm}) : null;
    dupBlock = g && g.mine ? g : null;
    if (!g) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = g.mine
      ? `<b>Bu filmi zaten değerlendirdin.</b> <a href="#/duzenle/${enc(g.mine.id)}">Değerlendirmeni düzenle</a>`
      : `<b>${esc(g.t)}</b> defterde var (${g.revs.length} kişi yazdı). Kaydettiğinde değerlendirmen bu filme eklenir.`;
  };
  const showScore = () => {
    $("#scoreval").innerHTML = scoreSet ? `${num($("#score").value)}<small>/10</small>` : '–<small>/10</small>';
    $("#clearscore").hidden = !scoreSet;
    const s = ["sV","sS","sA"].map(n => +$(`.starin[data-name="${n}"]`).dataset.v).filter(Boolean);
    const sugg = s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length * 4) / 2 : null;
    $("#sugg").innerHTML = sugg ? `Üç puanın ortalaması ${num(sugg)}/10. <button type="button" class="link" id="usesugg">Bunu kullan</button>` : (scoreSet ? "" : "Kaydırarak puan ver.");
    const u = $("#usesugg"); if (u) u.onclick = () => { $("#score").value = sugg; scoreSet = true; showScore(); persist(); };
  };
  const collect = () => {
    const v = id => { const el = $("#" + id); return el ? el.value.trim() : ""; };
    const ch = name => {
      const g = $(`.choices[data-name="${name}"]`);
      const on = $$('[aria-pressed="true"]', g).map(b => b.dataset.v);
      return g.dataset.multi ? on : (on[0] || "");
    };
    const st = name => +$(`.starin[data-name="${name}"]`).dataset.v || null;
    const basic = basicEditable
      ? {t: v("t"), d: v("d"), g: v("g"), y: v("y") ? +v("y") : "", c: v("c"), tmdbId: tm.tmdbId || null, poster: tm.poster || "", orig: tm.orig || ""}
      : {t: film.t || "", d: film.d || "", g: film.g || "", y: film.y || "", c: film.c || "", tmdbId: group.tmdbId || null, poster: group.poster || "", orig: group.base.orig || ""};
    return {
      ...basic, date: v("date"), with: ch("with"),
      char: v("char"), act: ch("act"), dev: v("dev"),
      theme: v("theme"), pace: ch("pace"), quote: v("quote"),
      visual: v("visual"), music: v("music"),
      emotion: v("emotion"), scene: v("scene"), rec: ch("rec"), recWhy: v("recWhy"),
      sV: st("sV"), sS: st("sS"), sA: st("sA"), score: scoreSet ? +$("#score").value : null
    };
  };
  const persist = () => { if (isNew) { try { localStorage.setItem(draftKey, JSON.stringify(collect())); } catch (e) {} } };

  if (basicEditable) {
    tmdbAttach($("#t"), $("#tmres"), d => {
      $("#t").value = d.t; $("#d").value = d.d; $("#g").value = d.g; $("#y").value = d.y; $("#c").value = d.c;
      tm = {tmdbId: d.tmdbId, poster: d.poster, orig: d.orig};
      showChip(); checkDup(); persist();
    });
  }
  fm.addEventListener("click", e => {
    const chip = e.target.closest(".choices .chip");
    if (chip) {
      const g = chip.parentElement, on = chip.getAttribute("aria-pressed") === "true";
      if (!g.dataset.multi) $$(".chip", g).forEach(b => b.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", String(!on)); persist(); return;
    }
    const star = e.target.closest(".starin button");
    if (star) {
      const g = star.parentElement, i = +star.dataset.i;
      const nv = +g.dataset.v === i ? 0 : i;
      g.dataset.v = nv; $$("button", g).forEach(b => b.classList.toggle("on", +b.dataset.i <= nv));
      showScore(); persist();
    }
  });
  fm.addEventListener("input", e => {
    if (e.target.id === "score") { scoreSet = true; showScore(); }
    if (e.target.id === "t") {
      if (mode === "new" && tm.tmdbId) { tm = {tmdbId: null, poster: "", orig: ""}; showChip(); }
      checkDup(); const er = $("#t-err"); if (er) er.hidden = true;
    }
    persist();
  });
  $("#clearscore").onclick = () => { scoreSet = false; showScore(); persist(); };
  const cd = $("#cleardraft");
  if (cd) cd.onclick = () => { try { localStorage.removeItem(draftKey); } catch (e) {} route(false); };
  showScore(); showChip(); checkDup();

  fm.onsubmit = async e => {
    e.preventDefault();
    const data = collect();
    if (!data.t) {
      const er = $("#t-err"); er.textContent = "Film adını yaz, sonra kaydet."; er.hidden = false; $("#t").focus(); return;
    }
    let fk;
    if (mode === "new") {
      const g = findGroup(data);
      if (g && g.mine) { checkDup(); $("#t").focus(); return toast("Bu filmi zaten değerlendirdin."); }
      fk = g ? g.fk : (data.tmdbId ? "tmdb-" + data.tmdbId : slug(data.t));
    } else fk = mode === "join" ? group.fk : fkOf(review);
    const btn = $("#submit"); btn.disabled = true; btn.textContent = "Kaydediliyor…";
    try {
      if (isNew) {
        await add("films", {...data, fk, ownerUid: user.uid, ownerName: user.name, at: Date.now(), updatedAt: Date.now()});
        try { localStorage.removeItem(draftKey); } catch (e) {}
      } else {
        await upd("films", review.id, {...data, fk, updatedAt: Date.now()});
      }
      view = ""; toast(mode === "edit" ? "Değişiklikler kaydedildi" : "Değerlendirmen eklendi");
      location.hash = "#/film/" + enc(fk);
    } catch (err) {
      btn.disabled = false; btn.textContent = mode === "edit" ? "Değişiklikleri kaydet" : "Kaydet";
      toast("Kaydedilemedi: " + err.message);
    }
  };
}

/* ---------- sıradaki film listesi ---------- */
const wishWatched = w => findGroup(w);
function topWish(){
  return DB.wish.filter(w => !wishWatched(w)).sort((a, b) => (b.votes || []).length - (a.votes || []).length || (a.at || 0) - (b.at || 0))[0] || null;
}
let wishTm = {tmdbId: null, poster: "", orig: "", d: "", y: ""};
function wishView(){
  document.title = "Sıradaki film · Film Defteri";
  const open = DB.wish.filter(w => !wishWatched(w)).sort((a, b) => (b.votes || []).length - (a.votes || []).length || (a.at || 0) - (b.at || 0));
  const done = DB.wish.filter(w => wishWatched(w));
  const top = open[0];
  const mineVote = w => user && (w.votes || []).includes(user.uid);
  const voters = w => (w.votes || []).map(uid => { const p = people().find(p => p.uid === uid); return p ? p.name : (DB.wish.find(x => x.ownerUid === uid) || {}).ownerName || "?"; });
  const voteBtn = w => `<button class="vote" data-vote="${esc(w.id)}" aria-pressed="${!!mineVote(w)}" aria-label="Oy ver"><span>▲</span><b>${(w.votes || []).length}</b></button>`;
  const thumb = w => w.poster ? `<img class="wthumb" src="${IMG}w92${esc(w.poster)}" alt="">` : `<span class="wthumb gen" style="background:linear-gradient(160deg,hsl(${hue(w.t)} 45% 42%),hsl(${(hue(w.t) + 40) % 360} 55% 17%))"></span>`;

  app.innerHTML = `
    <section class="hero"><h1>Sıradaki<br><span>film</span></h1>
      <div class="stats"><div><b>${open.length}</b>öneri</div><div><b>${done.length}</b>izlendi</div></div></section>
    ${top ? `<section class="nexthero">
      <div>${top.poster ? `<div class="poster img"><img src="${IMG}w342${esc(top.poster)}" alt="${esc(top.t)} afişi"></div>` : poster({t: top.t, y: top.y, d: top.d})}</div>
      <div>
        <p class="sub">En çok oy alan</p>
        <h2 class="dt">${esc(top.t)}</h2>
        <p class="dir">${[top.d, top.y].filter(Boolean).map(esc).join(" · ")}</p>
        ${top.note ? `<blockquote>${nl(top.note)}</blockquote>` : ""}
        <p class="byline">Öneren: ${plink(top.ownerUid, top.ownerName)}</p>
        <p class="byline">${(top.votes || []).length} oy${(top.votes || []).length ? ": " + voters(top).map(esc).join(", ") : ""}</p>
        <div class="dact">${voteBtn(top)}${user ? `<a class="btn" href="#/yeni" id="watched">İzledik, değerlendir</a>` : ""}</div>
      </div>
    </section>` : '<div class="empty"><p>Henüz öneri yok. İzlemek istediğin bir filmi ilk sen öner.</p></div>'}

    <section class="sec"><h2>Film öner</h2>
      ${user ? `<form id="wform" class="wform">
        <div class="fields">
          <div class="wide"><label for="wt">Film adı <span class="req">*</span>${TMDB_KEY ? " <small>Yazmaya başla, listeden seç</small>" : ""}</label>
            <input id="wt" data-keep maxlength="150" placeholder="Hangi filmi izleyelim?"><div class="sresults" id="wres" hidden></div><div id="wchip"></div>
            <p class="err" id="wt-err" hidden></p></div>
          <div class="wide"><label for="wn">Neden izleyelim? <small>İsteğe bağlı</small></label>
            <textarea id="wn" data-keep maxlength="400" style="min-height:70px"></textarea></div>
        </div>
        <div class="formact" style="margin-top:14px;padding-top:0;border:0"><button class="btn">Listeye ekle</button></div>
      </form>` : `<button class="btn ghost" id="wlogin">Öneri yapmak ve oy vermek için giriş yap</button>`}
    </section>

    ${open.length > 1 ? `<section class="sec"><h2>Oylamadaki filmler</h2><ul class="wlist">${open.slice(1).map(w => `
      <li>${thumb(w)}<div class="wbody"><b>${esc(w.t)}</b><span class="sub">${[w.d, w.y].filter(Boolean).map(esc).join(" · ")}</span>
        ${w.note ? `<p>${nl(w.note)}</p>` : ""}
        <span class="wmeta">Öneren: ${plink(w.ownerUid, w.ownerName)}${user && w.ownerUid === user.uid ? ` · <button class="link" data-delw="${esc(w.id)}">kaldır</button>` : ""}</span></div>
        ${voteBtn(w)}</li>`).join("")}</ul></section>` : ""}

    ${done.length ? `<section class="sec"><h2>Listeden izlenenler</h2><ul class="wlist done">${done.map(w => { const g = wishWatched(w); return `
      <li>${thumb(w)}<div class="wbody"><a href="#/film/${enc(g.fk)}"><b>${esc(w.t)}</b></a><span class="sub">${g.revs.length} değerlendirme · ${(w.votes || []).length} oy almıştı</span>
        ${user && w.ownerUid === user.uid ? `<span class="wmeta"><button class="link" data-delw="${esc(w.id)}">listeden kaldır</button></span>` : ""}</div>
        <span class="donetag">İzlendi</span></li>`; }).join("")}</ul></section>` : ""}`;

  const wl = $("#wlogin"); if (wl) wl.onclick = login;
  const watched = $("#watched");
  if (watched && top) watched.onclick = () => {
    try { localStorage.setItem(DRAFT_KEY + ":yeni", JSON.stringify({t: top.t, d: top.d || "", y: top.y || "", tmdbId: top.tmdbId || null, poster: top.poster || "", orig: top.orig || "", date: new Date().toISOString().slice(0, 10)})); } catch (e) {}
  };
  $$("[data-vote]").forEach(b => b.onclick = async () => {
    if (!user) return login();
    const w = DB.wish.find(x => x.id === b.dataset.vote); if (!w) return;
    try { await vote(w, !mineVote(w)); localChanged(); } catch (e) { toast("Oy verilemedi: " + e.message); }
  });
  $$("[data-delw]").forEach(b => confirmTap(b, async () => { await del("wish", b.dataset.delw); toast("Listeden kaldırıldı"); localChanged(); }, "emin misin?"));

  const wf = $("#wform");
  if (!wf) return;
  const showWChip = () => {
    $("#wchip").innerHTML = wishTm.tmdbId ? `<div class="tmchip">${wishTm.poster ? `<img src="${IMG}w92${esc(wishTm.poster)}" alt="">` : ""}<span>${esc([wishTm.d, wishTm.y].filter(Boolean).join(" · ")) || "TMDB'den alındı"}</span></div>` : "";
  };
  showWChip();
  tmdbAttach($("#wt"), $("#wres"), d => { $("#wt").value = d.t; wishTm = {tmdbId: d.tmdbId, poster: d.poster, orig: d.orig, d: d.d, y: d.y}; showWChip(); });
  $("#wt").addEventListener("input", () => { if (wishTm.tmdbId) { wishTm = {tmdbId: null, poster: "", orig: "", d: "", y: ""}; showWChip(); } $("#wt-err").hidden = true; });
  wf.onsubmit = async e => {
    e.preventDefault();
    const t = $("#wt").value.trim(), note = $("#wn").value.trim(), er = $("#wt-err");
    if (!t) { er.textContent = "Film adını yaz."; er.hidden = false; return; }
    const d = {t, ...wishTm};
    const g = findGroup(d);
    if (g) { er.innerHTML = `Bu film zaten izlenmiş: <a href="#/film/${enc(g.fk)}">film sayfasına bak</a>.`; er.hidden = false; return; }
    const ex = DB.wish.find(w => (d.tmdbId && w.tmdbId === d.tmdbId) || slug(w.t) === slug(t) || (d.orig && slug(w.t) === slug(d.orig)));
    if (ex) { er.textContent = "Bu film zaten listede. Oy vererek destekleyebilirsin."; er.hidden = false; return; }
    try {
      await add("wish", {t, d: wishTm.d || "", y: wishTm.y || "", tmdbId: wishTm.tmdbId || null, poster: wishTm.poster || "", orig: wishTm.orig || "",
        note, votes: [user.uid], ownerUid: user.uid, ownerName: user.name, at: Date.now()});
      $("#wt").value = ""; $("#wn").value = ""; wishTm = {tmdbId: null, poster: "", orig: "", d: "", y: ""};
      toast("Listeye eklendi"); localChanged();
    } catch (err) { toast("Eklenemedi: " + err.message); }
  };
}

/* ---------- kişiler ---------- */
function peopleView(){
  document.title = "Kişiler · Film Defteri";
  const ppl = people().sort((a, b) => b.revs.length - a.revs.length);
  app.innerHTML = `
    <section class="hero"><h1>Defterin<br><span>yazarları</span></h1><div class="stats"><div><b>${ppl.length}</b>kişi</div></div></section>
    ${ppl.length ? `<ul class="plist">${ppl.map(p => {
      const t = user && p.uid !== user.uid ? taste(user.uid, p.uid) : null;
      const avg = mean(p.revs.map(r => r.score));
      return `<li><a href="#/kisi/${enc(p.uid)}">${av(p.name, true)}<span class="pn"><b>${esc(p.name)}</b>${user && p.uid === user.uid ? " (sen)" : ""}
        <small>${p.revs.length} değerlendirme · ortalama ${avgTxt(avg)}</small></span>
        ${t ? `<span class="match"><b>%${t.pct}</b><small>uyum</small></span>` : ""}</a></li>`; }).join("")}</ul>
      ${user ? '<p class="note">Uyum, ikinizin de puanladığı filmlerde genel puanlarınızın ne kadar yakın olduğunu gösterir.</p>' : ""}`
      : '<div class="empty"><p>Henüz kimse yazmadı.</p></div>'}`;
}
function personView(uid){
  const p = people().find(x => x.uid === uid);
  if (!p) {
    if (user && uid === user.uid) {
      app.innerHTML = `<div class="empty"><p>Henüz değerlendirme yazmadın.</p><a class="btn" href="#/yeni">İlk değerlendirmeni yaz</a></div>`; return;
    }
    return missing();
  }
  document.title = p.name + " · Film Defteri";
  const me = user && uid === user.uid;
  const gs = groups();
  const avg = mean(p.revs.map(r => r.score));
  const genreTop = (() => { const m = {}; p.revs.forEach(r => { const g = (gs.find(x => x.fk === fkOf(r)) || r).g; if (g) m[g] = (m[g] || 0) + 1; }); return (Object.entries(m).sort((a, b) => b[1] - a[1])[0] || [""])[0]; })();
  const recs = p.revs.filter(r => r.rec);
  const recYes = recs.length ? Math.round(recs.filter(r => r.rec === "Evet").length / recs.length * 100) : null;
  const matches = people().filter(o => o.uid !== uid).map(o => ({o, t: taste(uid, o.uid)})).filter(x => x.t).sort((a, b) => b.t.pct - a.t.pct || b.t.n - a.t.n);
  const items = p.revs.map(r => ({r, g: gs.find(x => x.fk === fkOf(r))})).filter(x => x.g)
    .sort((a, b) => (b.r.date || "").localeCompare(a.r.date || "") || (b.r.at || 0) - (a.r.at || 0));
  const comments = DB.comments.filter(c => c.ownerUid === uid).length;
  const wishes = DB.wish.filter(w => w.ownerUid === uid).length;

  app.innerHTML = `
    <a href="#/kisiler" class="back">← Kişiler</a>
    <section class="phead">${av(p.name, true)}<div><h1 class="dt">${esc(p.name)}</h1><p class="sub">${me ? "Senin sayfan" : "Film Defteri yazarı"}</p></div></section>
    <div class="tiles">
      <div class="tile"><b>${p.revs.length}</b><span>Değerlendirme</span></div>
      <div class="tile"><b>${avgTxt(avg)}</b><span>Verdiği ort. puan</span></div>
      <div class="tile"><b class="small">${esc(genreTop) || "–"}</b><span>En çok izlediği tür</span></div>
      <div class="tile"><b>${recYes != null ? "%" + recYes : "–"}</b><span>Önerdikleri</span></div>
    </div>
    <p class="note" style="margin-top:0">${comments} yorum · ${wishes} film önerisi</p>
    <div class="cols">
      <section class="sec"><h2>Zevk uyumu</h2>
        ${matches.length ? `<ul class="mlist">${matches.map(({o, t}) => `<li><a href="#/kisi/${enc(o.uid)}">${av(o.name)}<span>${esc(o.name)}</span></a>
          <div class="tr"><div class="fl" style="width:${t.pct}%"></div></div><span class="n">%${t.pct}</span><small>${t.n} ortak film</small></li>`).join("")}</ul>
          <p class="note">Ortak puanlanan filmlerde genel puanların ne kadar yakın olduğuna göre hesaplanır. Ortak film arttıkça daha anlamlı olur.</p>`
          : '<p class="unrated">Başkalarıyla ortak puanlanan film yok.</p>'}
      </section>
      <section class="sec"><h2>En sevdikleri</h2>
        ${(() => { const best = items.filter(x => x.r.score != null).sort((a, b) => b.r.score - a.r.score).slice(0, 5);
          return best.length ? `<ol class="top3">${best.map(({r, g}) => `<li><a href="#/film/${enc(g.fk)}">${esc(g.t)}</a>${gated(g) && !me ? '<span class="score hid">?</span>' : `<span class="score">${num(r.score)}<small>/10</small></span>`}</li>`).join("")}</ol>` : '<p class="unrated">Henüz puan vermemiş.</p>'; })()}
      </section>
    </div>
    <section class="sec"><h2>Değerlendirmeleri</h2>
      <div class="grid">${items.map(({r, g}) => card(g, `<div class="meta">${gated(g) && !me ? '<span class="score hid">?<small>/10</small></span>' : r.score != null ? `<span class="score">${num(r.score)}<small>/10</small></span>` : '<span class="unrated">puansız</span>'}<span>${r.date ? esc(fmtDate(r.date)) : ""}</span></div>`)).join("")}</div>
      ${user && !me && items.some(x => gated(x.g)) ? '<p class="note">"?" olanları sen henüz değerlendirmedin.</p>' : ""}
    </section>`;
}

/* ---------- istatistik ---------- */
function stats(){
  document.title = "İstatistik · Film Defteri";
  const gs = groups();
  const avg = mean(gs.map(g => g.avg));
  const mine = user ? DB.films.filter(f => f.ownerUid === user.uid) : [];
  const ppl = people();
  const count = (list, get) => { const m = {}; list.forEach(x => { const k = get(x); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const bars = rows => { const max = Math.max(1, ...rows.map(r => r[1])); return rows.length ? rows.slice(0, 10).map(([k, n]) =>
    `<div class="hbar"><span>${esc(k)}</span><div class="tr"><div class="fl" style="width:${n / max * 100}%"></div></div><span class="n">${n}</span></div>`).join("") : '<p class="unrated">Henüz veri yok.</p>'; };
  const now = new Date(); const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    months.push({label: d.toLocaleDateString("tr-TR", {month: "short"}), n: DB.films.filter(f => (f.date || "").startsWith(key)).length});
  }
  const mmax = Math.max(1, ...months.map(m => m.n));
  const top = gs.filter(g => g.avg != null).sort((a, b) => b.avg - a.avg).slice(0, 5);
  const split = gs.map(g => { const s = g.revs.map(r => r.score).filter(x => x != null); return {g, lo: Math.min(...s), hi: Math.max(...s), n: s.length}; })
    .filter(x => x.n > 1 && x.hi - x.lo > 0).sort((a, b) => (b.hi - b.lo) - (a.hi - a.lo)).slice(0, 5);
  // en uyumlu ikili
  let pair = null;
  for (let i = 0; i < ppl.length; i++) for (let j = i + 1; j < ppl.length; j++) {
    const t = taste(ppl[i].uid, ppl[j].uid);
    if (t && (!pair || t.pct > pair.t.pct || (t.pct === pair.t.pct && t.n > pair.t.n))) pair = {a: ppl[i], b: ppl[j], t};
  }

  app.innerHTML = `
    <section class="hero"><h1>Defterin<br><span>rakamları</span></h1></section>
    <div class="tiles">
      <div class="tile"><b>${gs.length}</b><span>Film</span></div>
      <div class="tile"><b>${DB.films.length}</b><span>Değerlendirme</span></div>
      <div class="tile"><b>${avgTxt(avg)}</b><span>Ortalama puan</span></div>
      <div class="tile"><b>${DB.comments.length}</b><span>Yorum</span></div>
    </div>
    ${pair ? `<p class="pairline">En uyumlu ikili: ${plink(pair.a.uid, pair.a.name)} ve ${plink(pair.b.uid, pair.b.name)}, %${pair.t.pct} uyum (${pair.t.n} ortak film)</p>` : ""}
    <div class="cols">
      <section class="sec"><h2>En yüksek ortalama</h2>
        ${top.length ? `<ol class="top3">${top.map(g => `<li><a href="#/film/${enc(g.fk)}">${esc(g.t)} <span class="sub" style="display:inline">· ${g.revs.length} kişi</span></a>${avgTag(g)}</li>`).join("")}</ol>` : '<p class="unrated">Henüz puan verilmedi.</p>'}
      </section>
      <section class="sec"><h2>Görüşlerin ayrıştığı filmler</h2>
        ${split.length ? `<ol class="top3">${split.map(x => `<li><a href="#/film/${enc(x.g.fk)}">${esc(x.g.t)}</a>${gated(x.g) ? '<span class="score hid">?</span>' : `<span class="score">${num(x.lo)} – ${num(x.hi)}</span>`}</li>`).join("")}</ol>` : '<p class="unrated">Aynı filmi en az iki kişi puanlayınca burada görünür.</p>'}
      </section>
      <section class="sec"><h2>Son 12 ayda izlenenler</h2>
        <div class="months">${months.map(m => `<div class="m"><span class="c">${m.n || ""}</span><div class="b" style="height:${m.n / mmax * 100}%"></div></div>`).join("")}</div>
        <div class="mlabels">${months.map(m => `<span>${esc(m.label)}</span>`).join("")}</div>
      </section>
      <section class="sec"><h2>En çok yazanlar</h2>${bars(count(DB.films, f => f.ownerName))}</section>
      <section class="sec"><h2>Türler</h2>${bars(count(gs, g => g.g))}</section>
    </div>
    <section class="sec"><h2>Veriler</h2>
      <div class="datarow">
        <p>Defterin tamamını yedek dosyası olarak indirebilirsin.${user ? " Yedek yüklediğinde içindeki değerlendirmeler senin adınla eklenir." : ""}</p>
        <button class="btn" id="exp">Yedeği indir</button>
        ${user ? `<label class="btn ghost" for="imp" style="margin:0;letter-spacing:.04em;color:var(--ink);font-size:18px">Yedek yükle</label>
        <input type="file" id="imp" accept="application/json,.json" hidden>` : ""}
      </div>
      ${user && (mine.length || DB.films.some(f => f.ornek)) ? `<div class="datarow" style="margin-top:18px">
        ${DB.films.some(f => f.ornek) ? '<button class="btn ghost" id="delex">Örnekleri sil</button>' : ""}
        ${mine.length ? `<button class="btn danger" id="delmine">Yazdıklarımı sil (${mine.length})</button>` : ""}
      </div>` : ""}
    </section>`;

  $("#exp").onclick = () => {
    const blob = new Blob([JSON.stringify({app: "film-defteri", v: 5, films: DB.films, wish: DB.wish, comments: DB.comments}, null, 2)], {type: "application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "film-defteri-yedek-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const imp = $("#imp");
  if (imp) imp.onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = async () => {
      let list;
      try { const d = JSON.parse(r.result); list = Array.isArray(d) ? d : d.films; if (!Array.isArray(list)) throw 0; }
      catch (err) { return toast("Bu dosya bir Film Defteri yedeği değil."); }
      list = list.filter(f => f && f.t).slice(0, 300);
      const have = new Set(mine.map(fkOf));
      let n = 0, skip = 0;
      for (const f of list) {
        const {id, ownerUid, ownerName, ornek, ...rest} = f;
        const fk = fkOf(rest);
        if (have.has(fk)) { skip++; continue; }
        try { await add("films", {...rest, fk, ownerUid: user.uid, ownerName: user.name, at: rest.at || Date.now(), updatedAt: Date.now()}); have.add(fk); n++; } catch (err) {}
      }
      toast(`${n} değerlendirme eklendi${skip ? `, zaten yazdığın ${skip} film atlandı` : ""}`); localChanged();
    };
    r.readAsText(file);
  };
  confirmTap($("#delex"), async () => {
    for (const c of ["films", "wish", "comments"]) { DB[c] = DB[c].filter(x => !x.ornek); saveLocal(c); }
    toast("Örnekler silindi"); localChanged();
  });
  confirmTap($("#delmine"), async () => { for (const f of mine) await del("films", f.id); toast("Değerlendirmelerin silindi"); localChanged(); });
}

init();
