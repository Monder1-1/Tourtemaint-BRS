/* =========================================================
   TOURNAMENT BRS
   COMPLETE TOURNAMENT ENGINE
   ========================================================= */


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEY = "TOURNAMENT_BRS_DATABASE_V2";

let database = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "{}"
);


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let state = {

    currentMode: null,

    currentTournament: null,

    currentTab: null

};


/* =========================================================
   TOURNAMENT MODES
   ========================================================= */

const MODES = {

    ucl: {

        title: "دوري أبطال أوروبا القديم",

        description:
            "دور مجموعات ثم التأهل إلى الأدوار الإقصائية."

    },

    knockout: {

        title: "الأدوار الإقصائية",

        description:
            "خروج المغلوب بنظام Bracket."

    },

    league: {

        title: "الدوري العادي",

        description:
            "دوري كامل مع النقاط والترتيب والنتائج."

    }

};


/* =========================================================
   SAVE DATABASE
   ========================================================= */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(database)
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}


/* =========================================================
   SCREEN MANAGEMENT
   ========================================================= */

function showScreen(screenID) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });

    const screen =
        document.getElementById(screenID);

    if (screen) {

        screen.classList.add("active");

    }

}


/* =========================================================
   HOME
   ========================================================= */

function goHome() {

    state.currentTournament = null;

    state.currentMode = null;

    state.currentTab = null;

    showScreen("home");

    renderSavedTournaments();

}


/* =========================================================
   START MODE
   ========================================================= */

function startMode(mode) {

    if (!MODES[mode]) return;

    state.currentMode = mode;

    const title =
        document.getElementById("setupTitle");

    const description =
        document.getElementById("setupDesc");

    const tourName =
        document.getElementById("tourName");

    const teamInput =
        document.getElementById("teamInput");

    title.textContent =
        MODES[mode].title;

    description.textContent =
        MODES[mode].description;

    tourName.value = "";

    teamInput.value = "";

    renderSetupOptions(mode);

    showScreen("setup");

}


/* =========================================================
   SETUP OPTIONS
   ========================================================= */

function renderSetupOptions(mode) {

    const container =
        document.getElementById("setupOptions");

    if (!container) return;


    /* =====================================
       CHAMPIONS FORMAT
       ===================================== */

    if (mode === "ucl") {

        container.innerHTML = `

            <div class="notice">

                النظام يتكون من مجموعات ثم أدوار إقصائية.

            </div>

            <label>

                عدد المجموعات

                <select id="groupCount">

                    <option value="2">
                        2 مجموعات
                    </option>

                    <option value="4" selected>
                        4 مجموعات
                    </option>

                    <option value="8">
                        8 مجموعات
                    </option>

                </select>

            </label>

            <br>

            <label>

                المتأهلون من كل مجموعة

                <select id="qualify">

                    <option value="1">
                        الأول فقط
                    </option>

                    <option value="2" selected>
                        الأول والثاني
                    </option>

                </select>

            </label>

            <br>

            <label>

                نظام مباريات المجموعة

                <select id="groupLegs">

                    <option value="1" selected>
                        ذهاب فقط
                    </option>

                    <option value="2">
                        ذهاب وإياب
                    </option>

                </select>

            </label>

        `;

        return;
    }


    /* =====================================
       KNOCKOUT
       ===================================== */

    if (mode === "knockout") {

        container.innerHTML = `

            <div class="notice">

                يجب أن يكون عدد الفرق
                4 أو 8 أو 16 أو 32 أو 64.

            </div>

            <label>

                نظام المواجهة

                <select id="koLegs">

                    <option value="1" selected>
                        مباراة واحدة
                    </option>

                    <option value="2">
                        ذهاب وإياب
                    </option>

                </select>

            </label>

        `;

        return;
    }


    /* =====================================
       LEAGUE
       ===================================== */

    if (mode === "league") {

        container.innerHTML = `

            <label>

                نظام الدوري

                <select id="leagueLegs">

                    <option value="1" selected>
                        دور واحد
                    </option>

                    <option value="2">
                        ذهاب وإياب
                    </option>

                </select>

            </label>

            <br>

            <label>

                نقاط الفوز

                <input
                    id="winPts"
                    type="number"
                    min="0"
                    value="3"
                >

            </label>

            <br>

            <label>

                نقاط التعادل

                <input
                    id="drawPts"
                    type="number"
                    min="0"
                    value="1"
                >

            </label>

        `;

    }

}


