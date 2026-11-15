# 내 회선 수첩 iOS 웹앱

Sites 웹앱 https://mvno-pocket-7602.activefox65.chatgpt.site/ 를 iPhone 내부 WKWebView로 여는 앱입니다. iOS 16 이상 지원.

## GitHub Actions에서 IPA 만들기
1. [Actions](https://github.com/8yyddtwwgs-gif/MVNO-Notebook-IOS/actions/workflows/build-ios.yml)에서 **Build Web Notebook iOS IPA** 선택
2. **Run workflow** 선택 (또는 main 브랜치에 push 시 자동 실행)
3. 성공한 실행의 **Artifacts**에서 `MVNONotebook-unsigned-IPA` 다운로드
4. 압축 해제하면 `MVNONotebook-unsigned.ipa`

**주의:** 이 IPA는 미서명이므로 그대로 iPhone에 설치할 수 없습니다. 실제 설치에는 Apple 계정에 맞는 서명 및 프로비저닝이 필요합니다. GitHub Actions에서 컴파일 성공/실제 iPhone 동작은 별도로 확인해야 합니다.

## 소스
- `project.yml`: XcodeGen 프로젝트 설정
- `Sources/MVNONotebookApp.swift`: 앱 진입
- `Sources/WebNotebook.swift`: WKWebView, 링크 처리
- `Sources/Info.plist`: iOS 앱 메타데이터
- `.github/workflows/build-ios.yml`: macOS 빌드 및 IPA 패키징

Sites 변경사항은 앱을 다시 빌드하지 않아도 웹 페이지 새로고침으로 반영됩니다. 로그인 및 웹사이트 데이터는 해당 사이트의 인증·저장 정책을 따르며 Safari와 로그인 세션이 자동 공유되는 것은 아닙니다. 파일 다운로드, 외부 인증, 데이터 유지 기능은 실제 iPhone에서 테스트해야 합니다.
