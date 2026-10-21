"use strict";
/* Film Defteri — ortak film değerlendirme defteri.
   Her film defterde bir kez görünür; o filme yazılan tüm değerlendirmeler film sayfasında yan yana durur.
   config.js içinde Firebase ayarı varsa veriler Firestore'da herkesle paylaşılır;
   yoksa site yerel deneme modunda (yalnızca bu tarayıcıda) çalışır. */

const CFG = window.FIREBASE_CONFIG;
const ONLINE = !!(CFG && CFG.apiKey);
const FB_SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
const LOCAL_KEY = "film-defteri-yerel-v2";
const DRAFT_KEY = "film-defteri-taslak";
const GENRES = ["Dram","Gerilim","Bilim Kurgu","Komedi","Romantik","Animasyon","Belgesel","Korku","Aksiyon","Fantastik","Suç","Tarih","Müzikal"];
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

/* ---------- yardımcılar ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const nl = s => esc(s).replace(/\n/g, "<br>");
const num = n => String(n).replace(".", ",");
const app = $("#app");

function toast(m){
  const t = $("#toast"); t.textContent = m; t.hidden = false;
  clearTimeout(t._t); t._t = setTimeout(() => t.hidden = true, 2600);
}
function hue(s){ let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
function poster(f, big){
  const h = hue(f.t);
  return `<div class="poster${big ? " big" : ""}" style="background:linear-gradient(160deg,hsl(${h} 45% 42%),hsl(${(h + 40) % 360} 55% 17%))">
    ${f.ornek ? '<span class="ex">Örnek</span>' : ""}<span class="yr">${esc(f.y)}</span>
    <div class="pt">${esc(f.t)}</div><div class="pd">${esc(f.d)}</div></div>`;
}
function fmtDate(d){
  if (!d) return "";
  const x = new Date(d + "T12:00:00");
  return isNaN(x) ? d : x.toLocaleDateString("tr-TR", {day:"numeric", month:"long", year:"numeric"});
}
const scoreTag = f => f.score != null ? `<span class="score">${num(f.score)}<small>/10</small></span>` : '<span class="unrated">puanlanmadı</span>';
const stars = n => n ? `<span class="stars" aria-label="${n} / 5">${"★".repeat(n)}<span class="off">${"★".repeat(5 - n)}</span></span>` : '<span class="unrated">—</span>';
const avgOf = list => list.length ? list.reduce((s, f) => s + f.score, 0) / list.length : null;



const slug = s => String(s || "").toLocaleLowerCase("tr")
  .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/['’`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "film";
const fkOf = r => r.fk || slug(r.t);
const avgTxt = v => v != null ? num((Math.round(v * 10) / 10).toFixed(1)).replace(",0", "") : "–";
const avgTag = g => g.avg != null ? `<span class="score">${avgTxt(g.avg)}<small>/10</small></span>` : '<span class="unrated">puanlanmadı</span>';
const av = (name, big) => `<span class="av${big ? " big" : ""}" style="background:hsl(${hue(name)} 42% 42%)" aria-hidden="true">${esc(String(name || "?").trim().charAt(0).toLocaleUpperCase("tr"))}</span>`;
const mean = arr => { const v = arr.filter(x => x != null && x !== 0); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };

/* ---------- veri katmanı ---------- */
let films = [], ready = false, user = null, loadError = null;
let auth = null, col = null;
const byId = id => films.find(f => f.id === id);
const canEdit = f => !!(user && f && f.ownerUid === user.uid);

function groups(){
  const m = new Map();
  for (const r of films) { const k = fkOf(r); if (!m.has(k)) m.set(k, []); m.get(k).push(r); }
  return [...m.entries()].map(([fk, revs]) => {
    revs.sort((a, b) => (a.at || 0) - (b.at || 0));
    const base = revs[0];
    return {
      fk, revs, base, t: base.t, d: base.d, y: base.y, c: base.c, g: base.g,
      ornek: revs.every(r => r.ornek),
      avg: mean(revs.map(r => r.score)),
      last: revs.reduce((m, r) => (r.date || "") > m ? r.date : m, ""),
      lastAt: Math.max(...revs.map(r => r.at || 0)),
      mine: user ? revs.find(r => r.ownerUid === user.uid) : null
    };
  });
}
const groupOf = fk => groups().find(g => g.fk === fk);

