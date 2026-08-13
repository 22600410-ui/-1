# 가이드 스크린샷 자리

가이드 모드 단계 카드에 이미지를 붙이고 싶다면, 이 폴더에 스크린샷(PNG/JPG)을 추가하고
해당 기능의 `js/features/*.js` 파일 안 `guideSteps` 배열에서 `image` 값을
파일 경로(예: `"../../assets/guides/remove-background-step2.png"`)로 채우면 됩니다.

`image`가 `null`이면 텍스트 설명만 표시됩니다.
