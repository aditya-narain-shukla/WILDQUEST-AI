/* =====================================================
   WILDQUEST AI
   Frontend Application Logic
   ===================================================== */


/* ================= APPLICATION STATE ================= */

const state = {

    view: "home",

    time: 10,

    difficulty: "easy",

    style: "random",

    xp:
        Number(localStorage.getItem("wq_xp")) || 320,

    missions:
        Number(localStorage.getItem("wq_missions")) || 7,

    minutes:
        Number(localStorage.getItem("wq_minutes")) || 70,

    discoveries:
        Number(localStorage.getItem("wq_discoveries")) || 12,

    selectedMission: null,

    timer: null,

    remaining: 0,

    uploaded: false

};


/* ================= MISSION DATABASE ================= */

const missions = [

    {
        id: 18,
        type: "observe",
        tag: "OBSERVATION",
        title:
            "Find something outside that shows how nature adapts.",
        desc:
            "Look closely. Your answer could be a plant, a rock, an insect, a path, or anything else that tells a story of adaptation.",
        time: 10,
        xp: 100,
        difficulty: "EASY"
    },

    {
        id: 7,
        type: "nature",
        tag: "NATURE",
        title:
            "Find three different leaf shapes.",
        desc:
            "Don't just collect them. Notice the differences in edges, veins, size, and symmetry.",
        time: 8,
        xp: 70,
        difficulty: "EASY"
    },

    {
        id: 31,
        type: "photo",
        tag: "PHOTOGRAPHY",
        title:
            "Find a shadow that changes the way an object looks.",
        desc:
            "Take a photo where the shadow becomes part of the story. No filters needed.",
        time: 12,
        xp: 110,
        difficulty: "MEDIUM"
    },

    {
        id: 12,
        type: "walk",
        tag: "MOVEMENT",
        title:
            "Walk somewhere you've never walked before.",
        desc:
            "Stay within a safe, familiar area. Take a short route you've never noticed and find one new detail.",
        time: 15,
        xp: 120,
        difficulty: "MEDIUM"
    },

    {
        id: 23,
        type: "observe",
        tag: "OBSERVATION",
        title:
            "Find evidence that an animal was nearby.",
        desc:
            "Look for tracks, feathers, chewed leaves, nests, webs, or other signs. Observe without disturbing anything.",
        time: 10,
        xp: 100,
        difficulty: "EASY"
    },

    {
        id: 41,
        type: "nature",
        tag: "NATURE",
        title:
            "Find something that looks dead but is still alive.",
        desc:
            "Look for resilience: new growth, moss, a fallen branch with leaves, or another surprising example.",
        time: 20,
        xp: 180,
        difficulty: "HARD"
    },

    {
        id: 15,
        type: "photo",
        tag: "PHOTOGRAPHY",
        title:
            "Capture three textures found in nature.",
        desc:
            "Find three surfaces that feel visually different: rough, smooth, patterned, layered, or unexpected.",
        time: 12,
        xp: 110,
        difficulty: "MEDIUM"
    },

    {
        id: 52,
        type: "walk",
        tag: "MOVEMENT",
        title:
            "Take a 10-minute walk without checking your phone.",
        desc:
            "Walk slowly enough to notice five things you would normally pass without seeing.",
        time: 10,
        xp: 100,
        difficulty: "EASY"
    }

];


/* ================= AI MISSION GENERATOR DATA ================= */

const missionPool = [

    [
        "Find a tiny detail you would normally walk past.",
        "Observe something small and describe why it caught your attention.",
        "observe"
    ],

    [
        "Find two things in nature that share the same color.",
        "Look beyond obvious flowers. Notice bark, leaves, stones, shadows, or other natural details.",
        "nature"
    ],

    [
        "Find an interesting pattern created without human design.",
        "It could be veins, bark, ripples, cracks, clouds, or another natural pattern.",
        "photo"
    ],

    [
        "Walk for five minutes and change direction at every safe intersection.",
        "Stay in public areas and see where a little randomness takes you.",
        "walk"
    ],

    [
        "Find a place where two different kinds of life interact.",
        "Look for a plant growing beside another plant, insects visiting flowers, or another safe example.",
        "nature"
    ]

];


