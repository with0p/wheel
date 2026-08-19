// ==========================================
// PRIZES
// ==========================================

const prizes = {
    1: "D 🍫",
    2: "Ahlgrens bilar 🚗",
    3: "Kexchoklad 🍫",
    4: "Marabou 🍫",
    5: "Plopp 🍫",
    6: "Polly 🍬",
    7: "Большой пакет конфет 🍭",
    8: "Dumle + Plopp 🎁"
};


// ==========================================
// SETTINGS
// ==========================================

const TOTAL_NUMBERS = 8;

const SECTOR_ANGLE =
    360 / TOTAL_NUMBERS;

let selectedNumber = null;

let currentRotation = 0;

let spinning = false;


// ==========================================
// ELEMENTS
// ==========================================

const wheel =
    document.getElementById("wheel");

const spinButton =
    document.getElementById("spinButton");

const numberButtons =
    document.querySelectorAll(
        ".numbers button"
    );

const result =
    document.getElementById("result");

const resultNumber =
    document.getElementById("resultNumber");

const resultPrize =
    document.getElementById("resultPrize");


// ==========================================
// CREATE NUMBERS
// ==========================================

for (
    let number = 1;
    number <= TOTAL_NUMBERS;
    number++
) {

    const element =
        document.createElement("div");

    element.className =
        "wheel-number";

    element.textContent =
        number;


    /*
        У каждого сектора есть центр.

        Первый сектор:
        0° → 45°

        Его центр:
        22.5°

        Мы располагаем цифру
        примерно на 37% радиуса колеса.
    */

    const angle =
        (number - 1) * SECTOR_ANGLE
        + SECTOR_ANGLE / 2
        - 90;


    const radius = 36;


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

    button.addEventListener(
        "click",
        () => {

            if (spinning) return;


            numberButtons.forEach(btn => {

                btn.classList.remove(
                    "selected"
                );

            });


            button.classList.add(
                "selected"
            );


            selectedNumber =
                Number(
                    button.dataset.number
                );


            spinButton.disabled =
                false;


            result.classList.add(
                "hidden"
            );

        }
    );

});


// ==========================================
// AUDIO
// ==========================================

let audioContext = null;

let lastTick = -1;


function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }


    if (
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();

    }


    return audioContext;
}


// ==========================================
// CLICK SOUND
// ==========================================

function playTick(
    intensity = 0.12
) {

    const ctx =
        getAudioContext();


    const now =
        ctx.currentTime;


    const oscillator =
        ctx.createOscillator();

    const gain =
        ctx.createGain();


    oscillator.type =
        "square";


    oscillator.frequency.setValueAtTime(
        1250,
        now
    );


    oscillator.frequency.exponentialRampToValueAtTime(
        700,
        now + 0.025
    );


    gain.gain.setValueAtTime(
        intensity,
        now
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.045
    );


    oscillator.connect(gain);

    gain.connect(
        ctx.destination
    );


    oscillator.start(now);

    oscillator.stop(
        now + 0.05
    );
}


// ==========================================
// WIN SOUND
// ==========================================

function playWinSound() {

    const ctx =
        getAudioContext();

    const now =
        ctx.currentTime;


    const notes = [
        523.25,
        659.25,
        783.99,
        1046.50
    ];


    notes.forEach(
        (frequency, index) => {

            const oscillator =
                ctx.createOscillator();

            const gain =
                ctx.createGain();


            const start =
                now +
                index * 0.12;


            oscillator.type =
                "triangle";


            oscillator.frequency.setValueAtTime(
                frequency,
                start
            );


            gain.gain.setValueAtTime(
                0.001,
                start
            );


            gain.gain.exponentialRampToValueAtTime(
                0.25,
                start + 0.025
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                start + 0.35
            );


            oscillator.connect(gain);

            gain.connect(
                ctx.destination
            );


            oscillator.start(start);

            oscillator.stop(
                start + 0.4
            );

        }
    );
}


// ==========================================
// SPIN
// ==========================================

