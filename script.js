(() => {
  const $ = (id) => document.getElementById(id);
  const screens = ["welcome","schedule","done","thanks"];
  const state = { noCount: 0, selectedTime: "", answer: "" };
  const noBtn = $("noBtn"), yesBtn = $("yesBtn"), stage = $("choiceStage");
  const show = (name) => {
    screens.forEach(id => $(id).classList.toggle("active", id === name));
    window.scrollTo({top:0,behavior:"smooth"});
  };
  const moveNo = () => {
    if (state.noCount >= 10) return;
    state.noCount++;
    const maxX = Math.max(10, stage.clientWidth - noBtn.offsetWidth - 8);
    const maxY = 95;
    const x = Math.random() * maxX - maxX/2;
    const y = Math.random() * maxY - maxY/2;
    const rotation = Math.round(Math.random()*720 - 360);
    noBtn.style.position = "absolute";
    noBtn.style.left = `calc(50% + ${x}px)`;
    noBtn.style.top = `calc(50% + ${y}px)`;
    noBtn.style.transform = `translate(-50%,-50%) rotate(${rotation}deg) scale(${Math.max(.58,1-state.noCount*.04)})`;
    yesBtn.style.transform = `scale(${1 + state.noCount*.035})`;
    yesBtn.style.filter = `saturate(${1 + state.noCount*.035})`;
    $("counter").classList.add("visible");
    $("counter").innerHTML = `فرصت‌های فرارِ «نه»: <b>${state.noCount}</b> از ۱۰`;
    $("hint").textContent = state.noCount < 10 ? "اوه! دوباره فرار کرد 😼" : "خب دیگه فرار بسه! حالا هر جوابی راحت‌تری انتخاب کن 🎀";
    if (state.noCount === 10) {
      noBtn.style.left = "50%"; noBtn.style.top = "50%";
      noBtn.style.transform = "translate(-50%,-50%) scale(.62)";
      noBtn.style.opacity = ".72";
      noBtn.innerHTML = '<span class="btn-icon">☁</span><span>نه (دیگه فرار نمی‌کنم!)</span>';
      $("hint").textContent = "حالا «نه» هم کاملاً قابل انتخابه؛ تصمیم با خودته 💗";
    }
  };
  noBtn.addEventListener("pointerenter", (e) => { if (state.noCount < 10 && e.pointerType === "mouse") moveNo(); });
  noBtn.addEventListener("click", () => {
    if (state.noCount < 10) { moveNo(); return; }
    state.answer = "نه";
    show("thanks");
  });
  yesBtn.addEventListener("click", () => { state.answer = "آره"; show("schedule"); });
  $("backBtn").addEventListener("click", () => show("welcome"));
  document.querySelectorAll(".time-card").forEach(card => card.addEventListener("click", () => {
    state.selectedTime = card.dataset.time;
    $("chosenText").textContent = `زمان انتخابی: ${state.selectedTime} 💌`;
    show("done"); launchConfetti();
  }));
  function launchConfetti(){
    const zone = document.querySelector(".confetti-zone");
    zone.innerHTML = "";
    for(let i=0;i<42;i++){
      const p=document.createElement("i"); p.className="confetti";
      p.style.left=Math.random()*100+"%";
      p.style.animationDelay=(Math.random()*.9)+"s";
      p.style.background=["#e83d55","#ff9eaf","#f4c1ca","#d9a4ad","#f4a261"][i%5];
      p.style.transform=`rotate(${Math.random()*180}deg)`;
      zone.appendChild(p);
    }
  }
  function message(){
    return `نتیجه‌ی صفحه‌ی «حرف بزنیم؟» 🎀\nپاسخ: ${state.answer}\nزمان انتخابی: ${state.selectedTime || "انتخاب نشد"}\n— عدالت طاهایی`;
  }
  $("telegramBtn").addEventListener("click", () => {
    const url = "https://t.me/beemax_1?text=" + encodeURIComponent(message());
    window.open(url, "_blank", "noopener,noreferrer");
  });
  $("exitBtn").addEventListener("click", () => {
    const url = "https://t.me/beemax_1?text=" + encodeURIComponent(message());
    window.open(url, "_blank", "noopener,noreferrer");
  });
  $("closeBtn").addEventListener("click", () => {
    document.body.innerHTML = '<main style="min-height:100svh;display:grid;place-items:center;text-align:center;padding:24px;font-family:Vazirmatn,sans-serif;color:#a91f3b;background:#fff7f7"><div><div style="font-size:54px">🎀</div><h2>ممنون که وقت گذاشتی</h2><p>روزت پر از اتفاقای خوب!</p></div></main>';
  });
})();