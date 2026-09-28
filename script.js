const EYE_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.4 20.4 0 0 1 5.06-6.06"/><path d="M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a20.3 20.3 0 0 1-3.22 4.44"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/></svg>`;

const form = document.getElementById("regForm");
const successBanner = document.getElementById("successBanner");

const fields = {
  nama: {
    input: document.getElementById("nama"),
    wrap: document.querySelector('[data-field="nama"]'),
    hint: document.getElementById("namaHint"),
    defaultHint: "Minimal 3 karakter.",
    validate(value) {
      const v = value.trim();
      if (v.length === 0) return { valid: false, message: "Nama lengkap tidak boleh kosong." };
      if (v.length < 3) return { valid: false, message: "Nama minimal 3 karakter." };
      return { valid: true, message: "Nama terlihat baik." };
    },
  },
  email: {
    input: document.getElementById("email"),
    wrap: document.querySelector('[data-field="email"]'),
    hint: document.getElementById("emailHint"),
    defaultHint: "Gunakan format email yang benar.",
    validate(value) {
      const v = value.trim();
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (v.length === 0) return { valid: false, message: "Email tidak boleh kosong." };
      if (!pattern.test(v)) return { valid: false, message: "Format email tidak valid." };
      return { valid: true, message: "Format email valid." };
    },
  },
  password: {
    input: document.getElementById("password"),
    wrap: document.querySelector('[data-field="password"]'),
    hint: document.getElementById("passwordHint"),
    defaultHint: "Minimal 8 karakter.",
    validate(value) {
      if (value.length === 0) return { valid: false, message: "Password tidak boleh kosong." };
      if (value.length < 8) return { valid: false, message: "Password minimal 8 karakter." };
      return { valid: true, message: "Password sudah cukup kuat." };
    },
  },
  confirm: {
    input: document.getElementById("confirm"),
    wrap: document.querySelector('[data-field="confirm"]'),
    hint: document.getElementById("confirmHint"),
    defaultHint: "Harus sama dengan password di atas.",
    validate(value) {
      const pass = fields.password.input.value;
      if (value.length === 0) return { valid: false, message: "Konfirmasi password tidak boleh kosong." };
      if (value !== pass) return { valid: false, message: "Konfirmasi password tidak sama." };
      return { valid: true, message: "Password cocok." };
    },
  },
  ekskul: {
    input: document.getElementById("ekskul"),
    wrap: document.querySelector('[data-field="ekskul"]'),
    hint: document.getElementById("ekskulHint"),
    defaultHint: "Pilih salah satu ekstrakurikuler.",
    validate(value) {
      if (!value) return { valid: false, message: "Pilih salah satu ekstrakurikuler." };
      return { valid: true, message: "Pilihan tersimpan." };
    },
  },
};

function applyResult(field, result, silent) {
  field.wrap.classList.remove("is-invalid", "is-valid");

  if (silent) {
    field.hint.textContent = field.defaultHint;
    return;
  }

  if (result.valid) {
    field.wrap.classList.add("is-valid");
  } else {
    field.wrap.classList.add("is-invalid");
  }
  field.hint.textContent = result.message;
}

function validateField(key, silent = false) {
  const field = fields[key];
  const result = field.validate(field.input.value);
  applyResult(field, result, silent);
  return result.valid;
}

Object.keys(fields).forEach((key) => {
  const field = fields[key];
  const eventName = field.input.tagName === "SELECT" ? "change" : "input";
  field.input.addEventListener(eventName, () => validateField(key));
  field.input.addEventListener("blur", () => validateField(key));
});

// Re-check confirmation whenever the password itself changes
fields.password.input.addEventListener("input", () => {
  if (fields.confirm.input.value.length > 0) validateField("confirm");
});