/* =========================================================
   CREATE TOURNAMENT
   ========================================================= */

function createTournament() {

    const mode =
        state.currentMode;

    const name =
        document
            .getElementById("tourName")
            .value
            .trim() ||
        "بطولة بدون اسم";


    const rawTeams =
        document
            .getElementById("teamInput")
            .value;


    const teams = [
        ...new Set(

            rawTeams
                .split(/\n|,/)
                .map(team => team.trim())
                .filter(Boolean)

        )
    ];


    /* MINIMUM */

    if (teams.length < 4) {

        showToast(
            "يجب إضافة 4 فرق على الأقل."
        );

        return;

    }


    /* KNOCKOUT VALIDATION */

    if (
        mode === "knockout" &&
        ![4, 8, 16, 32, 64]
            .includes(teams.length)
    ) {

        showToast(
            "الإقصائي يحتاج 4 أو 8 أو 16 أو 32 أو 64 فريق."
        );

        return;

    }


    /* UCL VALIDATION */

    if (mode === "ucl") {

        const groupCount =
            Number(
                document
                    .getElementById("groupCount")
                    .value
            );


        const expected =
            groupCount * 4;


        if (teams.length !== expected) {

            showToast(
                `هذا النظام يحتاج ${expected} فريق مع ${groupCount} مجموعات.`
            );

            return;

        }

    }


    /* CREATE OBJECT */

    const tournament = {

        id:
            "tournament_" +
            Date.now(),

        name,

        mode,

        teams,

        createdAt:
            new Date().toISOString(),

        data: {}

    };


    /* INITIALIZE */

    if (mode === "league") {

        initializeLeague(
            tournament
        );

    }


    if (mode === "knockout") {

        initializeKnockout(
            tournament
        );

    }


    if (mode === "ucl") {

        initializeChampionsFormat(
            tournament
        );

    }


    /* SAVE */

    database[tournament.id] =
        tournament;

    saveDatabase();


    openTournament(
        tournament.id
    );

}


/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffle(array) {

    const result = [
        ...array
    ];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];

    }

    return result;

}


/* =========================================================
   ROUND ROBIN
   ========================================================= */

function generateRoundRobin(
    teams,
    legs = 1
) {

    let list = [
        ...teams
    ];


    if (list.length % 2 !== 0) {

        list.push("BYE");

    }


    const numberOfTeams =
        list.length;

    const numberOfRounds =
        numberOfTeams - 1;

    const matches = [];


    let rotation = [
        ...list
    ];


    for (
        let round = 0;
        round < numberOfRounds;
        round++
    ) {

        for (
            let i = 0;
            i < numberOfTeams / 2;
            i++
        ) {

            const home =
                rotation[i];

            const away =
                rotation[
                    numberOfTeams - 1 - i
                ];


            if (
                home !== "BYE" &&
                away !== "BYE"
            ) {

                matches.push({

                    id:
                        "match_" +
                        Date.now() +
                        "_" +
                        matches.length,

                    home,

                    away,

                    round:
                        round + 1,

                    homeScore:
                        null,

                    awayScore:
                        null,

                    played:
                        false

                });

            }

        }


        rotation = [

            rotation[0],

            rotation[
                numberOfTeams - 1
            ],

            ...rotation.slice(
                1,
                numberOfTeams - 1
            )

        ];

    }


    if (legs === 2) {

        const firstLeg =
            matches.map(
                (match, index) => ({

                    id:
                        "match_" +
                        Date.now() +
                        "_return_" +
                        index,

                    home:
                        match.away,

                    away:
                        match.home,

                    round:
                        match.round +
                        numberOfRounds,

                    homeScore:
                        null,

                    awayScore:
                        null,

                    played:
                        false

                })
            );


        matches.push(
            ...firstLeg
        );

    }


    return matches;

}


/* =========================================================
   LEAGUE INITIALIZATION
   ========================================================= */

function initializeLeague(
    tournament
) {

    const legs =
        Number(
            document
                .getElementById("leagueLegs")
                .value
        );


    const winPoints =
        Number(
            document
                .getElementById("winPts")
                .value
        );


    const drawPoints =
        Number(
            document
                .getElementById("drawPts")
                .value
        );


    tournament.data = {

        legs,

        winPoints,

        drawPoints,

        matches:
            generateRoundRobin(
                tournament.teams,
                legs
            )

    };

}


