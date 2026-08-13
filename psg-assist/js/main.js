/*
 * PSG Assist 패널 UI 컨트롤러.
 * UXP entrypoints 라이프사이클에 맞춰 초기화하고,
 * 카테고리 → 기능 목록 → 기능 상세(가이드/자동 실행) 화면 전환을 담당한다.
 */

const { entrypoints } = require("uxp");
const { CATEGORIES, findFeature } = require("./featureRegistry.js");

let initialized = false;

function $(selector) {
  return document.querySelector(selector);
}

function setStatus(message, isError) {
  const bar = $("#status-bar");
  bar.textContent = message || "";
  bar.classList.toggle("is-error", Boolean(isError));
}

function clearPanels() {
  $("#feature-list").hidden = true;
  $("#feature-detail").hidden = true;
  $("#guide-view").hidden = true;
}

function renderCategories() {
  const container = $("#category-list");
  container.hidden = false;
  container.innerHTML = "";

  CATEGORIES.forEach((category) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "psg-btn psg-btn--category";
    btn.textContent = category.label;
    btn.addEventListener("click", () => showFeatures(category.id));
    container.appendChild(btn);
  });
}

function showFeatures(categoryId) {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return;

  clearPanels();
  const list = $("#feature-list");
  list.hidden = false;
  list.innerHTML = "";

  const backBtn = document.createElement("button");
  backBtn.type = "button";
  backBtn.className = "psg-btn psg-btn--back";
  backBtn.textContent = "← 카테고리로";
  backBtn.addEventListener("click", () => {
    clearPanels();
  });
  list.appendChild(backBtn);

  const heading = document.createElement("h2");
  heading.className = "psg-section-title";
  heading.textContent = category.label;
  list.appendChild(heading);

  category.features.forEach((feature) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "psg-btn psg-btn--feature";
    btn.textContent = feature.impl ? feature.label : `${feature.label} (준비 중)`;
    btn.disabled = !feature.impl;
    btn.addEventListener("click", () => showFeatureDetail(feature.id));
    list.appendChild(btn);
  });
}

function showFeatureDetail(featureId) {
  const found = findFeature(featureId);
  if (!found || !found.feature.impl) return;
  const { impl } = found.feature;

  const detail = $("#feature-detail");
  detail.hidden = false;
  detail.innerHTML = "";
  $("#guide-view").hidden = true;

  const title = document.createElement("h2");
  title.className = "psg-section-title";
  title.textContent = impl.meta.label;
  detail.appendChild(title);

  const summary = document.createElement("p");
  summary.className = "psg-summary";
  summary.textContent = impl.meta.summary;
  detail.appendChild(summary);

  const actions = document.createElement("div");
  actions.className = "psg-actions";

  const guideBtn = document.createElement("button");
  guideBtn.type = "button";
  guideBtn.className = "psg-btn psg-btn--secondary";
  guideBtn.textContent = "가이드로 보기";
  guideBtn.addEventListener("click", () => showGuide(featureId));

  const autoBtn = document.createElement("button");
  autoBtn.type = "button";
  autoBtn.className = "psg-btn psg-btn--primary";
  autoBtn.textContent = "자동 실행";
  autoBtn.addEventListener("click", () => runAuto(featureId));

  actions.appendChild(guideBtn);
  actions.appendChild(autoBtn);
  detail.appendChild(actions);
}

function showGuide(featureId) {
  const found = findFeature(featureId);
  if (!found || !found.feature.impl) return;
  const { impl } = found.feature;

  const guideView = $("#guide-view");
  guideView.hidden = false;
  guideView.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "psg-section-title";
  title.textContent = `${impl.meta.label} – 단계별 가이드`;
  guideView.appendChild(title);

  const list = document.createElement("ol");
  list.className = "psg-guide-steps";

  impl.guideSteps.forEach((step) => {
    const li = document.createElement("li");
    li.className = "psg-guide-step";

    const stepTitle = document.createElement("strong");
    stepTitle.textContent = step.title;
    li.appendChild(stepTitle);

    const stepDesc = document.createElement("p");
    stepDesc.textContent = step.description;
    li.appendChild(stepDesc);

    if (step.image) {
      const img = document.createElement("img");
      img.src = step.image;
      img.alt = step.title;
      li.appendChild(img);
    }

    list.appendChild(li);
  });

  guideView.appendChild(list);
  setStatus("가이드를 참고해 Photoshop에서 직접 따라해 보세요.");
}

async function runAuto(featureId) {
  const found = findFeature(featureId);
  if (!found || !found.feature.impl) return;
  const { impl } = found.feature;

  setStatus(`${impl.meta.label} 실행 중...`);
  try {
    await impl.autoRun();
    setStatus(`${impl.meta.label} 완료되었습니다.`);
  } catch (err) {
    console.error("[PSG Assist]", err);
    setStatus(`오류가 발생했습니다: ${err.message}`, true);
  }
}

function renderSearchResults(query) {
  const container = $("#category-list");
  container.innerHTML = "";

  const matches = [];
  CATEGORIES.forEach((category) => {
    category.features.forEach((feature) => {
      if (feature.label.toLowerCase().includes(query)) {
        matches.push({ category, feature });
      }
    });
  });

  if (matches.length === 0) {
    const empty = document.createElement("p");
    empty.className = "psg-empty";
    empty.textContent = "일치하는 기능이 없습니다.";
    container.appendChild(empty);
    return;
  }

  matches.forEach(({ category, feature }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "psg-btn psg-btn--feature";
    btn.textContent = feature.impl
      ? `${feature.label} (${category.label})`
      : `${feature.label} (${category.label}, 준비 중)`;
    btn.disabled = !feature.impl;
    btn.addEventListener("click", () => showFeatureDetail(feature.id));
    container.appendChild(btn);
  });
}

function setupSearch() {
  const input = $("#search-input");
  input.addEventListener("input", () => {
    clearPanels();
    const query = input.value.trim().toLowerCase();
    if (!query) {
      renderCategories();
      return;
    }
    renderSearchResults(query);
  });
}

function init() {
  if (initialized) return;
  initialized = true;

  renderCategories();
  setupSearch();
  setStatus("카테고리를 선택해 시작하세요.");
}

entrypoints.setup({
  panels: {
    psgAssistPanel: {
      show() {
        init();
      }
    }
  }
});

// UXP Developer Tool 환경에 따라 panels.show가 호출되기 전에 DOM이 준비될 수 있으므로 보강한다.
if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