/* ================= DOM HELPER ================= */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    [...document.querySelectorAll(selector)];


/* ================= SAVE DATA ================= */

function save() {

    localStorage.setItem(
        "wq_xp",
        state.xp
    );

    localStorage.setItem(
        "wq_missions",
        state.missions
    );

    localStorage.setItem(
        "wq_minutes",
        state.minutes
    );

    localStorage.setItem(
        "wq_discoveries",
        state.discoveries
    );

}


/* ================= UPDATE UI ================= */

function updateHeader() {

    $("#headerXp").textContent =
        state.xp;

    $("#profileXp").textContent =
        state.xp;

    $("#statMissions").textContent =
        state.missions;

    $("#statMinutes").textContent =
        state.minutes;

    $("#statDiscoveries").textContent =
        state.discoveries;


    $("#levelBar").style.width =
        Math.min(
            100,
            (state.xp / 500) * 100
        ) + "%";

}


/* ================= PAGE NAVIGATION ================= */

function showView(name) {

    $$(".view").forEach(view => {

        view.classList.remove("active");

    });


    const target =
        $("#" + name + "View");


    if (target) {

        target.classList.add("active");

    }


    state.view = name;


    $$(".nav-link").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.view === name
        );

    });


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    updateHeader();

}


/* ================= TOAST ================= */

function toast(message) {

    const toastElement =
        $("#toast");


    toastElement.querySelector("p")
        .textContent = message;


    toastElement.classList.add("show");


    clearTimeout(
        toast.timeout
    );


    toast.timeout =
        setTimeout(() => {

            toastElement.classList.remove(
                "show"
            );

        }, 3000);

}


/* ================= RENDER MISSIONS ================= */

function renderMissions(filter = "all") {

    const grid =
        $("#missionGrid");


    const list =
        filter === "all"
            ? missions
            : missions.filter(
                mission =>
                    mission.type === filter
            );


    grid.innerHTML =
        list.map(mission => `

        <article class="mission-card">

            <span class="tag">
                ${mission.tag}
            </span>

            <h3>
                ${mission.title}
            </h3>

            <p>
                ${mission.desc}
            </p>

            <div class="mission-bottom">

                <span>
                    ${mission.time} min •
                    ${mission.difficulty}
                </span>

                <b>
                    +${mission.xp} XP
                </b>

            </div>

        </article>

    `).join("");

}


/* ================= CHOICE SYSTEM ================= */

function setupChoice(selector, key) {

    $$(selector).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                $$(selector).forEach(
                    item =>
                        item.classList.remove(
                            "selected"
                        )
                );


                button.classList.add(
                    "selected"
                );


                state[key] =
                    button.dataset.value;

            }
        );

    });

}


/* ================= GENERATE MISSION ================= */

function getMission() {

    /* If user selected a specific category */

    if (state.style !== "random") {

        const matching =
            missions.filter(
                mission =>
                    mission.type === state.style
            );


        if (matching.length) {

            return matching[
                Math.floor(
                    Math.random() *
                    matching.length
                )
            ];

        }

    }


    /* AI-style generated mission */

    const raw =
        missionPool[
        Math.floor(
            Math.random() *
            missionPool.length
        )
        ];


    let multiplier = 1;


    if (state.difficulty === "medium") {

        multiplier = 1.5;

    }


    if (state.difficulty === "hard") {

        multiplier = 2;

    }


    return {

        id:
            Math.floor(
                60 +
                Math.random() * 90
            ),

        type: raw[2],

        tag:
            raw[2].toUpperCase(),

        title: raw[0],

        desc: raw[1],

        time:
            Number(state.time),

        xp:
            Math.round(
                70 * multiplier
            ),

        difficulty:
            state.difficulty.toUpperCase()

    };

}


/* ================= ACTIVE MISSION ================= */

