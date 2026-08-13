/*
 * 기능: 텍스트에 그림자 넣기 (text / text-shadow)
 *
 * 자동 실행 흐름:
 *   활성 레이어에 기본값의 "그림자(Drop Shadow)" 레이어 스타일을 적용한다.
 *   (레이어 > 레이어 스타일 > 그림자... 를 기본값 그대로 확인한 것과 동일한 효과)
 *
 * 주의: batchPlay 디스크립터는 Adobe가 공식적으로 전체를 문서화하지 않으며
 * Photoshop 버전에 따라 세부 파라미터가 달라질 수 있다. 아래 값은 커뮤니티에
 * 널리 알려진 값을 바탕으로 한 "뼈대" 코드이므로 실제 대상 Photoshop 버전에서
 * 반드시 검증하라. RGBColor 디스크립터의 "grain" 키는 오타가 아니라, green
 * 채널의 내부 charID("Grn ")가 변환될 때 흔히 이렇게 나타나는 Photoshop
 * Action Manager의 잘 알려진 특이사항이다.
 */

const { runBatchPlay, runModal, getApp } = require("../batchplay.js");

const meta = {
  id: "text-shadow",
  label: "텍스트에 그림자 넣기",
  summary: "선택한 텍스트(또는 활성 레이어)에 기본값의 그림자 레이어 스타일을 적용합니다."
};

const guideSteps = [
  {
    title: "1. 텍스트 레이어 선택",
    description: "레이어 패널에서 그림자를 넣고 싶은 텍스트 레이어를 클릭해 선택하세요.",
    image: null
  },
  {
    title: "2. 레이어 스타일 열기",
    description:
      "레이어 패널 하단의 'fx' 아이콘을 클릭한 뒤 [그림자(Drop Shadow)]를 선택하세요. 또는 상단 메뉴 [레이어(Layer)] → [레이어 스타일(Layer Style)] → [그림자(Drop Shadow)]를 클릭합니다.",
    image: null
  },
  {
    title: "3. 그림자 옵션 조정",
    description:
      "'레이어 스타일' 대화상자에서 각도, 거리, 스프레드, 크기, 불투명도를 조정하며 미리보기로 확인하세요.",
    image: null
  },
  {
    title: "4. 적용 확인",
    description:
      "확인(OK)을 클릭해 적용합니다. 레이어 패널의 해당 레이어 아래에 'fx' 아이콘과 함께 '그림자' 효과가 표시됩니다.",
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
    throw new Error("그림자를 적용할 레이어를 먼저 선택하세요.");
  }
  return activeLayer;
}

async function autoRun() {
  await runModal("PSG Assist: 텍스트에 그림자 넣기", async () => {
    await ensureActiveLayer();

    // 활성 레이어에 기본값의 그림자(Drop Shadow) 레이어 스타일을 설정한다.
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
          dropShadow: {
            _obj: "dropShadow",
            enabled: true,
            present: true,
            showInDialog: false,
            mode: { _enum: "blendMode", _value: "multiply" },
            color: { _obj: "RGBColor", red: 0, grain: 0, blue: 0 },
            opacity: { _unit: "percentUnit", _value: 75 },
            useGlobalAngle: true,
            localLightingAngle: { _unit: "angleUnit", _value: 120 },
            distance: { _unit: "pixelsUnit", _value: 5 },
            chokeMatte: { _unit: "pixelsUnit", _value: 0 },
            blur: { _unit: "pixelsUnit", _value: 5 },
            noise: { _unit: "percentUnit", _value: 0 },
            antialiasGloss: false,
            layerConceals: true
          }
        }
      }
    ]);
  });
}

module.exports = { meta, guideSteps, autoRun };
