# FlowShip

FlowShip는 GitHub Actions를 통해 배포하는 프론트엔드 프로젝트를 위한 멀티 레포지토리 배포 컨트롤 센터입니다.

GitHub 레포지토리를 등록하면, FlowShip이 GitHub Actions의 실제 워크플로우 실행·잡·스텝 데이터를 조회하여 배포 진행 상황, 파이프라인 의존성 흐름, 실패 원인 진단, 배포 타겟 URL 상태를 시각화합니다.

## 개발 히스토리

FlowShip은 대시보드 레이아웃과 정보 구조를 검증하기 위한 목(mock) 데이터 프로토타입으로 시작했습니다. 이후 GitHub Actions API 기반의 실제 데이터 대시보드로 전환되었습니다.

최종 대시보드는 목 배포 데이터를 사용하지 않습니다. GitHub Actions 데이터를 가져올 수 없는 경우, 가짜 데이터 대신 로딩·오류·빈 상태를 표시합니다.

## 라이브 주소

Amplify:

```txt
https://main.d1cvodkenfaorb.amplifyapp.com
```

S3 정적 웹사이트:

```txt
http://mybucket-20263620.s3-website-us-east-1.amazonaws.com
```

## 주요 기능

- 소유자·레포·브랜치·토큰을 포함한 멀티 레포지토리 설정
- GitHub API를 통한 레포지토리 목록 불러오기
- GitHub Actions 워크플로우 실행 내역 조회
- 워크플로우 잡 및 스텝 조회
- 실제 잡/스텝 기반 파이프라인 의존성 그래프 (Figma 스타일 pan/zoom 지원)
- 실패 원인 진단 및 권장 조치
- 실제 API 데이터 기반 워크플로우 실행 메트릭
- 실패 잡/스텝 상세 정보
- S3 및 Amplify 배포 타겟 URL 링크
- 브라우저 기반 배포 타겟 상태 확인 (no-cors 방식)
- 사용자별 브라우저 로컬 레포지토리 설정 분리를 위한 로컬 워크스페이스 계정
- GitHub 토큰 제공 시 비공개·조직 레포지토리 조회
- GitHub `/user` API를 통한 토큰 유효성 검사
- 로딩·오류·빈 상태·성공 상태 처리
- 라이트/다크 테마 토글 (localStorage 유지)

## 기술 스택

- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- Zustand
- Recharts
- Lucide React
- GitHub Actions
- AWS S3
- AWS Amplify

## 아키텍처

FlowShip은 서버 상태, 영속 클라이언트 상태, 로컬 컴포넌트 상태를 분리합니다.

- **TanStack Query** — GitHub API 서버 상태 관리:
  - 워크플로우 실행 내역
  - 워크플로우 잡 및 스텝
  - 레포지토리별 최신 실행 요약
  - 워크플로우 목록
  - 배포 타겟 상태 확인
- **Zustand** — 클라이언트 UI 및 영속 설정 관리:
  - 등록된 레포지토리 목록
  - 활성 레포지토리
  - 선택된 워크플로우 실행
  - 로컬 워크스페이스 인증 세션
  - 라이트/다크 테마
- **React `useState`** — 로컬 폼 및 위젯 상태

GitHub Actions API 클라이언트는 `src/features/github-actions/api`에, 레포지토리 설정은 `src/features/repository`에 위치합니다.

## 로컬 워크스페이스 계정

FlowShip은 프론트엔드 전용 데모이므로, 실제 백엔드 인증 대신 로컬 워크스페이스 계정을 사용합니다.

- 브라우저에서 로컬로 회원가입 및 로그인 가능
- 비밀번호는 평문이 아닌 이메일을 포함한 SHA-256 해시로 저장
- 레포지토리 설정은 `localStorage`에서 로컬 사용자별로 분리 저장
- 프로덕션 수준의 인증이 아닙니다. 실제 서비스에서는 백엔드 인증, 보안 세션, GitHub OAuth 또는 백엔드 프록시를 사용하세요.

## 비공개 및 조직 레포지토리

공개 레포지토리는 토큰 없이 불러올 수 있습니다. GitHub 토큰을 입력하면 `GET /user`로 토큰을 검증한 뒤, `GET /user/repos?visibility=all&affiliation=owner,collaborator,organization_member`를 사용하여 소유·협업·비공개·조직 멤버 레포지토리를 모두 조회할 수 있습니다.

토큰 권한 안내:

- Fine-grained 토큰: Repository 접근 및 Actions 읽기 권한 확인
- Classic 토큰: `repo`, `workflow`, `read:org` 권한 필요할 수 있음
- 토큰 값은 UI에 직접 표시되지 않습니다.
- 토큰은 레포지토리 설정의 일부로 이 브라우저의 localStorage에만 저장됩니다. 민감 정보로 취급하세요.
- 프로덕션 환경에서는 GitHub OAuth 또는 백엔드 프록시를 권장합니다.

## 컨트롤 센터 레이아웃

대시보드는 전체 폭 배포 컨트롤 센터로 설계되어 있습니다:

- **왼쪽 패널**: 프로젝트 개요 및 레포지토리 목록
- **중앙 패널**: 활성 레포지토리의 파이프라인 의존성 그래프 (pan/zoom 캔버스) 및 선택 노드 상세 정보
- **오른쪽 패널**: 실패 진단, 잡 및 스텝 상세, 배포 헬스, 워크플로우 메트릭
- **탭 전환**: 인스펙트 영역은 파이프라인·잡·메트릭·진단·헬스 탭으로 구성

레이아웃은 *현재 무엇이 배포 중인지*, *어디서 멈추거나 실패했는지*, *다음에 무엇을 해야 하는지*를 빠르게 파악하는 데 초점을 맞추고 있습니다.

