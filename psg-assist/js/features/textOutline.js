/*
 * 기능: 텍스트에 외곽선 넣기 (text / text-outline)
 *
 * 자동 실행 흐름:
 *   활성 레이어에 기본값의 "획(Stroke)" 레이어 스타일을 적용한다.
 *   (레이어 > 레이어 스타일 > 획... 을 검은색 2px, 바깥쪽 위치로 확인한 것과 동일)
 *
 * 주의: 다른 기능과 마찬가지로 batchPlay의 frameFX(Stroke) 디스크립터는
 * 커뮤니티에 알려진 값을 바탕으로 한 뼈대 코드이며, 실제 대상 Photoshop
 * 버전에서 검증이 필요하다.
 */

const { runBatchPlay, runModal, getApp } = require("../batchplay.js");

const meta = {
  id: "text-outline",
  label: "텍스트에 외곽선 넣기",
  summary: "선택한 텍스트(또는 활성 레이어)에 기본값의 획(Stroke) 레이어 스타일을 적용합니다."
};

const guideSteps = [
  {
    title: "1. 텍스트 레이어 선택",
    description: "레이어 패널에서 외곽선을 넣고 싶은 텍스트 레이어를 클릭해 선택하세요.",
    image: null
  },
  {
    title: "2. 레이어 스타일 열기",
    description:
      "레이어 패널 하단의 'fx' 아이콘을 클릭한 뒤 [획(Stroke)]을 선택하세요. 또는 상단 메뉴 [레이어(Layer)] → [레이어 스타일(Layer Style)] → [획(Stroke)]를 클릭합니다.",
    image: null
  },
  {
    title: "3. 획 옵션 조정",
    description: "크기(두께), 위치(안쪽/가운데/바깥쪽), 색상을 조정하며 미리보기로 확인하세요.",
    image: null
  },
  {
    title: "4. 적용 확인",
    description: "확인(OK)을 클릭해 적용합니다. 레이어 패널에 'fx' 아이콘과 함께 '획' 효과가 표시됩니다.",
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
    throw new Error("외곽선을 적용할 레이어를 먼저 선택하세요.");
  }
  return activeLayer;
}

async function autoRun() {
  await runModal("PSG Assist: 텍스트에 외곽선 넣기", async () => {
    await ensureActiveLayer();

    // 활성 레이어에 기본값의 획(Stroke) 레이어 스타일을 설정한다.
    await runBatchPlay([
      {
        _obj: "set",
        _target: [
          { _ref: "property", _property: "layerEffects" },
          { _ref: "layer", _enum: "ordinal", _value: "targetEnum" }
        ],
        to: {
          _obj: "layerEffects",
          scale: { _unit: "percentUnit", _value: 100 },
          frameFX: {
            _obj: "frameFX",
            enabled: true,
            present: true,
            showInDialog: false,
            style: { _enum: "frameStyle", _value: "outsetFrame" },
            paintType: { _enum: "frameFill", _value: "solidColor" },
            mode: { _enum: "blendMode", _value: "normal" },
            opacity: { _unit: "percentUnit", _value: 100 },
            size: { _unit: "pixelsUnit", _value: 2 },
            color: { _obj: "RGBColor", red: 0, grain: 0, blue: 0 }
          }
        }
      }
    ]);
  });
}

module.exports = { meta, guideSteps, autoRun };
