const STORAGE_KEY = "potok-documents-v1";

const seedDocuments = [
  { id: "d-1048", number: "СЗ-2026-1048", title: "Согласование плана закупок оборудования на IV квартал", type: "Служебная записка", status: "На согласовании", author: "Илья Воронцов", owner: "Анна Крылова", due: "2026-09-16", updated: "Сегодня, 10:42", comment: "Проверить объёмы и согласовать с финансовым блоком.", route: ["Илья Воронцов — подготовил", "Анна Крылова — на согласовании", "Мария Соколова — ожидает"] },
  { id: "d-1047", number: "ПР-2026-0312", title: "Приказ о назначении ответственных за охрану труда", type: "Приказ", status: "На согласовании", author: "Мария Соколова", owner: "Сергей Лапин", due: "2026-09-17", updated: "Сегодня, 09:18", comment: "Новая редакция после замечаний юридического отдела.", route: ["Мария Соколова — подготовила", "Юридический отдел — согласовано", "Сергей Лапин — на подписании"] },
  { id: "d-1042", number: "ДГ-2026-0084", title: "Дополнительное соглашение к договору поставки №41", type: "Договор", status: "Исполнен", author: "Ольга Белова", owner: "Ольга Белова", due: "2026-09-14", updated: "Вчера, 16:05", comment: "Соглашение подписано обеими сторонами.", route: ["Ольга Белова — подготовила", "Финансовый блок — согласовано", "Директор — подписано"] },
  { id: "d-1039", number: "ВХ-2026-2291", title: "Ответ на запрос о предоставлении технической документации", type: "Входящее письмо", status: "Черновик", author: "Анна Крылова", owner: "Анна Крылова", due: "2026-09-19", updated: "15 сентября, 12:30", comment: "Ожидается приложение от технического отдела.", route: ["Анна Крылова — подготовка"] },
  { id: "d-1035", number: "СЗ-2026-1035", title: "Отчёт об исполнении поручений за август", type: "Служебная записка", status: "Исполнен", author: "Павел Егоров", owner: "Павел Егоров", due: "2026-09-10", updated: "12 сентября, 15:44", comment: "Отчёт принят без замечаний.", route: ["Павел Егоров — подготовил", "Руководитель аппарата — утверждено"] }
];

const tasks = [
  { id: "t1", docId: "d-1048", title: "Согласовать план закупок", kind: "Согласование", due: "Сегодня, 14:00", state: "today", owner: "Вы" },
  { id: "t2", docId: "d-1047", title: "Проверить новую редакцию приказа", kind: "Проверка", due: "Сегодня, 17:30", state: "today", owner: "Вы" },
  { id: "t3", docId: "d-1039", title: "Приложить техническую документацию", kind: "Доработка", due: "Завтра", state: "next", owner: "Технический отдел" },
  { id: "t4", docId: "d-1042", title: "Ознакомиться с соглашением", kind: "Ознакомление", due: "18 сентября", state: "next", owner: "Вы" },
  { id: "t5", docId: "d-1035", title: "Подтвердить закрытие поручений", kind: "Контроль", due: "Выполнено", state: "done", owner: "Вы" }
];

const activities = [
  ["Сергей Лапин принял приказ на подписание", "12 минут назад"],
  ["Юридический отдел согласовал редакцию без замечаний", "1 час назад"],
  ["Ольга Белова завершила маршрут договора", "Вчера, 16:05"],
  ["В реестр добавлено входящее письмо", "15 сентября, 12:30"]
];

let documents = loadDocuments();
let activeFilter = "all";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadDocuments() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || seedDocuments; }
  catch { return seedDocuments; }
}

function saveDocuments() { localStorage.setItem(STORAGE_KEY, JSON.stringify(documents)); }

function statusClass(status) {
  return status === "На согласовании" ? "approval" : status === "Исполнен" ? "done" : "draft";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
}

