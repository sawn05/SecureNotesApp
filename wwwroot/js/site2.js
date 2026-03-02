/* ============================================================
   SecureNotes - site2.js  |  Full implementation
   ============================================================ */
"use strict";

let MASTER_PWD = localStorage.getItem("masterPwd") || "1234";

/* ══ TOAST ══════════════════════════════════════════════════ */
function showToast(msg, type = "success") {
  document.getElementById("sn-toast")?.remove();
  const pal = {
    success: "#10b981",
    error: "#ef4444",
    info: "#667eea",
    warning: "#f59e0b",
  };
  const ico = { success: "✅", error: "❌", info: "ℹ️", warning: "⚠️" }[type];
  const t = document.createElement("div");
  t.id = "sn-toast";
  t.innerHTML = `${ico} ${msg}`;
  Object.assign(t.style, {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    background: pal[type],
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "10px",
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: ".875rem",
    fontWeight: "600",
    boxShadow: "0 8px 24px rgba(0,0,0,.2)",
    zIndex: "999999",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    opacity: "0",
    transform: "translateY(14px)",
    transition: "all .3s cubic-bezier(.175,.885,.32,1.275)",
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity = "1";
    t.style.transform = "translateY(0)";
  });
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(14px)";
    setTimeout(() => t.remove(), 320);
  }, 3200);
}

/* ══ MODAL ══════════════════════════════════════════════════ */
function openModal(id, title, body, footer) {
  document.getElementById(id)?.remove();
  const ov = document.createElement("div");
  ov.id = id;
  ov.style.cssText =
    "position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:99998;backdrop-filter:blur(6px);animation:_mFadeIn .2s ease";
  ov.innerHTML = `
    <style>
      @keyframes _mFadeIn{from{opacity:0}to{opacity:1}}
      @keyframes _mSlide{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
      #${id} ._mBox{animation:_mSlide .25s cubic-bezier(.175,.885,.32,1.275)}
      #${id} input,#${id} select,#${id} textarea{transition:border-color .2s,box-shadow .2s}
      #${id} input:focus,#${id} select:focus,#${id} textarea:focus{outline:none;border-color:#667eea!important;box-shadow:0 0 0 3px rgba(102,126,234,.18)!important}
    </style>
    <div class="_mBox" style="background:#fff;border-radius:16px;width:520px;max-width:94vw;box-shadow:0 24px 64px rgba(0,0,0,.22);overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;max-height:90vh;display:flex;flex-direction:column">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:18px 22px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
        <h3 style="color:#fff;font-size:1.05rem;font-weight:700;margin:0">${title}</h3>
        <button onclick="document.getElementById('${id}').remove()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:1.2rem;line-height:1;display:flex;align-items:center;justify-content:center">×</button>
      </div>
      <div style="padding:22px;overflow-y:auto;flex:1">${body}</div>
      <div style="padding:14px 22px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px;flex-shrink:0">${footer}</div>
    </div>`;
  ov.addEventListener("click", (e) => {
    if (e.target === ov) ov.remove();
  });
  document.body.appendChild(ov);
}

const BS = (c) =>
  `background:${c};color:white;border:none;padding:10px 18px;border-radius:8px;cursor:pointer;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;font-size:0.875rem;`;
const CB = (id) =>
  `<button onclick="document.getElementById('${id}').remove()" style="background:#f1f5f9;color:#64748b;border:1px solid #e2e8f0;padding:10px 18px;border-radius:8px;cursor:pointer;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;font-size:0.875rem;">Hủy</button>`;
const IS =
  "width:100%;padding:10px 12px;margin-bottom:14px;border:1.5px solid #e2e8f0;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:0.875rem;box-sizing:border-box;";
const LS =
  "display:block;font-weight:600;font-size:0.875rem;margin-bottom:6px;color:#374151;";