/* =========================================================
   LEAGUE TABLE
   ========================================================= */

function calculateTable(
    tournament,
    teams = tournament.teams,
    matches = tournament.data.matches
) {

    const table = {};


    teams.forEach(team => {

        table[team] = {

            team,

            played: 0,

            wins: 0,

            draws: 0,

            losses: 0,

            goalsFor: 0,

            goalsAgainst: 0,

            points: 0

        };

    });


    matches.forEach(match => {

        if (
            !match.played ||
            match.homeScore === null ||
            match.awayScore === null
        ) {

            return;

        }


        const home =
            table[match.home];

        const away =
            table[match.away];


        if (!home || !away) return;


        home.played++;

        away.played++;


        home.goalsFor +=
            match.homeScore;

        home.goalsAgainst +=
            match.awayScore;


        away.goalsFor +=
            match.awayScore;

        away.goalsAgainst +=
            match.homeScore;


        if (
            match.homeScore >
            match.awayScore
        ) {

            home.wins++;

            away.losses++;

            home.points +=
                tournament.data.winPoints;

        }


        else if (
            match.homeScore <
            match.awayScore
        ) {

            away.wins++;

            home.losses++;

            away.points +=
                tournament.data.winPoints;

        }


        else {

            home.draws++;

            away.draws++;

            home.points +=
                tournament.data.drawPoints;

            away.points +=
                tournament.data.drawPoints;

        }

    });


    return Object
        .values(table)
        .sort(
            (a, b) => {

                if (
                    b.points !==
                    a.points
                ) {

                    return (
                        b.points -
                        a.points
                    );

                }


                const diffA =
                    a.goalsFor -
                    a.goalsAgainst;


                const diffB =
                    b.goalsFor -
                    b.goalsAgainst;


                if (
                    diffB !==
                    diffA
                ) {

                    return (
                        diffB -
                        diffA
                    );

                }


                return (
                    b.goalsFor -
                    a.goalsFor
                );

            }
        );

}


/* =========================================================
   KNOCKOUT INITIALIZATION
   ========================================================= */

function initializeKnockout(
    tournament
) {

    const legs =
        Number(
            document
                .getElementById("koLegs")
                .value
        );


    const teams =
        shuffle(
            tournament.teams
        );


    tournament.data = {

        legs,

        rounds: [],

        champion: null

    };


    createFirstKnockoutRound(
        tournament,
        teams
    );

}


/* =========================================================
   FIRST KNOCKOUT ROUND
   ========================================================= */

function createFirstKnockoutRound(
    tournament,
    teams
) {

    const matches = [];


    for (
        let i = 0;
        i < teams.length;
        i += 2
    ) {

        matches.push({

            id:
                "ko_" +
                Date.now() +
                "_" +
                i,

            home:
                teams[i],

            away:
                teams[i + 1],

            homeScore:
                null,

            awayScore:
                null,

            winner:
                null

        });

    }


    tournament.data.rounds.push(
        matches
    );

}


/* =========================================================
   CHAMPIONS FORMAT
   ========================================================= */

function initializeChampionsFormat(
    tournament
) {

    const groupCount =
        Number(
            document
                .getElementById("groupCount")
                .value
        );


    const qualify =
        Number(
            document
                .getElementById("qualify")
                .value
        );


    const legs =
        Number(
            document
                .getElementById("groupLegs")
                .value
        );


    const shuffled =
        shuffle(
            tournament.teams
        );


    const groups = [];


    for (
        let i = 0;
        i < groupCount;
        i++
    ) {

        groups.push(
            shuffled.slice(
                i * 4,
                i * 4 + 4
            )
        );

    }


    const matches = [];


    groups.forEach(
        (group, index) => {

            const groupMatches =
                generateRoundRobin(
                    group,
                    legs
                );


            groupMatches.forEach(
                match => {

                    match.group =
                        index;

                }
            );


            matches.push(
                ...groupMatches
            );

        }
    );


    tournament.data = {

        groupCount,

        qualify,

        legs,

        groups,

        matches,

        qualified: [],

        knockout: null

    };

}


/* =========================================================
   OPEN TOURNAMENT
   ========================================================= */

