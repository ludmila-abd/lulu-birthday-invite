let guestName = "";
let pubRSVP = "";
let clubRSVP = "";

const pubMusic = document.getElementById("pubMusic");
const technoMusic = document.getElementById("technoMusic");
const finalMusic = document.getElementById("finalMusic");

function showScreen(screenId) {
    const screens = document.querySelectorAll(".screen");

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(screenId).classList.add("active");
}

function startInvite() {
    const nameInput = document.getElementById("guestName");
    guestName = nameInput.value.trim();

    if (!guestName) {
        alert("Enter your name first, don’t be suspicious.");
        return;
    }

    showScreen("pubScreen");
    playPubMusic();
}

function stopMusic(audio) {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
    }
}

function playMusic(audio, volume = 0.55) {
    if (audio) {
        audio.volume = volume;
        audio.play().catch(() => {
            console.log("Music blocked until user interaction.");
        });
    }
}

function playPubMusic() {
    stopMusic(technoMusic);
    stopMusic(finalMusic);
    playMusic(pubMusic, 0.55);
}

function playTechnoMusic() {
    stopMusic(pubMusic);
    stopMusic(finalMusic);
    playMusic(technoMusic, 0.6);
}

function playFinalMusic() {
    stopMusic(pubMusic);
    stopMusic(technoMusic);
    playMusic(finalMusic, 0.55);
}

function answerPub(answer) {
    pubRSVP = answer;

    const reaction = document.getElementById("pubReaction");
    const nextButton = document.getElementById("toClubButton");
    const pubExtraDetails = document.getElementById("pubExtraDetails");

    reaction.classList.remove("hidden");
    nextButton.classList.remove("hidden");

    if (answer === "yes") {
        reaction.innerHTML = `
            <img src="/static/images/happy.jpg" alt="Happy Lulu" class="reaction-photo round">
            <div>PUB ATTENDANCE APPROVED. Seat pending. Social ranking increased.</div>
        `;
        pubExtraDetails.classList.remove("hidden");
        makeConfetti(["🍻", "✨", "🎂", "💅"]);
    } else {
        reaction.innerHTML = `
            <img src="/static/images/crying.JPG" alt="Crying Lulu" class="reaction-photo round">
            <div>Wow. Betrayal before the night even started.</div>
        `;
        pubExtraDetails.classList.add("hidden");
    }
}

function goToClub() {
    showScreen("clubScreen");
    playTechnoMusic();
}

function answerClub(answer) {
    clubRSVP = answer;

    const reaction = document.getElementById("clubReaction");
    const submitButton = document.getElementById("submitButton");
    const clubExtraDetails = document.getElementById("clubExtraDetails");
    const guestNote = document.getElementById("guestNote");

    reaction.classList.remove("hidden");
    submitButton.classList.remove("hidden");
    guestNote.style.display = "block";

    if (answer === "yes") {
        reaction.innerHTML = `
            <img src="/static/images/happy.jpg" alt="Happy Lulu" class="reaction-photo round">
            <div>CLUB ACCESS GRANTED. Prepare emotionally. Buy your ticket.</div>
        `;
        clubExtraDetails.classList.remove("hidden");
        makeConfetti(["🖤", "🪩", "💜", "⚡"]);
    } else {
        reaction.innerHTML = `
            <img src="/static/images/poop.PNG" alt="Poop emoji" class="reaction-photo small">
            <div>Club attendance denied. Poop emoji has been notified. Josh will hunt you down at afters.</div>
        `;
        clubExtraDetails.classList.add("hidden");
    }
}

function submitRSVP() {
    if (!guestName || !pubRSVP || !clubRSVP) {
        alert("Something is missing. Suspicious behaviour.");
        return;
    }

    const ticketCheck = document.getElementById("ticketCheck");
    const ticketAcknowledged = clubRSVP === "yes" && ticketCheck && ticketCheck.checked ? "yes" : "no";

    if (clubRSVP === "yes" && ticketAcknowledged !== "yes") {
        alert("You said yes to the club, so you must confirm you’ll buy your own RA ticket (please come it's like £7).");
        return;
    }

    const guestNote = document.getElementById("guestNote").value.trim();

    fetch("/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: guestName,
            pub_rsvp: pubRSVP,
            club_rsvp: clubRSVP,
            ticket_acknowledged: ticketAcknowledged,
            guest_note: guestNote
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showFinalScreen();
        } else {
            alert("RSVP failed. Very dramatic.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Something went wrong. The birthday committee is investigating.");
    });
}

function showFinalScreen() {
    showScreen("finalScreen");
    playFinalMusic();

    document.getElementById("summaryName").textContent = guestName;
    document.getElementById("summaryPub").textContent = pubRSVP === "yes" ? "Yes 🍻" : "No 💀";
    document.getElementById("summaryClub").textContent = clubRSVP === "yes" ? "Yes 🖤" : "No 💀";

    const finalTitle = document.getElementById("finalTitle");
    const finalMessage = document.getElementById("finalMessage");

    if (pubRSVP === "yes" && clubRSVP === "yes") {
        finalTitle.textContent = "Elite guest behaviour. Lulu is very proud of you!";
        finalMessage.textContent = "Pub and club confirmed. You know how to have fun, I like that. Lulu will see you at both events, and she'll be very happy to see you.";
        makeConfetti(["🎂", "🍻", "🪩", "💜"]);
    } else if (pubRSVP === "yes" && clubRSVP === "no") {
        finalTitle.textContent = "Acceptable behaviour.";
        finalMessage.textContent = "You are coming to the pub, so you may still be loved. Drinks remain accepted. If you're somehow from Taiwan, I have one thing to say: 操你妈";
        makeConfetti(["🍻", "🎂", "✨"]);
    } else if (pubRSVP === "no" && clubRSVP === "yes") {
        finalTitle.textContent = "Chaotic but approved.";
        finalMessage.textContent = "Skipping the pub but going the rave, sure why not buddy...";
        makeConfetti(["🪩", "🖤", "⚡"]);
    } else {
        finalTitle.textContent = "Betrayal in two acts.";
        finalMessage.textContent = "No pub. No club. Honestly, vas te faire enculer. Lulu is very disappointed in you. She won't be happy to see you at either event, and she won't be happy to see you at all.";
    }
}

function makeConfetti(symbols) {
    for (let i = 0; i < 42; i++) {
        const confetti = document.createElement("div");
        confetti.classList.add("confetti");

        confetti.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        confetti.style.left = Math.random() * 100 + "vw";
        confetti.style.animationDelay = Math.random() * 0.7 + "s";
        confetti.style.fontSize = 18 + Math.random() * 18 + "px";

        document.body.appendChild(confetti);

        setTimeout(() => {
            confetti.remove();
        }, 3000);
    }
}

function copyPubDetails() {
    const text = `Lulu's birthday pub pre-game 🎂🍻
Date: Friday 26 June
Time: 9:30 PM
Place: OX184, 184–186 Cowgate, Edinburgh
Gifts welcome, drinks accepted.`;

    copyText(text);
}

function copyFullDetails() {
    const text = `Lulu's Birthday Night 🎂

Part I: Pub pre-game
Friday 26 June, 9:30 PM
OX184, 184–186 Cowgate, Edinburgh

Part II: Alien Disko: Enastorm [Gabber / Hardcore]
The Bongo Club, 66 Cowgate
11:00 PM – 3:00 AM
Buy your own ticket on Resident Advisor.

Gifts welcome. Drinks accepted.`;

    copyText(text);
}

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast("Copied.");
    }).catch(() => {
        showToast("Could not copy.");
    });
}

function showToast(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 1800);
}