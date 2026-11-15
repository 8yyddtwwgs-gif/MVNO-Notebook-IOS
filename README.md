# 내 회선 수첩 · 기존 Sites 웹 전용 iOS 프로젝트

## 지금 제공되는 것
- **IPA 완성본이 아니라 Xcode 소스 프로젝트입니다.** 이 환경은 Linux이며 Xcode/iOS SDK가 없어 iPhone 앱 컴파일·설치 검증을 실행하지 못했습니다.
- 기존 웹사이트 `https://mvno-pocket-7602.activefox65.chatgpt.site/`만 엽니다. Android 앱 포팅이나 별도의 회선 데이터베이스는 없습니다.
- iOS 16 이상, iPhone/iPad 대상입니다. Safari 기반 시스템 브라우저(SFSafariViewController)로 웹사이트를 표시합니다. Safari의 상·하단 브라우저 UI가 나타날 수 있습니다.
- 앱 실행 시 웹 수첩이 자동으로 열립니다. 닫으면 다시 여는 버튼과 Safari에서 여는 버튼이 보입니다.
- 기존 사이트가 업데이트되면 웹 내용도 최신 버전을 사용합니다. 인터넷 연결이 필요합니다.
- 로그인, 백업 다운로드, 북마크 수집, 외부 링크의 실제 iPhone 동작은 Mac 빌드 후 실기기 검증이 필요합니다. 로그인 화면이 앱 내 브라우저에서 제한되면 ‘Safari에서 열기’를 사용하세요. 로그인 세션을 강제로 공유하거나 쿠키를 추출하지 않습니다.

## Mac에서 설치용으로 빌드
1. `NotebookWeb.xcodeproj`를 Xcode에서 엽니다. 추가 패키지는 필요 없습니다.
2. `NotebookWeb` target의 Signing & Capabilities에서 본인 Apple 계정의 Team을 선택합니다.
3. Bundle Identifier를 본인이 사용할 고유 값으로 바꿉니다. 기본값은 `com.mvnonotebook.web`입니다.
4. 연결한 iPhone을 선택해 Run으로 실행하고 사이트 로그인·데이터 표시를 확인합니다.
5. IPA가 필요한 배포 방식이라면 Product → Archive → Distribute App에서 본인 계정에 가능한 방식으로 내보냅니다. 배포용 인증서/프로비저닝이 필요할 수 있습니다.

## Mac 없이 GitHub Actions로 미서명 IPA 생성
1. 이 폴더의 **내용 전체**를 본인 GitHub 저장소 루트에 넣습니다. 숨겨진 `.github/workflows/build-ios.yml`도 포함해야 합니다.
2. Actions에서 `Build web-only iOS IPA`를 실행합니다. 저장소에 올리면 push로도 실행됩니다.
3. 성공하면 `WebNotebook-unsigned-IPA` artifact 안에서 `WebNotebook-unsigned.ipa`를 받습니다.
4. **미서명 IPA는 그대로 설치할 수 없습니다.** 개인 서명/재서명 또는 정식 Apple 배포 서명이 별도로 필요합니다. Apple 계정 비밀번호, 인증서, 프로비저닝 파일을 채팅이나 저장소에 올리지 마세요.

이미 Sites 소스 저장소를 일반 GitHub로 가져온 경우에는 `ios-web-wrapper/` 하위 폴더도 빌드 스크립트가 인식합니다. 다만 해당 workflow 파일은 GitHub 저장소 루트의 `.github/workflows/` 안에 있어야 실행됩니다.

## 로컬 명령
```bash
bash scripts/build-unsigned.sh
```
Mac의 Xcode로 실제 바이너리를 만든 뒤 `build/WebNotebook-unsigned.ipa`를 생성합니다. Linux에서는 오류를 출력하고 종료하며 가짜 IPA를 만들지 않습니다.

```bash
python3 scripts/validate-project.py
```
프로젝트 구조, 파일 참조, plist, scheme, 아이콘 크기를 검사합니다. 이 검사는 Xcode 컴파일이나 실기기 테스트를 대신하지 않습니다.

## 웹 범위와 데이터
- 이 앱은 기존 Sites 주소를 표시하는 최소 웹 전용 컨테이너입니다.
- 기존 사이트의 접근 권한·계정별 저장·연결코드·동기화 정책은 변경하지 않습니다.
- 앱에 비밀번호, 서비스 토큰, 계정 우회 헤더, 사용자 회선 기록을 포함하지 않습니다.
- `PrivacyInfo.xcprivacy`는 네이티브 컨테이너가 별도 추적/데이터 수집 API를 사용하지 않음을 나타냅니다. 웹사이트 자체의 계정·개인정보 처리는 별개이며, 배포 전 실제 운영 정책에 맞게 검토해야 합니다.
- App Store 심사 통과나 배포 방식 사용 가능 여부는 보장하지 않습니다. 이 파일은 앱스토어 제출·공개 배포를 자동 실행하지 않습니다.

## 공식 참고
- Apple: https://developer.apple.com/documentation/xcode/distributing-your-app-to-registered-devices/
- Apple: https://developer.apple.com/documentation/safariservices/sfsafariviewcontroller
- Apple: https://help.apple.com/xcode/mac/current/en.lproj/dev23ea8b877.html

준비일: 2026-11-15. 검증 상태: 구조·구문 검사만 수행; Xcode 컴파일 / 서명 / iPhone 설치 / 로그인은 미검증.
