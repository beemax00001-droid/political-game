(() => {
  const $ = id => document.getElementById(id);
  const screens = ["welcome", "schedule", "done", "thanks"];
  const state = { noCount: 0, selectedTime: "", answer: "" };
  const noBtn = $("noBtn"), yesBtn = $("yesBtn"), stage = $("choiceStage");

  function show(name) {
    screens.forEach(id => $(id).classList.toggle("active", id === name));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function moveNo() {
    if (state.noCount >= 10) return;
    state.noCount++;
    const maxX = Math.max(12, stage.clientWidth - noBtn.offsetWidth - 10);
    const maxY = Math.max(55, stage.clientHeight - noBtn.offsetHeight - 10);
    const x = Math.random() * maxX - maxX / 2;
    const y = Math.random() * maxY - maxY / 2;
    const rotation = Math.round(Math.random() * 720 - 360);
    noBtn.style.position = "absolute";
    noBtn.style.left = `calc(50% + ${x}px)`;
    noBtn.style.top = `calc(50% + ${y}px)`;
    noBtn.style.transform = `translate(-50%,-50%) rotate(${rotation}deg) scale(${Math.max(.58, 1 - state.noCount * .04)})`;
    yesBtn.style.transform = `scale(${1 + state.noCount * .045})`;
    if (state.noCount === 10) {
      noBtn.style.left = "50%";
      noBtn.style.top = "50%";
      noBtn.style.transform = "translate(-50%,-50%) scale(.62)";
      noBtn.style.opacity = ".8";
    }
  }

  noBtn.addEventListener("pointerenter", e => {
    if (e.pointerType === "mouse" && state.noCount < 10) moveNo();
  });
  noBtn.addEventListener("click", () => {
    if (state.noCount < 10) { moveNo(); return; }
    state.answer = "نه";
    show("thanks");
  });
  yesBtn.addEventListener("click", () => {
    state.answer = "آره";
    show("schedule");
  });
  $("backBtn").addEventListener("click", () => show("welcome"));

  document.querySelectorAll(".time-card").forEach(card => {
    card.addEventListener("click", () => {
      state.selectedTime = card.dataset.time;
      show("done");
      launchConfetti();
    });
  });

  function launchConfetti() {
    const zone = document.querySelector(".confetti-zone");
    zone.innerHTML = "";
    for (let i = 0; i < 48; i++) {
      const piece = document.createElement("i");
      piece.className = "confetti";
      piece.style.left = Math.random() * 100 + "%";
      piece.style.animationDelay = Math.random() * .9 + "s";
      piece.style.background = ["#e83d55", "#ff9eaf", "#f4c1ca", "#d9a4ad", "#f4a261"][i % 5];
      zone.appendChild(piece);
    }
  }

  function sendResult() {
    const result = `نتیجه: ${state.answer}\nزمان انتخابی: ${state.selectedTime || "انتخاب نشد"}`;
    const url = "https://t.me/beemax_1?text=" + encodeURIComponent(result);
    window.location.href = url;
  }
  $("telegramBtn").addEventListener("click", sendResult);
  $("noTelegramBtn").addEventListener("click", sendResult);
})();