/*
 * 카테고리 / 기능 목록의 단일 원천(source of truth).
 * impl이 있는 기능만 "가이드로 보기"/"자동 실행" 버튼이 활성화된다.
 * 새 기능을 추가하려면 ./features/<기능>.js 를 만들고 여기 등록하면 된다.
 */

const removeBackground = require("./features/removeBackground.js");

const CATEGORIES = [
  {
    id: "bg-object",
    label: "배경 / 오브젝트",
    features: [
      { id: "remove-background", label: removeBackground.meta.label, impl: removeBackground },
      { id: "duplicate-object", label: "오브젝트 복제", impl: null }
    ]
  },
  {
    id: "text",
    label: "텍스트",
    features: [
      { id: "text-shadow", label: "텍스트에 그림자 넣기", impl: null },
      { id: "text-outline", label: "텍스트에 외곽선 넣기", impl: null }
    ]
  },
  {
    id: "color",
    label: "색상 / 보정",
    features: [
      { id: "auto-tone", label: "자동 색상 보정", impl: null },
      { id: "brightness-contrast", label: "밝기/대비 조정", impl: null }
    ]
  },
  {
    id: "layer",
    label: "레이어 정리",
    features: [
      { id: "group-layers", label: "레이어 그룹으로 정리", impl: null },
      { id: "rename-layers", label: "레이어 이름 정리", impl: null }
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