function setActiveMission(mission) {

    state.selectedMission =
        mission;


    $("#activeTag").textContent =
        mission.tag;


    $("#activeId").textContent =
        "MISSION #" +
        String(mission.id)
            .padStart(3, "0");


    $("#activeTitle").textContent =
        mission.title;


    $("#activeDescription")
        .textContent =
        mission.desc;


    $("#activeTime")
        .textContent =
        mission.time + ":00";


    $("#activeReward")
        .textContent =
        "+" + mission.xp + " XP";


    $("#activeDifficulty")
        .textContent =
        mission.difficulty;


    $("#timerTitle")
        .textContent =
        mission.title;

}


/* ================= CREATE ADVENTURE ================= */

function createAdventure() {

    const mission =
        getMission();


    setActiveMission(
        mission
    );


    showView("active");


    toast(
        "Your AI mission is ready. Time to touch grass."
    );

}


/* ================= TIMER ================= */

function beginTimer() {

    if (!state.selectedMission)
        return;


    state.remaining =
        state.selectedMission.time *
        60;


    updateTimerDisplay();


    showView("timer");


    clearInterval(
        state.timer
    );


    state.timer =
        setInterval(() => {

            state.remaining--;

            updateTimerDisplay();


            if (state.remaining <= 0) {

                clearInterval(
                    state.timer
                );


                toast(
                    "Time's up. Come back and tell us what you found."
                );

            }

        }, 1000);

}


/* ================= TIMER DISPLAY ================= */

function updateTimerDisplay() {

    const minutes =
        Math.floor(
            Math.max(
                0,
                state.remaining
            ) / 60
        );


    const seconds =
        Math.max(
            0,
            state.remaining
        ) % 60;


    $("#timerDisplay")
        .textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


/* ================= FINISH TIMER ================= */

function finishTimer() {

    clearInterval(
        state.timer
    );


    showView("evidence");

}


/* ================= VERIFY MISSION ================= */

function verifyMission() {

    const reflection =
        $("#reflectionInput")
            .value
            .trim();


    if (!reflection && !state.uploaded) {

        toast(
            "Add a photo or tell us what you discovered first."
        );

        return;

    }


    const button =
        $("#verifyBtn");


    button.disabled = true;


    button.innerHTML =
        "✦ AI is checking...";


    /*
       This is currently a simulation.

       Later, this function can call:

       - Ollama
       - llama.cpp
       - Transformers.js
       - a local vision model
       - Hugging Face model

       without changing the rest
       of the interface.
    */


    setTimeout(() => {

        const mission =
            state.selectedMission ||
            {
                xp: 100,
                time: 10
            };


        const photoBonus =
            state.uploaded
                ? 15
                : 0;


        const earned =
            mission.xp +
            photoBonus;


        state.xp += earned;

        state.missions += 1;

        state.minutes +=
            Number(
                mission.time || 10
            );

        state.discoveries += 1;


        save();

        updateHeader();


        $("#resultXp")
            .textContent =
            "+" + earned;


        $("#resultTime")
            .textContent =
            (mission.time || 10) +
            " min";


        $("#resultMissions")
            .textContent =
            state.missions;


        $("#resultMessage")
            .textContent =
            state.uploaded

                ? "Your evidence looks consistent with the mission. In the full build, an open-weight vision model would perform this verification locally."

                : "Your reflection captures the spirit of the mission. In the full build, the local model would use it as additional evidence.";


        const quotes = [

            "The best discoveries are the ones you almost walked past.",

            "You didn't need a better feed. You needed a better reason to go outside.",

            "Curiosity gets stronger when the screen gets quieter."

        ];


        $("#resultQuote")
            .textContent =
            quotes[
            Math.floor(
                Math.random() *
                quotes.length
            )
            ];


        button.disabled = false;


        button.innerHTML =
            'Verify my mission <span>→</span>';


        showView("result");


    }, 1000);

}


/* ================= AI MISSION CARD ================= */

function generateMissionCard() {

    const raw =
        missionPool[
        Math.floor(
            Math.random() *
            missionPool.length
        )
        ];


    const newMission = {

        id:
            Math.floor(
                100 +
                Math.random() *
                900
            ),

        type:
            raw[2],

        tag:
            raw[2].toUpperCase(),

        title:
            raw[0],

        desc:
            raw[1],

        time: 10,

        xp: 100,

        difficulty: "EASY"

    };


    missions.unshift(
        newMission
    );


    renderMissions(
        "all"
    );


    toast(
        "New mission generated by the AI mission engine."
    );

}


/* ================= NAVIGATION EVENTS ================= */

$$("[data-view]").forEach(element => {

    element.addEventListener(
        "click",
        () => {

            showView(
                element.dataset.view
            );

        }
    );

});


/* ================= MAIN BUTTONS ================= */

$("#startBtn")
    .addEventListener(
        "click",
        () => showView("setup")
    );


$("#nextAdventureBtn")
    .addEventListener(
        "click",
        () => showView("setup")
    );


$("#createAdventureBtn")
    .addEventListener(
        "click",
        createAdventure
    );


$("#beginMissionBtn")
    .addEventListener(
        "click",
        beginTimer
    );


$("#submitEvidenceBtn")
    .addEventListener(
        "click",
        finishTimer
    );


$("#finishEarlyBtn")
    .addEventListener(
        "click",
        finishTimer
    );


$("#verifyBtn")
    .addEventListener(
        "click",
        verifyMission
    );


$("#generateMissionBtn")
    .addEventListener(
        "click",
        generateMissionCard
    );


/* ================= SETUP CONTROLS ================= */

setupChoice(
    "#timeChoices .choice",
    "time"
);


setupChoice(
    "#difficultyChoices .difficulty",
    "difficulty"
);


setupChoice(
    "#styleChoices .style-choice",
    "style"
);


/* ================= FILTERS ================= */

$$(".filter").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            $$(".filter")
                .forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


            button.classList.add(
                "active"
            );


            renderMissions(
                button.dataset.filter
            );

        }
    );

});