function openTournament(
    tournamentID
) {

    const tournament =
        database[tournamentID];


    if (!tournament) {

        showToast(
            "البطولة غير موجودة."
        );

        return;

    }


    state.currentTournament =
        tournament;


    state.currentMode =
        tournament.mode;


    if (
        tournament.mode ===
        "league"
    ) {

        state.currentTab =
            "table";

    }

    else if (
        tournament.mode ===
        "knockout"
    ) {

        state.currentTab =
            "bracket";

    }

    else {

        state.currentTab =
            "groups";

    }


    document
        .getElementById("tTitle")
        .textContent =
        tournament.name;


    document
        .getElementById("tSub")
        .textContent =
        MODES[
            tournament.mode
        ].title;


    renderTournament();

    showScreen("tournament");

}


/* =========================================================
   RENDER TOURNAMENT
   ========================================================= */

function renderTournament() {

    const tournament =
        state.currentTournament;


    if (!tournament) return;


    renderTabs();


    const content =
        document.getElementById(
            "content"
        );


    if (!content) return;


    if (
        state.currentTab ===
        "table"
    ) {

        content.innerHTML =
            renderLeagueTable(
                tournament
            );

    }


    else if (
        state.currentTab ===
        "matches"
    ) {

        content.innerHTML =
            renderMatches(
                tournament.data.matches,
                "league"
            );

    }


    else if (
        state.currentTab ===
        "groups"
    ) {

        content.innerHTML =
            renderGroups(
                tournament
            );

    }


    else if (
        state.currentTab ===
        "bracket"
    ) {

        content.innerHTML =
            renderKnockout(
                tournament
            );

    }


    else if (
        state.currentTab ===
        "knockout"
    ) {

        content.innerHTML =
            renderChampionsKnockout(
                tournament
            );

    }


    else if (
        state.currentTab ===
        "settings"
    ) {

        content.innerHTML =
            renderSettings(
                tournament
            );

    }

}


/* =========================================================
   TABS
   ========================================================= */

function renderTabs() {

    const tournament =
        state.currentTournament;


    const tabs =
        document.getElementById(
            "tabs"
        );


    let items = [];


    if (
        tournament.mode ===
        "league"
    ) {

        items = [

            ["table", "الترتيب"],

            ["matches", "المباريات"],

            ["settings", "الإعدادات"]

        ];

    }


    else if (
        tournament.mode ===
        "knockout"
    ) {

        items = [

            ["bracket", "Bracket"],

            ["settings", "الإعدادات"]

        ];

    }


    else {

        items = [

            ["groups", "المجموعات"],

            ["knockout", "الأدوار الإقصائية"],

            ["settings", "الإعدادات"]

        ];

    }


    tabs.innerHTML =
        items
            .map(
                ([id, label]) => `

                    <button
                        class="
                            tab
                            ${
                                state.currentTab === id
                                    ? "active"
                                    : ""
                            }
                        "
                        onclick="
                            setTournamentTab(
                                '${id}'
                            )
                        "
                    >

                        ${label}

                    </button>

                `
            )
            .join("");

}


/* =========================================================
   CHANGE TAB
   ========================================================= */

function setTournamentTab(
    tab
) {

    state.currentTab =
        tab;

    renderTournament();

}


/* =========================================================
   RENDER LEAGUE TABLE
   ========================================================= */

