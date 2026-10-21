// Firebase ayarları (film-defteri projesi).
// Bu bilgilerin herkese açık olması normaldir; verileri koruyan şey
// Firestore'daki güvenlik kurallarıdır.

window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBCSuaYKrXYnI41d9LHlTzqkY3g9ouGG9A",
  authDomain: "film-defteri.firebaseapp.com",
  projectId: "film-defteri",
  storageBucket: "film-defteri.firebasestorage.app",
  messagingSenderId: "693379196691",
  appId: "1:693379196691:web:280f2b868dec6899771ce6"
};

// TMDB (The Movie Database) API anahtarı. Doldurulursa film adı yazınca
// afiş, yönetmen, yıl ve tür otomatik gelir. Boş kalırsa site yine çalışır.
window.TMDB_KEY = "fea9df412845cf55b7c388414b2787cb";