## 보안 참고 사항

- GitHub 토큰은 선택 사항입니다.
- 공개 레포지토리는 토큰 없이 조회 가능합니다.
- 비공개·조직 레포지토리 또는 API 요청 제한 우회를 위해 토큰이 필요할 수 있습니다.
- 토큰 값은 UI에 직접 표시되지 않습니다.
- 브라우저 localStorage는 안전한 시크릿 저장소가 아닙니다. 프론트엔드 전용 데모에서 토큰을 신중하게 사용하세요.
- 프로덕션 서비스에서는 OAuth 또는 백엔드 프록시 방식을 권장합니다.
- AWS Access Key ID 및 AWS Secret Access Key는 프론트엔드에서 요청하지 않습니다.
- FlowShip은 브라우저에서 AWS SDK를 사용하지 않습니다.
- S3 및 Amplify 지원은 대시보드의 URL 기반으로 동작합니다.

## 시작하기

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

## 사용 방법

1. 로컬 워크스페이스 계정으로 회원가입 또는 로그인합니다.
2. GitHub 레포지토리를 하나 이상 추가합니다.
3. GitHub 소유자(owner)를 입력합니다.
4. 비공개 또는 조직 레포지토리 접근을 위해 선택적으로 GitHub 토큰을 입력하고 검증합니다.
5. GitHub API에서 레포지토리 목록을 불러오거나, 직접 레포지토리 정보를 입력합니다.
6. 레포지토리를 선택하고 브랜치를 확인합니다.
7. 선택적으로 S3 Website URL과 Amplify URL을 입력합니다.
8. 프로젝트 목록에서 활성 레포지토리를 선택합니다.
9. 파이프라인 의존성 그래프, 실패 진단, 배포 타겟 상태, 워크플로우 실행 내역, 잡 상세 정보를 확인합니다.

FlowShip은 GitHub API가 반환한 데이터만 렌더링합니다. 레포지토리에 워크플로우 실행·잡·스텝이 없으면 빈 상태를 표시합니다.

## 배포

S3 배포 워크플로우는 `main` 브랜치에 푸시할 때마다 실행됩니다.

```txt
main push
-> npm ci
-> npm run build
-> aws s3 sync dist s3://S3_BUCKET_NAME --delete
```

필요한 GitHub Actions 시크릿:

```txt
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
AWS_REGION
S3_BUCKET_NAME
```

`AWS_SESSION_TOKEN`은 AWS Academy Learner Lab의 임시 자격 증명에 사용됩니다.

`amplify.yml`은 AWS Amplify Hosting을 위해 포함되어 있습니다.

- preBuild: `npm ci`
- build: `npm run build`
- artifacts: `dist`

## 문제 해결

### 레포지토리를 찾을 수 없는 경우

소유자, 레포지토리 이름, 브랜치를 확인하세요. 비공개 레포지토리는 해당 레포에 접근 권한이 있는 토큰이 필요합니다.

### 비공개 또는 조직 레포지토리가 표시되지 않는 경우

레포지토리 설정 화면에서 토큰을 검증하세요. Fine-grained 토큰은 레포지토리 접근 및 Actions 읽기 권한이 필요합니다. Classic 토큰은 `repo`, `workflow`, `read:org`가 필요할 수 있습니다.

### GitHub API 요청 제한

인증되지 않은 공개 API 요청은 요청 수 제한이 있습니다. 선택적으로 GitHub 토큰을 추가하면 한도가 높아집니다.

### 워크플로우 실행 내역이 없는 경우

선택한 레포지토리와 브랜치에 GitHub Actions 실행 내역이 없을 수 있습니다. FlowShip은 빈 상태를 표시하며, 가짜 워크플로우 히스토리를 생성하지 않습니다.

### 잡 또는 스텝이 누락된 경우

FlowShip은 GitHub Actions API가 반환한 잡과 스텝만 표시합니다. API 응답에 스텝이 없으면 해당 영역에 빈 상태를 표시합니다.

### 실패 진단이 불완전해 보이는 경우

GitHub Actions 잡/스텝 API는 전체 로그 텍스트를 포함하지 않습니다. FlowShip은 실제 실패한 잡·스텝의 이름, 상태, conclusion으로 원인을 진단합니다. 전체 로그는 GitHub Actions 상세 링크에서 확인하세요.

### 배포 타겟 상태 확인이 안 되는 경우

FlowShip은 `fetch no-cors` 방식으로 서버 응답 여부를 확인합니다. 서버가 응답하면 `Reachable`, 연결 자체가 안 되면 `Unreachable`로 표시됩니다. 상세 HTTP 상태 코드는 CORS 정책상 브라우저에서 직접 확인이 불가능하므로, URL 링크로 직접 열어 검증하세요.

### S3 배포 AccessDenied 오류

`aws s3 sync --delete`는 `s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject` 등의 권한이 필요합니다. `explicit deny` 오류가 발생하면 버킷 정책, IAM 정책, 권한 경계, AWS Academy Learner Lab 역할 제한, `S3_BUCKET_NAME` 시크릿을 확인하세요.

### 빌드 실패

아래 명령을 실행하세요:

```bash
npm install
npm run build
```

배포 전 TypeScript, lint, 의존성 오류를 먼저 해결하세요.

## 프로젝트 의의

FlowShip은 정적 대시보드 목업이 아닙니다. 실제 GitHub Actions 배포 데이터를 관찰하여 워크플로우 실행·잡·스텝을 멀티 프로젝트 배포 컨트롤 센터로 전환합니다.

이 프로젝트는 목 프로토타입에서 실제 API 기반 제품으로 발전하는 과정을 보여주며, 프론트엔드 배포 안정성·의존성 시각화·실패 진단에 집중합니다.
