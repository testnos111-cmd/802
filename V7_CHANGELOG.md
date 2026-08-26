# v7 변경사항

1. HTTPDBG의 `res.send()`/`res.json()` 중복 캡처 제거. 실제 wire response byte만 기록.
2. `/download/default/version.json` 전용 route 추가.
3. mainVersion/googlePlayMainVersion/kakaoGameShopVersion = 8.019.
4. 외부 스토어 링크는 공란으로 변경해 버전 단계에서 외부 URL로 빠질 가능성을 제거.
5. `Content-Length`, `Content-Type`, `Cache-Control: no-store`를 명시.
6. 기존 API/게임 서버 코드는 그 외 변경하지 않음.
