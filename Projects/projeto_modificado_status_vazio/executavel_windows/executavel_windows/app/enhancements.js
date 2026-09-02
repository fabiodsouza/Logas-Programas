/* ============================================================
   enhancements.js — melhorias visuais/funcionais aditivas.
   NÃO altera a lógica de script.js. Apenas embrulha as funções
   de renderização para acrescentar:
     - cartões-resumo (aba Obras)
     - busca por seção
     - ordenação clicando no cabeçalho
     - destaque de prazo vencido / próximo (Obras)
     - rótulos de status mais legíveis
   ============================================================ */
(function () {
  "use strict";

  var SECTIONS = {
    obras:        { fn: "updateProjectsDisplay",    sec: "obras-section",        tbody: "project-list",     dateCol: 5, statusCol: 7, summary: true, dateSortCol: 5 },
    preventiva:   { fn: "updateMaintenanceDisplay", sec: "preventiva-section",   tbody: "maintenance-list", dateSortCol: 1 },
    plantao:      { fn: "updatePlantaoDisplay",     sec: "plantao-section",      tbody: "plantao-list",     dateSortCol: 1 },
    treinamentos: { fn: "updateTreinamentoDisplay", sec: "treinamentos-section", tbody: "treinamento-list", dateSortCol: 3 },
    viagens:      { fn: "updateViagemDisplay",      sec: "viagens-section",      tbody: "viagem-list",      dateSortCol: 3 },
    ferias:       { fn: "renderFeriasList",         sec: "ferias-section",       tbody: "ferias-list",      dateSortCol: 1 }
  };

  var searchTerm = {};
  var sortState = {}; // key -> { col: n, dir: 1|-1 }

  var STATUS_LABEL = {
    "em-andamento": "Em andamento",
    "programado": "Programado",
    "pausado": "Pausado",
    "finalizado": "Finalizado"
  };

  function today0() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function parseBrDate(txt) {
    var m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(txt);
    if (!m) return null;
    return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
  }

  /* ---------- Injeção de barra de ferramentas / cartões ---------- */
  function ensureToolbar(key, cfg) {
    var section = document.getElementById(cfg.sec);
    if (!section) return;
    var h2 = section.querySelector("h2");
    if (!h2) return;

    if (cfg.summary && !section.querySelector(".summary-cards")) {
      var cards = document.createElement("div");
      cards.className = "summary-cards";
      cards.id = "summary-" + key;
      h2.insertAdjacentElement("afterend", cards);
    }

    if (!section.querySelector(".section-toolbar")) {
      var bar = document.createElement("div");
      bar.className = "section-toolbar";
      var box = document.createElement("div");
      box.className = "search-box";
      var input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Buscar nesta lista...";
      input.setAttribute("aria-label", "Buscar");
      input.addEventListener("input", function () {
        searchTerm[key] = input.value.toLowerCase().trim();
        applyFilter(key, cfg);
      });
      box.appendChild(input);
      bar.appendChild(box);

      // Botões de Backup / Restaurar (dados portáteis entre máquinas)
      var actions = document.createElement("div");
      actions.className = "toolbar-actions";
      var btnBkp = document.createElement("button");
      btnBkp.type = "button";
      btnBkp.className = "btn-tool";
      btnBkp.innerHTML = "⬇ Backup";
      btnBkp.title = "Salvar todos os dados em um arquivo (para levar a outra máquina)";
      btnBkp.addEventListener("click", exportarDados);
      var btnRst = document.createElement("button");
      btnRst.type = "button";
      btnRst.className = "btn-tool";
      btnRst.innerHTML = "⬆ Restaurar";
      btnRst.title = "Carregar os dados de um arquivo de backup";
      btnRst.addEventListener("click", importarDados);
      actions.appendChild(btnBkp);
      actions.appendChild(btnRst);
      bar.appendChild(actions);

      var anchor = section.querySelector(".summary-cards") || h2;
      anchor.insertAdjacentElement("afterend", bar);
    }
  }

  /* ---------- Backup / Restauração dos dados ---------- */
  var DATA_KEYS = ["projects", "maintenances", "plantoes", "treinamentos", "viagens", "ferias"];

  function pad2(n) { return n < 10 ? "0" + n : "" + n; }

  function exportarDados() {
    var dump = { _app: "gestao-manutencao", _versao: 1, _exportadoEm: new Date().toISOString() };
    DATA_KEYS.forEach(function (k) {
      dump[k] = JSON.parse(localStorage.getItem(k) || "[]");
    });
    var total = DATA_KEYS.reduce(function (s, k) { return s + (dump[k] ? dump[k].length : 0); }, 0);
    var blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var d = new Date();
    var nome = "backup-gestao-manutencao-" + d.getFullYear() + pad2(d.getMonth() + 1) + pad2(d.getDate()) + ".json";
    var a = document.createElement("a");
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      URL.revokeObjectURL(url);
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 150);
    showToast("Backup gerado (" + total + " registros): " + nome, "ok");
  }

  function ensureImportInput() {
    var fi = document.getElementById("__import-input");
    if (fi) return fi;
    fi = document.createElement("input");
    fi.type = "file";
    fi.id = "__import-input";
    fi.accept = ".json,application/json";
    fi.style.display = "none";
    fi.addEventListener("change", function () {
      var f = fi.files && fi.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        var obj;
        try { obj = JSON.parse(reader.result); }
        catch (e) { showToast("Não foi possível ler o arquivo (não é um backup válido).", "err"); return; }
        var temAlgum = DATA_KEYS.some(function (k) { return Array.isArray(obj[k]); });
        if (!temAlgum) { showToast("Arquivo inválido: não parece um backup deste sistema.", "err"); return; }
        if (!window.confirm("Isso vai SUBSTITUIR todos os dados atuais deste computador pelos do arquivo. Deseja continuar?")) return;
        DATA_KEYS.forEach(function (k) {
          if (Array.isArray(obj[k])) localStorage.setItem(k, JSON.stringify(obj[k]));
        });
        if (typeof window.loadDataFromLocalStorage === "function") window.loadDataFromLocalStorage();
        var sec = typeof window.getCurrentSection === "function" ? window.getCurrentSection() : "obras";
        if (typeof window.showSection === "function") window.showSection(sec);
        if (window.__refreshAlerts) window.__refreshAlerts();
        showToast("Dados restaurados com sucesso!", "ok");
      };
      reader.readAsText(f);
    });
    document.body.appendChild(fi);
    return fi;
  }

  function importarDados() {
    var fi = ensureImportInput();
    fi.value = "";
    fi.click();
  }

  /* ---------- Cartões-resumo (Obras) ---------- */
  function updateSummary(key, cfg) {
    if (!cfg.summary) return;
    var box = document.getElementById("summary-" + key);
    if (!box) return;
    var list = (window.data && window.data.projects) || [];
    var hoje = today0();
    var total = list.length;
    var andamento = 0, critica = 0, vencido = 0, somaProg = 0;
    list.forEach(function (p) {
      if (p.status === "Em-Andamento") andamento++;
      if (p.urgency === "Crítica") critica++;
      somaProg += parseInt(p.progress, 10) || 0;
      var d = p.deadline ? new Date(p.deadline + "T00:00:00") : null;
      if (d && d < hoje && p.status !== "Finalizado") vencido++;
    });
    var media = total ? Math.round(somaProg / total) : 0;
    box.innerHTML =
      card("c-total", total, "Total de obras") +
      card("c-andamento", andamento, "Em andamento") +
      card("c-critica", critica, "Urgência crítica") +
      card("c-vencido", vencido, "Prazo vencido") +
      card("c-progresso", media + "%", "Progresso médio");
  }

  function card(cls, num, label) {
    return '<div class="summary-card ' + cls + '"><span class="num">' + num +
      '</span><span class="label">' + label + "</span></div>";
  }

  /* ---------- Rótulos de status + destaque de prazo (Obras) ---------- */
  function polishObras(cfg) {
    var tbody = document.getElementById(cfg.tbody);
    if (!tbody) return;
    var hoje = today0();
    Array.prototype.forEach.call(tbody.rows, function (tr) {
      // Rótulo de status
      if (cfg.statusCol != null && tr.cells[cfg.statusCol]) {
        var badge = tr.cells[cfg.statusCol].querySelector(".badge");
        if (badge) {
          var nice = STATUS_LABEL[badge.textContent.trim().toLowerCase()];
          if (nice) badge.textContent = nice;
        }
      }
      // Destaque de prazo
      if (cfg.dateCol != null && tr.cells[cfg.dateCol]) {
        var cell = tr.cells[cfg.dateCol];
        cell.classList.remove("overdue", "due-soon");
        var statusTxt = tr.cells[cfg.statusCol] ? tr.cells[cfg.statusCol].textContent.trim() : "";
        var d = parseBrDate(cell.textContent);
        if (d && statusTxt !== "Finalizado") {
          var diff = Math.round((d - hoje) / 86400000);
          if (diff < 0) cell.classList.add("overdue");
          else if (diff <= 7) cell.classList.add("due-soon");
        }
      }
    });
  }

  /* ---------- Ordenação ---------- */
  function setupSort(key, cfg) {
    var section = document.getElementById(cfg.sec);
    if (!section) return;
    var table = section.querySelector(".dashboard-table table");
    if (!table || table.dataset.sortReady) return;
    var ths = table.querySelectorAll("thead th");
    ths.forEach(function (th, idx) {
      if (th.textContent.trim().toLowerCase() === "ações") return;
      th.classList.add("sortable");
      th.addEventListener("click", function () {
        var cur = sortState[key];
        var dir = (cur && cur.col === idx && cur.dir === 1) ? -1 : 1;
        sortState[key] = { col: idx, dir: dir };
        ths.forEach(function (t) { t.classList.remove("sort-asc", "sort-desc"); });
        th.classList.add(dir === 1 ? "sort-asc" : "sort-desc");
        applySort(key, cfg);
        applyFilter(key, cfg);
      });
    });
    table.dataset.sortReady = "1";
  }

  function detectType(v) {
    if (/^\d{1,3}%$/.test(v)) return "num";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return "date";
    if (/^-?\d+([.,]\d+)?$/.test(v)) return "num";
    return "str";
  }

  function sortKey(v, type) {
    if (type === "num") return parseFloat(v.replace("%", "").replace(",", ".")) || 0;
    if (type === "date") { var d = parseBrDate(v); return d ? d.getTime() : 0; }
    return v.toLowerCase();
  }

  function applySort(key, cfg) {
    var st = sortState[key];
    if (!st) return;
    var tbody = document.getElementById(cfg.tbody);
    if (!tbody) return;
    var rows = Array.prototype.slice.call(tbody.rows);
    if (!rows.length) return;
    var sample = "";
    for (var i = 0; i < rows.length; i++) {
      var c = rows[i].cells[st.col];
      if (c && c.textContent.trim()) { sample = c.textContent.trim(); break; }
    }
    var type = detectType(sample);
    rows.sort(function (a, b) {
      var av = a.cells[st.col] ? a.cells[st.col].textContent.trim() : "";
      var bv = b.cells[st.col] ? b.cells[st.col].textContent.trim() : "";
      var ak = sortKey(av, type), bk = sortKey(bv, type);
      if (ak < bk) return -1 * st.dir;
      if (ak > bk) return 1 * st.dir;
      return 0;
    });
    rows.forEach(function (r) { tbody.appendChild(r); });
  }

  /* ---------- Busca ---------- */
  function applyFilter(key, cfg) {
    var term = searchTerm[key] || "";
    var tbody = document.getElementById(cfg.tbody);
    if (!tbody) return;
    Array.prototype.forEach.call(tbody.rows, function (tr) {
      var show = !term || tr.textContent.toLowerCase().indexOf(term) !== -1;
      tr.style.display = show ? "" : "none";
    });
  }

  /* ---------- Pós-renderização ---------- */
  function markSortHeader(key, cfg) {
    var st = sortState[key];
    if (!st) return;
    var section = document.getElementById(cfg.sec);
    if (!section) return;
    var table = section.querySelector(".dashboard-table table");
    if (!table) return;
    var ths = table.querySelectorAll("thead th");
    ths.forEach(function (t) { t.classList.remove("sort-asc", "sort-desc"); });
    if (ths[st.col]) ths[st.col].classList.add(st.dir === 1 ? "sort-asc" : "sort-desc");
  }

  function postRender(key, cfg) {
    ensureToolbar(key, cfg);
    setupSort(key, cfg);
    if (cfg.summary) {
      updateSummary(key, cfg);
      polishObras(cfg);
    }
    // Ordena por data por padrão (uma vez), para a lista ficar sempre cronológica.
    if (!sortState[key] && cfg.dateSortCol != null) {
      sortState[key] = { col: cfg.dateSortCol, dir: 1 };
      markSortHeader(key, cfg);
    }
    applySort(key, cfg);
    applyFilter(key, cfg);
    if (window.__refreshAlerts) window.__refreshAlerts();
  }

  /* ---------- Embrulhar as funções de render ---------- */
  function wrap(key, cfg) {
    var orig = window[cfg.fn];
    if (typeof orig !== "function") return;
    window[cfg.fn] = function () {
      var r = orig.apply(this, arguments);
      try { postRender(key, cfg); } catch (e) { console.error("enhancements:", e); }
      return r;
    };
  }

  Object.keys(SECTIONS).forEach(function (key) { wrap(key, SECTIONS[key]); });

  // Torna 'data' acessível ao resumo (script.js declara com let → não vai ao window).
  // Fallback: lê do localStorage caso window.data não exista.
  if (typeof window.data === "undefined") {
    Object.defineProperty(window, "data", {
      get: function () {
        return {
          projects: JSON.parse(localStorage.getItem("projects") || "[]"),
          maintenances: JSON.parse(localStorage.getItem("maintenances") || "[]"),
          plantoes: JSON.parse(localStorage.getItem("plantoes") || "[]"),
          treinamentos: JSON.parse(localStorage.getItem("treinamentos") || "[]"),
          viagens: JSON.parse(localStorage.getItem("viagens") || "[]"),
          ferias: JSON.parse(localStorage.getItem("ferias") || "[]")
        };
      }
    });
  }

  /* ============================================================
     Correção do modal de senha do administrador.
     O script.js original usava alert() ao errar a senha — no
     aplicativo (Electron) esse diálogo nativo tira o foco e deixa
     o campo sem clique. Aqui trocamos por um aviso embutido, sem
     diálogo nativo, mantendo o campo sempre editável.
     ============================================================ */
  function checkAdminPasswordFixed(callback, opts) {
    opts = opts || {};
    var titulo = opts.titulo || "Autenticação de Administrador";
    var subtitulo = opts.subtitulo || "Digite a senha do administrador para continuar:";

    var old = document.getElementById("auth-modal");
    if (old && old.parentNode) old.parentNode.removeChild(old);

    var overlay = document.createElement("div");
    overlay.id = "auth-modal";
    overlay.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;" +
      "background:rgba(17,24,39,0.55);backdrop-filter:blur(4px);" +
      "display:flex;justify-content:center;align-items:center;z-index:10000;";

    var box = document.createElement("div");
    box.style.cssText =
      "background:#fff;padding:26px 28px;border-radius:12px;" +
      "box-shadow:0 24px 48px rgba(0,0,0,0.28);text-align:center;" +
      'min-width:320px;max-width:90%;font-family:"Segoe UI",Tahoma,sans-serif;';
    box.innerHTML =
      '<h3 style="margin:0 0 8px;color:#0f3d68;font-size:1.2rem;">' + titulo + "</h3>" +
      '<p style="margin:0 0 16px;color:#4b5563;font-size:0.92rem;">' + subtitulo + "</p>" +
      '<input type="password" id="admin-password-input" placeholder="Senha do administrador" ' +
      'style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:8px;' +
      'margin-bottom:8px;font-size:1rem;box-sizing:border-box;">' +
      '<div id="admin-password-error" style="display:none;color:#dc2626;font-size:0.85rem;' +
      'margin-bottom:10px;font-weight:600;">Senha incorreta. Tente novamente.</div>' +
      '<div style="display:flex;gap:10px;justify-content:center;margin-top:8px;">' +
      '<button id="auth-cancel-btn" type="button" style="background:#f3f4f6;color:#1f2937;' +
      'border:1px solid #e5e7eb;padding:10px 20px;border-radius:8px;cursor:pointer;' +
      'font-size:0.95rem;font-weight:600;">Cancelar</button>' +
      '<button id="auth-confirm-btn" type="button" style="background:#16a34a;color:#fff;' +
      'border:none;padding:10px 20px;border-radius:8px;cursor:pointer;' +
      'font-size:0.95rem;font-weight:600;">Confirmar</button>' +
      "</div>";

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    var input = box.querySelector("#admin-password-input");
    var errEl = box.querySelector("#admin-password-error");
    var confirmBtn = box.querySelector("#auth-confirm-btn");
    var cancelBtn = box.querySelector("#auth-cancel-btn");

    setTimeout(function () { input.focus(); }, 50);

    function close(result) {
      document.removeEventListener("keydown", onKey, true);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      callback(result);
    }

    function tryConfirm() {
      if (input.value === "admin123") {
        close(true);
      } else {
        errEl.style.display = "block";
        input.value = "";
        input.style.borderColor = "#dc2626";
        input.focus();
      }
    }

    confirmBtn.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); tryConfirm(); });
    cancelBtn.addEventListener("click", function (e) { e.preventDefault(); e.stopPropagation(); close(false); });
    input.addEventListener("input", function () {
      errEl.style.display = "none";
      input.style.borderColor = "#e5e7eb";
    });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); tryConfirm(); }
    });
    // Clicar fora (no fundo escuro) cancela
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(false); });

    function onKey(e) { if (e.key === "Escape") close(false); }
    document.addEventListener("keydown", onKey, true);
  }

  window.checkAdminPassword = checkAdminPasswordFixed;

  /* ============================================================
     Confirmação de remoção na própria tela (sem confirm() nativo).
     O confirm() nativo do Windows também trava a interface; aqui
     usamos um modal em página e sobrescrevemos as funções de
     exclusão para não sobrar nenhum diálogo nativo.
     ============================================================ */
  function askConfirm(msg) {
    return new Promise(function (resolve) {
      var old = document.getElementById("confirm-modal");
      if (old && old.parentNode) old.parentNode.removeChild(old);

      var overlay = document.createElement("div");
      overlay.id = "confirm-modal";
      overlay.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;" +
        "background:rgba(17,24,39,0.55);backdrop-filter:blur(4px);" +
        "display:flex;justify-content:center;align-items:center;z-index:11000;";
      var box = document.createElement("div");
      box.style.cssText =
        "background:#fff;padding:24px 26px;border-radius:12px;" +
        "box-shadow:0 24px 48px rgba(0,0,0,0.28);text-align:center;" +
        'min-width:320px;max-width:90%;font-family:"Segoe UI",Tahoma,sans-serif;';
      box.innerHTML =
        '<div style="font-size:2rem;margin-bottom:8px;">🗑️</div>' +
        '<p style="margin:0 0 18px;color:#1f2937;font-size:1rem;font-weight:600;">' + esc(msg) + "</p>" +
        '<div style="display:flex;gap:10px;justify-content:center;">' +
        '<button id="cf-nao" type="button" style="background:#f3f4f6;color:#1f2937;border:1px solid #e5e7eb;padding:10px 22px;border-radius:8px;cursor:pointer;font-weight:600;">Cancelar</button>' +
        '<button id="cf-sim" type="button" style="background:#dc2626;color:#fff;border:none;padding:10px 22px;border-radius:8px;cursor:pointer;font-weight:600;">Remover</button>' +
        "</div>";
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      function close(v) {
        document.removeEventListener("keydown", onKey, true);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        resolve(v);
      }
      box.querySelector("#cf-sim").addEventListener("click", function () { close(true); });
      box.querySelector("#cf-nao").addEventListener("click", function () { close(false); });
      overlay.addEventListener("click", function (e) { if (e.target === overlay) close(false); });
      function onKey(e) {
        if (e.key === "Escape") close(false);
        else if (e.key === "Enter") close(true);
      }
      document.addEventListener("keydown", onKey, true);
      setTimeout(function () { var b = box.querySelector("#cf-sim"); if (b) b.focus(); }, 50);
    });
  }

  function makeDelete(arrKey, section, msg) {
    return function (index) {
      checkAdminPasswordFixed(function (ok) {
        if (!ok) return;
        askConfirm(msg).then(function (sim) {
          if (!sim) return;
          var arr = JSON.parse(localStorage.getItem(arrKey) || "[]");
          if (index < 0 || index >= arr.length) return;
          arr.splice(index, 1);
          localStorage.setItem(arrKey, JSON.stringify(arr));
          if (typeof window.loadDataFromLocalStorage === "function") window.loadDataFromLocalStorage();
          if (typeof window.updateDisplay === "function") window.updateDisplay(section);
          showToast("Item removido.", "ok");
        });
      });
    };
  }

  window.deleteProject = makeDelete("projects", "obras", "Tem certeza que deseja remover esta obra?");
  window.deleteMaintenance = makeDelete("maintenances", "preventiva", "Tem certeza que deseja remover esta manutenção?");
  window.deletePlantao = makeDelete("plantoes", "plantao", "Tem certeza que deseja remover esta escala de plantão?");
  window.deleteTreinamento = makeDelete("treinamentos", "treinamentos", "Tem certeza que deseja remover este treinamento?");
  window.deleteViagem = makeDelete("viagens", "viagens", "Tem certeza que deseja remover esta viagem?");
  window.deleteFerias = makeDelete("ferias", "ferias", "Tem certeza que deseja remover esta escala de férias?");

  /* ============================================================
     Avisos não bloqueantes (toasts) no lugar de alert().
     O alert() nativo trava a interface por um instante ao abrir e
     fechar — em cadastros seguidos isso dá sensação de travamento.
     Aqui o alert() vira um toast que some sozinho, sem bloquear.
     ============================================================ */
  function toastContainer() {
    var c = document.getElementById("toast-container");
    if (!c) {
      c = document.createElement("div");
      c.id = "toast-container";
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(msg, tipo) {
    var c = toastContainer();
    var el = document.createElement("div");
    el.className = "toast " + (tipo || "info");
    el.textContent = String(msg == null ? "" : msg);
    c.appendChild(el);
    setTimeout(function () {
      el.classList.add("saindo");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
    }, 2600);
  }

  window.showToast = showToast;

  // Substitui o alert() nativo por toast (não bloqueante).
  window.alert = function (msg) {
    var s = String(msg == null ? "" : msg);
    var tipo = "info";
    if (/sucesso|adicionad|atualizad|salv|removid/i.test(s)) tipo = "ok";
    else if (/incorreta|preencha|obrigat|deve|erro|inv[aá]lid|posterior/i.test(s)) tipo = "err";
    showToast(s, tipo);
  };

  /* ============================================================
     Alertas de vencimento.
     Varre todas as listas e mostra o que está vencido e o que
     vence nos próximos N dias, num painel acessível por um sino.
     ============================================================ */
  var alertWindowDays = 7;

  // Categorias monitoradas. overdue=true => datas passadas viram "vencido".
  var ALERT_CATS = [
    { arr: "projects",     dateField: "deadline",   overdue: true,  section: "obras",        ico: "🏗️", label: "Obra",
      title: function (o) { return o.name || "Obra"; },
      sub: function (o) { return "Obra • " + (o.location || ""); },
      skip: function (o) { return o.status === "Finalizado"; } },
    { arr: "maintenances", dateField: "date",       overdue: true,  section: "preventiva",   ico: "🔧", label: "Manutenção",
      title: function (o) { return (o.client || "Cliente") + (o.type ? " — " + o.type : ""); },
      sub: function (o) { return "Manutenção • " + (o.technician || ""); } },
    { arr: "treinamentos", dateField: "data",       overdue: false, section: "treinamentos", ico: "🎓", label: "Treinamento/Exame",
      title: function (o) { return (o.colaborador || "") + (o.nome ? " — " + o.nome : ""); },
      sub: function (o) { return "Treinamento/Exame" + (o.horario ? " • " + o.horario : ""); } },
    { arr: "viagens",      dateField: "data",       overdue: false, section: "viagens",      ico: "✈️", label: "Viagem",
      title: function (o) { return (o.colaborador || "") + (o.local ? " — " + o.local : ""); },
      sub: function () { return "Viagem"; } },
    { arr: "plantoes",     dateField: "dataInicio", overdue: false, section: "plantao",       ico: "🗓️", label: "Plantão",
      title: function (o) { return o.colaborador || "Plantão"; },
      sub: function () { return "Início de plantão"; } },
    { arr: "ferias",       dateField: "dataInicio", overdue: false, section: "ferias",        ico: "🌴", label: "Férias",
      title: function (o) { return o.colaborador || "Férias"; },
      sub: function () { return "Início de férias"; } },
    { arr: "plantoes",     dateField: "dataTermino", overdue: false, section: "plantao",       ico: "🗓️", label: "Plantão",
      title: function (o) { return o.colaborador || "Plantão"; },
      sub: function () { return "Fim de plantão"; } },
    { arr: "ferias",       dateField: "dataTermino", overdue: false, section: "ferias",        ico: "🌴", label: "Férias",
      title: function (o) { return o.colaborador || "Férias"; },
      sub: function () { return "Retorno de férias"; } }
  ];

  function parseISO(s) {
    if (!s || typeof s !== "string") return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (!m) { var d = parseBrDate(s); return d; }
    return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  }

  function computeAlerts() {
    var hoje = today0();
    var d = window.data || {};
    var out = [];
    ALERT_CATS.forEach(function (cat) {
      var list = d[cat.arr] || [];
      list.forEach(function (item) {
        if (cat.skip && cat.skip(item)) return;
        var dt = parseISO(item[cat.dateField]);
        if (!dt) return;
        var diff = Math.round((dt - hoje) / 86400000);
        var estado = null;
        if (cat.overdue && diff < 0) estado = "vencido";
        else if (diff >= 0 && diff <= alertWindowDays) estado = "proximo";
        if (!estado) return;
        out.push({
          estado: estado, diff: diff, data: dt,
          ico: cat.ico, section: cat.section,
          t1: cat.title(item), t2: cat.sub(item)
        });
      });
    });
    out.sort(function (a, b) {
      if (a.estado !== b.estado) return a.estado === "vencido" ? -1 : 1;
      return a.diff - b.diff;
    });
    return out;
  }

  function quandoTexto(a) {
    if (a.estado === "vencido") {
      var n = Math.abs(a.diff);
      return "venceu há " + n + (n === 1 ? " dia" : " dias");
    }
    if (a.diff === 0) return "hoje";
    if (a.diff === 1) return "amanhã";
    return "em " + a.diff + " dias";
  }

  function ensureAlertUI() {
    if (document.getElementById("alert-fab")) return;

    var fab = document.createElement("button");
    fab.id = "alert-fab";
    fab.className = "alert-fab";
    fab.type = "button";
    fab.setAttribute("aria-label", "Alertas de vencimento");
    fab.innerHTML = '🔔<span class="badge-count">0</span>';
    document.body.appendChild(fab);

    var overlay = document.createElement("div");
    overlay.id = "alert-overlay";
    overlay.className = "alert-overlay";
    overlay.innerHTML =
      '<div class="alert-panel">' +
      '<div class="alert-panel-head">' +
      "<h3>🔔 Alertas de vencimento</h3>" +
      '<div style="display:flex;align-items:center;gap:8px;">' +
      '<select id="alert-window" title="Período">' +
      '<option value="7">Próx. 7 dias</option>' +
      '<option value="15">Próx. 15 dias</option>' +
      '<option value="30">Próx. 30 dias</option>' +
      "</select>" +
      '<button class="alert-close" type="button" aria-label="Fechar">✕</button>' +
      "</div></div>" +
      '<div class="alert-list" id="alert-list"></div>' +
      "</div>";
    document.body.appendChild(overlay);

    fab.addEventListener("click", function () {
      overlay.classList.add("aberto");
      renderAlertList();
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.classList.contains("alert-close")) {
        overlay.classList.remove("aberto");
      }
    });
    overlay.querySelector("#alert-window").addEventListener("change", function (e) {
      alertWindowDays = parseInt(e.target.value, 10) || 7;
      refreshAlerts();
      renderAlertList();
    });
  }

  function renderAlertList() {
    var listEl = document.getElementById("alert-list");
    if (!listEl) return;
    var alerts = computeAlerts();
    if (!alerts.length) {
      listEl.innerHTML = '<div class="alert-empty">Nenhum vencimento no período. Tudo em dia!</div>';
      return;
    }
    var html = "";
    var vencidos = alerts.filter(function (a) { return a.estado === "vencido"; });
    var proximos = alerts.filter(function (a) { return a.estado === "proximo"; });

    function bloco(titulo, arr) {
      if (!arr.length) return "";
      var s = '<div class="alert-group-title">' + titulo + " (" + arr.length + ")</div>";
      arr.forEach(function (a) {
        s +=
          '<div class="alert-item ' + a.estado + '" data-section="' + a.section + '">' +
          '<span class="ico">' + a.ico + "</span>" +
          '<span class="txt"><span class="t1">' + esc(a.t1) + '</span><br><span class="t2">' + esc(a.t2) + "</span></span>" +
          '<span class="quando">' + quandoTexto(a) + "</span>" +
          "</div>";
      });
      return s;
    }
    html += bloco("Vencidos", vencidos);
    html += bloco("A vencer", proximos);
    listEl.innerHTML = html;

    Array.prototype.forEach.call(listEl.querySelectorAll(".alert-item"), function (el) {
      el.addEventListener("click", function () {
        var sec = el.getAttribute("data-section");
        document.getElementById("alert-overlay").classList.remove("aberto");
        if (typeof window.showSection === "function") window.showSection(sec);
      });
    });
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Conta itens VENCIDOS (data passada) por seção — só categorias com overdue=true.
  function overdueCounts() {
    var hoje = today0();
    var d = window.data || {};
    var counts = {};
    ALERT_CATS.forEach(function (cat) {
      if (!cat.overdue) return;
      var list = d[cat.arr] || [];
      list.forEach(function (item) {
        if (cat.skip && cat.skip(item)) return;
        var dt = parseISO(item[cat.dateField]);
        if (dt && Math.round((dt - hoje) / 86400000) < 0) {
          counts[cat.section] = (counts[cat.section] || 0) + 1;
        }
      });
    });
    return counts;
  }

  var NAV_MAP = {
    obras: "nav-obras",
    preventiva: "nav-preventiva",
    plantao: "nav-plantao",
    treinamentos: "nav-treinamentos",
    viagens: "nav-viagens",
    ferias: "nav-ferias"
  };

  function updateNavBadges() {
    var counts = overdueCounts();
    Object.keys(NAV_MAP).forEach(function (sec) {
      var btn = document.getElementById(NAV_MAP[sec]);
      if (!btn) return;
      var badge = btn.querySelector(".nav-badge");
      var n = counts[sec] || 0;
      if (n <= 0) {
        if (badge) badge.style.display = "none";
        return;
      }
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "nav-badge";
        btn.appendChild(badge);
      }
      badge.textContent = n > 99 ? "99+" : String(n);
      badge.title = n + (n === 1 ? " item vencido" : " itens vencidos");
      badge.style.display = "flex";
    });
  }

  function refreshAlerts() {
    ensureAlertUI();
    var fab = document.getElementById("alert-fab");
    if (!fab) return;
    var alerts = computeAlerts();
    var temVencido = alerts.some(function (a) { return a.estado === "vencido"; });
    fab.classList.toggle("tem-alerta", alerts.length > 0);
    fab.classList.toggle("tem-vencido", temVencido);
    var badge = fab.querySelector(".badge-count");
    if (badge) badge.textContent = alerts.length > 99 ? "99+" : String(alerts.length);
    updateNavBadges();
    if (document.getElementById("alert-overlay").classList.contains("aberto")) renderAlertList();
  }

  window.__refreshAlerts = refreshAlerts;
  // Primeira checagem (caso nenhuma renderização dispare de imediato).
  setTimeout(function () { try { refreshAlerts(); } catch (e) { console.error(e); } }, 300);

  /* ============================================================
     Tela inicial (Painel) — resumo do dia a partir de todas as abas.
     ============================================================ */
  function fmt(dstr) {
    return typeof window.formatDate === "function" ? window.formatDate(dstr) : dstr;
  }
  function byDateField(field) {
    return function (a, b) {
      var da = parseISO(a[field]), db = parseISO(b[field]);
      return (da ? da.getTime() : 0) - (db ? db.getTime() : 0);
    };
  }

  function renderPainel() {
    var sec = document.getElementById("painel-section");
    if (!sec) return;
    var d = window.data || {};
    var hoje = today0();
    var proj = d.projects || [], man = d.maintenances || [], pl = d.plantoes || [],
        tr = d.treinamentos || [], vi = d.viagens || [], fe = d.ferias || [];

    function dd(dtStr) { var dt = parseISO(dtStr); return dt ? Math.round((dt - hoje) / 86400000) : null; }
    function dentro(dtStr, dias) { var x = dd(dtStr); return x !== null && x >= 0 && x <= dias; }
    function ativoHoje(i, f) { var a = parseISO(i), b = parseISO(f); return a && b && a <= hoje && hoje <= b; }

    // KPIs
    var obrasAtivas = proj.filter(function (p) { return p.status === "Em-Andamento"; }).length;
    var criticas = proj.filter(function (p) { return p.urgency === "Crítica" && p.status !== "Finalizado"; }).length;
    var alerts = computeAlerts();
    var vencidos = alerts.filter(function (a) { return a.estado === "vencido"; }).length;
    var manSemana = man.filter(function (m) { return dentro(m.date, 7); }).length;
    var progMedia = proj.length ? Math.round(proj.reduce(function (s, p) { return s + (parseInt(p.progress, 10) || 0); }, 0) / proj.length) : 0;

    var kpis = '<div class="summary-cards">' +
      card("c-total", obrasAtivas, "Obras ativas") +
      card("c-critica", criticas, "Urgência crítica") +
      card("c-vencido", vencidos, "Vencidos") +
      card("c-andamento", manSemana, "Manut. na semana") +
      card("c-progresso", progMedia + "%", "Progresso médio") +
      "</div>";

    function item(main, sub, right, goto, cls) {
      return '<div class="w-item ' + (cls || "") + '"' + (goto ? ' data-goto="' + goto + '"' : "") + ">" +
        '<span class="w-item-main">' + esc(main) + (sub ? '<span class="w-item-sub">' + esc(sub) + "</span>" : "") + "</span>" +
        (right ? '<span class="w-item-right">' + esc(right) + "</span>" : "") + "</div>";
    }
    function widget(icon, titulo, goto, corpo, vazio) {
      return '<div class="widget">' +
        '<div class="w-head"><span class="w-title">' + icon + " " + esc(titulo) + "</span>" +
        (goto ? '<button class="w-link" data-goto="' + goto + '">ver todos ›</button>' : "") + "</div>" +
        '<div class="w-body">' + (corpo && corpo.trim() ? corpo : '<div class="w-empty">' + esc(vazio || "Nada por aqui.") + "</div>") + "</div></div>";
    }

    // Plantão de hoje
    var plHoje = pl.filter(function (x) { return ativoHoje(x.dataInicio, x.dataTermino); });
    var plHtml = plHoje.map(function (x) { return item(x.colaborador || "-", "até " + fmt(x.dataTermino), "de plantão", "plantao"); }).join("");

    // Férias hoje
    var feHoje = fe.filter(function (x) { return ativoHoje(x.dataInicio, x.dataTermino); });
    var feHtml = feHoje.map(function (x) { return item(x.colaborador || "-", "retorna " + fmt(x.dataTermino), "de férias", "ferias"); }).join("");

    // Manutenções desta semana
    var manProx = man.filter(function (m) { return dentro(m.date, 7); }).sort(byDateField("date"));
    var manHtml = manProx.slice(0, 6).map(function (m) {
      var x = dd(m.date);
      return item((m.client || "-") + (m.type ? " — " + m.type : ""), m.technician || "", x === 0 ? "hoje" : (x === 1 ? "amanhã" : "em " + x + "d"), "preventiva");
    }).join("");

    // Obras em andamento (por prazo)
    var obrasEm = proj.filter(function (p) { return p.status === "Em-Andamento"; }).sort(byDateField("deadline"));
    var obrasHtml = obrasEm.slice(0, 6).map(function (p) {
      var x = dd(p.deadline);
      var venc = x !== null && x < 0;
      return item(p.name || "-", (p.responsible || "") + (p.location ? " • " + p.location : ""),
        (p.deadline ? fmt(p.deadline) : "sem prazo"), "obras", venc ? "venc" : "");
    }).join("");

    // Agenda da semana (treinamentos, viagens, início de plantão e de férias nos próximos 7 dias)
    var agenda = [];
    tr.forEach(function (t) { if (dentro(t.data, 7)) agenda.push({ dt: t.data, ico: "🎓", main: (t.colaborador || "") + (t.nome ? " — " + t.nome : ""), goto: "treinamentos" }); });
    vi.forEach(function (v) { if (dentro(v.data, 7)) agenda.push({ dt: v.data, ico: "✈️", main: (v.colaborador || "") + (v.local ? " — " + v.local : ""), goto: "viagens" }); });
    pl.forEach(function (p) { if (dentro(p.dataInicio, 7)) agenda.push({ dt: p.dataInicio, ico: "🗓️", main: (p.colaborador || "") + " (início de plantão)", goto: "plantao" }); });
    fe.forEach(function (f) { if (dentro(f.dataInicio, 7)) agenda.push({ dt: f.dataInicio, ico: "🌴", main: (f.colaborador || "") + " (início de férias)", goto: "ferias" }); });
    agenda.sort(function (a, b) { return parseISO(a.dt) - parseISO(b.dt); });
    var agHtml = agenda.slice(0, 7).map(function (a) {
      var x = dd(a.dt);
      return item(a.ico + " " + a.main, "", x === 0 ? "hoje" : (x === 1 ? "amanhã" : fmt(a.dt)), a.goto);
    }).join("");

    // Alertas (vencidos + a vencer, top 6)
    var alHtml = alerts.slice(0, 6).map(function (a) {
      var right = a.estado === "vencido" ? "vencido" : (a.diff === 0 ? "hoje" : (a.diff === 1 ? "amanhã" : "em " + a.diff + "d"));
      return item(a.ico + " " + a.t1, a.t2, right, a.section, a.estado === "vencido" ? "venc" : "");
    }).join("");

    var hojeTxt = hoje.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

    sec.innerHTML =
      '<h2>Painel</h2>' +
      '<div class="painel-sub">Resumo de ' + esc(hojeTxt) + "</div>" +
      kpis +
      '<div class="painel-grid">' +
      widget("🗓️", "Plantão de hoje", "plantao", plHtml, "Ninguém de plantão hoje.") +
      widget("🔧", "Manutenções desta semana", "preventiva", manHtml, "Nenhuma manutenção nos próximos 7 dias.") +
      widget("🏗️", "Obras em andamento", "obras", obrasHtml, "Nenhuma obra em andamento.") +
      widget("⚠️", "Vencimentos", null, alHtml, "Nada vencendo. Tudo em dia!") +
      widget("📆", "Agenda da semana", null, agHtml, "Sem eventos nos próximos 7 dias.") +
      widget("🌴", "De férias agora", "ferias", feHtml, "Ninguém de férias hoje.") +
      "</div>";

    // Navegação ao clicar
    Array.prototype.forEach.call(sec.querySelectorAll("[data-goto]"), function (el) {
      el.addEventListener("click", function () {
        var g = el.getAttribute("data-goto");
        if (typeof window.showSection === "function") window.showSection(g);
      });
    });
  }

  // Faz o updateDisplay('painel') renderizar o painel.
  var _origUpdateDisplay = window.updateDisplay;
  window.updateDisplay = function (sectionId) {
    var r = (typeof _origUpdateDisplay === "function") ? _origUpdateDisplay.apply(this, arguments) : undefined;
    if (sectionId === "painel") { try { renderPainel(); } catch (e) { console.error("painel:", e); } }
    return r;
  };

  // Abre o sistema já no Painel.
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      try { if (typeof window.showSection === "function") window.showSection("painel"); } catch (e) {}
    }, 0);
  });

  // Selo de versão (para conferir se o .exe está atualizado)
  var VERSAO = "1.3";
  (function () {
    if (document.getElementById("versao-app")) return;
    var v = document.createElement("div");
    v.id = "versao-app";
    v.textContent = "v" + VERSAO;
    v.title = "Versão do sistema";
    v.style.cssText =
      "position:fixed;left:10px;bottom:8px;font-size:11px;color:#9ca3af;" +
      'z-index:8000;pointer-events:none;font-family:"Segoe UI",Tahoma,sans-serif;';
    document.body.appendChild(v);
  })();

  /* ============================================================
     Senha para FECHAR o programa.
     O processo principal (main.js) chama window.__askClosePassword()
     quando o usuário clica no X. Retorna uma Promise que resolve
     true (senha correta -> pode fechar) ou false (cancelou -> fica aberto).
     ============================================================ */
  window.__askClosePassword = function () {
    return new Promise(function (resolve) {
      checkAdminPasswordFixed(
        function (ok) { resolve(ok === true); },
        {
          titulo: "Fechar o programa",
          subtitulo: "Digite a senha do administrador para sair:"
        }
      );
    });
  };

  console.log("enhancements.js carregado");
})();