const SecureNotes = {
  _timeAgo(d) {
    const s = (Date.now() - new Date(d)) / 1000;
    if (s < 60) return "Vừa xong";
    if (s < 3600) return Math.floor(s / 60) + " phút trước";
    if (s < 86400) return Math.floor(s / 3600) + " giờ trước";
    return Math.floor(s / 86400) + " ngày trước";
  },

  addActivity(title, icon, ibg, ic) {
    const a = JSON.parse(localStorage.getItem("snActivities") || "[]");
    a.push({
      title,
      icon,
      iconBg: ibg,
      iconColor: ic,
      time: this._timeAgo(new Date()),
    });
    if (a.length > 20) a.shift();
    localStorage.setItem("snActivities", JSON.stringify(a));
  },

  /* ── DASHBOARD ── */
  initDashboard() {
    this.updateDashboardStats();
    document
      .querySelector(".page-header .btn-primary")
      ?.addEventListener("click", () => this.openQuickCreateModal());
  },

  updateDashboardStats() {
    const notes = JSON.parse(localStorage.getItem("secureNotes") || "[]");
    const tasks = JSON.parse(localStorage.getItem("secureTasks") || "[]");
    const accounts = JSON.parse(localStorage.getItem("secureAccounts") || "[]");
    const done = tasks.filter((t) => t.completed).length;
    const rate =
      tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 75;
    const todayStr = new Date().toDateString();
    const todayT = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate).toDateString() === todayStr,
    );
    const s = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    s("stat-accounts", accounts.length || 12);
    s("stat-tasks", todayT.length || tasks.length || 8);
    s("stat-notes", notes.length || 24);
    s("stat-completion", rate + "%");
    this.renderRecentActivities();
  },

  renderRecentActivities() {
    const list = document.getElementById("activity-list");
    if (!list) return;
    const acts = JSON.parse(localStorage.getItem("snActivities") || "[]");
    if (!acts.length) return;
    list.innerHTML = acts
      .slice(-5)
      .reverse()
      .map(
        (a) =>
          '<div class="activity-item">' +
          '<div class="activity-icon" style="background:' +
          a.iconBg +
          ";color:" +
          a.iconColor +
          '">' +
          a.icon +
          "</div>" +
          '<div class="activity-content">' +
          '<div class="activity-title">' +
          a.title +
          "</div>" +
          '<div class="activity-time">' +
          a.time +
          "</div>" +
          "</div>" +
          "</div>",
      )
      .join("");
  },

  openQuickCreateModal() {
    const items = [
      ["📝", "Ghi chú mới", "#667eea", "location.href='notes.html'"],
      ["✅", "Task mới", "#10b981", "SecureNotes.openAddTaskModal()"],
      ["💬", "Prompt mới", "#4facfe", "SecureNotes.openAddPromptModal()"],
      ["🔐", "Tài khoản mới", "#764ba2", "SecureNotes.openAddAccountModal()"],
    ];
    openModal(
      "m-qc",
      "⚡ Tạo mới nhanh",
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">' +
        items
          .map(function (item) {
            return (
              "<button onclick=\"document.getElementById('m-qc').remove();" +
              item[3] +
              '" style="padding:20px;border:2px solid #e2e8f0;border-radius:12px;background:#f8fafc;cursor:pointer;font-family:\'Plus Jakarta Sans\',sans-serif;transition:all .2s;text-align:center" onmouseover="this.style.borderColor=\'' +
              item[2] +
              "';this.style.background='#fff';this.style.transform='translateY(-2px)'\" onmouseout=\"this.style.borderColor='#e2e8f0';this.style.background='#f8fafc';this.style.transform=''\">" +
              '<div style="font-size:2rem;margin-bottom:8px">' +
              item[0] +
              "</div>" +
              '<div style="font-weight:600;color:#0f172a;font-size:0.875rem">' +
              item[1] +
              "</div>" +
              "</button>"
            );
          })
          .join("") +
        "</div>",
      CB("m-qc"),
    );
  },

  /* ── NOTES ── */
  initNotesPage() {
    this.currentNoteId = null;
    this.loadNotesList();
    this._initToolbar();
    document
      .getElementById("noteSearch")
      ?.addEventListener("input", function (e) {
        const q = e.target.value.toLowerCase();
        const notes = JSON.parse(localStorage.getItem("secureNotes") || "[]");
        SecureNotes._renderNoteItems(
          q
            ? notes.filter(function (n) {
                return (
                  n.title.toLowerCase().includes(q) ||
                  n.content.toLowerCase().includes(q)
                );
              })
            : notes,
        );
      });
  },

  _initToolbar() {
    document
      .querySelectorAll(".toolbar-btn[data-command]")
      .forEach(function (btn) {
        btn.addEventListener("click", function () {
          document.execCommand(btn.dataset.command, false, null);
          document.getElementById("noteEditor")?.focus();
        });
      });
    const imgBtn = document.getElementById("imageUpload");
    if (imgBtn)
      imgBtn.onclick = function () {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = "image/*";
        inp.onchange = function (e) {
          const r = new FileReader();
          r.onload = function (ev) {
            document.execCommand("insertImage", false, ev.target.result);
          };
          r.readAsDataURL(e.target.files[0]);
        };
        inp.click();
      };
    const tblBtn = document.getElementById("tableInsert");
    if (tblBtn)
      tblBtn.onclick = function () {
        const tbl =
          '<table style="width:100%;border-collapse:collapse;margin:12px 0"><thead><tr style="background:linear-gradient(135deg,#667eea,#764ba2)"><th style="padding:10px;color:white;border:1px solid #e2e8f0;text-align:left">Cột 1</th><th style="padding:10px;color:white;border:1px solid #e2e8f0;text-align:left">Cột 2</th><th style="padding:10px;color:white;border:1px solid #e2e8f0;text-align:left">Cột 3</th></tr></thead><tbody><tr><td contenteditable style="padding:10px;border:1px solid #e2e8f0">Dữ liệu</td><td contenteditable style="padding:10px;border:1px solid #e2e8f0">Dữ liệu</td><td contenteditable style="padding:10px;border:1px solid #e2e8f0">Dữ liệu</td></tr><tr style="background:#f8fafc"><td contenteditable style="padding:10px;border:1px solid #e2e8f0">Dữ liệu</td><td contenteditable style="padding:10px;border:1px solid #e2e8f0">Dữ liệu</td><td contenteditable style="padding:10px;border:1px solid #e2e8f0">Dữ liệu</td></tr></tbody></table><p></p>';
        const ed = document.getElementById("noteEditor");
        if (ed) {
          ed.innerHTML += tbl;
          ed.focus();
        }
      };
    setInterval(function () {
      if (SecureNotes.currentNoteId) SecureNotes._autoSave();
    }, 30000);
  },

  _autoSave() {
    const title = document.querySelector(".note-title-input")?.value.trim();
    const content = document.getElementById("noteEditor")?.innerHTML.trim();
    if (!title || !content) return;
    let notes = JSON.parse(localStorage.getItem("secureNotes") || "[]");
    const idx = notes.findIndex(function (n) {
      return n.id === SecureNotes.currentNoteId;
    });
    if (idx !== -1) {
      notes[idx] = Object.assign({}, notes[idx], {
        title,
        content,
        updated: new Date().toLocaleString("vi-VN"),
      });
      localStorage.setItem("secureNotes", JSON.stringify(notes));
      const st = document.querySelector(".status-time");
      if (st) st.textContent = new Date().toLocaleTimeString("vi-VN");
    }
  },

  openAddNoteModal() {
    this.createNewNote();
  },

  createNewNote() {
    this.currentNoteId = null;
    const ed = document.getElementById("noteEditor");
    if (ed) {
      ed.innerHTML = "";
      ed.focus();
    }
    const ti = document.querySelector(".note-title-input");
    if (ti) ti.value = "";
    showToast("Sẵn sàng ghi chú mới!", "info");
    this.loadNotesList();
  },

  saveNote() {
    const title =
      document.querySelector(".note-title-input")?.value.trim() ||
      "Ghi chú không tiêu đề";
    const content = document.getElementById("noteEditor")?.innerHTML.trim();
    if (!content) {
      showToast("Vui lòng nhập nội dung!", "warning");
      return;
    }
    let notes = JSON.parse(localStorage.getItem("secureNotes") || "[]");
    if (this.currentNoteId) {
      const idx = notes.findIndex(function (n) {
        return n.id === SecureNotes.currentNoteId;
      });
      if (idx !== -1) {
        notes[idx] = Object.assign({}, notes[idx], {
          title,
          content,
          updated: new Date().toLocaleString("vi-VN"),
        });
        showToast('Đã cập nhật "' + title + '"', "success");
      }
    } else {
      const n = {
        id: Date.now(),
        title,
        content,
        created: new Date().toLocaleString("vi-VN"),
        updated: new Date().toLocaleString("vi-VN"),
      };
      notes.push(n);
      this.currentNoteId = n.id;
      showToast('Đã lưu "' + title + '"', "success");
      this.addActivity(
        'Lưu ghi chú "' + title + '"',
        "📝",
        "rgba(245,158,11,0.1)",
        "#f59e0b",
      );
    }
    localStorage.setItem("secureNotes", JSON.stringify(notes));
    const st = document.querySelector(".status-time");
    if (st) st.textContent = new Date().toLocaleTimeString("vi-VN");
    this.loadNotesList();
  },

  loadNotesList() {
    this._renderNoteItems(
      JSON.parse(localStorage.getItem("secureNotes") || "[]"),
    );
  },

  _renderNoteItems(notes) {
    const panel = document.getElementById("notes-list-panel");
    if (!panel) return;
    if (!notes.length) {
      panel.innerHTML =
        '<div style="text-align:center;padding:2rem;color:#94a3b8;font-size:0.875rem">Chưa có ghi chú nào</div>';
      return;
    }
    const self = this;
    panel.innerHTML = notes
      .slice()
      .reverse()
      .map(function (n) {
        const isActive = self.currentNoteId === n.id;
        return (
          '<div onclick="SecureNotes.loadNote(' +
          n.id +
          ')" style="padding:12px;border-radius:8px;cursor:pointer;transition:all .2s;margin-bottom:4px;border:1px solid ' +
          (isActive ? "#667eea" : "transparent") +
          ";background:" +
          (isActive ? "rgba(102,126,234,0.08)" : "transparent") +
          '" onmouseover="if(' +
          !isActive +
          ") this.style.background='#f1f5f9'\" onmouseout=\"if(" +
          !isActive +
          ") this.style.background='transparent'\">" +
          '<div style="display:flex;justify-content:space-between;align-items:start">' +
          '<div style="font-weight:600;font-size:0.85rem;color:#0f172a;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
          n.title +
          "</div>" +
          '<button onclick="event.stopPropagation();SecureNotes.deleteNote(' +
          n.id +
          ')" style="background:none;border:none;cursor:pointer;color:#94a3b8;padding:2px;font-size:14px" onmouseover="this.style.color=\'#ef4444\'" onmouseout="this.style.color=\'#94a3b8\'">×</button>' +
          "</div>" +
          '<div style="font-size:0.75rem;color:#94a3b8;margin-top:4px">' +
          (n.updated || n.created) +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  },

  loadNote(id) {
    const notes = JSON.parse(localStorage.getItem("secureNotes") || "[]");
    const note = notes.find(function (n) {
      return n.id === id;
    });
    if (!note) return;
    this.currentNoteId = id;
    document.querySelector(".note-title-input").value = note.title;
    document.getElementById("noteEditor").innerHTML = note.content;
    this.loadNotesList();
    showToast('Đã mở "' + note.title + '"', "info");
  },

  deleteNote(id) {
    if (!confirm("Xóa ghi chú này?")) return;
    let notes = JSON.parse(localStorage.getItem("secureNotes") || "[]");
    notes = notes.filter(function (n) {
      return n.id !== id;
    });
    localStorage.setItem("secureNotes", JSON.stringify(notes));
    if (this.currentNoteId === id) {
      this.currentNoteId = null;
      document.querySelector(".note-title-input").value = "";
      document.getElementById("noteEditor").innerHTML = "";
    }
    showToast("Đã xóa ghi chú!", "info");
    this.loadNotesList();
  },

  /* ── PROMPTS ── */
  initPromptsPage() {
    this.prompts = JSON.parse(localStorage.getItem("securePrompts") || "[]");
    this._updatePromptStats();
    this.renderPrompts();
    const self = this;
    document.querySelectorAll(".category-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        document.querySelectorAll(".category-chip").forEach(function (c) {
          c.classList.remove("active");
        });
        chip.classList.add("active");
        const icon = chip.querySelector(".chip-icon");
        const txt = icon
          ? chip.textContent.replace(icon.textContent, "").trim()
          : chip.textContent.trim();
        self.renderPrompts(txt === "Tất cả" ? "" : txt);
      });
    });
    document
      .getElementById("searchInput")
      ?.addEventListener("input", function (e) {
        const q = e.target.value.toLowerCase();
        self._renderPromptCards(
          q
            ? self.prompts.filter(function (p) {
                return (
                  p.title.toLowerCase().includes(q) ||
                  p.text.toLowerCase().includes(q)
                );
              })
            : self.prompts,
        );
      });
    document
      .querySelector(".header-actions .btn-secondary")
      ?.addEventListener("click", function () {
        self.openFilterModal();
      });
  },

  _updatePromptStats() {
    const t = document.getElementById("stat-total-prompts");
    if (t) t.textContent = this.prompts.length;
    const f = document.getElementById("stat-fav-prompts");
    if (f)
      f.textContent = this.prompts.filter(function (p) {
        return p.favorite;
      }).length;
  },

  renderPrompts(filter) {
    filter = filter || "";
    this._renderPromptCards(
      filter
        ? this.prompts.filter(function (p) {
            return p.category === filter;
          })
        : this.prompts,
    );
  },

  _renderPromptCards(list) {
    const grid = document.getElementById("prompts-grid-container");
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML =
        '<div class="prompts-empty"><h3>Chưa có prompt nào</h3><p>Hãy tạo prompt mới để bắt đầu!</p></div>';
      return;
    }
    const cm = {
      "Công việc": "business",
      "Lập trình": "coding",
      "Viết lách": "writing",
      Email: "email",
      "Sáng tạo": "creative",
    };
    grid.innerHTML = list
      .map(function (p, i) {
        const pId = p.id || String(i);
        const enc = encodeURIComponent(p.text);
        return (
          '<div class="prompt-card" style="animation-delay:' +
          i * 0.05 +
          's">' +
          '<div class="prompt-header">' +
          '<span class="prompt-category ' +
          (cm[p.category] || "business") +
          '">' +
          p.category +
          "</span>" +
          '<button class="btn-icon favorite ' +
          (p.favorite ? "active" : "") +
          '" onclick="SecureNotes.toggleFavorite(\'' +
          pId +
          "')\">❤️</button>" +
          "</div>" +
          '<h3 class="prompt-title">' +
          p.title +
          "</h3>" +
          '<p class="prompt-description">' +
          p.text.substring(0, 120) +
          (p.text.length > 120 ? "..." : "") +
          "</p>" +
          '<div class="prompt-footer">' +
          '<div class="prompt-meta"><span class="meta-item">📅 ' +
          (p.created || "Hôm nay") +
          "</span></div>" +
          '<div style="display:flex;gap:6px">' +
          "<button onclick=\"SecureNotes.copyPrompt('" +
          enc +
          '\')" style="background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:0.75rem;font-weight:600;color:#64748b">📋 Copy</button>' +
          "<button onclick=\"SecureNotes.viewPromptModal('" +
          pId +
          '\')" style="background:linear-gradient(135deg,#667eea,#764ba2);border:none;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:0.75rem;font-weight:600;color:white">Xem</button>' +
          "<button onclick=\"SecureNotes.deletePrompt('" +
          pId +
          '\')" style="background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:0.75rem;color:#ef4444">🗑</button>' +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  },

  viewPromptModal(id) {
    const p = this.prompts.find(function (x, i) {
      return (x.id || String(i)) === String(id);
    });
    if (!p) return;
    const enc = encodeURIComponent(p.text);
    openModal(
      "m-vp",
      p.title,
      '<div style="background:#f8fafc;border-radius:8px;padding:16px;line-height:1.7;font-size:0.9rem;color:#374151;white-space:pre-wrap;max-height:400px;overflow-y:auto">' +
        p.text +
        "</div>",
      CB("m-vp") +
        "<button onclick=\"SecureNotes.copyPrompt('" +
        enc +
        "');document.getElementById('m-vp').remove()\" style=\"" +
        BS("#667eea") +
        '">📋 Sao chép</button>',
    );
  },

  copyPrompt(enc) {
    const text = decodeURIComponent(enc);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(function () {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      });
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    showToast("Đã sao chép prompt!", "success");
  },

  toggleFavorite(id) {
    const idx = this.prompts.findIndex(function (p, i) {
      return (p.id || String(i)) === String(id);
    });
    if (idx !== -1) {
      this.prompts[idx].favorite = !this.prompts[idx].favorite;
      localStorage.setItem("securePrompts", JSON.stringify(this.prompts));
      this._updatePromptStats();
      this.renderPrompts();
    }
  },

  deletePrompt(id) {
    if (!confirm("Xóa prompt này?")) return;
    this.prompts = this.prompts.filter(function (p, i) {
      return (p.id || String(i)) !== String(id);
    });
    localStorage.setItem("securePrompts", JSON.stringify(this.prompts));
    showToast("Đã xóa prompt!", "info");
    this._updatePromptStats();
    this.renderPrompts();
  },

  openFilterModal() {
    openModal(
      "m-fp",
      "🔍 Lọc & Sắp xếp",
      '<label style="' +
        LS +
        '">Sắp xếp theo</label>' +
        '<select id="sort-order" style="' +
        IS +
        '">' +
        '<option value="newest">Mới nhất</option>' +
        '<option value="oldest">Cũ nhất</option>' +
        '<option value="az">A → Z</option>' +
        '<option value="fav">Yêu thích trước</option>' +
        "</select>",
      CB("m-fp") +
        '<button onclick="SecureNotes.applyFilter()" style="' +
        BS("#667eea") +
        '">Áp dụng</button>',
    );
  },

  applyFilter() {
    const order = document.getElementById("sort-order")?.value;
    let list = this.prompts.slice();
    if (order === "az")
      list.sort(function (a, b) {
        return a.title.localeCompare(b.title);
      });
    else if (order === "fav")
      list.sort(function (a, b) {
        return b.favorite - a.favorite;
      });
    else if (order === "oldest")
      list.sort(function (a, b) {
        return new Date(a.created) - new Date(b.created);
      });
    else
      list.sort(function (a, b) {
        return new Date(b.created) - new Date(a.created);
      });
    this._renderPromptCards(list);
    document.getElementById("m-fp")?.remove();
    showToast("Đã sắp xếp!", "info");
  },

  openAddPromptModal() {
    openModal(
      "m-add-prompt",
      "💬 Tạo Prompt Mới",
      '<label style="' +
        LS +
        '">Tiêu đề *</label>' +
        '<input id="prompt-title" placeholder="Nhập tiêu đề prompt..." style="' +
        IS +
        '">' +
        '<label style="' +
        LS +
        '">Danh mục</label>' +
        '<select id="prompt-category" style="' +
        IS +
        '">' +
        "<option>Công việc</option><option>Lập trình</option>" +
        "<option>Viết lách</option><option>Email</option><option>Sáng tạo</option>" +
        "</select>" +
        '<label style="' +
        LS +
        '">Nội dung *</label>' +
        '<textarea id="prompt-text" rows="6" placeholder="Nội dung prompt..." style="' +
        IS +
        'resize:vertical;"></textarea>',
      CB("m-add-prompt") +
        '<button onclick="SecureNotes.savePrompt()" style="' +
        BS("#667eea") +
        '">💾 Lưu Prompt</button>',
    );
    setTimeout(function () {
      document.getElementById("prompt-title")?.focus();
    }, 100);
  },

  savePrompt() {
    const title = document.getElementById("prompt-title")?.value.trim();
    const category = document.getElementById("prompt-category")?.value;
    const text = document.getElementById("prompt-text")?.value.trim();
    if (!title || !text) {
      showToast("Vui lòng điền đầy đủ!", "warning");
      return;
    }
    this.prompts.push({
      id: String(Date.now()),
      title,
      category,
      text,
      favorite: false,
      created: new Date().toLocaleString("vi-VN"),
    });
    localStorage.setItem("securePrompts", JSON.stringify(this.prompts));
    document.getElementById("m-add-prompt")?.remove();
    showToast("Đã lưu prompt mới!", "success");
    this.addActivity(
      'Tạo prompt "' + title + '"',
      "💬",
      "rgba(102,126,234,0.1)",
      "#667eea",
    );
    this._updatePromptStats();
    this.renderPrompts();
  },

  /* ── ACCOUNTS ── */
  initAccountsPage() {
    const self = this;
    document
      .querySelectorAll('.btn-icon-small[title="Xem chi tiết"]')
      .forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          const field = e.target
            .closest(".account-item")
            ?.querySelector("[data-real-pwd]");
          if (field) {
            self.tempRevealField = field;
            self.promptPasswordForReveal();
          }
        });
      });
    document
      .querySelectorAll('.btn-icon-small[title="Sửa"]')
      .forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          self.openEditAccountFromDOM(e.target.closest(".account-item"));
        });
      });
    document
      .querySelectorAll('.btn-icon-small[title="Xóa"]')
      .forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          if (!confirm("Xóa tài khoản này?")) return;
          const item = e.target.closest(".account-item");
          item.style.cssText +=
            "opacity:0;transform:translateX(-20px);transition:all .3s";
          setTimeout(function () {
            item.remove();
          }, 300);
          showToast("Đã xóa tài khoản!", "info");
        });
      });
    this._loadDynAccounts();
  },

  _loadDynAccounts() {
    const accs = JSON.parse(localStorage.getItem("secureAccounts") || "[]");
    if (!accs.length) return;
    const cont = document.querySelector(".account-groups");
    if (!cont) return;
    const grps = {};
    accs.forEach(function (a) {
      if (!grps[a.group]) grps[a.group] = [];
      grps[a.group].push(a);
    });
    const self = this;
    Object.keys(grps).forEach(function (g) {
      cont.appendChild(self._mkGroupEl(g, grps[g]));
    });
    this._bindDynBtns();
  },

  _mkGroupEl(grp, accs) {
    const d = document.createElement("div");
    d.className = "account-group";
    d.id = "grp-" + grp.replace(/\s/g, "-");
    const self = this;
    d.innerHTML =
      '<div class="account-group-header">' +
      '<div class="account-group-title">' +
      '<svg class="account-group-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
      '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>' +
      "</svg>" +
      grp +
      "</div>" +
      "</div>" +
      '<div class="account-list" id="list-' +
      grp.replace(/\s/g, "-") +
      '">' +
      accs
        .map(function (a) {
          return self._mkAccItemHTML(a);
        })
        .join("") +
      "</div>";
    return d;
  },

  _mkAccItemHTML(a) {
    return (
      '<div class="account-item" data-acc-id="' +
      a.id +
      '">' +
      '<div class="account-field"><div class="field-content"><div class="field-value" style="font-family:var(--font-primary)">' +
      a.platform +
      '</div><div class="field-label">Nền tảng</div></div></div>' +
      '<div class="account-field"><div class="field-content"><div class="field-value">' +
      a.username +
      '</div><div class="field-label">Tên đăng nhập</div></div></div>' +
      '<div class="account-field"><div class="field-content"><div class="field-value" data-real-pwd="' +
      a.password +
      '">' +
      a.password.substring(0, 3) +
      '****</div><div class="field-label">Mật khẩu</div></div></div>' +
      '<div class="account-field"><div class="field-content"><div class="field-value" style="font-family:var(--font-primary)">' +
      (a.note || "—") +
      '</div><div class="field-label">Ghi chú</div></div></div>' +
      '<div class="account-actions">' +
      '<button class="btn-icon-small _dv" title="Xem chi tiết"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg></button>' +
      '<button class="btn-icon-small _de" title="Sửa"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>' +
      '<button class="btn-icon-small _dd" title="Xóa"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>' +
      "</div>" +
      "</div>"
    );
  },

  _bindDynBtns() {
    const self = this;
    document.querySelectorAll("._dv").forEach(function (b) {
      b.onclick = function (e) {
        const f = e.target
          .closest(".account-item")
          ?.querySelector("[data-real-pwd]");
        if (f) {
          self.tempRevealField = f;
          self.promptPasswordForReveal();
        }
      };
    });
    document.querySelectorAll("._de").forEach(function (b) {
      b.onclick = function (e) {
        self.openEditAccountFromDOM(e.target.closest(".account-item"));
      };
    });
    document.querySelectorAll("._dd").forEach(function (b) {
      b.onclick = function (e) {
        if (!confirm("Xóa tài khoản này?")) return;
        const item = e.target.closest(".account-item");
        const id = parseInt(item.dataset.accId);
        let accs = JSON.parse(localStorage.getItem("secureAccounts") || "[]");
        accs = accs.filter(function (a) {
          return a.id !== id;
        });
        localStorage.setItem("secureAccounts", JSON.stringify(accs));
        item.style.cssText +=
          "opacity:0;transform:translateX(-20px);transition:all .3s";
        setTimeout(function () {
          item.remove();
        }, 300);
        showToast("Đã xóa tài khoản!", "info");
      };
    });
  },

  openEditAccountFromDOM(item) {
    if (!item) return;
    const fv = item.querySelectorAll(".field-value");
    const p = fv[0]?.textContent || "";
    const u = fv[1]?.textContent || "";
    const pw = fv[2]?.dataset.realPwd || "";
    const n = fv[3]?.textContent || "";
    openModal(
      "m-ea",
      "✏️ Sửa Tài Khoản",
      '<label style="' +
        LS +
        '">Nền tảng</label>' +
        '<input id="ea-p" value="' +
        p +
        '" style="' +
        IS +
        '">' +
        '<label style="' +
        LS +
        '">Tên đăng nhập</label>' +
        '<input id="ea-u" value="' +
        u +
        '" style="' +
        IS +
        '">' +
        '<label style="' +
        LS +
        '">Mật khẩu</label>' +
        '<div style="position:relative;margin-bottom:14px">' +
        '<input id="ea-pw" type="password" value="' +
        pw +
        '" style="' +
        IS +
        'margin-bottom:0;padding-right:40px">' +
        "<button onclick=\"var i=document.getElementById('ea-pw');i.type=i.type==='password'?'text':'password'\" style=\"position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94a3b8\">👁</button>" +
        "</div>" +
        '<label style="' +
        LS +
        '">Ghi chú</label>' +
        '<input id="ea-n" value="' +
        (n === "—" ? "" : n) +
        '" style="' +
        IS +
        '">',
      CB("m-ea") +
        '<button onclick="SecureNotes._applyDOMEdit()" style="' +
        BS("#10b981") +
        '">💾 Lưu</button>',
    );
    this._editItem = item;
  },

  _applyDOMEdit() {
    const item = this._editItem;
    if (!item) return;
    const fv = item.querySelectorAll(".field-value");
    if (fv[0]) fv[0].textContent = document.getElementById("ea-p").value;
    if (fv[1]) fv[1].textContent = document.getElementById("ea-u").value;
    const pw = document.getElementById("ea-pw").value;
    if (fv[2]) {
      fv[2].dataset.realPwd = pw;
      fv[2].textContent = pw.substring(0, 3) + "****";
    }
    if (fv[3]) fv[3].textContent = document.getElementById("ea-n").value || "—";
    document.getElementById("m-ea")?.remove();
    showToast("Đã cập nhật tài khoản!", "success");
  },

  promptPasswordForReveal() {
    openModal(
      "m-rp",
      "🔐 Xác thực bảo mật",
      '<div style="text-align:center;margin-bottom:16px">' +
        '<div style="width:60px;height:60px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:1.75rem">🔒</div>' +
        '<p style="color:#64748b;font-size:0.875rem">Nhập mật khẩu chủ để xem thông tin bảo mật</p>' +
        "</div>" +
        '<input id="reveal-pwd" type="password" placeholder="Mật khẩu chủ..." style="' +
        IS +
        'text-align:center;letter-spacing:0.15em;font-family:monospace;font-size:1rem">' +
        '<p style="font-size:0.78rem;color:#94a3b8;text-align:center;margin-top:-8px">Thông tin hiển thị trong 10 giây</p>',
      CB("m-rp") +
        '<button onclick="SecureNotes.verifyReveal()" style="' +
        BS("#10b981") +
        '">✓ Xác nhận</button>',
    );
    const self = this;
    setTimeout(function () {
      const inp = document.getElementById("reveal-pwd");
      if (inp) {
        inp.focus();
        inp.addEventListener("keydown", function (e) {
          if (e.key === "Enter") self.verifyReveal();
        });
      }
    }, 100);
  },

  verifyReveal() {
    const val = document.getElementById("reveal-pwd")?.value;
    if (val === MASTER_PWD) {
      const f = this.tempRevealField;
      if (f) {
        const real = f.dataset.realPwd || "(chưa có)";
        f.textContent = real;
        f.style.color = "#667eea";
        f.style.fontWeight = "700";
        setTimeout(function () {
          f.textContent = real.substring(0, 3) + "****";
          f.style.color = "";
          f.style.fontWeight = "";
        }, 10000);
        showToast("Hiển thị trong 10 giây!", "success");
      }
      document.getElementById("m-rp")?.remove();
    } else {
      showToast("Mật khẩu không đúng!", "error");
      const inp = document.getElementById("reveal-pwd");
      if (inp) {
        inp.style.borderColor = "#ef4444";
        inp.value = "";
        setTimeout(function () {
          inp.style.borderColor = "";
        }, 1000);
      }
    }
  },

  openAddAccountModal() {
    openModal(
      "m-aa",
      "🔐 Thêm Tài Khoản Mới",
      '<label style="' +
        LS +
        '">Nhóm tài khoản</label>' +
        '<select id="acc-group" style="' +
        IS +
        '">' +
        "<option>Mạng xã hội</option><option>Email</option>" +
        "<option>Ngân hàng</option><option>Làm việc</option><option>Khác</option>" +
        "</select>" +
        '<label style="' +
        LS +
        '">Nền tảng *</label>' +
        '<input id="acc-platform" placeholder="VD: Facebook, Gmail..." style="' +
        IS +
        '">' +
        '<label style="' +
        LS +
        '">Tên đăng nhập *</label>' +
        '<input id="acc-username" placeholder="Email hoặc username" style="' +
        IS +
        '">' +
        '<label style="' +
        LS +
        '">Mật khẩu *</label>' +
        '<div style="position:relative;margin-bottom:14px">' +
        '<input id="acc-password" type="password" placeholder="Nhập mật khẩu" style="' +
        IS +
        'margin-bottom:0;padding-right:40px">' +
        "<button onclick=\"var i=document.getElementById('acc-password');i.type=i.type==='password'?'text':'password'\" style=\"position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:#94a3b8\">👁</button>" +
        "</div>" +
        '<label style="' +
        LS +
        '">Ghi chú</label>' +
        '<input id="acc-note" placeholder="Ghi chú thêm (không bắt buộc)" style="' +
        IS +
        '">',
      CB("m-aa") +
        '<button onclick="SecureNotes.saveAccount()" style="' +
        BS("#667eea") +
        '">💾 Lưu tài khoản</button>',
    );
    setTimeout(function () {
      document.getElementById("acc-platform")?.focus();
    }, 100);
  },

  saveAccount() {
    const group = document.getElementById("acc-group")?.value;
    const platform = document.getElementById("acc-platform")?.value.trim();
    const username = document.getElementById("acc-username")?.value.trim();
    const password = document.getElementById("acc-password")?.value;
    const note = document.getElementById("acc-note")?.value.trim();
    if (!platform || !username || !password) {
      showToast("Vui lòng điền đầy đủ thông tin!", "warning");
      return;
    }
    const accs = JSON.parse(localStorage.getItem("secureAccounts") || "[]");
    const acc = {
      id: Date.now(),
      group,
      platform,
      username,
      password,
      note,
      created: new Date().toLocaleString("vi-VN"),
    };
    accs.push(acc);
    localStorage.setItem("secureAccounts", JSON.stringify(accs));
    document.getElementById("m-aa")?.remove();
    showToast("Đã thêm tài khoản " + platform + "!", "success");
    this.addActivity(
      'Thêm tài khoản "' + platform + '"',
      "🔐",
      "rgba(102,126,234,0.1)",
      "#667eea",
    );
    let grpEl = document.getElementById("grp-" + group.replace(/\s/g, "-"));
    if (!grpEl) {
      grpEl = this._mkGroupEl(group, []);
      document.querySelector(".account-groups")?.appendChild(grpEl);
    }
    const list = grpEl.querySelector(".account-list");
    if (list) {
      list.insertAdjacentHTML("beforeend", this._mkAccItemHTML(acc));
      this._bindDynBtns();
    }
  },

  /* ── TASKS ── */
  initTasksPage() {
    this.tasks = JSON.parse(localStorage.getItem("secureTasks") || "[]");
    this.currentMonth = new Date();
    this.renderCalendar();
    this.updateTaskStats();
    this._bindCalNav();
    const si = document.querySelector(".search-bar input");
    const wrap = document.querySelector(".search-bar");
    if (si && wrap) {
      wrap.style.position = "relative";
      const self = this;
      si.addEventListener("input", function (e) {
        const q = e.target.value.toLowerCase();
        document.getElementById("_tsr")?.remove();
        if (!q) return;
        const found = self.tasks.filter(function (t) {
          return t.title.toLowerCase().includes(q);
        });
        if (!found.length) return;
        const res = document.createElement("div");
        res.id = "_tsr";
        res.style.cssText =
          "position:absolute;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.1);z-index:100;width:100%;max-height:280px;overflow-y:auto;top:100%;left:0;margin-top:4px";
        res.innerHTML = found
          .map(function (t) {
            return (
              "<div onclick=\"document.getElementById('_tsr').remove();SecureNotes.openTaskDetail(" +
              t.id +
              ')" style="padding:12px 16px;border-bottom:1px solid #f1f5f9;cursor:pointer;display:flex;align-items:center;gap:10px" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">' +
              "<span>" +
              (t.completed ? "✅" : "⬜") +
              "</span>" +
              "<div>" +
              '<div style="font-weight:600;font-size:0.875rem">' +
              t.title +
              "</div>" +
              '<div style="font-size:0.75rem;color:#94a3b8">' +
              (t.dueDate || "Không có hạn") +
              " · " +
              (t.priority || "Bình thường") +
              "</div>" +
              "</div>" +
              "</div>"
            );
          })
          .join("");
        wrap.appendChild(res);
      });
      document.addEventListener("click", function (e) {
        if (!e.target.closest(".search-bar"))
          document.getElementById("_tsr")?.remove();
      });
    }
    document
      .querySelector(".header-actions .btn-secondary")
      ?.addEventListener("click", function () {
        SecureNotes.openTaskFilterModal();
      });
  },

  openAddTaskModal() {
    const today = new Date().toISOString().split("T")[0];
    openModal(
      "m-at",
      "✅ Thêm Task Mới",
      '<label style="' +
        LS +
        '">Tiêu đề task *</label>' +
        '<input id="task-title" placeholder="Nhập tiêu đề task..." style="' +
        IS +
        '">' +
        '<label style="' +
        LS +
        '">Mô tả</label>' +
        '<textarea id="task-desc" rows="3" placeholder="Mô tả chi tiết (không bắt buộc)..." style="' +
        IS +
        'resize:vertical;"></textarea>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        '<div><label style="' +
        LS +
        '">Ngày hết hạn</label><input id="task-due" type="date" value="' +
        today +
        '" style="' +
        IS +
        '"></div>' +
        '<div><label style="' +
        LS +
        '">Ưu tiên</label><select id="task-priority" style="' +
        IS +
        '"><option>Bình thường</option><option>Cao</option><option>Thấp</option></select></div>' +
        "</div>" +
        '<label style="' +
        LS +
        '">Nhãn</label>' +
        '<input id="task-label" placeholder="VD: Công việc, Cá nhân..." style="' +
        IS +
        '">',
      CB("m-at") +
        '<button onclick="SecureNotes.saveTask()" style="' +
        BS("#667eea") +
        '">✅ Thêm Task</button>',
    );
    setTimeout(function () {
      document.getElementById("task-title")?.focus();
    }, 100);
  },

  saveTask() {
    const title = document.getElementById("task-title")?.value.trim();
    if (!title) {
      showToast("Vui lòng nhập tiêu đề task!", "warning");
      return;
    }
    const task = {
      id: Date.now(),
      title,
      desc: document.getElementById("task-desc")?.value.trim(),
      dueDate: document.getElementById("task-due")?.value,
      priority: document.getElementById("task-priority")?.value,
      label: document.getElementById("task-label")?.value.trim(),
      completed: false,
      created: new Date().toLocaleString("vi-VN"),
    };
    this.tasks.push(task);
    localStorage.setItem("secureTasks", JSON.stringify(this.tasks));
    document.getElementById("m-at")?.remove();
    showToast('Đã thêm task "' + title + '"!', "success");
    this.addActivity(
      'Thêm task "' + title + '"',
      "✅",
      "rgba(16,185,129,0.1)",
      "#10b981",
    );
    this.renderCalendar();
    this.updateTaskStats();
  },

  openTaskDetail(id) {
    const t = this.tasks.find(function (x) {
      return x.id === id;
    });
    if (!t) return;
    const pc =
      t.priority === "Cao"
        ? "#ef4444"
        : t.priority === "Thấp"
          ? "#10b981"
          : "#3b82f6";
    const pb =
      t.priority === "Cao"
        ? "#fef2f2"
        : t.priority === "Thấp"
          ? "#f0fdf4"
          : "#f0f9ff";
    openModal(
      "m-td",
      t.title,
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
        '<span style="padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;background:' +
        pb +
        ";color:" +
        pc +
        '">' +
        (t.priority || "Bình thường") +
        "</span>" +
        '<span style="padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;background:' +
        (t.completed ? "#f0fdf4" : "#fef9ec") +
        ";color:" +
        (t.completed ? "#10b981" : "#f59e0b") +
        '">' +
        (t.completed ? "✅ Hoàn thành" : "⏳ Đang làm") +
        "</span>" +
        (t.label
          ? '<span style="padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;background:#f0f9ff;color:#3b82f6">🏷 ' +
            t.label +
            "</span>"
          : "") +
        "</div>" +
        (t.desc
          ? '<p style="color:#64748b;margin-bottom:16px;line-height:1.6;font-size:0.9rem">' +
            t.desc +
            "</p>"
          : "") +
        '<div style="background:#f8fafc;border-radius:8px;padding:14px">' +
        '<div style="font-size:0.75rem;color:#94a3b8;margin-bottom:4px">📅 Ngày hết hạn</div>' +
        '<div style="font-weight:600">' +
        (t.dueDate || "Không có hạn") +
        "</div>" +
        "</div>",
      CB("m-td") +
        '<button onclick="SecureNotes.toggleTask(' +
        t.id +
        ");document.getElementById('m-td').remove()\" style=\"" +
        BS(t.completed ? "#f59e0b" : "#10b981") +
        '">' +
        (t.completed ? "↩ Bỏ hoàn thành" : "✅ Hoàn thành") +
        "</button>" +
        '<button onclick="SecureNotes.deleteTask(' +
        t.id +
        ");document.getElementById('m-td').remove()\" style=\"" +
        BS("#ef4444") +
        '">🗑 Xóa</button>',
    );
  },

  openDayTasks(dateStr) {
    const dt = this.tasks.filter(function (t) {
      return t.dueDate === dateStr;
    });
    const done = dt.filter(function (t) {
      return t.completed;
    }).length;
    const parts = dateStr.split("-");
    const label = parts[2] + "/" + parts[1] + "/" + parts[0];
    openModal(
      "m-dt",
      "📅 " +
        label +
        (dt.length ? " — " + done + "/" + dt.length + " hoàn thành" : ""),
      dt.length
        ? "<div>" +
            dt
              .map(function (t) {
                return (
                  '<div style="display:flex;align-items:center;gap:10px;padding:12px;border-radius:8px;margin-bottom:8px;background:' +
                  (t.completed ? "#f0fdf4" : "#f8fafc") +
                  ";border:1px solid " +
                  (t.completed ? "#bbf7d0" : "#e2e8f0") +
                  '">' +
                  '<input type="checkbox" ' +
                  (t.completed ? "checked" : "") +
                  ' style="width:18px;height:18px;cursor:pointer;accent-color:#10b981" onchange="SecureNotes.toggleTask(' +
                  t.id +
                  ");this.parentElement.style.background=this.checked?'#f0fdf4':'#f8fafc'\">" +
                  '<div style="flex:1">' +
                  '<div style="font-weight:600;font-size:0.875rem;' +
                  (t.completed
                    ? "text-decoration:line-through;color:#94a3b8"
                    : "") +
                  '">' +
                  t.title +
                  "</div>" +
                  (t.desc
                    ? '<div style="font-size:0.75rem;color:#94a3b8;margin-top:2px">' +
                      t.desc +
                      "</div>"
                    : "") +
                  "</div>" +
                  '<button onclick="SecureNotes.deleteTask(' +
                  t.id +
                  ');this.closest(\'[style]\').remove();SecureNotes.updateTaskStats()" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:18px" onmouseover="this.style.color=\'#ef4444\'" onmouseout="this.style.color=\'#94a3b8\'">×</button>' +
                  "</div>"
                );
              })
              .join("") +
            "</div>"
        : '<div style="text-align:center;padding:24px;color:#94a3b8"><div style="font-size:3rem;margin-bottom:12px">📭</div><p>Không có task nào trong ngày này</p></div>',
      CB("m-dt") +
        "<button onclick=\"document.getElementById('m-dt').remove();SecureNotes._addForDate('" +
        dateStr +
        '\')" style="' +
        BS("#667eea") +
        '">+ Thêm Task</button>',
    );
  },

  _addForDate(dateStr) {
    this.openAddTaskModal();
    setTimeout(function () {
      const d = document.getElementById("task-due");
      if (d) d.value = dateStr;
    }, 80);
  },

  toggleTask(id) {
    const idx = this.tasks.findIndex(function (t) {
      return t.id === id;
    });
    if (idx !== -1) {
      this.tasks[idx].completed = !this.tasks[idx].completed;
      localStorage.setItem("secureTasks", JSON.stringify(this.tasks));
      showToast(
        this.tasks[idx].completed ? "Task hoàn thành! 🎉" : "Đã bỏ đánh dấu",
        "success",
      );
      this.renderCalendar();
      this.updateTaskStats();
    }
  },

  deleteTask(id) {
    if (!confirm("Xóa task này?")) return;
    this.tasks = this.tasks.filter(function (t) {
      return t.id !== id;
    });
    localStorage.setItem("secureTasks", JSON.stringify(this.tasks));
    showToast("Đã xóa task!", "info");
    this.renderCalendar();
    this.updateTaskStats();
  },

  updateTaskStats() {
    const t = this.tasks;
    const done = t.filter(function (x) {
      return x.completed;
    }).length;
    const rate = t.length > 0 ? Math.round((done / t.length) * 100) : 0;
    const now = new Date();
    const in7 = new Date();
    in7.setDate(now.getDate() + 7);
    const up = t.filter(function (x) {
      if (!x.dueDate || x.completed) return false;
      const d = new Date(x.dueDate);
      return d >= now && d <= in7;
    }).length;
    const s = function (id, v) {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    s("total-tasks", t.length);
    s("completed-tasks", done);
    s("completion-rate", rate + "%");
    s("upcoming-7days", up);
  },

  openTaskFilterModal() {
    openModal(
      "m-tf",
      "🔍 Lọc Tasks",
      '<label style="' +
        LS +
        '">Trạng thái</label>' +
        '<select id="tf-status" style="' +
        IS +
        '">' +
        '<option value="all">Tất cả</option>' +
        '<option value="pending">Chưa hoàn thành</option>' +
        '<option value="done">Đã hoàn thành</option>' +
        "</select>" +
        '<label style="' +
        LS +
        '">Ưu tiên</label>' +
        '<select id="tf-priority" style="' +
        IS +
        '">' +
        '<option value="all">Tất cả</option>' +
        '<option value="Cao">Cao</option>' +
        '<option value="Bình thường">Bình thường</option>' +
        '<option value="Thấp">Thấp</option>' +
        "</select>",
      CB("m-tf") +
        '<button onclick="SecureNotes.applyTaskFilter()" style="' +
        BS("#667eea") +
        '">Áp dụng</button>',
    );
  },

  applyTaskFilter() {
    const status = document.getElementById("tf-status")?.value;
    const priority = document.getElementById("tf-priority")?.value;
    let list = this.tasks.slice();
    if (status === "pending")
      list = list.filter(function (t) {
        return !t.completed;
      });
    if (status === "done")
      list = list.filter(function (t) {
        return t.completed;
      });
    if (priority !== "all")
      list = list.filter(function (t) {
        return t.priority === priority;
      });
    document.getElementById("m-tf")?.remove();
    showToast("Hiển thị " + list.length + " task", "info");
    this.renderCalendar(list);
  },

  _bindCalNav() {
    const self = this;
    const prev = document.querySelector(".calendar-nav:first-of-type");
    const next = document.querySelector(".calendar-nav:last-of-type");
    if (prev)
      prev.onclick = function () {
        self.currentMonth.setMonth(self.currentMonth.getMonth() - 1);
        self.renderCalendar();
      };
    if (next)
      next.onclick = function () {
        self.currentMonth.setMonth(self.currentMonth.getMonth() + 1);
        self.renderCalendar();
      };
  },

  renderCalendar(overrideTasks) {
    const tasks = overrideTasks || this.tasks;
    const grid = document.querySelector(".calendar-grid");
    if (!grid) return;
    const title = document.querySelector(".calendar-title");
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const monthNames = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];
    if (title) title.textContent = monthNames[month] + " " + year;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const taskMap = {};
    tasks.forEach(function (t) {
      if (!t.dueDate) return;
      if (!taskMap[t.dueDate]) taskMap[t.dueDate] = [];
      taskMap[t.dueDate].push(t);
    });
    const headers = Array.from(grid.querySelectorAll(".calendar-weekday"));
    grid.innerHTML = "";
    headers.forEach(function (h) {
      grid.appendChild(h);
    });
    for (var i = 0; i < firstDay; i++) {
      var e = document.createElement("div");
      e.className = "calendar-day";
      grid.appendChild(e);
    }
    for (var d = 1; d <= daysInMonth; d++) {
      var dateStr =
        year +
        "-" +
        String(month + 1).padStart(2, "0") +
        "-" +
        String(d).padStart(2, "0");
      var dt = taskMap[dateStr] || [];
      var isToday =
        today.getDate() === d &&
        today.getMonth() === month &&
        today.getFullYear() === year;
      var done = dt.filter(function (t) {
        return t.completed;
      }).length;
      var cell = document.createElement("div");
      cell.className =
        "calendar-day" +
        (dt.length ? " has-tasks" : "") +
        (isToday ? " active" : "");
      cell.innerHTML =
        '<div class="day-number">' +
        String(d).padStart(2, "0") +
        "/" +
        String(month + 1).padStart(2, "0") +
        "</div>" +
        (dt.length
          ? '<div class="day-label">' + done + "/" + dt.length + "</div>"
          : "") +
        '<div class="task-preview-container">' +
        dt
          .slice(0, 2)
          .map(function (t) {
            return (
              '<div class="task-preview"><div class="task-dot ' +
              (t.completed ? "completed" : "") +
              '"></div><span>' +
              (t.title.length > 16 ? t.title.slice(0, 14) + "…" : t.title) +
              "</span></div>"
            );
          })
          .join("") +
        (dt.length > 2
          ? '<div class="task-preview" style="color:#667eea;font-size:0.7rem;font-weight:600">+' +
            (dt.length - 2) +
            " khác</div>"
          : "") +
        "</div>";
      (function (ds) {
        cell.onclick = function () {
          SecureNotes.openDayTasks(ds);
        };
      })(dateStr);
      grid.appendChild(cell);
    }
  },
};

function openAddPromptModal() {
  SecureNotes.openAddPromptModal();
}
function openAddAccountModal() {
  SecureNotes.openAddAccountModal();
}

document.addEventListener("DOMContentLoaded", function () {
  var page = location.pathname.split("/").pop() || "index.html";
  if (page === "notes.html") SecureNotes.initNotesPage();
  else if (page === "prompts.html") SecureNotes.initPromptsPage();
  else if (page === "accounts.html") SecureNotes.initAccountsPage();
  else if (page === "tasks.html") SecureNotes.initTasksPage();
  else SecureNotes.initDashboard();
});
