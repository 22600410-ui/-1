# PSG Assist (Photoshop Guide Assist)

포토샵을 처음 접하거나 익숙하지 않은 사람이 홍보용 포스터를 쉽게 만들 수 있도록 돕는
**목적 기반 가이드 패널** Photoshop UXP 플러그인입니다.

사용자가 "배경 제거하고 싶어요", "텍스트에 그림자 넣고 싶어요" 같은 목적을 고르면:

- **가이드 모드**: 해당 기능의 위치와 클릭 순서를 텍스트/이미지로 안내
- **자동 모드**: `batchPlay` API로 해당 작업을 원클릭으로 실행

두 가지 방식을 제공합니다.

## 현재 구현 상태

| 카테고리 | 기능 | 상태 |
| --- | --- | --- |
| 배경 / 오브젝트 | 배경 제거 | ✅ 가이드 + 자동 실행 구현 완료 |
| 배경 / 오브젝트 | 오브젝트 복제 | ✅ 가이드 + 자동 실행 구현 완료 |
| 텍스트 | 텍스트에 그림자 넣기 | ✅ 가이드 + 자동 실행 구현 완료 |
| 텍스트 | 텍스트에 외곽선 넣기 | ✅ 가이드 + 자동 실행 구현 완료 |
| 색상 / 보정 | 자동 색상 보정 | ✅ 가이드 + 자동 실행 구현 완료 |
| 색상 / 보정 | 밝기/대비 조정 | ✅ 가이드 + 자동 실행 구현 완료 |
| 레이어 정리 | 레이어 그룹으로 정리 | ✅ 가이드 + 자동 실행 구현 완료 |
| 레이어 정리 | 레이어 이름 정리 | ✅ 가이드 + 자동 실행 구현 완료 |