function loadLocal(){
  try { const d = JSON.parse(localStorage.getItem(LOCAL_KEY)); if (Array.isArray(d)) return d; } catch (e) {}
  const t0 = Date.now();
  const main = SAMPLE.map((f, i) => ({...f, o: i % 2}));
  return [...main, ...SAMPLE_EXTRA].map((f, i) => {
    const {o, ...rest} = f, p = SAMPLE_PEOPLE[o];
    return {...rest, fk: slug(rest.t), id: "ornek" + i, ornek: true, ownerUid: p.uid, ownerName: p.name, at: t0 - 100000 + i * 1000};
  });
}
function saveLocal(){
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(films)); }
  catch (e) { toast("Kaydedilemedi: tarayıcı depolaması kapalı"); }
}
async function addFilm(data){
  if (ONLINE) return (await col.add(data)).id;
  const id = "f" + Date.now() + Math.random().toString(36).slice(2, 5);
  films.push({...data, id}); saveLocal(); return id;
}
async function updateFilm(id, data){
  if (ONLINE) return col.doc(id).update(data);
  Object.assign(byId(id), data); delete byId(id).ornek; saveLocal();
}
async function removeFilm(id){
  if (ONLINE) return col.doc(id).delete();
  films = films.filter(f => f.id !== id); saveLocal();
}

function loadScript(src){
  return new Promise((res, rej) => {
    const s = document.createElement("script"); s.src = src;
    s.onload = res; s.onerror = () => rej(new Error("Yüklenemedi: " + src));
    document.head.appendChild(s);
  });
}
async function init(){
  if (!ONLINE) {
    films = loadLocal(); user = {uid: "yerel", name: "Sen"}; ready = true;
    $("#demo").hidden = false; renderAuth(); route(); return;
  }
  route();
  try {
    await loadScript(FB_SDK + "firebase-app-compat.js");
    await Promise.all([loadScript(FB_SDK + "firebase-auth-compat.js"), loadScript(FB_SDK + "firebase-firestore-compat.js")]);
    firebase.initializeApp(CFG);
    auth = firebase.auth();
    col = firebase.firestore().collection("films");
    auth.getRedirectResult().catch(() => {});
    auth.onAuthStateChanged(u => {
      user = u ? {uid: u.uid, name: u.displayName || (u.email || "").split("@")[0] || "İsimsiz"} : null;
      renderAuth(); if (ready && view !== "form") route(false);
    });
    col.onSnapshot(snap => {
      films = snap.docs.map(d => ({...d.data(), id: d.id}));
      ready = true; loadError = null;
      if (view !== "form") route(false);
    }, err => { loadError = err.message; ready = true; route(false); });
  } catch (e) { loadError = e.message; ready = true; route(false); }
}

/* ---------- giriş ---------- */
async function login(){
  if (!ONLINE || !auth) return;
  const provider = new firebase.auth.GoogleAuthProvider();
  try { await auth.signInWithPopup(provider); toast("Giriş yapıldı"); }
  catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") return auth.signInWithRedirect(provider);
    if (e.code === "auth/unauthorized-domain") return toast("Bu alan adı Firebase'de yetkili değil. Kurulum rehberindeki 7. adıma bak.");
    if (e.code !== "auth/popup-closed-by-user" && e.code !== "auth/cancelled-popup-request") toast("Giriş yapılamadı: " + e.message);
  }
}
function renderAuth(){
  const box = $("#authbox");
  if (!ONLINE) { box.innerHTML = ""; return; }
  box.innerHTML = user
    ? `<span class="who" title="${esc(user.name)}">${esc(user.name.split(" ")[0])}</span><button class="link" id="logout">Çıkış</button>`
    : `<button class="navlogin" id="loginbtn">Giriş yap</button>`;
  const lb = $("#loginbtn"); if (lb) lb.onclick = login;
  const lo = $("#logout"); if (lo) lo.onclick = () => { auth.signOut(); toast("Çıkış yapıldı"); };
}
function loginGate(msg){
  app.innerHTML = `<div class="empty"><p>${esc(msg)}</p><button class="btn" id="gate">Google ile giriş yap</button>
    <p class="note">Adın, yazdığın değerlendirmelerin yanında görünür. E-posta adresin gösterilmez.</p></div>`;
  $("#gate").onclick = login;
}

