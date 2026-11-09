import { animate, inView, stagger } from "./motion.min.js";

const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const ease = [0.23, 1, 0.32, 1];
const crc = (n) => "₡" + Math.round(n).toLocaleString("es-CR").replace(/[., ]/g, " ");

clearTimeout(window.__mt);

/* ---------- Entradas ---------- */
const drawHl = (hl, delay = 0) => {
  if (reduce || !hl) return;
  animate(hl, { clipPath: ["inset(-30% 100% -30% -30%)", "inset(-30% -30% -30% -30%)"] }, { duration: 0.6, ease, delay });
  animate(hl.querySelectorAll("b"), { scale: [0, 1] }, { type: "spring", bounce: 0.4, visualDuration: 0.35, delay: delay + 0.35 });
};

if (!reduce) {
  animate(".hero-in > *", { opacity: [0, 1], y: [16, 0] }, { duration: 0.55, ease, delay: stagger(0.07) });
  drawHl(document.querySelector(".hero [data-hl]"), 0.25);

  const groups = new Map();
  document.querySelectorAll("[data-in]").forEach((el) => {
    const key = el.closest("section, .marq") || document.body;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  });
  groups.forEach((els) => {
    els.forEach((el) => {
      inView(el, () => {
        const siblings = els.filter((x) => x.parentElement === el.parentElement && !x.dataset.done);
        siblings.forEach((x) => (x.dataset.done = "1"));
        if (!siblings.length) return;
        animate(siblings, { opacity: [0, 1], y: [22, 0] }, { duration: 0.6, ease, delay: stagger(0.07) });
        siblings.forEach((x) => { if (x.matches("h2")) drawHl(x.querySelector("[data-hl]"), 0.2); });
      }, { amount: 0.25 });
    });
  });
}
root.classList.remove("m");

/* ---------- Contadores ---------- */
document.querySelectorAll("[data-count]").forEach((el) => {
  const to = +el.dataset.count, isCrc = el.dataset.fmt === "crc";
  const show = (v) => (el.textContent = isCrc ? crc(v) : String(Math.round(v)));
  if (reduce || to === 0) return show(to);
  show(0);
  inView(el, () => { animate(0, to, { duration: 1.2, ease, onUpdate: show }); }, { amount: 0.6 });
});

/* ---------- Comparador: barrido de muestra ---------- */
const box = document.getElementById("ba"), rng = document.getElementById("ba-range");
if (!reduce && box) {
  let touched = false;
  const stop = () => { touched = true; };
  rng.addEventListener("pointerdown", stop, { once: true });
  rng.addEventListener("keydown", stop, { once: true });
  inView(box, () => {
    animate(62, [62, 88, 26, 55], {
      duration: 2, ease: "easeInOut", times: [0, 0.3, 0.72, 1], delay: 0.5,
      onUpdate: (v) => { if (!touched) { box.style.setProperty("--pos", v + "%"); rng.value = v; } },
    });
  }, { amount: 0.6 });
}

/* ---------- Reserva de ejemplo ---------- */
const bk = document.getElementById("bk");
const flow = [...document.querySelectorAll("#flow > div")];
if (bk) {
  const pick = (sel) => bk.querySelector(`[data-s="${sel}"]`);
  const final = () => { ["0", "1", "2"].forEach((k) => pick(k).classList.add("on")); pick("3").style.display = "none"; pick("4").classList.add("on"); flow.forEach((f) => f.classList.add("on")); };
  if (reduce) final();
  else {
    let played = false;
    const play = () => {
      if (played) return; played = true;
      const seq = [
        [0.4, () => { pick("0").classList.add("on"); flow[0].classList.add("on"); }],
        [1.3, () => { pick("1").classList.add("on"); flow[1].classList.add("on"); }],
        [2.2, () => { pick("2").classList.add("on"); flow[2].classList.add("on"); flow[3].classList.add("on"); }],
        [3.1, () => { pick("3").classList.add("on"); }],
        [3.5, () => {
          pick("3").style.display = "none";
          const ok = pick("4"); ok.classList.add("on");
          animate(ok, { opacity: [0, 1], scale: [0.92, 1] }, { type: "spring", bounce: 0.3, visualDuration: 0.4 });
          flow[4].classList.add("on");
        }],
      ];
      seq.forEach(([t, fn]) => setTimeout(fn, t * 1000));
    };
    inView(bk, play, { amount: 0.5 });
  }
}

/* ---------- Precios ---------- */
document.querySelectorAll(".toggle button").forEach((b) => {
  b.addEventListener("click", () => {
    if (reduce) return;
    animate("[data-sedan]", { opacity: [0, 1], y: [8, 0], filter: ["blur(4px)", "blur(0px)"] }, { duration: 0.3, ease });
  });
});

/* ---------- Preguntas ---------- */
document.querySelectorAll(".faq details").forEach((d) => {
  const summary = d.querySelector("summary"), body = d.querySelector("p");
  let run = null;
  summary.addEventListener("click", (e) => {
    if (reduce) return;
    e.preventDefault();
    if (run) run.stop();
    if (!d.open) {
      d.open = true;
      const h = body.scrollHeight;
      run = animate(body, { height: [0, h], paddingBottom: ["0px", "20px"], opacity: [0, 1] }, { duration: 0.3, ease });
      run.then(() => { body.style.height = body.style.paddingBottom = ""; run = null; });
    } else {
      run = animate(body, { height: [body.offsetHeight, 0], paddingBottom: ["20px", "0px"], opacity: [1, 0] }, { duration: 0.22, ease });
      run.then(() => { d.open = false; body.style.height = body.style.paddingBottom = body.style.opacity = ""; run = null; });
    }
  });
});


/* ---------- Video del cerámico ---------- */
const vid = document.querySelector(".rain video");
if (vid) {
  if (reduce) { vid.removeAttribute("autoplay"); vid.pause(); vid.controls = true; }
  else inView(vid, () => { vid.play().catch(() => { vid.controls = true; }); return () => vid.pause(); }, { amount: 0.3 });
}