function showView(name) {
  $$(".view").forEach(view => view.classList.toggle("active", view.id === `${name}View`));
  $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === name));
  $("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  const query = $("#globalSearch").value.trim().toLowerCase();
  const matching = documents.filter(doc => {
    const matchesFilter = activeFilter === "all" || doc.status === activeFilter;
    const haystack = `${doc.number} ${doc.title} ${doc.author} ${doc.type}`.toLowerCase();
    return matchesFilter && haystack.includes(query);
  });

  $("#documentsCount").textContent = documents.length;
  $("#tasksCount").textContent = tasks.filter(task => task.state !== "done").length;
  $("#urgentMetric").textContent = tasks.filter(task => task.state === "today").length;
  $("#approvalMetric").textContent = documents.filter(doc => doc.status === "На согласовании").length;
  const archived = documents.filter(doc => doc.status === "Исполнен").length;
  $("#archiveCount").textContent = `${archived} ${archived === 1 ? "документ" : "документа"} в архиве`;

  $("#priorityTasks").innerHTML = tasks.filter(task => task.state !== "done").slice(0, 4).map(task => `
    <button class="task-row" data-doc="${task.docId}">
      <span class="task-icon">${task.kind.slice(0,1)}</span>
      <span><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.kind)} · ${escapeHtml(task.owner)}</span></span>
      <span class="due ${task.state === "today" ? "overdue" : ""}"><strong>${escapeHtml(task.due)}</strong></span>
    </button>`).join("");

  $("#activityList").innerHTML = activities.map(([text, time]) => `<li>${escapeHtml(text)}<time>${escapeHtml(time)}</time></li>`).join("");
  $("#recentDocuments").innerHTML = documents.slice(0, 4).map(doc => documentRow(doc, false)).join("");
  $("#documentsTable").innerHTML = matching.map(doc => documentRow(doc, true)).join("");
  $("#documentsEmpty").hidden = matching.length > 0;

  const columns = [["today", "Сегодня"], ["next", "Далее"], ["done", "Завершено"]];
  $("#taskBoard").innerHTML = columns.map(([state, label]) => {
    const columnTasks = tasks.filter(task => task.state === state);
    return `<section class="task-column"><div class="column-title"><h2>${label}</h2><span>${columnTasks.length}</span></div>${columnTasks.map(task => `
      <article class="task-card" data-doc="${task.docId}" tabindex="0"><p>${escapeHtml(task.title)}</p><div class="task-meta"><span>${escapeHtml(task.kind)}</span><strong>${escapeHtml(task.due)}</strong></div></article>`).join("")}</section>`;
  }).join("");
}

function documentRow(doc, registry) {
  if (registry) return `<tr data-id="${doc.id}"><td><span class="doc-number">${escapeHtml(doc.number)}</span></td><td class="doc-title">${escapeHtml(doc.title)}</td><td><span class="status ${statusClass(doc.status)}">${escapeHtml(doc.status)}</span></td><td>${escapeHtml(doc.author)}</td><td>${escapeHtml(doc.updated)}</td></tr>`;
  return `<tr data-id="${doc.id}"><td><div class="doc-title">${escapeHtml(doc.title)}</div><span class="doc-number">${escapeHtml(doc.number)}</span></td><td>${escapeHtml(doc.type)}</td><td><span class="status ${statusClass(doc.status)}">${escapeHtml(doc.status)}</span></td><td>${escapeHtml(doc.owner)}</td><td>${formatDate(doc.due)}</td></tr>`;
}

function formatDate(date) {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(parsed);
}

function openDocument(id) {
  const doc = documents.find(item => item.id === id);
  if (!doc) return;
  $("#detailTitle").textContent = doc.title;
  $("#detailContent").innerHTML = `
    <span class="status ${statusClass(doc.status)}">${escapeHtml(doc.status)}</span>
    <div class="detail-summary">
      <div class="detail-field"><span>Регистрационный номер</span><strong>${escapeHtml(doc.number)}</strong></div>
      <div class="detail-field"><span>Тип</span><strong>${escapeHtml(doc.type)}</strong></div>
      <div class="detail-field"><span>Автор</span><strong>${escapeHtml(doc.author)}</strong></div>
      <div class="detail-field"><span>Срок</span><strong>${formatDate(doc.due)}</strong></div>
    </div>
    <h3>Описание</h3><p>${escapeHtml(doc.comment || "Описание не добавлено.")}</p>
    <h3>Маршрут</h3><ol class="route">${doc.route.map((step, index) => `<li class="${index === doc.route.length - 1 && doc.status !== "Исполнен" ? "pending" : ""}"><strong>${escapeHtml(step.split(" — ")[0])}</strong><span>${escapeHtml(step.split(" — ")[1] || "Этап маршрута")}</span></li>`).join("")}</ol>
    <div class="drawer-actions">${doc.status !== "Исполнен" ? `<button class="primary-button" data-action="approve" data-id="${doc.id}">Согласовать</button>` : ""}<button class="secondary-button" data-action="history">Журнал действий</button></div>`;
  $("#detailDrawer").classList.add("open");
  $("#detailDrawer").setAttribute("aria-hidden", "false");
  $("#backdrop").hidden = false;
}

function closeDocument() {
  $("#detailDrawer").classList.remove("open");
  $("#detailDrawer").setAttribute("aria-hidden", "true");
  $("#backdrop").hidden = true;
}

