// --- DATA TEKS TARGET (DIPERLUAS) ---
const textTarget = [
    "Jadilah master keyboard, ketik cepat dan akurat untuk mencapai skor tertinggi.",
    "Setiap karakter yang benar membawa Anda lebih dekat pada penguasaan mesin tik.",
    "Latihan hari ini menentukan kecepatan Anda di masa depan yang serba digital.",
    "Kecepatan bukan segalanya, namun presisi adalah kunci utama dalam mengetik.",
    "Algoritma ini mengukur seberapa efektif jemari Anda berselancar di atas tuts.",
    "Ada beberapa contoh ilmu juga kata lain mengatakan objek perkara seputar universal.",
    "Aplikasi ini membantu tingkatkan presisi serta laju jari Anda berlatih.",
    "Gerakan jari Anda kini dapat terekam dan dinilai secara otomatis",
    "Simulasi ini melatih otak dan otot tangan agar dapat mengetik cepat.",
    "Metode ketik sentuh mengoptimalkan efisiensi kerja melalui kebiasaan.",
    "Ketangkasan jemari Anda akan terasah jika terus konsisten berlatih.",
    "Keyboard QWERTY telah menjadi standar global sejak penemuannya di abad ke-19.",
    "Fokuskan pandangan Anda pada teks target, bukan pada tombol keyboard fisik.",
    "Kunci utama untuk WPM tinggi adalah meminimalkan kesalahan pengetikan.",
    "Cobalah untuk selalu menggunakan sepuluh jari Anda secara proporsional.",
    "Teknik *touch typing* memungkinkan Anda mengetik tanpa melihat jari sama sekali.",
    "Jangan terburu-buru, mulailah dengan akurasi sebelum mengejar kecepatan tinggi.",
    "Lampu indikator Caps Lock seringkali terletak di sisi kiri keyboard Anda.",
    "Penggunaan tanda baca seperti koma dan titik haruslah dilakukan dengan cepat.",
    "Konsentrasi penuh pada setiap huruf akan mengurangi tingkat *backspace* Anda.",
    "Proses belajar ini memerlukan dedikasi dan konsistensi dari waktu ke waktu.",
    "Pemanasan ringan sebelum sesi latihan dapat meningkatkan kelenturan jemari.",
    "Beberapa frasa dalam bahasa Inggris menggunakan huruf-huruf yang jarang seperti J, Q, dan Z.",
    "Perhatikan postur duduk yang benar untuk menghindari kelelahan saat mengetik.",
    "Layar komputer Anda adalah fokus utama saat berinteraksi dengan aplikasi ini.",
    "Sistem operasi modern menawarkan berbagai tata letak keyboard yang berbeda."
];

let targetText;
let charElements;
let charIndex = 0;
let startTime = null;
let timer = 60; // Waktu dalam detik
let timerInterval;
let errors = 0;
let currentScore = { wpm: 0, accuracy: 0 }; // Untuk menyimpan skor sementara

// --- DOM ELEMENTS ---
const typingArea = document.getElementById('typing-area');
const inputField = document.getElementById('input-field');
const wpmDisplay = document.getElementById('wpm-display');
const accuracyDisplay = document.getElementById('accuracy-display');
const timerDisplay = document.getElementById('timer-display');
const restartBtn = document.getElementById('restart-btn');
const resultOverlay = document.getElementById('result-overlay');
const finalWpm = document.getElementById('final-wpm');
const finalAccuracy = document.getElementById('final-accuracy');
const finalErrors = document.getElementById('final-errors');
const emoteDisplay = document.getElementById('emote-display');
const finalScoreTitle = document.getElementById('final-score-title');
const leaderboardTableBody = document.querySelector('#leaderboard-table tbody');

// REFERENSI MODAL INPUT NAMA
const nameInputModal = document.getElementById('name-input-modal');
const playerNameInput = document.getElementById('player-name-input');
const submitNameBtn = document.getElementById('submit-name-btn');


// --- FUNGSI LEADERBOARD & LOCAL STORAGE ---

function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('typingLeaderboard')) || [];
    
    // Urutkan berdasarkan WPM (tertinggi ke terendah), lalu Akurasi
    scores.sort((a, b) => {
        if (b.wpm !== a.wpm) {
            return b.wpm - a.wpm; 
        }
        return b.accuracy - a.accuracy; 
    });
    
    leaderboardTableBody.innerHTML = ''; 

    scores.slice(0, 10).forEach((score, index) => {
        const row = leaderboardTableBody.insertRow();
        row.insertCell(0).textContent = index + 1;
        row.insertCell(1).textContent = score.wpm;
        row.insertCell(2).textContent = `${score.accuracy}%`;
        row.insertCell(3).textContent = score.name;
    });
}

function saveScore(name, wpm, accuracy) {
    const newScore = {
        name: name,
        wpm: wpm,
        accuracy: accuracy,
        timestamp: new Date().toISOString()
    };

    const scores = JSON.parse(localStorage.getItem('typingLeaderboard')) || [];
    scores.push(newScore);

    localStorage.setItem('typingLeaderboard', JSON.stringify(scores));
    loadLeaderboard(); 
}


// --- FUNGSI MODAL INPUT NAMA ---

function showNameInputModal(wpm, accuracy) {
    currentScore = { wpm, accuracy }; // Simpan skor sementara

    // Sembunyikan result overlay, tapi biarkan nameInputModal aktif di atasnya
    resultOverlay.classList.add('active'); 

    nameInputModal.classList.add('active');
    playerNameInput.focus();
    playerNameInput.value = ''; // Pastikan input bersih
}


// --- SETUP GAME ---

