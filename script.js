const barriers = [
  ["Не знаю першого кроку", "Спробуй назвати найменшу видиму дію: відкрити файл, дістати потрібну річ або записати одне речення."],
  ["Хочу зробити ідеально", "Дозволь собі чернетку. Перша версія не має бути остаточною — її завдання лише допомогти почати."],
  ["Справа здається нудною", "Поєднай короткий відрізок справи з приємною умовою: зручним місцем, музикою без слів або маленькою перервою після."],
  ["Постійно відволікаюся", "Прибери одну перешкоду на п’ять хвилин: вимкни сповіщення або поклади телефон трохи далі."],
  ["Не бачу результату", "Обери результат, який можна помітити сьогодні: один абзац, одна відповідь або один прибраний предмет."],
  ["Не маю енергії", "Зменш очікування й перевір, чи потрібні тобі вода, їжа, коротка перерва або відпочинок. Рух уперед не має ігнорувати твої сили."],
  ["Завдання здається занадто великим", "Відокрем перші п’ять хвилин від усієї справи. Зараз не потрібно завершувати — лише підготувати початок."]
];

const options = document.querySelector("#barrier-options");
const result = document.querySelector("#check-result");

barriers.forEach(([label, tip], index) => {
  const option = document.createElement("label");
  option.className = "option";
  option.innerHTML = `<input type="radio" name="barrier" value="${index}"><span>${label}</span>`;
  options.append(option);
  option.querySelector("input").addEventListener("change", () => {
    result.innerHTML = `<strong>Можна спробувати так:</strong>${tip}`;
  });
});

const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  navigation.classList.toggle("open", !isOpen);
});
navigation.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navigation.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }
});

const timerDisplay = document.querySelector("#timer");
const timerToggle = document.querySelector("#timer-toggle");
const timerReset = document.querySelector("#timer-reset");
const timerNote = document.querySelector("#timer-note");
let remaining = 300;
let timerId = null;

function renderTime() {
  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");
  timerDisplay.textContent = `${minutes}:${seconds}`;
}

function stopTimer(label = "Продовжити") {
  window.clearInterval(timerId);
  timerId = null;
  timerToggle.textContent = label;
}

timerToggle.addEventListener("click", () => {
  if (timerId) {
    stopTimer();
    timerNote.textContent = "Пауза. Повернися, коли будеш готовий.";
    return;
  }
  if (remaining === 0) remaining = 300;
  timerToggle.textContent = "Пауза";
  timerNote.textContent = "Зосередься лише на наступній маленькій дії.";
  timerId = window.setInterval(() => {
    remaining -= 1;
    renderTime();
    if (remaining === 0) {
      stopTimer("Ще 5 хвилин");
      timerNote.textContent = "П’ять хвилин минули. Хочеш продовжити?";
    }
  }, 1000);
});

timerReset.addEventListener("click", () => {
  stopTimer("Почати 5 хвилин");
  remaining = 300;
  renderTime();
  timerNote.textContent = "П’ять хвилин — це вже початок.";
});

document.querySelector("#year").textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (reducedMotion || !("IntersectionObserver" in window)) {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}
