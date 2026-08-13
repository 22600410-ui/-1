/*
 * 기능: 레이어 이름 정리 (layer / rename-layers)
 *
 * 자동 실행 흐름:
 *   현재 문서의 최상위 레이어들을 위에서부터 "레이어 01", "레이어 02" ... 형식으로
 *   순차적으로 이름을 다시 붙인다.
 *
 * 구현 메모: 이 기능은 batchPlay 디스크립터 대신 UXP Photoshop DOM API
 * (document.layers, layer.name)를 직접 사용한다. 여러 레이어를 순회하며
 * 이름만 바꾸는 단순 작업이라 DOM API가 batchPlay보다 더 간단하고 안정적이다.
 */

const { runModal, getApp } = require("../batchplay.js");

const meta = {
  id: "rename-layers",
  label: "레이어 이름 정리",
  summary: "최상위 레이어 이름을 '레이어 01', '레이어 02' ... 형식으로 한 번에 정리합니다."
};

const guideSteps = [
  {
    title: "1. 정리할 문서 확인",
    description: "레이어가 많아 이름이 뒤섞인 문서를 여세요. 레이어 패널에서 전체 구성을 먼저 살펴보세요.",
    image: null
  },
  {
    title: "2. 레이어 이름 직접 바꾸기",
    description: "레이어 패널에서 이름을 바꾸고 싶은 레이어를 더블 클릭하면 이름을 편집할 수 있습니다. 역할이 드러나는 이름(예: '제목 텍스트', '배경 사진')을 붙이세요.",
    image: null
  },
  {
    title: "3. 규칙적인 이름 규칙 정하기",
    description: "포스터 작업이라면 '배경', '메인이미지', '제목', '부제목', '로고'처럼 역할별 규칙을 정해두면 나중에 찾기 쉽습니다.",
    image: null
  }
];

async function autoRun() {
  await runModal("PSG Assist: 레이어 이름 정리", async () => {
    const app = getApp();
    const doc = app.activeDocument;
    if (!doc) {
      throw new Error("열려 있는 문서가 없습니다.");
    }

    const layers = doc.layers;
    if (!layers || layers.length === 0) {
      throw new Error("정리할 레이어가 없습니다.");
    }

    for (let i = 0; i < layers.length; i += 1) {
      const index = String(i + 1).padStart(2, "0");
      layers[i].name = `레이어 ${index}`;
    }
  });
}

module.exports = { meta, guideSteps, autoRun };