// Show / hide password
document.querySelectorAll(".toggle-eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    const willShow = input.type === "password";
    input.type = willShow ? "text" : "password";
    btn.innerHTML = willShow ? EYE_OFF_ICON : EYE_ICON;
    btn.setAttribute("aria-label", willShow ? "Sembunyikan password" : "Tampilkan password");
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault(); // mencegah reload halaman
  successBanner.hidden = true;

  let allValid = true;

  Object.keys(fields).forEach((key) => {
    const valid = validateField(key);
    if (!valid) {
      allValid = false;
      const wrap = fields[key].wrap;
      wrap.classList.add("shake");
      setTimeout(() => wrap.classList.remove("shake"), 350);
    }
  });

  if (allValid) {
    successBanner.hidden = false;
    successBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    form.reset();
    Object.keys(fields).forEach((key) => validateField(key, true));
  } else {
    const firstInvalidKey = Object.keys(fields).find((key) =>
      fields[key].wrap.classList.contains("is-invalid")
    );
    if (firstInvalidKey) fields[firstInvalidKey].input.focus();
  }
});

/* ===================== Chatbot ===================== */
(function () {
  const chatbot = document.getElementById("chatbot");
  const toggleBtn = document.getElementById("chatbotToggle");
  const closeBtn = document.getElementById("chatbotClose");
  const windowEl = document.getElementById("chatbotWindow");
  const messagesEl = document.getElementById("chatbotMessages");
  const quickEl = document.getElementById("chatbotQuick");
  const chatForm = document.getElementById("chatbotForm");
  const chatInput = document.getElementById("chatbotInput");
  const badge = document.getElementById("chatbotBadge");

  // Basis pengetahuan: setiap entri punya kata kunci & jawaban.
  // Dicocokkan dengan sistem skor (bukan cuma "match pertama"), jadi kalau
  // sebuah pesan mengandung beberapa kata kunci dari beberapa topik,
  // topik dengan kecocokan terbanyak yang akan dijawab.
  const knowledgeBase = [
    {
      keywords: ["ekskul", "ekstrakurikuler", "pilihan ekstrakurikuler", "daftar apa saja", "apa saja pilihan", "kegiatan apa"],
      answer:
        "Ekstrakurikuler yang tersedia: Paskibra, PMR, Paduan Suara, Seni Tari, Jurnalis, Rabana, Drumband, Pencak Silat, Bahasa Jepang, Pramuka, Rohis, dan Voli. Kamu bisa memilihnya di kolom \"Pilihan Ekstrakurikuler\" pada formulir.",
    },
    {
      keywords: ["voli", "bola voli"],
      answer: "Voli termasuk salah satu ekskul olahraga yang tersedia. Kamu bisa memilihnya langsung di dropdown \"Pilihan Ekstrakurikuler\".",
    },
    {
      keywords: ["tari", "seni tari", "menari", "dance"],
      answer: "Seni Tari ada di daftar ekskul kategori Seni. Cocok buat kamu yang suka menari dan tampil di acara sekolah.",
    },
    {
      keywords: ["paduan suara", "band", "musik", "nyanyi", "bernyanyi"],
      answer: "Untuk bidang musik, ada Paduan Suara dan Rabana/Drumband. Semuanya bisa dipilih di kolom ekstrakurikuler.",
    },
    {
      keywords: ["jurnalis", "jurnalistik", "menulis", "majalah dinding", "mading"],
      answer: "Jurnalis adalah ekskul kategori teknologi/literasi, cocok untuk yang suka menulis dan liputan kegiatan sekolah.",
    },
    {
      keywords: ["paskibra", "pengibar bendera"],
      answer: "Paskibra melatih kedisiplinan dan baris-berbaris, biasanya bertugas dalam upacara bendera di sekolah.",
    },
    {
      keywords: ["pmr", "palang merah"],
      answer: "PMR (Palang Merah Remaja) fokus pada pertolongan pertama dan kepedulian kesehatan di lingkungan sekolah.",
    },
    {
      keywords: ["pencak silat", "silat", "bela diri"],
      answer: "Pencak Silat adalah ekskul bela diri tradisional yang juga melatih fisik dan mental.",
    },
    {
      keywords: ["bahasa jepang", "jepang"],
      answer: "Bahasa Jepang cocok untukmu yang tertarik belajar bahasa asing dan budaya Jepang.",
    },
    {
      keywords: ["pramuka"],
      answer: "Pramuka melatih kemandirian, kerja sama tim, dan keterampilan berkemah/lapangan.",
    },
    {
      keywords: ["rohis", "kerohanian", "keagamaan"],
      answer: "Rohis adalah kegiatan kerohanian Islam di sekolah, membahas kajian dan kegiatan keagamaan.",
    },
    {
      keywords: ["cara daftar", "bagaimana daftar", "langkah daftar", "gimana daftar", "cara mendaftar", "cara isi", "cara mengisi"],
      answer:
        "Caranya mudah: isi Nama Lengkap, Email, Password, Konfirmasi Password, lalu pilih Ekstrakurikuler. Setelah semua kolom valid (ditandai warna hijau), klik tombol \"Daftar Sekarang\".",
    },
    {
      keywords: ["email", "e-mail", "alamat surel", "surel"],
      answer:
        "Email harus dalam format yang benar, contoh: nama@sekolah.sch.id. Jika kolom berwarna merah, biasanya formatnya belum sesuai (kurang tanda @ atau titik).",
    },
    {
      keywords: ["password", "sandi", "kata sandi", "lupa password", "lupa sandi"],
      answer:
        "Password minimal 8 karakter. Kolom \"Konfirmasi Password\" harus diisi persis sama dengan Password di atasnya. Klik ikon mata di sebelah kanan kolom untuk menampilkan/menyembunyikan tulisannya.",
    },
    {
      keywords: ["konfirmasi password", "ulangi password", "sama tidak sama"],
      answer: "Konfirmasi Password harus persis sama, huruf besar/kecil pun berpengaruh. Kalau tidak sama, kolom akan berwarna merah dengan pesan \"Konfirmasi password tidak sama.\"",
    },
    {
      keywords: ["nama", "nama lengkap", "nama saya"],
      answer: "Kolom Nama Lengkap wajib diisi minimal 3 karakter, misalnya \"Amelda Isnaini\".",
    },
    {
      keywords: ["gagal", "error", "tidak bisa", "kenapa tidak", "kenapa gagal", "tidak terkirim", "tidak jalan", "bermasalah", "kenapa tidak bisa"],
      answer:
        "Jika formulir tidak terkirim, cek kolom yang bergaris merah — itu tandanya belum valid. Perbaiki sesuai pesan kecil di bawah kolom tersebut, lalu klik \"Daftar Sekarang\" lagi.",
    },
    {
      keywords: ["berhasil", "sudah terkirim", "sukses", "sudah kekirim"],
      answer:
        "Kalau muncul kotak hijau bertuliskan \"Pendaftaran berhasil dikirim!\" setelah kamu klik \"Daftar Sekarang\", artinya data kamu sudah tersimpan. Tidak perlu mengisi ulang formulir.",
    },
    {
      keywords: ["tahun ajaran", "kapan", "jadwal", "kapan mulai", "kapan dibuka", "kapan tutup", "batas waktu", "deadline"],
      answer: "Pendaftaran ini untuk Tahun Ajaran 2026/2027. Untuk tanggal pasti pembukaan/penutupan, silakan cek pengumuman resmi sekolah ya.",
    },
    {
      keywords: ["boleh pilih lebih dari satu", "boleh dua ekskul", "lebih dari 1 ekskul", "ganti pilihan", "ubah pilihan"],
      answer: "Formulir ini hanya menyediakan satu kolom pilihan ekstrakurikuler, jadi pilih satu yang paling kamu minati dulu. Untuk pertanyaan mengganti pilihan setelah daftar, sebaiknya hubungi panitia/guru pembina.",
    },
    {
      keywords: ["biaya", "bayar", "gratis", "harga"],
      answer: "Formulir ini tidak menampilkan informasi biaya pendaftaran. Untuk info biaya, sebaiknya tanyakan langsung ke pihak sekolah/panitia ekstrakurikuler.",
    },
    {
      keywords: ["syarat", "persyaratan", "ketentuan"],
      answer: "Syarat di formulir ini: Nama minimal 3 karakter, email valid, password minimal 8 karakter dan cocok dengan konfirmasi, serta memilih satu ekstrakurikuler.",
    },
    {
      keywords: ["siapa kamu", "kamu siapa", "kamu apa", "kamu bot", "kamu robot"],
      answer: "Saya asisten virtual sederhana di halaman pendaftaran ini, dibuat untuk membantu jawab pertanyaan seputar cara mengisi formulir ekstrakurikuler.",
    },
    {
      keywords: ["kontak", "hubungi", "cs", "admin", "panitia", "guru"],
      answer: "Untuk hal di luar pengisian formulir (misalnya perubahan data setelah daftar), sebaiknya hubungi panitia atau guru pembina ekstrakurikuler di sekolahmu.",
    },
    {
      keywords: ["terima kasih", "makasih", "thanks", "thank you"],
      answer: "Sama-sama! Semoga lancar pendaftarannya. 😊",
    },
    {
      keywords: ["halo", "hai", "hi", "hello", "pagi", "siang", "sore", "malam", "permisi"],
      answer: "Halo juga! Ada yang bisa saya bantu terkait pendaftaran ekstrakurikuler?",
    },
    {
      keywords: ["bantuan", "help", "tolong", "bingung", "tidak mengerti", "gimana ini"],
      answer: "Tenang, saya bantu ya. Kamu bisa tanya soal: pilihan ekstrakurikuler, cara mendaftar, email, password, atau kenapa formulir gagal terkirim.",
    },
  ];

  const quickReplies = [
    "Ekstrakurikuler apa saja?",
    "Bagaimana cara mendaftar?",
    "Syarat password apa?",
  ];

  const fallbackAnswers = [
    "Hmm, saya belum yakin jawabannya. Coba tanyakan dengan kata lain, atau seputar: pilihan ekstrakurikuler, cara mendaftar, email, password, ya! 🙂",
    "Maaf, saya belum punya jawaban pasti untuk itu. Saya paling jago menjawab soal formulir pendaftaran ekstrakurikuler ini — coba tanya lagi ya.",
    "Pertanyaan itu di luar yang saya kuasai. Kalau soal cara isi formulir, syarat, atau ekskul yang tersedia, saya siap bantu!",
  ];

  let hasOpenedOnce = false;

  // Menghilangkan tanda baca & spasi berlebih supaya pencocokan kata kunci
  // lebih toleran terhadap variasi penulisan pengguna.
  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[?!.,;:'"()]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findAnswer(text) {
    const normalized = normalizeText(text);
    if (!normalized) {
      return fallbackAnswers[0];
    }

    let bestEntry = null;
    let bestScore = 0;

    knowledgeBase.forEach((entry) => {
      let score = 0;
      entry.keywords.forEach((kw) => {
        if (normalized.includes(kw)) {
          // Kata kunci yang lebih panjang/spesifik diberi bobot lebih besar
          score += kw.length;
        }
      });
      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    });

    if (bestEntry) {
      return bestEntry.answer;
    }

    // Fallback acak supaya terasa lebih natural, bukan pesan yang sama terus
    const idx = Math.floor(Math.random() * fallbackAnswers.length);
    return fallbackAnswers[idx];
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = `chatbot__msg chatbot__msg--${sender}`;
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.className = "chatbot__msg chatbot__msg--bot chatbot__msg--typing";
    typing.id = "chatbotTyping";
    typing.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(typing);
    scrollToBottom();
  }

  function hideTyping() {
    const typing = document.getElementById("chatbotTyping");
    if (typing) typing.remove();
  }

  function botReply(userText) {
    showTyping();
    const delay = 500 + Math.random() * 400;
    setTimeout(() => {
      hideTyping();
      addMessage(findAnswer(userText), "bot");
    }, delay);
  }

  function renderQuickReplies() {
    quickEl.innerHTML = "";
    quickReplies.forEach((label) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chatbot__chip";
      chip.textContent = label;
      chip.addEventListener("click", () => sendUserMessage(label));
      quickEl.appendChild(chip);
    });
  }

  function sendUserMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    addMessage(trimmed, "user");
    botReply(trimmed);
  }

  function openChat() {
    chatbot.classList.add("is-open");
    windowEl.hidden = false;
    badge.hidden = true;
    chatInput.focus();

    if (!hasOpenedOnce) {
      hasOpenedOnce = true;
      addMessage(
        "Halo! 👋 Saya asisten pendaftaran ekstrakurikuler. Ada yang bisa saya bantu?",
        "bot"
      );
      renderQuickReplies();
    }
  }

  function closeChat() {
    chatbot.classList.remove("is-open");
    windowEl.hidden = true;
  }

  toggleBtn.addEventListener("click", () => {
    if (windowEl.hidden) {
      openChat();
    } else {
      closeChat();
    }
  });

  closeBtn.addEventListener("click", closeChat);

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatInput.value;
    chatInput.value = "";
    sendUserMessage(text);
  });
})();