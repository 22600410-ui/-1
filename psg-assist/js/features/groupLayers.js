/*
 * 기능: 레이어 그룹으로 정리 (layer / group-layers)
 *
 * 자동 실행 흐름:
 *   현재 선택된 레이어(들)를 하나의 그룹(폴더)으로 묶는다.
 *   (레이어 패널에서 Shift/Ctrl+클릭으로 여러 레이어를 선택한 뒤
 *   Ctrl/Cmd+G를 누르는 것과 동일)
 *
 * 주의: 다른 기능과 마찬가지로 batchPlay 디스크립터는 뼈대 코드이며
 * 실제 Photoshop 버전에서 검증이 필요하다.
 */

const { runBatchPlay, runModal, getApp } = require("../batchplay.js");

const meta = {
  id: "group-layers",
  label: "레이어 그룹으로 정리",
  summary: "선택한 레이어들을 하나의 그룹(폴더)으로 묶어 레이어 패널을 정리합니다."
};

const guideSteps = [
  {
    title: "1. 그룹으로 묶을 레이어 선택",
    description: "레이어 패널에서 Ctrl/Cmd+클릭 또는 Shift+클릭으로 그룹으로 묶고 싶은 레이어를 여러 개 선택하세요.",
    image: null
  },
  {
    title: "2. 그룹 만들기",
    description: "Ctrl/Cmd+G를 누르거나 상단 메뉴 [레이어(Layer)] → [그룹화(Group Layers)]를 클릭합니다.",
    image: null
  },
  {
    title: "3. 그룹 이름 정리",
    description: "새로 생긴 그룹 폴더를 더블 클릭해 알아보기 쉬운 이름(예: '텍스트', '배경')으로 바꾸세요.",
    image: null
  }
];

async function ensureSelection() {
  const app = getApp();
  const doc = app.activeDocument;
  if (!doc) {
    throw new Error("열려 있는 문서가 없습니다.");
  }
  const activeLayers = doc.activeLayers || (doc.activeLayer ? [doc.activeLayer] : []);
  if (!activeLayers.length) {
    throw new Error("그룹으로 묶을 레이어를 먼저 선택하세요.");
  }
  return activeLayers;
}

async function autoRun() {
  await runModal("PSG Assist: 레이어 그룹으로 정리", async () => {
    await ensureSelection();

    // 선택된 레이어(들)를 그룹으로 묶는다.
    await runBatchPlay([
      {
        _obj: "make",
        _target: [{ _ref: "layerSection" }],
        from: { _ref: "layer", _enum: "ordinal", _value: "targetEnum" }
      }
    ]);
  });
}

module.exports = { meta, guideSteps, autoRun };