8개 기능 모두 가이드 모드와 자동 실행 모드가 구현되어 있습니다.
새 기능을 추가하려면 [기능 추가 방법](#기능-추가-방법)을 참고하세요.

## 프로젝트 구조

```
psg-assist/
├── manifest.json          # 플러그인 매니페스트 (진입점, 권한, 패널 UI 정의)
├── index.html              # 패널 기본 레이아웃
├── css/
│   └── main.css             # Spectrum 톤을 참고한 패널 스타일
├── js/
│   ├── main.js               # UI 컨트롤러 (entrypoints 초기화, 화면 전환)
│   ├── batchplay.js           # photoshop.action.batchPlay / core.executeAsModal 래퍼
│   ├── featureRegistry.js     # 카테고리·기능 목록 (단일 원천)
│   └── features/
│       ├── removeBackground.js    # 배경 제거
│       ├── duplicateObject.js      # 오브젝트 복제
│       ├── textShadow.js            # 텍스트에 그림자 넣기
│       ├── textOutline.js            # 텍스트에 외곽선 넣기
│       ├── autoTone.js                # 자동 색상 보정
│       ├── brightnessContrast.js       # 밝기/대비 조정
│       ├── groupLayers.js               # 레이어 그룹으로 정리
│       └── renameLayers.js               # 레이어 이름 정리
├── assets/
│   └── guides/                # 가이드 단계 스크린샷을 넣는 자리 (선택)
├── package.json
└── README.md
```

## manifest.json 핵심 내용

- `id`: `com.psgassist.plugin`
- `host.app`: `PS`, `host.minVersion`: `24.0.0` (Photoshop 24.0 이상 필요)
- `entrypoints`: `panel` 타입 1개 (`psgAssistPanel`)
- **permissions**: 로컬 파일 시스템, 클립보드, 네트워크, 외부 프로세스 실행 등을
  전혀 요청하지 않습니다. `requiredPermissions` 자체를 선언하지 않았는데, 이 플러그인이
  쓰는 `require("photoshop")`의 `app` / `action.batchPlay` / `core` API는 UXP의
  `requiredPermissions`가 아니라 Photoshop이 패널 진입점에 기본 제공하는 스크립팅 API라
  별도 권한 선언이 필요 없기 때문입니다. 파일 접근, 클립보드, 네트워크 등을 쓰는 기능을
  추가할 때만 `requiredPermissions`를 추가하면 됩니다.

## "배경 제거" 기능 동작 방식

- **가이드 모드**: `js/features/removeBackground.js`의 `guideSteps` 배열(레이어 선택 →
  피사체 선택 → 선택 반전 → 삭제 → 선택 해제)을 패널에 순서대로 렌더링합니다.
- **자동 모드**: `autoRun()`이 `core.executeAsModal` 안에서 다음 순서로 `batchPlay`를 호출합니다.
  1. 활성 레이어가 잠긴 배경 레이어면 일반 레이어로 변환
  2. `_obj: "autoCutout"` → 메뉴의 [선택 > 피사체]에 해당, 피사체 자동 선택
  3. 선택 반전 → 배경 영역만 선택
  4. 선택된 픽셀 삭제(투명화)
  5. 선택 해제

> ⚠️ **주의**: `batchPlay` 디스크립터(`_obj` 값과 파라미터)는 Adobe가 전체를 공식
> 문서화하지 않으며 Photoshop 버전에 따라 세부 동작이 달라질 수 있습니다. 위 코드는
> 커뮤니티에 알려진 값을 바탕으로 한 뼈대(skeleton) 구현이므로, 실제 대상 Photoshop
> 버전에서 반드시 동작을 검증하고 필요하면 ScriptListener 플러그인으로 실제 액션을
> 캡처해 값을 맞춰야 합니다.

## "텍스트에 그림자 넣기" 기능 동작 방식

- **가이드 모드**: `js/features/textShadow.js`의 `guideSteps` 배열(텍스트 레이어 선택 →
  레이어 스타일 열기 → 옵션 조정 → 적용 확인)을 패널에 순서대로 렌더링합니다.
- **자동 모드**: `autoRun()`이 `core.executeAsModal` 안에서 활성 레이어에 기본값의
  그림자(Drop Shadow) 레이어 스타일 하나를 `batchPlay`로 바로 적용합니다.
  (레이어 스타일 대화상자를 열지 않고 기본값을 그대로 확인한 것과 동일한 결과)

> ⚠️ 위와 동일하게 `dropShadow` 디스크립터도 커뮤니티에 알려진 값 기반의 뼈대이며,
> RGBColor의 `grain` 키는 오타가 아니라 green 채널이 Action Manager에서 흔히 이렇게
> 나타나는 잘 알려진 특이사항입니다. 실제 버전에서 검증하세요.

## 나머지 기능 동작 방식 요약

| 기능 | 파일 | 자동 실행이 하는 일 |
| --- | --- | --- |
| 오브젝트 복제 | `js/features/duplicateObject.js` | 활성 레이어를 `duplicate`로 복제하고 30px, 30px 오프셋 이동 |
| 텍스트에 외곽선 넣기 | `js/features/textOutline.js` | 활성 레이어에 기본값(검정 2px, 바깥쪽)의 획(Stroke, `frameFX`) 레이어 스타일 적용 |
| 자동 색상 보정 | `js/features/autoTone.js` | `_obj: "autoTone"` 한 번 호출 ([이미지 > 자동 톤]과 동일) |
| 밝기/대비 조정 | `js/features/brightnessContrast.js` | `_obj: "brightnessEvent"`로 밝기 +10, 대비 +10 적용 |
| 레이어 그룹으로 정리 | `js/features/groupLayers.js` | 선택된 레이어(들)를 `make layerSection`으로 그룹화 (Ctrl/Cmd+G와 동일) |
| 레이어 이름 정리 | `js/features/renameLayers.js` | batchPlay 대신 UXP DOM API(`document.layers`, `layer.name`)로 최상위 레이어 이름을 "레이어 01", "레이어 02" ... 순으로 재설정 |

배경 제거/텍스트 그림자와 마찬가지로 위 batchPlay 디스크립터들도 커뮤니티에 알려진
값을 바탕으로 한 뼈대 코드이므로, 실제 대상 Photoshop 버전에서 검증이 필요합니다.

## 기능 추가 방법

1. `js/features/<featureId>.js` 파일을 만들고 `meta`, `guideSteps`, `autoRun`을 export합니다.
   (`js/features/removeBackground.js`를 템플릿으로 복사해서 시작하면 편합니다.)
2. `js/featureRegistry.js`의 해당 카테고리 `features` 배열에서 `impl: null`을
   새로 만든 모듈로 바꿔줍니다.
3. UI(가이드 버튼, 자동 실행 버튼, 목록 노출)는 `impl`이 채워지는 즉시 자동으로 활성화됩니다.

## 개발 환경 준비

### 1. Node.js

이 저장소를 확인한 환경의 Node.js 버전:

```
$ node --version
v22.22.2
```

Photoshop UXP 플러그인 자체는 Photoshop 내장 JS 엔진에서 실행되므로 Node.js가
플러그인 실행에 직접 필요하지는 않습니다. Node.js는 `npm run validate-manifest` 같은
로컬 개발 스크립트, 이후 린터/번들러를 추가할 때 필요합니다. LTS 최신 버전(18 이상)이면
충분합니다.

### 2. UXP Developer Tool (UDT) 설치 여부 확인

UDT가 설치되어 있는지는 다음 중 하나로 확인할 수 있습니다.

- macOS: `Applications` 폴더에 **Adobe UXP Developer Tool** 앱이 있는지 확인
- Windows: 시작 메뉴에서 "UXP Developer Tool" 검색

설치되어 있지 않다면 (설치는 직접 진행해 주세요):

1. Creative Cloud 데스크톱 앱을 실행합니다.
2. 좌측 메뉴에서 **Stock & Marketplace → 앱** 또는 검색창에서 `UXP Developer Tool`을 검색합니다.
3. **설치**를 클릭합니다.
4. 또는 Adobe 공식 UXP 개발자 문서(https://developer.adobe.com/photoshop/uxp/)에서
   최신 설치 안내를 확인할 수 있습니다.

### 3. 로컬 사이드로드 테스트 방법

1. Photoshop **24.0 이상**을 실행합니다.
2. UXP Developer Tool(UDT)을 실행하고, Photoshop과 동일한 Adobe ID로 로그인되어 있는지 확인합니다.
3. UDT에서 **Add Plugin** 버튼을 클릭하고, 이 프로젝트의 `psg-assist/manifest.json` 파일을 선택합니다.
4. 플러그인 목록에 `PSG Assist`가 추가되면, 해당 항목의 **Load**(▶) 버튼을 클릭해 Photoshop에 로드합니다.
5. Photoshop 메뉴 **Plugins**(플러그인) → **PSG Assist**에서 패널을 열 수 있습니다. (패널이 안 보이면
   `Window > Plugins`도 확인하세요.)
6. 코드를 수정하는 동안 UDT의 **Watch** 토글을 켜두면 파일 저장 시 패널이 자동으로 새로고침됩니다.
7. 문제가 생기면 UDT에서 플러그인 항목을 우클릭 → **Inspect**를 선택하면 개발자 도구(콘솔)가 열려
   `console.log` / 오류 메시지를 확인할 수 있습니다.

### 유효성 검사

```bash
npm run validate-manifest
```

`manifest.json`이 유효한 JSON인지만 빠르게 확인합니다.

## 다음 단계 (제안)

- 8개 기능 모두 실제 Photoshop에서 검증 (레이어 종류, 문서 상태별 예외 처리 보강)
- `assets/guides/`에 실제 스크린샷 추가
- 카테고리/기능을 더 추가하고 싶다면 [기능 추가 방법](#기능-추가-방법) 참고
- 필요 시 ESLint/Prettier, TypeScript, 번들러(esbuild 등) 도입
