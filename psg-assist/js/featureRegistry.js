/*
 * 카테고리 / 기능 목록의 단일 원천(source of truth).
 * impl이 있는 기능만 "가이드로 보기"/"자동 실행" 버튼이 활성화된다.
 * 새 기능을 추가하려면 ./features/<기능>.js 를 만들고 여기 등록하면 된다.
 */

const removeBackground = require("./features/removeBackground.js");
const textShadow = require("./features/textShadow.js");
const duplicateObject = require("./features/duplicateObject.js");
const textOutline = require("./features/textOutline.js");
const autoTone = require("./features/autoTone.js");
const brightnessContrast = require("./features/brightnessContrast.js");
const groupLayers = require("./features/groupLayers.js");
const renameLayers = require("./features/renameLayers.js");

const CATEGORIES = [
  {
    id: "bg-object",
    label: "배경 / 오브젝트",
    features: [
      { id: "remove-background", label: removeBackground.meta.label, impl: removeBackground },
      { id: "duplicate-object", label: duplicateObject.meta.label, impl: duplicateObject }
    ]
  },
  {
    id: "text",
    label: "텍스트",
    features: [
      { id: "text-shadow", label: textShadow.meta.label, impl: textShadow },
      { id: "text-outline", label: textOutline.meta.label, impl: textOutline }
    ]
  },
  {
    id: "color",
    label: "색상 / 보정",
    features: [
      { id: "auto-tone", label: autoTone.meta.label, impl: autoTone },
      { id: "brightness-contrast", label: brightnessContrast.meta.label, impl: brightnessContrast }
    ]
  },
  {
    id: "layer",
    label: "레이어 정리",
    features: [
      { id: "group-layers", label: groupLayers.meta.label, impl: groupLayers },
      { id: "rename-layers", label: renameLayers.meta.label, impl: renameLayers }
    ]
  }
];

function findFeature(featureId) {
  for (const category of CATEGORIES) {
    const feature = category.features.find((f) => f.id === featureId);
    if (feature) {
      return { category, feature };
    }
  }
  return null;
}

module.exports = { CATEGORIES, findFeature };