function renderLeagueTable(
    tournament
) {

    const rows =
        calculateTable(
            tournament
        );


    return `

        <div class="table-wrap">

            <table class="standings">

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            الفريق
                        </th>

                        <th>
                            لعب
                        </th>

                        <th>
                            ف
                        </th>

                        <th>
                            ت
                        </th>

                        <th>
                            خ
                        </th>

                        <th>
                            له
                        </th>

                        <th>
                            عليه
                        </th>

                        <th>
                            نقاط
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        rows
                            .map(
                                (row, index) => `

                                    <tr>

                                        <td>
                                            ${index + 1}
                                        </td>

                                        <td class="teamname">
                                            ${escapeHTML(row.team)}
                                        </td>

                                        <td>
                                            ${row.played}
                                        </td>

                                        <td>
                                            ${row.wins}
                                        </td>

                                        <td>
                                            ${row.draws}
                                        </td>

                                        <td>
                                            ${row.losses}
                                        </td>

                                        <td>
                                            ${row.goalsFor}
                                        </td>

                                        <td>
                                            ${row.goalsAgainst}
                                        </td>

                                        <td>
                                            <b>
                                                ${row.points}
                                            </b>
                                        </td>

                                    </tr>

                                `
                            )
                            .join("")
                    }

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================================
   RENDER MATCHES
   ========================================================= */

function renderMatches(
    matches,
    type
) {

    if (!matches.length) {

        return `

            <div class="empty">
                لا توجد مباريات.
            </div>

        `;

    }


    return `

        <div class="match-list">

            ${
                matches
                    .map(
                        (match, index) => `

                            <div class="match">

                                <div class="match-top">

                                    <span>
                                        الجولة
                                        ${match.round}
                                    </span>

                                    <span>
                                        MATCH
                                        ${index + 1}
                                    </span>

                                </div>


                                <div class="match-main">

                                    <div class="team">
                                        ${escapeHTML(
                                            match.home
                                        )}
                                    </div>


                                    <div class="scorebox">

                                        <input
                                            id="score_home_${match.id}"
                                            type="number"
                                            min="0"
                                            value="${
                                                match.homeScore ??
                                                ""
                                            }"
                                        >

                                        <input
                                            id="score_away_${match.id}"
                                            type="number"
                                            min="0"
                                            value="${
                                                match.awayScore ??
                                                ""
                                            }"
                                        >

                                    </div>


                                    <div class="team">
                                        ${escapeHTML(
                                            match.away
                                        )}
                                    </div>

                                </div>


                                <button
                                    onclick="
                                        saveLeagueMatch(
                                            '${match.id}'
                                        )
                                    "
                                >

                                    حفظ النتيجة

                                </button>

                            </div>

                        `
                    )
                    .join("")
            }

        </div>

    `;

}


/* =========================================================
   SAVE LEAGUE MATCH
   ========================================================= */

function saveLeagueMatch(
    matchID
) {

    const tournament =
        state.currentTournament;


    const match =
        tournament.data.matches
            .find(
                m => m.id === matchID
            );


    if (!match) return;


    const homeInput =
        document.getElementById(
            "score_home_" +
            matchID
        );


    const awayInput =
        document.getElementById(
            "score_away_" +
            matchID
        );


    if (
        homeInput.value === "" ||
        awayInput.value === ""
    ) {

        showToast(
            "أدخل نتيجة المباراة."
        );

        return;

    }


    match.homeScore =
        Number(
            homeInput.value
        );


    match.awayScore =
        Number(
            awayInput.value
        );


    match.played = true;


    saveCurrentTournament();


    showToast(
        "تم حفظ النتيجة."
    );


    renderTournament();

}


/* =========================================================
   SAVE CURRENT TOURNAMENT
   ========================================================= */

function saveCurrentTournament() {

    const tournament =
        state.currentTournament;


    if (!tournament) return;


    database[
        tournament.id
    ] = tournament;


    saveDatabase();

}


/* =========================================================
   RENDER GROUPS
   ========================================================= */

function renderGroups(
    tournament
) {

    let html = `

        <div class="groups">

    `;


    tournament.data.groups
        .forEach(
            (group, index) => {

                const groupMatches =
                    tournament.data.matches
                        .filter(
                            match =>
                                match.group ===
                                index
                        );


                const fakeTournament = {

                    ...tournament,

                    teams:
                        group,

                    data: {

                        ...tournament.data,

                        matches:
                            groupMatches

                    }

                };


                const table =
                    calculateTable(
                        fakeTournament,
                        group,
                        groupMatches
                    );


                html += `

                    <div class="group-card">

                        <h3>
                            المجموعة
                            ${String.fromCharCode(
                                65 + index
                            )}
                        </h3>

                        ${renderMiniTable(
                            table
                        )}

                    </div>

                `;

            }
        );


    html += `

        </div>


        <div class="toolbar">

            <button
                class="primary-button"
                onclick="
                    qualifyGroups()
                "
            >

                تأكيد المتأهلين

            </button>

        </div>

    `;


    return html;

}


/* =========================================================
   MINI TABLE
   ========================================================= */

function renderMiniTable(
    rows
) {

    return `

        <div class="table-wrap">

            <table class="standings">

                <thead>

                    <tr>

                        <th>
                            #
                        </th>

                        <th>
                            الفريق
                        </th>

                        <th>
                            لعب
                        </th>

                        <th>
                            نقاط
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${
                        rows
                            .map(
                                (row, index) => `

                                    <tr>

                                        <td>
                                            ${index + 1}
                                        </td>

                                        <td class="teamname">
                                            ${escapeHTML(
                                                row.team
                                            )}
                                        </td>

                                        <td>
                                            ${row.played}
                                        </td>

                                        <td>
                                            <b>
                                                ${row.points}
                                            </b>
                                        </td>

                                    </tr>

                                `
                            )
                            .join("")
                    }

                </tbody>

            </table>

        </div>

    `;

}


/* =========================================================
   QUALIFY GROUPS
   ========================================================= */

function qualifyGroups() {

    const tournament =
        state.currentTournament;


    const qualify =
        tournament.data.qualify;


    const qualified = [];


    tournament.data.groups
        .forEach(
            (group, index) => {

                const matches =
                    tournament.data.matches
                        .filter(
                            match =>
                                match.group ===
                                index
                        );


                const fakeTournament = {

                    ...tournament,

                    teams:
                        group,

                    data: {

                        ...tournament.data,

                        matches

                    }

                };


                const table =
                    calculateTable(
                        fakeTournament,
                        group,
                        matches
                    );


                const unfinished =
                    matches.some(
                        match =>
                            !match.played
                    );


                if (unfinished) {

                    return;

                }


                qualified.push(

                    ...table
                        .slice(
                            0,
                            qualify
                        )
                        .map(
                            row =>
                                row.team
                        )

                );

            }
        );


    if (
        qualified.length <
        2
    ) {

        showToast(
            "يجب إكمال مباريات المجموعات أولاً."
        );

        return;

    }


    tournament.data.qualified =
        qualified;


    tournament.data.knockout =
        createChampionsKnockout(
            qualified
        );


    saveCurrentTournament();


    state.currentTab =
        "knockout";


    renderTournament();


    showToast(
        "تم تحديد المتأهلين."
    );

}


/* =========================================================
   CHAMPIONS KNOCKOUT
   ========================================================= */

function createChampionsKnockout(
    teams
) {

    const shuffled =
        shuffle(
            teams
        );


    const firstRound = [];


    for (
        let i = 0;
        i < shuffled.length;
        i += 2
    ) {

        firstRound.push({

            id:
                "ucl_ko_" +
                Date.now() +
                "_" +
                i,

            home:
                shuffled[i],

            away:
                shuffled[i + 1],

            homeScore:
                null,

            awayScore:
                null,

            winner:
                null

        });

    }


    return {

        rounds: [
            firstRound
        ],

        champion:
            null

    };

}


/* =========================================================
   RENDER CHAMPIONS KNOCKOUT
   ========================================================= */

function renderChampionsKnockout(
    tournament
) {

    const knockout =
        tournament.data.knockout;


    if (!knockout) {

        return `

            <div class="empty">

                أكمل دور المجموعات
                لتحديد المتأهلين.

            </div>

        `;

    }


    let html = `

        <div class="notice">

            المتأهلون:

            ${tournament.data.qualified
                .map(
                    team =>
                        escapeHTML(team)
                )
                .join(" • ")
            }

        </div>

    `;


    html +=
        renderKnockoutHTML(
            knockout
        );


    return html;

}


/* =========================================================
   RENDER KNOCKOUT
   ========================================================= */

function renderKnockout(
    tournament
) {

    return `

        <div class="toolbar">

            <button
                class="smallbtn"
                onclick="
                    advanceKnockout(
                        false
                    )
                "
            >

                إنشاء الدور التالي

            </button>

        </div>


        ${
            renderKnockoutHTML(
                tournament.data
            )
        }

    `;

}


/* =========================================================
   KNOCKOUT HTML
   ========================================================= */

function renderKnockoutHTML(
    knockout
) {

    if (
        !knockout.rounds ||
        !knockout.rounds.length
    ) {

        return `

            <div class="empty">
                لا توجد مواجهات.
            </div>

        `;

    }


    let html = `

        <div class="bracket">

    `;


    knockout.rounds
        .forEach(
            (round, roundIndex) => {

                html += `

                    <div class="round">

                        <h3>
                            ${getRoundName(
                                round.length
                            )}
                        </h3>

                `;


                round.forEach(
                    match => {

                        html += `

                            <div
                                class="bracket-match"
                            >

                                <div
                                    class="
                                        bracket-team
                                        ${
                                            match.winner ===
                                            match.home
                                                ? "win"
                                                : ""
                                        }
                                    "
                                >

                                    <span>
                                        ${escapeHTML(
                                            match.home ||
                                            "-"
                                        )}
                                    </span>

                                    <input
                                        id="ko_home_${match.id}"
                                        type="number"
                                        min="0"
                                        value="${
                                            match.homeScore ??
                                            ""
                                        }"
                                        style="
                                            width:28px;
                                            background:#080c13;
                                            color:white;
                                            border:1px solid #2b394e;
                                            border-radius:6px;
                                            text-align:center;
                                        "
                                    >

                                </div>


                                <div
                                    class="
                                        bracket-team
                                        ${
                                            match.winner ===
                                            match.away
                                                ? "win"
                                                : ""
                                        }
                                    "
                                >

                                    <span>
                                        ${escapeHTML(
                                            match.away ||
                                            "-"
                                        )}
                                    </span>

                                    <input
                                        id="ko_away_${match.id}"
                                        type="number"
                                        min="0"
                                        value="${
                                            match.awayScore ??
                                            ""
                                        }"
                                        style="
                                            width:28px;
                                            background:#080c13;
                                            color:white;
                                            border:1px solid #2b394e;
                                            border-radius:6px;
                                            text-align:center;
                                        "
                                    >

                                </div>


                                <button
                                    class="smallbtn"
                                    style="
                                        width:100%;
                                        margin-top:5px;
                                    "
                                    onclick="
                                        saveKnockoutMatch(
                                            '${match.id}'
                                        )
                                    "
                                >

                                    حفظ

                                </button>

                            </div>

                        `;

                    }
                );


                html += `
                    </div>
                `;

            }
        );


    html += `
        </div>
    `;


    if (knockout.champion) {

        html += `

            <div class="champ">

                <strong>
                    ${escapeHTML(
                        knockout.champion
                    )}
                </strong>

                <small>
                    بطل البطولة
                </small>

            </div>

        `;

    }


    return html;

}


/* =========================================================
   ROUND NAME
   ========================================================= */

function getRoundName(
    matches
) {

    if (matches === 1)
        return "النهائي";

    if (matches === 2)
        return "نصف النهائي";

    if (matches === 4)
        return "ربع النهائي";

    if (matches === 8)
        return "دور الـ16";

    return "دور " + matches;

}


/* =========================================================
   SAVE KNOCKOUT MATCH
   ========================================================= */

function saveKnockoutMatch(
    matchID
) {

    const tournament =
        state.currentTournament;


    let knockout;


    if (
        tournament.mode ===
        "ucl"
    ) {

        knockout =
            tournament.data.knockout;

    }

    else {

        knockout =
            tournament.data;

    }


    const match =
        knockout.rounds
            .flat()
            .find(
                m =>
                    m.id ===
                    matchID
            );


    if (!match) return;


    const homeInput =
        document.getElementById(
            "ko_home_" +
            matchID
        );


    const awayInput =
        document.getElementById(
            "ko_away_" +
            matchID
        );


    if (
        homeInput.value === "" ||
        awayInput.value === ""
    ) {

        showToast(
            "أدخل النتيجة."
        );

        return;

    }


    const homeScore =
        Number(
            homeInput.value
        );


    const awayScore =
        Number(
            awayInput.value
        );


    if (
        homeScore ===
        awayScore
    ) {

        showToast(
            "يجب تحديد فائز."
        );

        return;

    }


    match.homeScore =
        homeScore;

    match.awayScore =
        awayScore;


    match.winner =
        homeScore >
        awayScore
            ? match.home
            : match.away;


    saveCurrentTournament();


    renderTournament();


    showToast(
        "تم حفظ الفائز."
    );

}


/* =========================================================
   ADVANCE KNOCKOUT
   ========================================================= */

function advanceKnockout(
    championsMode
) {

    const tournament =
        state.currentTournament;


    const knockout =
        championsMode
            ? tournament.data.knockout
            : tournament.data;


    if (!knockout) return;


    const currentRound =
        knockout.rounds[
            knockout.rounds.length - 1
        ];


    const unfinished =
        currentRound.some(
            match =>
                !match.winner
        );


    if (unfinished) {

        showToast(
            "احفظ جميع مباريات الدور أولاً."
        );

        return;

    }


    if (
        currentRound.length ===
        1
    ) {

        knockout.champion =
            currentRound[0].winner;


        saveCurrentTournament();


        renderTournament();


        showToast(
            "تم تحديد بطل البطولة."
        );

        return;

    }


    const nextRound = [];


    for (
        let i = 0;
        i < currentRound.length;
        i += 2
    ) {

        const first =
            currentRound[i];

        const second =
            currentRound[i + 1];


        nextRound.push({

            id:
                "next_" +
                Date.now() +
                "_" +
                i,

            home:
                first.winner,

            away:
                second.winner,

            homeScore:
                null,

            awayScore:
                null,

            winner:
                null

        });

    }


    knockout.rounds.push(
        nextRound
    );


    saveCurrentTournament();


    renderTournament();

}


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettings(
    tournament
) {

    return `

        <div class="panel">

            <div class="notice">

                اسم البطولة:

                <strong>
                    ${escapeHTML(
                        tournament.name
                    )}
                </strong>

                <br><br>

                عدد الفرق:

                ${tournament.teams.length}

            </div>


            <button
                class="danger"
                onclick="
                    resetTournament()
                "
            >

                إعادة ضبط البطولة

            </button>


            <button
                class="danger"
                style="
                    margin-right:7px;
                "
                onclick="
                    deleteCurrentTournament()
                "
            >

                حذف البطولة

            </button>

        </div>

    `;

}


/* =========================================================
   RESET TOURNAMENT
   ========================================================= */

function resetTournament() {

    const tournament =
        state.currentTournament;


    if (!tournament) return;


    const confirmed =
        confirm(
            "هل تريد إعادة ضبط جميع النتائج؟"
        );


    if (!confirmed) return;


    if (
        tournament.mode ===
        "league"
    ) {

        initializeLeague(
            tournament
        );

    }


    else if (
        tournament.mode ===
        "knockout"
    ) {

        initializeKnockout(
            tournament
        );

    }


    else {

        initializeChampionsFormat(
            tournament
        );

    }


    saveCurrentTournament();


    renderTournament();


    showToast(
        "تمت إعادة ضبط البطولة."
    );

}


/* =========================================================
   DELETE CURRENT TOURNAMENT
   ========================================================= */

function deleteCurrentTournament() {

    const tournament =
        state.currentTournament;


    if (!tournament) return;


    const confirmed =
        confirm(
            "هل تريد حذف البطولة نهائيًا؟"
        );


    if (!confirmed) return;


    delete database[
        tournament.id
    ];


    saveDatabase();


    goHome();


    showToast(
        "تم حذف البطولة."
    );

}


/* =========================================================
   SAVED TOURNAMENTS
   ========================================================= */

function renderSavedTournaments() {

    const box =
        document.getElementById(
            "savedBox"
        );


    if (!box) return;


    const tournaments =
        Object.values(
            database
        )
        .sort(
            (a, b) =>
                new Date(b.createdAt) -
                new Date(a.createdAt)
        );


    if (!tournaments.length) {

        box.innerHTML = "";

        return;

    }


    box.innerHTML = `

        <div class="saved">

            <h3>
                البطولات المحفوظة
            </h3>


            ${
                tournaments
                    .map(
                        tournament => `

                            <div
                                class="saved-item"
                            >

                                <div>

                                    <strong>
                                        ${escapeHTML(
                                            tournament.name
                                        )}
                                    </strong>

                                    <br>

                                    <small
                                        style="
                                            color:#647287;
                                        "
                                    >
                                        ${
                                            MODES[
                                                tournament.mode
                                            ].title
                                        }
                                    </small>

                                </div>


                                <div
                                    style="
                                        display:flex;
                                        gap:6px;
                                    "
                                >

                                    <button
                                        class="smallbtn"
                                        onclick="
                                            openTournament(
                                                '${tournament.id}'
                                            )
                                        "
                                    >

                                        فتح

                                    </button>


                                    <button
                                        class="danger"
                                        onclick="
                                            deleteTournament(
                                                '${tournament.id}'
                                            )
                                        "
                                    >

                                        حذف

                                    </button>

                                </div>

                            </div>

                        `
                    )
                    .join("")
            }

        </div>

    `;

}


/* =========================================================
   DELETE SAVED TOURNAMENT
   ========================================================= */

function deleteTournament(
    tournamentID
) {

    const confirmed =
        confirm(
            "هل تريد حذف هذه البطولة؟"
        );


    if (!confirmed) return;


    delete database[
        tournamentID
    ];


    saveDatabase();


    renderSavedTournaments();


    showToast(
        "تم حذف البطولة."
    );

}


/* =========================================================
   INITIALIZE APP
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderSavedTournaments();

    }
);