function loadText() {
    // Reset timer jika sudah ada
    if (timerInterval) clearInterval(timerInterval);
    timer = 60; 

    // Pilih teks acak
    targetText = textTarget[Math.floor(Math.random() * textTarget.length)];
    typingArea.innerHTML = '';
    
    // Pecah teks menjadi elemen span per karakter untuk styling
    targetText.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char;
        typingArea.appendChild(span);
    });

    charElements = typingArea.querySelectorAll('span');
    // Set kursor awal
    if (charElements.length > 0) {
        charElements[0].classList.add('char-current');
    }
    
    // Reset Stats
    charIndex = 0;
    errors = 0;
    startTime = null;
    wpmDisplay.textContent = 'WPM: 0';
    accuracyDisplay.textContent = 'Akurasi: 0%';
    timerDisplay.textContent = `Waktu: ${timer}s`;
    inputField.value = '';
    inputField.disabled = false;
    inputField.focus();
    
    // Sembunyikan semua modal/overlay
    resultOverlay.classList.remove('active');
    nameInputModal.classList.remove('active');
}

// --- LOGIKA UTAMA TIMER & HITUNG ---

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timer--;
        timerDisplay.textContent = `Waktu: ${timer}s`;

        if (timer <= 0) {
            clearInterval(timerInterval);
            finishGame();
        }
    }, 1000);
}

function calculateWPM() {
    const totalTypedChars = charIndex;
    if (totalTypedChars === 0) return 0;
    
    const timeElapsed = (60 - timer); 
    if (timeElapsed <= 0) return 0;

    // WPM = (Karakter Benar / 5) / (Waktu Berlalu / 60)
    const wpm = Math.round((totalTypedChars / 5) / (timeElapsed / 60));
    return wpm;
}

function calculateAccuracy() {
    // Total Karakter Diketik = Benar + Salah
    const totalTypedChars = charIndex + errors; 
    if (totalTypedChars === 0) return 100;

    const accuracy = Math.round((charIndex / totalTypedChars) * 100);
    return accuracy;
}

function updateStats() {
    wpmDisplay.textContent = `WPM: ${calculateWPM()}`;
    accuracyDisplay.textContent = `Akurasi: ${calculateAccuracy()}%`;
}


function handleInput(e) {
    if (startTime === null) {
        startTime = new Date();
        startTimer();
    }
    
    const typedChar = e.data; 
    const targetChar = targetText[charIndex];

    // Logika Backspace
    if (!typedChar) {
        if (e.inputType === 'deleteContentBackward' && charIndex > 0) {
            charIndex--;
            charElements[charIndex].classList.remove('char-correct', 'char-incorrect');
            charElements[charIndex].classList.add('char-current');
            
            if (charIndex + 1 < charElements.length) {
                charElements[charIndex + 1].classList.remove('char-current');
            }
        }
        return;
    }

    // Pengecekan karakter
    if (charIndex < charElements.length) {
        charElements[charIndex].classList.remove('char-current');

        if (typedChar === targetChar) {
            charElements[charIndex].classList.add('char-correct');
        } else {
            charElements[charIndex].classList.add('char-incorrect');
            errors++;
        }

        charIndex++;

        // Pindahkan kursor ke posisi berikutnya
        if (charIndex < charElements.length) {
            charElements[charIndex].classList.add('char-current');
        }
    }

    updateStats();

    // Cek selesai (semua teks habis)
    if (charIndex === targetText.length) {
        finishGame();
    }
}

// --- LOGIKA HASIL AKHIR & ANIMASI ---

function finishGame() {
    clearInterval(timerInterval);
    inputField.disabled = true;

    // Hitung skor akhir
    const finalWPMValue = calculateWPM();
    const finalAccuracyValue = calculateAccuracy();

    // Tentukan Level dan Emote
    let level = '';
    let emote = '';
    let emoteClass = '';

    if (finalWPMValue >= 60 && finalAccuracyValue >= 95) {
        level = 'AMPUN SUHUUU';
        emote = '👑';
        emoteClass = 'emote-win';
    } else if (finalWPMValue >= 40 && finalAccuracyValue >= 90) {
        level = 'HEBAT SEKALI';
        emote = '🔥';
        emoteClass = 'emote-win';
    } else if (finalWPMValue >= 20) {
        level = 'CUKUP HANDAL';
        emote = '👍';
        emoteClass = 'emote-ok';
    } else {
        level = 'PERLU LATIHAN LAGI YAA';
        emote = '😥💪';
        emoteClass = '';
    }

    // Tampilkan hasil di result box (tetapi overlay belum aktif)
    finalScoreTitle.textContent = `Sesi Selesai: ${level}!`;
    finalWpm.textContent = finalWPMValue;
    finalAccuracy.textContent = `${finalAccuracyValue}%`;
    finalErrors.textContent = errors;
    emoteDisplay.textContent = emote;
    emoteDisplay.className = `emote-display ${emoteClass}`; 
    
    // PANGGIL MODAL INPUT NAMA
    showNameInputModal(finalWPMValue, finalAccuracyValue);
}

// --- EVENT LISTENERS ---
inputField.addEventListener('input', handleInput);
restartBtn.addEventListener('click', () => {
    loadText();
    loadLeaderboard();
});

// Event Listener untuk tombol Simpan Skor di Modal
submitNameBtn.addEventListener('click', () => {
    // Pastikan modal hasil juga aktif saat nama disubmit
    resultOverlay.classList.add('active'); 
    
    // Sembunyikan modal input nama
    nameInputModal.classList.remove('active');

    const playerName = playerNameInput.value.trim() || "Anonim";
    
    // Simpan skor ke Leaderboard
    saveScore(playerName, currentScore.wpm, currentScore.accuracy);
});

// Event Listener untuk tombol Enter di Modal
playerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitNameBtn.click();
    }
});


// --- INIT (PEMUATAN AWAL) ---
loadText();

loadLeaderboard();
