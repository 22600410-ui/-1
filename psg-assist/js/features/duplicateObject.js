/*
 * 기능: 오브젝트 복제 (bg-object / duplicate-object)
 *
 * 자동 실행 흐름:
 *   활성 레이어를 복제하고, 복제본을 살짝 오프셋(30px, 30px)해서
 *   원본과 겹치지 않게 배치한다. (레이어 복제 + 이동 툴로 옮기는 것과 동일)
 *
 * 주의: 다른 기능과 마찬가지로 batchPlay 디스크립터는 뼈대 코드이며
 * 실제 Photoshop 버전에서 검증이 필요하다.
 */

const { runBatchPlay, runModal, getApp } = require("../batchplay.js");

const meta = {
  id: "duplicate-object",
  label: "오브젝트 복제",
  summary: "선택한 레이어를 복제하고 살짝 옮겨서 원본과 겹치지 않게 배치합니다."
};

const guideSteps = [
  {
    title: "1. 복제할 레이어 선택",
    description: "레이어 패널에서 복제하고 싶은 오브젝트(도형, 이미지 등)가 있는 레이어를 클릭해 선택하세요.",
    image: null
  },
  {
    title: "2. 레이어 복제",
    description: "Ctrl/Cmd+J를 누르거나 [레이어(Layer)] → [레이어 복제(Duplicate Layer)]를 클릭합니다.",
    image: null
  },
  {
    title: "3. 이동 툴로 위치 조정",
    description: "이동 툴(V)을 선택한 뒤, 복제된 레이어를 드래그하거나 방향키로 옮겨 원하는 위치에 배치하세요.",
    image: null
  },
  {
    title: "4. 필요하면 반복",
    description: "여러 개를 복제하고 싶다면 2~3단계를 반복하거나, Alt/Option 키를 누른 채 드래그하면 복제와 이동을 한 번에 할 수 있습니다.",
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
    throw new Error("복제할 레이어를 먼저 선택하세요.");
  }
  return activeLayer;
}

async function autoRun() {
  await runModal("PSG Assist: 오브젝트 복제", async () => {
    await ensureActiveLayer();

    // 1) 활성 레이어 복제
    await runBatchPlay([
      {
        _obj: "duplicate",
        _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }]
      }
    ]);

    // 2) 복제본을 30px, 30px 만큼 오프셋해서 원본과 겹치지 않게 이동
    await runBatchPlay([
      {
        _obj: "move",
        _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }],
        to: {
          _obj: "offset",
          horizontal: { _unit: "pixelsUnit", _value: 30 },
          vertical: { _unit: "pixelsUnit", _value: 30 }
        }
      }
    ]);
  });
}

module.exports = { meta, guideSteps, autoRun };
