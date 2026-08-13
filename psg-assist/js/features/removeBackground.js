/*
 * 기능: 배경 제거 (bg-object / remove-background)
 *
 * 자동 실행 흐름:
 *   1) 활성 레이어가 잠긴 배경(Background) 레이어면 일반 레이어로 변환
 *   2) [선택 > 피사체 선택]에 해당하는 batchPlay("autoCutout")로 피사체 자동 선택
 *   3) 선택 반전 → 배경 영역만 선택되도록
 *   4) 선택된 배경 픽셀 삭제(투명화)
 *   5) 선택 해제
 *
 * 주의: batchPlay 디스크립터(_obj 값 등)는 Adobe가 공식적으로 전체를 문서화하지
 * 않으며, Photoshop 버전에 따라 세부 파라미터가 달라질 수 있다. 아래 값은
 * 커뮤니티에 알려진 값을 바탕으로 한 "뼈대" 코드이므로, 실제 대상 Photoshop
 * 버전에서 반드시 동작을 검증하고(필요하면 ScriptListener로 캡처해) 조정하라.
 */

const { runBatchPlay, runModal, getApp } = require("../batchplay.js");

const meta = {
  id: "remove-background",
  label: "배경 제거",
  summary: "피사체를 자동으로 인식해 배경 픽셀을 지우고 투명하게 만듭니다."
};

const guideSteps = [
  {
    title: "1. 레이어 선택",
    description:
      "레이어 패널에서 배경을 제거하고 싶은 이미지 레이어를 클릭해 선택하세요. 배경(Background) 레이어라면 자물쇠 아이콘을 더블 클릭해 잠금을 해제하세요.",
    image: null
  },
  {
    title: "2. 피사체 선택",
    description:
      "상단 메뉴 [선택(Select)] → [피사체(Subject)]를 클릭하면 Photoshop이 인물/사물 등 주요 피사체를 자동으로 인식해 선택 영역을 만듭니다.",
    image: null
  },
  {
    title: "3. 선택 반전",
    description:
      "[선택(Select)] → [반전(Inverse)] (Shift+Ctrl/Cmd+I)을 클릭해 피사체가 아닌 배경 영역만 선택되도록 합니다.",
    image: null
  },
  {
    title: "4. 배경 삭제",
    description:
      "키보드의 Delete(Backspace) 키를 눌러 선택된 배경 픽셀을 지웁니다. 지운 부분은 투명하게 표시됩니다.",
    image: null
  },
  {
    title: "5. 선택 해제 및 확인",
    description:
      "[선택] → [선택 해제] (Ctrl/Cmd+D)로 선택 영역을 해제하고 결과를 확인합니다. 경계가 거칠면 레이어 마스크로 다듬으세요.",
    image: null
  }
];

async function convertBackgroundLayerIfNeeded() {
  const app = getApp();
  const doc = app.activeDocument;
  if (!doc) {
    throw new Error("열려 있는 문서가 없습니다.");
  }
  const activeLayer = doc.activeLayers ? doc.activeLayers[0] : doc.activeLayer;
  if (activeLayer && activeLayer.isBackgroundLayer) {
    await runBatchPlay([
      {
        _obj: "backgroundLayer",
        _target: [{ _ref: "layer", _enum: "ordinal", _value: "targetEnum" }]
      }
    ]);
  }
}

async function autoRun() {
  await runModal("PSG Assist: 배경 제거", async () => {
    await convertBackgroundLayerIfNeeded();

    // 1) 피사체 자동 선택 (메뉴: 선택 > 피사체)
    await runBatchPlay([
      {
        _obj: "autoCutout",
        sampleAllLayers: false
      }
    ]);

    // 2) 선택 반전 (배경 영역만 남도록)
    await runBatchPlay([
      {
        _obj: "invert",
        _target: [{ _ref: "channel", _property: "selection" }]
      }
    ]);

    // 3) 선택된 배경 픽셀 삭제
    await runBatchPlay([{ _obj: "delete" }]);

    // 4) 선택 해제
    await runBatchPlay([
      {
        _obj: "set",
        _target: [{ _ref: "channel", _property: "selection" }],
        to: { _enum: "ordinal", _value: "none" }
      }
    ]);
  });
}

module.exports = { meta, guideSteps, autoRun };