/* ================= THEME ================= */

$("#themeBtn")
    .addEventListener(
        "click",
        () => {

            document.body
                .classList
                .toggle("light");


            localStorage.setItem(

                "wq_theme",

                document.body.classList.contains(
                    "light"
                )
                    ? "light"
                    : "dark"

            );

        }
    );


if (
    localStorage.getItem(
        "wq_theme"
    ) === "light"
) {

    document.body
        .classList
        .add("light");

}


/* ================= PHOTO UPLOAD ================= */

$("#choosePhotoBtn")
    .addEventListener(
        "click",
        () =>
            $("#evidenceInput").click()
    );


$("#uploadCard")
    .addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    "#choosePhotoBtn"
                )
            )
                return;


            if (
                event.target.closest(
                    "#removePhotoBtn"
                )
            )
                return;


            if (!state.uploaded) {

                $("#evidenceInput")
                    .click();

            }

        }
    );


$("#evidenceInput")
    .addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (!file)
                return;


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                toast(
                    "Please choose an image file."
                );

                return;

            }


            const url =
                URL.createObjectURL(
                    file
                );


            $("#evidencePreview")
                .src = url;


            $("#evidencePreview")
                .hidden = false;


            $("#uploadEmpty")
                .hidden = true;


            $("#removePhotoBtn")
                .hidden = false;


            state.uploaded = true;

        }
    );


/* ================= REMOVE PHOTO ================= */

$("#removePhotoBtn")
    .addEventListener(
        "click",
        () => {

            $("#evidenceInput")
                .value = "";


            $("#evidencePreview")
                .src = "";


            $("#evidencePreview")
                .hidden = true;


            $("#uploadEmpty")
                .hidden = false;


            $("#removePhotoBtn")
                .hidden = true;


            state.uploaded = false;

        }
    );


/* ================= TEXT COUNTER ================= */

$("#reflectionInput")
    .addEventListener(
        "input",
        event => {

            $("#charCount")
                .textContent =
                event.target.value.length;

        }
    );


/* ================= INITIALIZE ================= */

renderMissions();

updateHeader();