/* ---------- yönlendirme ---------- */
let view = "";
function route(scroll = true){
  const [a, b] = location.hash.replace(/^#\/?/, "").split("/").map(x => decodeURIComponent(x || ""));
  $$("nav a").forEach(x => x.classList.toggle("on", x.dataset.r === (a || "defter") && !(a === "yeni" && b)));
  if (loadError) { view = "error"; return errorView(); }
  if (!ready) { view = "loading"; app.innerHTML = '<div class="empty"><p>Defter yükleniyor…</p></div>'; return; }

  if (a === "film") {
    const g = groupOf(b);
    if (g) { view = "detail"; detail(g); }
    else if (byId(b)) { location.replace("#/film/" + encodeURIComponent(fkOf(byId(b)))); return; }
    else { view = "detail"; missing(); }
  }
  else if (a === "yeni") {
    const g = b ? groupOf(b) : null;
    if (b && !g) { view = "detail"; missing(); }
    else if (!user) { view = "gate"; loginGate("Değerlendirme yazmak için giriş yap."); }
    else if (g && g.mine) { location.replace("#/duzenle/" + encodeURIComponent(g.mine.id)); return; }
    else { view = "form"; form(g ? {mode: "join", group: g} : {mode: "new"}); }
  }
  else if (a === "duzenle") {
    const r = byId(b);
    if (!r) { view = "detail"; missing(); }
    else if (!user) { view = "gate"; loginGate("Düzenlemek için giriş yap."); }
    else if (!canEdit(r)) { location.replace("#/film/" + encodeURIComponent(fkOf(r))); return; }
    else { view = "form"; form({mode: "edit", review: r, group: groupOf(fkOf(r))}); }
  }
  else if (a === "istatistik") { view = "stats"; stats(); }
  else { view = "home"; home(); }
  if (scroll) window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => route());
function missing(){ app.innerHTML = '<div class="empty"><p>Bu film defterde bulunamadı. Silinmiş olabilir.</p><a class="btn" href="#/">Deftere dön</a></div>'; }
function errorView(){
  app.innerHTML = `<div class="empty"><p><b>Defter yüklenemedi.</b></p><p class="note">${esc(loadError)}</p>
    <p class="note">Firestore kurallarını yayınladığından ve config.js bilgilerinin doğru olduğundan emin ol.</p></div>`;
}

/* ---------- defter (ana sayfa) ---------- */
let q = "", genre = "Tümü", sort = "date", who = "";
function home(){
  document.title = "Film Defteri";
  const gs = groups();
  const authors = [...new Map(films.map(f => [f.ownerUid, f.ownerName])).entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1]), "tr"));
  const genres = ["Tümü", ...[...new Set(gs.map(g => g.g).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"))];
  if (!genres.includes(genre)) genre = "Tümü";
  const whoOpts = ["", ...(user ? ["@mine", "@todo"] : []), ...authors.map(([u]) => u)];
  if (!whoOpts.includes(who)) who = "";
  app.innerHTML = `
    <section class="hero">
      <h1>İzledik,<br><span>düşündük,</span><br>yazdık.</h1>
      <div class="stats">
        <div><b>${gs.length}</b>film</div>
        <div><b>${films.length}</b>değerlendirme</div>
        <div><b>${authors.length}</b>yazar</div>
      </div>
    </section>
    ${gs.length ? `
    <div class="toolbar">
      <input id="q" type="search" placeholder="Film, yönetmen, tür veya kişi ara" value="${esc(q)}" aria-label="Ara">
      <select id="who" aria-label="Kimin">
        <option value="">Herkesin</option>
        ${user ? '<option value="@mine">Benim yazdıklarım</option><option value="@todo">Henüz yazmadıklarım</option>' : ""}
        ${authors.filter(([u]) => !user || u !== user.uid).map(([u, n]) => `<option value="${esc(u)}">${esc(n)} yazdı</option>`).join("")}
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
    ${gs.some(g => g.revs.some(r => r.ornek)) ? '<p class="note">"Örnek" etiketli filmler ve Ayşe, Mert, Deniz\'in değerlendirmeleri deneme amaçlıdır.</p>' : ""}
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
function grid(){
  const s = q.trim().toLocaleLowerCase("tr");
  const list = groups().filter(g =>
    (genre === "Tümü" || g.g === genre) &&
    (!who || (who === "@mine" ? !!g.mine : who === "@todo" ? !g.mine : g.revs.some(r => r.ownerUid === who))) &&
    (!s || [g.t, g.d, g.g, g.c, ...g.revs.map(r => r.ownerName)].join(" ").toLocaleLowerCase("tr").includes(s)));
  const cmp = {
    date: (a, b) => b.last.localeCompare(a.last) || b.lastAt - a.lastAt,
    score: (a, b) => (b.avg ?? -1) - (a.avg ?? -1),
    count: (a, b) => b.revs.length - a.revs.length || (b.avg ?? -1) - (a.avg ?? -1),
    year: (a, b) => (b.y || 0) - (a.y || 0),
    title: (a, b) => String(a.t).localeCompare(String(b.t), "tr")
  }[sort];
  list.sort(cmp);
  $("#grid").innerHTML = list.length ? list.map(g => `
    <a class="card" href="#/film/${encodeURIComponent(g.fk)}">
      ${poster(g)}
      <div class="ct">${esc(g.t)}</div>
      <div class="meta">${avgTag(g)}<span>${g.revs.length} kişi</span></div>
      <div class="faces">${g.revs.slice(0, 6).map(r => av(r.ownerName)).join("")}${g.revs.length > 6 ? `<span class="more">+${g.revs.length - 6}</span>` : ""}${user && g.mine ? '<span class="mine">sen de yazdın</span>' : ""}</div>
    </a>`).join("") : '<div class="empty" style="grid-column:1/-1">Bu seçime uyan film yok.</div>';
}

/* ---------- film sayfası: tüm değerlendirmeler yan yana ---------- */
function detail(g){
  document.title = g.t + " · Film Defteri";
  const revs = [...g.revs].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const isMe = r => user && r.ownerUid === user.uid;
  const cell = v => v ? `${v}<span class="st">★</span>` : '<span class="unrated">–</span>';
  const rowMeta = r => [r.date ? fmtDate(r.date) : "", (r.with || []).join(", ")].filter(Boolean).map(esc).join(" · ");

  const answers = (label, get) => {
    const items = revs.map(r => ({r, v: get(r)})).filter(x => x.v);
    return `<div class="q"><h3>${label}</h3>${items.length ? `<ul class="ans">${items.map(({r, v}) =>
      `<li class="${isMe(r) ? "me" : ""}"><span class="by">${av(r.ownerName)}<b>${esc(r.ownerName)}</b></span><div>${v}</div></li>`).join("")}</ul>`
      : '<p class="unrated">Kimse yazmamış.</p>'}</div>`;
  };
  const tally = (key) => {
    const m = {}; revs.forEach(r => { if (r[key]) m[r[key]] = (m[r[key]] || 0) + 1; });
    const e = Object.entries(m).sort((a, b) => b[1] - a[1]);
    return e.length ? `<p class="tally">${e.map(([k, n]) => `<span class="pill">${esc(k)}${n > 1 ? " ×" + n : ""}</span>`).join(" ")}</p>` : "";
  };
  const pill = v => v ? `<span class="pill">${esc(v)}</span>` : "";
  const scores = revs.map(r => r.score).filter(x => x != null);
  const spread = scores.length > 1 ? Math.max(...scores) - Math.min(...scores) : 0;

  app.innerHTML = `
    <a href="#/" class="back">← Deftere dön</a>
    <article>
      <div class="dhead">
        <div>${poster(g, true)}</div>
        <div>
          <p class="sub">${[g.g, g.y, g.c].filter(Boolean).map(esc).join(" · ")}</p>
          <h1 class="dt">${esc(g.t)}</h1>
          <p class="dir">Yönetmen: ${esc(g.d) || "—"}</p>
          <div class="bigscore">${avgTxt(g.avg)}<small>/10</small></div>
          <p class="byline">${g.revs.length} kişinin ortalaması${spread >= 2 ? ` · <span class="warnpill">Görüşler ayrışıyor</span>` : ""}</p>
          <div class="faces lg">${g.revs.map(r => av(r.ownerName, true)).join("")}</div>
          <div class="dact">
            ${g.mine ? `<a class="btn" href="#/duzenle/${encodeURIComponent(g.mine.id)}">Değerlendirmeni düzenle</a><button class="btn danger" id="del">Değerlendirmeni sil</button>`
                     : `<a class="btn" href="#/yeni/${encodeURIComponent(g.fk)}">${user ? "Değerlendirmeni ekle" : "Giriş yapıp değerlendir"}</a>`}
          </div>
        </div>
      </div>

      <section class="sec"><h2>Puanlar</h2>
        <div class="tablewrap"><table class="cmp">
          <thead><tr><th scope="col">Kim</th><th scope="col">Görsel</th><th scope="col">Hikâye</th><th scope="col">Oyunculuk</th><th scope="col">Genel</th></tr></thead>
          <tbody>
            ${revs.map(r => `<tr class="${isMe(r) ? "me" : ""}">
              <th scope="row"><span class="by">${av(r.ownerName)}<span><b>${esc(r.ownerName)}</b>${isMe(r) ? " (sen)" : ""}<small>${rowMeta(r)}</small></span></span></th>
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
    </article>`;

  const del = $("#del");
  if (del) del.onclick = async () => {
    if (!del.dataset.ok) { del.dataset.ok = 1; del.textContent = "Silmek için tekrar dokun"; return; }
    del.disabled = true;
    try {
      await removeFilm(g.mine.id); toast("Değerlendirmen silindi");
      if (g.revs.length === 1) location.hash = "#/";
      else if (!ONLINE) route(false);
    } catch (e) { del.disabled = false; toast("Silinemedi: " + e.message); }
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
  const film = group ? group.base : f;
  let scoreSet = f.score != null;
  const backHref = group ? "#/film/" + encodeURIComponent(group.fk) : "#/";
  document.title = (mode === "edit" ? "Değerlendirmeni düzenle" : "Yeni değerlendirme") + " · Film Defteri";

  app.innerHTML = `
    <a href="${backHref}" class="back">← Vazgeç</a>
    <div class="formhead">
      <h1>${mode === "new" ? "Yeni değerlendirme" : esc(film.t)}</h1>
      <p>${mode === "join" ? `${group.revs.length} kişi bu filmi değerlendirdi. ` : ""}${mode === "new" ? "Yalnızca film adı zorunlu. " : ""}Değerlendirmen <b>${esc(user.name)}</b> adıyla görünecek.</p>
      ${isNew ? `<div class="draft" id="draftbar">${draft ? 'Kaldığın taslak yüklendi. <button type="button" class="link" id="cleardraft">Taslağı temizle</button>' : "Yazdıkların bu cihazda taslak olarak otomatik saklanır."}</div>` : ""}
    </div>
    <form id="form" novalidate>
      <fieldset class="fs"><legend><em>1</em>Temel Bilgiler</legend><div class="fields">
        ${basicEditable ? `
          ${field("t", "Film adı", f.t, {req: 1, wide: 1})}
          <div class="wide hintbox" id="duphint" hidden></div>
          ${field("d", "Yönetmen", f.d)}
          ${field("g", "Tür", f.g, {ph: "Dram, Gerilim, Bilim Kurgu…", attrs: 'list="genres" maxlength="40"'})}
          ${field("y", "Yapım yılı", f.y, {type: "number", attrs: 'inputmode="numeric" min="1888" max="2100"'})}
          ${field("c", "Ülke", f.c)}
        ` : `
          <div class="wide filmsum">${poster(group)}<div><b>${esc(film.t)}</b><p class="sub">${[film.d, film.y, film.c, film.g].filter(Boolean).map(esc).join(" · ")}</p>
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
  let dupBlock = null; // kullanıcı bu filmi zaten değerlendirdiyse
  const checkDup = () => {
    if (mode !== "new") return;
    const box = $("#duphint"), t = $("#t").value.trim();
    const g = t ? groupOf(slug(t)) : null;
    dupBlock = g && g.mine ? g : null;
    if (!g) { box.hidden = true; return; }
    box.hidden = false;
    box.innerHTML = g.mine
      ? `<b>Bu filmi zaten değerlendirdin.</b> <a href="#/duzenle/${encodeURIComponent(g.mine.id)}">Değerlendirmeni düzenle</a>`
      : `<b>${esc(g.t)}</b> defterde var (${g.revs.length} kişi yazdı). Kaydettiğinde değerlendirmen bu filme eklenir. <a href="#/film/${encodeURIComponent(g.fk)}">Film sayfasına bak</a>`;
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
      ? {t: v("t"), d: v("d"), g: v("g"), y: v("y") ? +v("y") : "", c: v("c")}
      : {t: film.t || "", d: film.d || "", g: film.g || "", y: film.y || "", c: film.c || ""};
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
    if (e.target.id === "t") { checkDup(); const er = $("#t-err"); if (er) er.hidden = true; }
    persist();
  });
  $("#clearscore").onclick = () => { scoreSet = false; showScore(); persist(); };
  const cd = $("#cleardraft");
  if (cd) cd.onclick = () => { try { localStorage.removeItem(draftKey); } catch (e) {} route(false); };
  showScore(); checkDup();

  fm.onsubmit = async e => {
    e.preventDefault();
    const data = collect();
    if (!data.t) {
      const er = $("#t-err"); er.textContent = "Film adını yaz, sonra kaydet."; er.hidden = false; $("#t").focus(); return;
    }
    if (mode === "new") { checkDup(); if (dupBlock) { $("#t").focus(); return toast("Bu filmi zaten değerlendirdin."); } }
    const fk = mode === "new" ? slug(data.t) : mode === "join" ? group.fk : fkOf(review);
    const btn = $("#submit"); btn.disabled = true; btn.textContent = "Kaydediliyor…";
    try {
      if (isNew) {
        await addFilm({...data, fk, ownerUid: user.uid, ownerName: user.name, at: Date.now(), updatedAt: Date.now()});
        try { localStorage.removeItem(draftKey); } catch (e) {}
      } else {
        await updateFilm(review.id, {...data, fk, updatedAt: Date.now()});
      }
      view = ""; toast(mode === "edit" ? "Değişiklikler kaydedildi" : "Değerlendirmen eklendi");
      location.hash = "#/film/" + encodeURIComponent(fk);
    } catch (err) {
      btn.disabled = false; btn.textContent = mode === "edit" ? "Değişiklikleri kaydet" : "Kaydet";
      toast("Kaydedilemedi: " + err.message);
    }
  };
}

/* ---------- istatistik ---------- */
function stats(){
  document.title = "İstatistik · Film Defteri";
  const gs = groups();
  const avg = mean(gs.map(g => g.avg));
  const year = new Date().getFullYear();
  const mine = user ? films.filter(f => f.ownerUid === user.uid) : [];
  const authors = new Set(films.map(f => f.ownerUid)).size;

  const count = (list, get) => { const m = {}; list.forEach(x => { const k = get(x); if (k) m[k] = (m[k] || 0) + 1; }); return Object.entries(m).sort((a, b) => b[1] - a[1]); };
  const bars = rows => { const max = Math.max(1, ...rows.map(r => r[1])); return rows.length ? rows.slice(0, 10).map(([k, n]) =>
    `<div class="hbar"><span>${esc(k)}</span><div class="tr"><div class="fl" style="width:${n / max * 100}%"></div></div><span class="n">${n}</span></div>`).join("") : '<p class="unrated">Henüz veri yok.</p>'; };

  const now = new Date(); const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    months.push({label: d.toLocaleDateString("tr-TR", {month: "short"}), n: films.filter(f => (f.date || "").startsWith(key)).length});
  }
  const mmax = Math.max(1, ...months.map(m => m.n));
  const top = gs.filter(g => g.avg != null).sort((a, b) => b.avg - a.avg).slice(0, 5);
  const split = gs.map(g => { const s = g.revs.map(r => r.score).filter(x => x != null); return {g, lo: Math.min(...s), hi: Math.max(...s), n: s.length}; })
    .filter(x => x.n > 1 && x.hi - x.lo > 0).sort((a, b) => (b.hi - b.lo) - (a.hi - a.lo)).slice(0, 5);

  app.innerHTML = `
    <section class="hero"><h1>Defterin<br><span>rakamları</span></h1></section>
    <div class="tiles">
      <div class="tile"><b>${gs.length}</b><span>Film</span></div>
      <div class="tile"><b>${films.length}</b><span>Değerlendirme</span></div>
      <div class="tile"><b>${avgTxt(avg)}</b><span>Ortalama puan</span></div>
      <div class="tile"><b>${authors}</b><span>Yazar</span></div>
    </div>
    <div class="cols">
      <section class="sec"><h2>En yüksek ortalama</h2>
        ${top.length ? `<ol class="top3">${top.map(g => `<li><a href="#/film/${encodeURIComponent(g.fk)}">${esc(g.t)} <span class="sub" style="display:inline">· ${g.revs.length} kişi</span></a>${avgTag(g)}</li>`).join("")}</ol>` : '<p class="unrated">Henüz puan verilmedi.</p>'}
      </section>
      <section class="sec"><h2>Görüşlerin ayrıştığı filmler</h2>
        ${split.length ? `<ol class="top3">${split.map(x => `<li><a href="#/film/${encodeURIComponent(x.g.fk)}">${esc(x.g.t)}</a><span class="score">${num(x.lo)} – ${num(x.hi)}</span></li>`).join("")}</ol>` : '<p class="unrated">Aynı filmi en az iki kişi puanlayınca burada görünür.</p>'}
      </section>
      <section class="sec"><h2>Son 12 ayda izlenenler</h2>
        <div class="months">${months.map(m => `<div class="m"><span class="c">${m.n || ""}</span><div class="b" style="height:${m.n / mmax * 100}%"></div></div>`).join("")}</div>
        <div class="mlabels">${months.map(m => `<span>${esc(m.label)}</span>`).join("")}</div>
      </section>
      <section class="sec"><h2>En çok yazanlar</h2>${bars(count(films, f => f.ownerName))}</section>
      <section class="sec"><h2>Türler</h2>${bars(count(gs, g => g.g))}</section>
    </div>
    <section class="sec"><h2>Veriler</h2>
      <div class="datarow">
        <p>Defterin tamamını yedek dosyası olarak indirebilirsin.${user ? " Yedek yüklediğinde içindeki değerlendirmeler senin adınla eklenir." : ""}</p>
        <button class="btn" id="exp">Yedeği indir</button>
        ${user ? `<label class="btn ghost" for="imp" style="margin:0;letter-spacing:.04em;color:var(--ink);font-size:18px">Yedek yükle</label>
        <input type="file" id="imp" accept="application/json,.json" hidden>` : ""}
      </div>
      ${user && (mine.length || films.some(f => f.ornek)) ? `<div class="datarow" style="margin-top:18px">
        ${films.some(f => f.ornek) ? '<button class="btn ghost" id="delex">Örnekleri sil</button>' : ""}
        ${mine.length ? `<button class="btn danger" id="delmine">Yazdıklarımı sil (${mine.length})</button>` : ""}
      </div>` : ""}
    </section>`;

  $("#exp").onclick = () => {
    const blob = new Blob([JSON.stringify({app: "film-defteri", v: 4, films}, null, 2)], {type: "application/json"});
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
        try { await addFilm({...rest, fk, ownerUid: user.uid, ownerName: user.name, at: rest.at || Date.now(), updatedAt: Date.now()}); have.add(fk); n++; } catch (err) {}
      }
      toast(`${n} değerlendirme eklendi${skip ? `, zaten yazdığın ${skip} film atlandı` : ""}`); if (!ONLINE) stats();
    };
    r.readAsText(file);
  };
  const confirmBtn = (id, fn) => { const b = $("#" + id); if (!b) return; b.onclick = async () => {
    if (!b.dataset.ok) { b.dataset.ok = 1; b.textContent = "Emin misin? Tekrar dokun"; return; }
    b.disabled = true; try { await fn(); } catch (e) { toast("İşlem yapılamadı: " + e.message); } stats(); }; };
  confirmBtn("delex", async () => { films = films.filter(f => !f.ornek); saveLocal(); toast("Örnekler silindi"); });
  confirmBtn("delmine", async () => { for (const f of mine) await removeFilm(f.id); toast("Değerlendirmelerin silindi"); });
}

init();
