import { validatePlan, validRecord } from "./validators.js";
import { loadRecords, saveRecords } from "./storage.js";

const $ = (selector) => document.querySelector(selector);
const form = $("plan-form");
const fields = {
    title: $("title"), dueDate: $("#dueDate"),
    duration: $("#duration"), tag: $("#tag"), details: $("#details")
}; 
const errorIds = { title: "#title-error", dueDate: "#date-error", duration: "#duration-error", tag: "#tag-error"};
const sample = [
    ["Finish biology report", 3, "Study", "2026-10-16"],
    ["Meet project team", 45, "Social", "2026-10-15"],
    ["Library reading", 60, "Study", "2026-10-17"],
    ["Morning run", 30, "Wellness", "2026-10-18"],
    ["Submit UX wireframes", 90, "Study", "2026-10-19"],
    ["Review lecture notes", 40, "Study", "2026-10-21"],
    ["Book dentist appointment", 10, "Wellness", "2026-10-22"],
    ["Volunteer orientation", 75, "Community", "2026-10-23"],
    ["Plan weekend groceries", 25, "Personal", "2026-10-24"],
].map(([title, duration, tag, dueDate], i) => ({
    id: `plan_${String(i + 1).padStart(4, "0")}`,
    title,
    duration,
    dueDate,
    tag,
    details: "",
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date().toISOString()
}));

let records = loadRecords();

if(!records.length){
    records = sample;
    saveRecords(records);
}

let unit = "minutes";
let searchError = "";

const nowISODate = () => new Date().toISOString().slice(0,10);

$("#today").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
});

$("#dueDate").value = nowISODate();

function persist() {
    const ok = saveRecords(records);

    if(!ok) {
        $("#data-status").textContent = 
        "Could not save. Check browser storage settings.";
    }
}

function escapeHTML(value) {
   return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[ch]);
}

function marked(value, regex) {
    const text = escapeHTML(value);

    if(!regex) {
        return text;
    }

    try {
        return text.replace(regex, (match) => `<marks>${match}</mark>`);
    } catch {
        return text;
    }
}

function makeSearch() {
    const query = $("#search").value;

    if(!query) {
        searchError = "";
        $("#search-error").textContent = "";
        return null;
    }

    try {
        const flags = $("#case").checked ? "g" : "gi";
        const re = new RegExp(query, flags);

        searchError = "";
        $("#search-error").textContent = "";

        return re;
    } catch {
        searchError = "That regex is not valid. Check brackets, parantheses and slashes.";

        $("#search-error").textContent = searchError;

        return null;
    }
}

function visibleRecords() {
    const re = makeSearch();
    const query = $("#search").value;

    let list = [...records];

    if(query && !searchError) {
        list = list.filter((record) => {
            re.lastIndex = 0;

            return re.test(
                `${record.title} ${record.tag} ${record.dueDate} ${record.details} || ""}`
            );
        });
    }

    const sort = $("#sort").value;

    list.sort((a, b) => {
        if(sort === "title") {
            return a.title.localeCompare(b.title);
        }

        if (sort === "title-desc") {
            return b.title.localeCompare(a.title);
        }

        if(sort === "duration") {
            return Number(a.duration) - Number(b.duration);
        }

        if(sort === "duration-desc") {
            return Number(b.duration) - Number(a.duration)
        }

        return a.dueDate.localeCompare(b.dueDate);
    });

    return {
        list,
        re: query && !searchError ? re : null
    };
}

function renderRecords() {
    const { list, re } = visibleRecords();
    const container = $("#record-list");

    container.setAttribute("aria-busy", "true");

    container.innerHTMl = list.map((record) => `
        <article class = "record" data-id="${escapeHTML(record.id)}">
        <div>
            <div class = "record-top">
                <h3>${marked(record.title, re)}</h3>
                <span class ="tag">${marked(record.tag, re)}</span>
            </div>

            <p>
                ${record.details ? marked(record.details, re): "No extra notes"}
            </p>

            <div class= "record-meta">
                <span>${marked(record.dueDate, re)}</span>
                <span>${formatDuration(record.duration)}</span>
            </div>
        </div>
        
        <div class ="record-actions">
            <button class = "small-button edit" type= "button" data-action= "edit" aria-label="Edit ${escapeHTML(record.title)}">
                Edit
            </button>

            <button class ="small-button delete" type="button" data-action="delete" aria-label="Delete ${escapeHTML(record.title)}">
                Delete
            </button>
        </div>
        </article>
    `).join("");

    $("#empty").hidden = list.length !== 0;

    $("#record-count").textContent = `${list.length} ${list.length === 1 ? "plan" : "plans"}`;

    container.setAttribute("aria-busy", "false");
}

function formatDuration(value) {
    const n = Number(value);

    return unit === "hours" ? `${(n/60).toFixed(2)} hr` : `${n} min`;
}

function renderStats(){
    $("#total").textContent = records.length;

    $("#minutes").textContent = records.reduce((sum, record) => sum + Number(record.duration), 0).toLocaleString();

    const counts = {};

    records.forEach((record) => {
        counts[record.tag] = (counts[record.tag] || 0) + 1;
    });

    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]) [0];

    $("#top-tag").textContent = top ? top[0] : "-";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 7}, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - 6 + i);

        return d;
    });

    const chart = $("#chart");

    chart.innerHTMl = days.map((d) => {
        const date = d.toISOString().slice(0,10);

        const count = records.filter(
            (record) => record.createdAt.slice(0, 10) === date
        ).length;

        return `
            <div class = "chart-day">
                <span class="bar-count">${count}</span>

                <div class="bar" style="height: ${Math.max(4, count * 22)}px" aria-hidden= "true"></div>

                <span>
                    ${d.toLocaleDateString(undefined, {weekday: "short"})}
                </span>
            </div>  
        `;
    }).join("");

    $("#chart").setAttribute(
        "aria-label",
        `Plans created in the last seven days: ${
            days.map((d) => records.filter(
                (record) => record.createdAt.slice(0, 10) === d.toISOString().slice(0, 10)
            ).length).join(", ")
        }`
    );

    $("#week-total").textContent = records.filter(
        (record) => Date.now() - Date.parse(record.createdAt) <= 7 * 86400000
    ).length;

    updateCap();
}

