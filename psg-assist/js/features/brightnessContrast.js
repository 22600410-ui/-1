/*
 * 기능: 밝기/대비 조정 (color / brightness-contrast)
 *
 * 자동 실행 흐름:
 *   메뉴 [이미지(Image)] → [조정(Adjustments)] → [밝기/대비(Brightness/Contrast)]에서
 *   밝기 +10, 대비 +10을 적용하고 확인한 것과 동일한 batchPlay 명령을 실행한다.
 *   (조정 레이어가 아니라 픽셀에 직접 적용되는 "이벤트" 방식)
 *
 * 주의: 다른 기능과 마찬가지로 batchPlay 디스크립터는 뼈대 코드이며
 * 실제 Photoshop 버전에서 검증이 필요하다.
 */

const { runBatchPlay, runModal, getApp } = require("../batchplay.js");

const meta = {
  id: "brightness-contrast",
  label: "밝기/대비 조정",
  summary: "활성 레이어에 밝기와 대비를 소폭(+10) 자동으로 조정합니다."
};

const guideSteps = [
  {
    title: "1. 조정할 레이어 선택",
    description: "레이어 패널에서 밝기/대비를 조정하고 싶은 레이어를 클릭해 선택하세요.",
    image: null
  },
  {
    title: "2. 밝기/대비 대화상자 열기",
    description: "상단 메뉴 [이미지(Image)] → [조정(Adjustments)] → [밝기/대비(Brightness/Contrast)]를 클릭합니다.",
    image: null
  },
  {
    title: "3. 슬라이더 조정",
    description: "밝기(Brightness)와 대비(Contrast) 슬라이더를 원하는 값으로 드래그하며 미리보기로 확인하세요.",
    image: null
  },
  {
    title: "4. 적용 확인",
    description: "확인(OK)을 클릭해 적용합니다. 필요하면 [편집(Edit)] → [소멸(Fade)]로 강도를 낮출 수 있습니다.",
    image: null
  }
];

async function ensureActiveLayer() {
  const app = getApp();
  const doc = app.activeDocument;
  if (!doc) {
    throw new Error("열려 있는 문서가 없습니다.");
  }
  const activeLayer = doc.activeLayers ? doc.activeLayers[0] : doc.activeLayer;
  if (!activeLayer) {
    throw new Error("조정할 레이어를 먼저 선택하세요.");
  }
  return activeLayer;
}

async function autoRun() {
  await runModal("PSG Assist: 밝기/대비 조정", async () => {
    await ensureActiveLayer();

    await runBatchPlay([
      {
        _obj: "brightnessEvent",
        brightness: 10,
        center: 10,
        useLegacy: false
      }
    ]);
  });
}

module.exports = { meta, guideSteps, autoRun };
