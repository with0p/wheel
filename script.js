// ==========================================
// PRIZES
// Здесь ты можешь менять призы
// ==========================================

const prizes = {
    1: "Dumle 🍫",
    2: "Ahlgrens bilar 🚗",
    3: "Kexchoklad 🍫",
    4: "Marabou 🍫",
    5: "Plopp 🍫",
    6: "Polly 🍬",
    7: "Большой пакет конфет 🍭",
    8: "Dumle + Plopp 🎁"
};


// ==========================================
// GAME SETTINGS
// ==========================================

const TOTAL_NUMBERS = 8;
const SECTOR_ANGLE = 360 / TOTAL_NUMBERS;

let selectedNumber = null;
let currentRotation = 0;
let spinning = false;


// ==========================================
// DOM
// ==========================================

const wheel = document.getElementById("wheel");
const spinButton = document.getElementById("spinButton");
const numberButtons = document.querySelectorAll(".numbers button");

const result = document.getElementById("result");
const resultNumber = document.getElementById("resultNumber");
const resultPrize = document.getElementById("resultPrize");


// ==========================================
// CREATE NUMBERS ON WHEEL
// ==========================================

for (let number = 1; number <= TOTAL_NUMBERS; number++) {

    const element = document.createElement("div");

    element.className = "wheel-number";
    element.textContent = number;

    /*
        Каждый номер располагаем по окружности.

        -90 градусов означает, что первый сектор
        начинается сверху.
    */

    const angle =
        (number - 1) * SECTOR_ANGLE
        + SECTOR_ANGLE / 2
        - 90;

    const radius = 38;

    element.style.transform = `
        rotate(${angle}deg)
        translateY(-${radius}%)
        rotate(${-angle}deg)
    `;

    wheel.appendChild(element);
}


// ==========================================
// SELECT NUMBER
// ==========================================

numberButtons.forEach(button => {

    button.addEventListener("click", () => {

        if (spinning) return;

        numberButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedNumber = Number(button.dataset.number);

        spinButton.disabled = false;

        result.classList.add("hidden");
    });

});


// ==========================================
// SPIN
// ==========================================

spinButton.addEventListener("click", () => {

    if (selectedNumber === null || spinning) {
        return;
    }

    spinning = true;

    spinButton.disabled = true;

    numberButtons.forEach(button => {
        button.disabled = true;
    });


    // --------------------------------------
    // Calculate target angle
    // --------------------------------------

    /*
        Нам нужно, чтобы выбранный сектор
        оказался под стрелкой сверху.

        Центр выбранного сектора:
        (number - 1) * 45 + 22.5

        Чтобы поставить его наверх,
        вращаем колесо в обратную сторону.
    */

    const sectorCenter =
        (selectedNumber - 1) * SECTOR_ANGLE
        + SECTOR_ANGLE / 2;

    const targetAngle = 360 - sectorCenter;


    // Несколько полных оборотов перед остановкой
    const fullSpins = 360 * 7;


    // Нормализуем текущий угол
    const normalizedRotation =
        currentRotation % 360;


    // Новый угол
    const finalRotation =
        currentRotation
        + fullSpins
        + targetAngle
        - normalizedRotation;


    currentRotation = finalRotation;


    // --------------------------------------
    // Start spinning
    // --------------------------------------

    wheel.style.transform =
        `rotate(${finalRotation}deg)`;


    // --------------------------------------
    // Finish
    // --------------------------------------

    setTimeout(() => {

        spinning = false;

        numberButtons.forEach(button => {
            button.disabled = false;
        });

        showPrize(selectedNumber);

    }, 5600);

});


// ==========================================
// SHOW PRIZE
// ==========================================

function showPrize(number) {

    resultNumber.textContent = number;

    resultPrize.textContent = prizes[number];

    result.classList.remove("hidden");

    playWinSound();

    createConfetti();
}


// ==========================================
// SOUND
// ==========================================

let audioContext = null;

function getAudioContext() {

    if (!audioContext) {
        audioContext =
            new (window.AudioContext ||
                window.webkitAudioContext)();
    }

    return audioContext;
}


// Маленький звук победы

function playWinSound() {

    const ctx = getAudioContext();

    const now = ctx.currentTime;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "triangle";

    oscillator.frequency.setValueAtTime(
        523,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        1046,
        now + 0.25
    );

    gain.gain.setValueAtTime(
        0.001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.3,
        now + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.8
    );

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.8);
}


// ==========================================
// CONFETTI
// ==========================================

function createConfetti() {

    const amount = 80;

    for (let i = 0; i < amount; i++) {

        const confetti =
            document.createElement("div");

        confetti.style.position = "fixed";

        confetti.style.left =
            Math.random() * 100 + "vw";

        confetti.style.top = "-20px";

        confetti.style.width = "10px";
        confetti.style.height = "14px";

        confetti.style.background =
            [
                "#e63946",
                "#ffd166",
                "#277da1",
                "#2a9d8f",
                "#ffffff"
            ][Math.floor(Math.random() * 5)];

        confetti.style.zIndex = "100";

        confetti.style.transform =
            `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(confetti);


        const duration =
            2000 + Math.random() * 2500;


        confetti.animate(
            [
                {
                    transform:
                        `translateY(0) rotate(0deg)`
                },
                {
                    transform:
                        `translateY(110vh) rotate(720deg)`
                }
            ],
            {
                duration,
                easing: "cubic-bezier(.2,.7,.3,1)"
            }
        );


        setTimeout(() => {
            confetti.remove();
        }, duration);
    }
}