function updateCap() {
    const cap = Number($("#cap").value);

    const total = records.reduce(
        (sum, record) => sum + Number(record.duration),0
    );

    const msg = $("#cap-message");

    if(
        $("#cap").value === "" ||
        !Number.isFinite(cap) ||
        cap < 0
    ) {
        msg.textContent = "Enter a valid non-negative target.";
        msg.setAttribute("aria-live", "polite");
        return;
    }

    if (total > cap) {
        msg.textContent = `Target exceeded by ${total - cap} minutes.`;
        msg.setAttribute("aria-live", "assertive");
    } else {
        msg.textContent = `${cap - total} minutes remaining in your target.`;
        msg.setAttribute("aria-live", "polite");
    }
}

function render() {
  renderRecords();
  renderStats();
}

function clearErrors() {
    Object.values(errorIds).forEach((id) => {
        $(id).textContent = "";
    });
}

function resetForm() {
    form.reset();

    $("#edit-id").value = "";
    $("#form-title").textContent = "Add a plan";
    $("#save-button").textContent = "Save plan";
    $("#cancel-edit").hidden = true;

    $("#dueDate").value = nowISODate();

    clearErrors();

    $("#form-status").textContent = "";
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const plan = {
        title: fields.title.value,
        dueDate: fields.dueDate.value,
        duration: fields.duration.value,
        tag: fields.tag.value,
        details: fields.details.value
    };

     const errors = validatePlan(plan);
    Object.entries(errors).forEach(([key, message]) => {
    const id = errorIds[key];

    if (id) {
      $(id).textContent = message;
    }
  });

  if (Object.keys(errors).length) {
    $("#form-status").textContent =
      "Please fix the highlighted fields.";

    const first = Object.keys(errors)[0];

    fields[first === "date" ? "dueDate" : first]?.focus();

    return;
  }

  const editId = $("#edit-id").value;

  if (editId) {
    records = records.map((record) =>
      record.id === editId
        ? {
            ...record,
            ...plan,
            duration: Number(plan.duration),
            updatedAt: new Date().toISOString()
          }
        : record
    );

    $("#form-status").textContent = `Updated “${plan.title}”.`;
  } else {
    const id =
      `plan_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    records.unshift({
      id,
      ...plan,
      duration: Number(plan.duration),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    $("#form-status").textContent = `Saved “${plan.title}”.`;
  }

  persist();
  render();
  resetForm();
});

$("#cancel-edit").addEventListener("click", resetForm);

$("#record-list").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) {
    return;
  }

  const card = button.closest("[data-id]");
  const id = card.dataset.id;
  const record = records.find((item) => item.id === id);

  if (!record) {
    return;
  }

  if (button.dataset.action === "delete") {
    if (!confirm(`Delete "${record.title}"? This cannot be undone.`)) {
      return;
    }

    records = records.filter((item) => item.id !== id);

    persist();
    render();

    $("#form-status").textContent = "Plan deleted.";
  } else {
    $("#edit-id").value = record.id;

    Object.keys(fields).forEach((key) => {
      fields[key].value = record[key] ?? "";
    });

    $("#form-title").textContent = "Edit plan";
    $("#save-button").textContent = "Update plan";
    $("#cancel-edit").hidden = false;

    $("#form-status").textContent = `Editing “${record.title}”.`;

    $("#planner-form-panel").scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    fields.title.focus();
  }
});

$("#search").addEventListener("input", renderRecords);
$("#case").addEventListener("change", renderRecords);
$("#sort").addEventListener("change", renderRecords);
$("#cap").addEventListener("input", updateCap);

$("#unit").addEventListener("change", () => {
  unit = $("#unit").value;
  renderRecords();
});

$("#export").addEventListener("click", () => {
  const blob = new Blob(
    [JSON.stringify(records, null, 2)],
    { type: "application/json" }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "campus-planner-backup.json";
  a.click();

  URL.revokeObjectURL(url);

  $("#data-status").textContent = "JSON backup exported.";
});

$("#import-file").addEventListener("change", async (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  try {
    const imported = JSON.parse(await file.text());

    if (
      !Array.isArray(imported) ||
      imported.length > 1000 ||
      !imported.every(validRecord)
    ) {
      throw new Error(
        "The file must contain an array of valid planner records."
      );
    }

    if (new Set(imported.map((record) => record.id)).size !== imported.length) {
      throw new Error("Each record must have a unique ID.");
    }

    if (
      !confirm(
        `Import ${imported.length} plans? This replaces the current list.`
      )
    ) {
      return;
    }

    records = imported;

    persist();
    render();
    resetForm();

    $("#data-status").textContent =
      `Imported ${records.length} valid plans.`;
  } catch (error) {
    $("#data-status").textContent = `Import failed: ${error.message}`;
  } finally {
    event.target.value = "";
  }
});

$("#reset").addEventListener("click", () => {
  if (
    !confirm(
      "Restore the 10 sample plans? Your current plans will be replaced."
    )
  ) {
    return;
  }

  records = sample.map((record) => ({ ...record }));

  persist();
  render();
  resetForm();

  $("#data-status").textContent = "Sample plans restored.";
});

render();

