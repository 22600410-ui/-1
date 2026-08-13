/*
 * 기능: 자동 색상 보정 (color / auto-tone)
 *
 * 자동 실행 흐름:
 *   메뉴 [이미지(Image)] → [자동 톤(Auto Tone)] (Shift+Ctrl/Cmd+L)과 동일한
 *   batchPlay 명령 하나를 문서 전체에 실행한다. 대상 레이어의 명암/색 균형을
 *   Photoshop이 자동으로 분석해 보정한다.
 *
 * 주의: 다른 기능과 마찬가지로 batchPlay 디스크립터는 뼈대 코드이며
 * 실제 Photoshop 버전에서 검증이 필요하다. (autoTone은 비교적 단순하고
 * 널리 알려진 명령이라 다른 레이어 스타일 디스크립터보다 안정적인 편이다.)
 */

const { runBatchPlay, runModal, getApp } = require("../batchplay.js");

const meta = {
  id: "auto-tone",
  label: "자동 색상 보정",
  summary: "Photoshop이 이미지의 명암과 색 균형을 자동으로 분석해 한 번에 보정합니다."
};

const guideSteps = [
  {
    title: "1. 보정할 레이어/문서 선택",
    description: "레이어 패널에서 보정하고 싶은 이미지 레이어를 클릭해 선택하세요.",
    image: null
  },
  {
    title: "2. 자동 톤 실행",
    description: "상단 메뉴 [이미지(Image)] → [자동 톤(Auto Tone)] (단축키 Shift+Ctrl/Cmd+L)을 클릭합니다.",
    image: null
  },
  {
    title: "3. 결과 확인",
    description: "적용 결과가 마음에 들지 않으면 Ctrl/Cmd+Z로 되돌리고, [이미지] → [조정(Adjustments)]의 세부 메뉴로 직접 조정하세요.",
    image: null
  }
];

async function ensureActiveDocument() {
  const app = getApp();
  const doc = app.activeDocument;
  if (!doc) {
    throw new Error("열려 있는 문서가 없습니다.");
  }
  return doc;
}

async function autoRun() {
  await runModal("PSG Assist: 자동 색상 보정", async () => {
    await ensureActiveDocument();

    await runBatchPlay([{ _obj: "autoTone" }]);
  });
}

module.exports = { meta, guideSteps, autoRun };