spinButton.addEventListener(
    "click",
    () => {

        if (
            selectedNumber === null ||
            spinning
        ) {

            return;

        }


        spinning = true;

        spinButton.disabled =
            true;


        numberButtons.forEach(
            button => {

                button.disabled =
                    true;

            }
        );


        result.classList.add(
            "hidden"
        );


        getAudioContext();


        /*
            Выбранный сектор должен
            оказаться под указателем.

            Центр сектора:
            number * 45 - 22.5
        */

        const sectorCenter =
            (
                selectedNumber - 1
            ) *
                SECTOR_ANGLE
            +
            SECTOR_ANGLE / 2;


        /*
            Указатель находится сверху.

            Поэтому вращаем колесо
            до позиции:

            360 - sectorCenter
        */

        const targetAngle =
            360 - sectorCenter;


        /*
            Делаем 7 полных оборотов.

            Это создаёт ощущение
            настоящего аттракциона.
        */

        const fullSpins =
            360 * 7;


        const normalizedRotation =
            (
                currentRotation % 360
                + 360
            ) % 360;


        const finalRotation =
            currentRotation
            +
            fullSpins
            +
            targetAngle
            -
            normalizedRotation;


        currentRotation =
            finalRotation;


        /*
            Запускаем вращение.
        */

        wheel.style.transform =
            `rotate(${finalRotation}deg)`;


        /*
            Запускаем визуальные
            щелчки во время вращения.
        */

        startTickSounds();


        /*
            Ждём окончания
            CSS-анимации.
        */

        setTimeout(
            () => {

                spinning = false;


                numberButtons.forEach(
                    button => {

                        button.disabled =
                            false;

                    }
                );


                showPrize(
                    selectedNumber
                );

            },
            5900
        );

    }
);


// ==========================================
// TICK SOUND LOOP
// ==========================================

function startTickSounds() {

    const startTime =
        performance.now();


    const duration =
        5800;


    let lastSector =
        Math.floor(
            currentRotation /
            SECTOR_ANGLE
        );


    function checkTick() {

        if (!spinning) {
            return;
        }


        const elapsed =
            performance.now()
            -
            startTime;


        const progress =
            Math.min(
                elapsed /
                duration,
                1
            );


        /*
            Замедление примерно
            соответствует CSS-анимации.
        */

        const eased =
            1 -
            Math.pow(
                1 - progress,
                3
            );


        const approximateRotation =
            currentRotation -
            currentRotation *
            (1 - eased);


        const sector =
            Math.floor(
                approximateRotation /
                SECTOR_ANGLE
            );


        if (
            sector !==
            lastSector
        ) {

            lastSector =
                sector;


            /*
                Чем медленнее колесо,
                тем громче ощущается
                каждый щелчок.
            */

            const intensity =
                0.06 +
                progress *
                0.13;


            playTick(
                intensity
            );

        }


        requestAnimationFrame(
            checkTick
        );

    }


    requestAnimationFrame(
        checkTick
    );
}


// ==========================================
// SHOW PRIZE
// ==========================================

function showPrize(number) {

    resultNumber.textContent =
        number;


    resultPrize.textContent =
        prizes[number];


    result.classList.remove(
        "hidden"
    );


    playWinSound();

    createConfetti();

}


// ==========================================
// CONFETTI
// ==========================================

function createConfetti() {

    const amount = 100;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const confetti =
            document.createElement(
                "div"
            );


        confetti.style.position =
            "fixed";


        confetti.style.left =
            Math.random() *
            100 +
            "vw";


        confetti.style.top =
            "-20px";


        confetti.style.width =
            8 +
            Math.random() *
            7 +
            "px";


        confetti.style.height =
            10 +
            Math.random() *
            8 +
            "px";


        const colors = [
            "#e63946",
            "#ffd166",
            "#277da1",
            "#2a9d8f",
            "#ffffff"
        ];


        confetti.style.background =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];


        confetti.style.zIndex =
            "100";


        confetti.style.borderRadius =
            Math.random() > 0.5
                ? "50%"
                : "2px";


        document.body.appendChild(
            confetti
        );


        const duration =
            2200 +
            Math.random() *
            2500;


        const rotation =
            360 +
            Math.random() *
            1080;


        confetti.animate(
            [
                {
                    transform:
                        "translateY(0) rotate(0deg)"
                },

                {
                    transform:
                        `translateY(110vh) rotate(${rotation}deg)`
                }
            ],
            {
                duration:
                    duration,

                easing:
                    "cubic-bezier(.2,.7,.3,1)"
            }
        );


        setTimeout(
            () => {
                confetti.remove();
            },
            duration
        );

    }
}