function toast(message) {
  const node = $("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove("show"), 2600);
}

document.addEventListener("click", event => {
  const nav = event.target.closest("[data-view]");
  const target = event.target.closest("[data-view-target]");
  const row = event.target.closest("[data-id], [data-doc]");
  const filter = event.target.closest("[data-filter]");
  const action = event.target.closest("[data-action]");
  const closeDialog = event.target.closest("[data-close-dialog]");
  if (nav) showView(nav.dataset.view);
  if (target) showView(target.dataset.viewTarget);
  if (row) openDocument(row.dataset.id || row.dataset.doc);
  if (filter) {
    activeFilter = filter.dataset.filter;
    $$(".filter").forEach(button => button.classList.toggle("active", button === filter));
    render();
  }
  if (closeDialog) $("#createDialog").close();
  if (action?.dataset.action === "approve") {
    const doc = documents.find(item => item.id === action.dataset.id);
    doc.status = "Исполнен";
    doc.updated = "Только что";
    doc.route.push("Анна Крылова — согласовано");
    saveDocuments();
    closeDocument();
    render();
    toast("Документ согласован и передан в архив");
  }
  if (action?.dataset.action === "history") toast("Журнал: карточка открыта, реквизиты просмотрены");
});

$("#createButton").addEventListener("click", () => {
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  $("#createForm").elements.due.value = tomorrow.toISOString().slice(0, 10);
  $("#createDialog").showModal();
});

$("#createForm").addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const number = `СЗ-${new Date().getFullYear()}-${String(1050 + documents.length).padStart(4, "0")}`;
  documents.unshift({ id: `d-${Date.now()}`, number, title: data.get("title"), type: data.get("type"), status: "Черновик", author: "Анна Крылова", owner: data.get("owner"), due: data.get("due"), updated: "Только что", comment: data.get("comment"), route: ["Анна Крылова — подготовка"] });
  saveDocuments();
  event.currentTarget.reset();
  $("#createDialog").close();
  showView("documents");
  render();
  toast(`Документ ${number} создан`);
});

$("#globalSearch").addEventListener("input", () => { showView("documents"); render(); });
$("#menuButton").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#closeDrawer").addEventListener("click", closeDocument);
$("#backdrop").addEventListener("click", closeDocument);
document.addEventListener("keydown", event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); $("#globalSearch").focus(); }
  if (event.key === "Escape") closeDocument();
  if (event.key === "Enter" && event.target.matches(".task-card")) openDocument(event.target.dataset.doc);
});

render();

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const register = tool => Promise.resolve(context.registerTool(tool)).catch(() => {});
  register({
    name: "list_documents",
    title: "Показать документы",
    description: "Возвращает документы из реестра с необязательной фильтрацией по статусу.",
    inputSchema: { type: "object", properties: { status: { type: "string", enum: ["На согласовании", "Исполнен", "Черновик"] } }, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute(input = {}) {
      const result = input.status ? documents.filter(doc => doc.status === input.status) : documents;
      return result.map(({ id, number, title, type, status, owner, due }) => ({ id, number, title, type, status, owner, due }));
    }
  });
  register({
    name: "create_document",
    title: "Создать документ",
    description: "Создаёт черновик документа в реестре и обновляет видимый интерфейс.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", minLength: 3, maxLength: 120 },
        type: { type: "string", enum: ["Служебная записка", "Приказ", "Договор", "Входящее письмо"] },
        due: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
        owner: { type: "string", minLength: 2, maxLength: 80 },
        comment: { type: "string", maxLength: 500 }
      },
      required: ["title", "type", "due", "owner"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!input || typeof input.title !== "string" || input.title.trim().length < 3 || !/^\d{4}-\d{2}-\d{2}$/.test(input.due || "")) throw new Error("Некорректные данные документа");
      const allowedTypes = ["Служебная записка", "Приказ", "Договор", "Входящее письмо"];
      if (!allowedTypes.includes(input.type) || typeof input.owner !== "string" || input.owner.trim().length < 2) throw new Error("Некорректный тип или ответственный");
      const number = `СЗ-${new Date().getFullYear()}-${String(1050 + documents.length).padStart(4, "0")}`;
      const document = { id: `d-${Date.now()}`, number, title: input.title.trim(), type: input.type, status: "Черновик", author: "Анна Крылова", owner: input.owner.trim(), due: input.due, updated: "Только что", comment: String(input.comment || "").slice(0, 500), route: ["Анна Крылова — подготовка"] };
      documents.unshift(document);
      saveDocuments();
      render();
      return { id: document.id, number: document.number, status: document.status };
    }
  });
}

registerWebMcpTools();
