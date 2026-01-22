/* =====================
   初期データ
===================== */
const DEFAULT_PARKINGS = [
  { id:1, name:"第1駐車場", lat:26.2625, lng:127.7564, max:200, now:50 },
  { id:2, name:"第2駐車場", lat:26.2630, lng:127.7558, max:180, now:30 },
  { id:3, name:"第3駐車場", lat:26.2635, lng:127.7549, max:150, now:120 },
  { id:4, name:"第4駐車場", lat:26.2619, lng:127.7572, max:100, now:20 },
  { id:5, name:"第5駐車場", lat:26.2615, lng:127.7580, max:120, now:90 },
  { id:6, name:"第6駐車場", lat:26.2609, lng:127.7575, max:80,  now:70 },
  { id:7, name:"第7駐車場", lat:26.2605, lng:127.7569, max:60,  now:55 }
];

const ADMIN = { id: "admin", pass: "1234" };

let isAdmin = false;
let tempParkings = null;

/* =====================
   起動時の安全チェック
===================== */
window.addEventListener("DOMContentLoaded", () => {
  try {
    const data = JSON.parse(localStorage.getItem("parkings"));
    if (!Array.isArray(data)) throw "reset";
  } catch {
    localStorage.setItem("parkings", JSON.stringify(DEFAULT_PARKINGS));
  }

  if (!localStorage.getItem("admin")) {
    localStorage.setItem("admin", JSON.stringify(ADMIN));
  }

  render();
});

/* =====================
   表示処理
===================== */
function render() {
  let parkings;

  try {
    parkings = isAdmin && tempParkings
      ? tempParkings
      : JSON.parse(localStorage.getItem("parkings"));

    if (!Array.isArray(parkings)) throw "error";
  } catch {
    parkings = DEFAULT_PARKINGS;
    localStorage.setItem("parkings", JSON.stringify(DEFAULT_PARKINGS));
  }

  const list = document.getElementById("parkingList");
  list.innerHTML = "";

  parkings.forEach(p => {
    const remain = Math.max(p.max - p.now, 0);

    let status = "free";
    let text = "空きあり";
    if (remain === 0) {
      status = "full";
      text = "満車";
    } else if (remain < 10) {
      status = "busy";
      text = "混雑";
    }

    const div = document.createElement("div");
    div.className = "parking";
    div.innerHTML = `
      <h3>${p.name}</h3>
      <p class="${status}">${text}（${remain}台）</p>
      <a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank">
        <button>📍 マップで見る</button>
      </a>
    `;

    if (isAdmin) {
      div.innerHTML += `
        <hr>
        <label>現在台数</label>
        <input type="number" value="${p.now}"
          onchange="tempUpdate(${p.id}, 'now', this.value)">
        <label>最大台数</label>
        <input type="number" value="${p.max}"
          onchange="tempUpdate(${p.id}, 'max', this.value)">
      `;
    }

    list.appendChild(div);
  });
}

/* =====================
   仮更新（まだ保存しない）
===================== */
function tempUpdate(id, key, value) {
  if (!tempParkings) return;

  const p = tempParkings.find(x => x.id === id);
  value = Number(value);
  if (isNaN(value)) return;

  if (key === "now") {
    value = Math.max(0, Math.min(value, p.max));
  }
  if (key === "max") {
    value = Math.max(0, value);
    if (p.now > value) p.now = value;
  }

  p[key] = value;
  render();
}

/* =====================
   保存（更新ボタン）
===================== */
function saveAll() {
  localStorage.setItem("parkings", JSON.stringify(tempParkings));

  const msg = document.getElementById("updateMsg");
  msg.textContent = "✅ 更新しました";

  const area = document.getElementById("parkingList");
  area.classList.add("updated");
  setTimeout(() => area.classList.remove("updated"), 800);
}

/* =====================
   管理者ログイン系
===================== */
function showLogin() {
  document.getElementById("loginArea").style.display = "block";
}

function login() {
  const id = document.getElementById("loginId").value;
  const pass = document.getElementById("loginPass").value;
  const admin = JSON.parse(localStorage.getItem("admin"));

  if (id === admin.id && pass === admin.pass) {
    isAdmin = true;
    tempParkings = JSON.parse(localStorage.getItem("parkings"));

    document.getElementById("loginArea").style.display = "none";
    document.getElementById("adminArea").style.display = "none";
    document.getElementById("logoutArea").style.display = "block";
    document.getElementById("updateArea").style.display = "block";

    render();
  } else {
    alert("IDかパスワードが違います");
  }
}

function logout() {
  isAdmin = false;
  tempParkings = null;

  document.getElementById("logoutArea").style.display = "none";
  document.getElementById("updateArea").style.display = "none";
  document.getElementById("updateMsg").textContent = "";
  document.getElementById("adminArea").style.display = "block";

  render();
}
