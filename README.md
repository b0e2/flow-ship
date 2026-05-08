# FlowShip

FlowShip은 GitHub Actions 기반 프론트엔드 CI/CD 배포 상태를 시각화하는 Observability Dashboard입니다.

대규모 IT 서비스 환경에서 중요한 배포 안정성, 운영 가시성, 개발 생산성을 주제로 기획했으며, 프론트엔드 배포 파이프라인에서 발생할 수 있는 빌드 실패, 환경별 배포 상태 차이, Secret 누락, S3 권한 문제 등을 한 화면에서 확인하는 내부 개발자 도구를 가정하고 구현했습니다.

## 기획 배경

프론트엔드 서비스도 단순히 정적 파일을 배포하는 과정에서 여러 운영 이슈를 겪을 수 있습니다.

- Vite build 실패
- GitHub Actions workflow 실패
- GitHub Secrets 누락
- AWS S3 bucket policy 오류
- AWS Amplify artifacts 경로 설정 오류
- production, staging, development 환경 간 배포 버전 불일치

FlowShip은 이런 배포 안정성 신호를 한눈에 확인할 수 있는 개발자용 대시보드입니다.

## 주요 기능

- 배포 상태 Summary KPI
- 배포 성공률 및 상태 추이 차트
- 환경별 배포 상태 카드
- GitHub Actions Pipeline 단계 시각화
- 최근 배포 히스토리 테이블
- 실패 로그
- 배포 체크리스트
- 릴리즈 노트
- branch, environment, status 필터

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

FlowShip은 서버 상태, 클라이언트 UI 상태, 컴포넌트 내부 상태의 역할을 분리합니다.

- 서버 상태성 데이터: TanStack Query
- 클라이언트 UI 필터 상태: Zustand
- 컴포넌트 내부 임시 상태: useState

현재 실제 API 서버는 없으므로 `getDeployments()` mock API를 통해 데이터를 조회합니다. API 호출부, hook, mock data, 타입 모델을 분리해 두어 이후 GitHub Actions API 또는 백엔드 API로 교체하기 쉽게 구성했습니다.

## 프로젝트 구조

```txt
src/
  app/
    App.tsx
    providers.tsx

  pages/
    dashboard/
      DashboardPage.tsx

  features/
    deployments/
      api/
      components/
      data/
      hooks/
      model/
      store/
      utils/

  shared/
    components/
      layout/
      ui/
    lib/
    constants/

  styles/
    globals.css
```

## 로컬 실행 방법

```bash
npm install
npm run dev
npm run build
```

개발 서버는 기본적으로 아래 주소에서 실행됩니다.

```txt
http://localhost:5173
```

## GitHub Flow 작업 방식

FlowShip은 GitHub Flow 방식으로 작업합니다.

- `main` 브랜치는 항상 배포 가능한 상태를 유지합니다.
- 기능 단위로 브랜치를 생성합니다.
- Pull Request를 통해 변경 사항을 검토하고 merge합니다.
- merge 후 다음 기능 브랜치를 `main` 기준으로 생성합니다.

## GitHub Actions CI/CD 구성

`main` 브랜치에 push되면 GitHub Actions workflow가 실행되어 React 프로젝트를 빌드하고 AWS S3에 정적 파일을 배포합니다.

배포 흐름:

```txt
main push
→ GitHub Actions 실행
→ npm ci
→ npm run build
→ AWS credentials 설정
→ aws s3 sync dist s3://S3_BUCKET_NAME --delete
```

## GitHub Secrets

S3 배포 workflow를 실행하려면 repository secrets에 아래 값을 등록해야 합니다.

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`

민감정보는 코드나 README에 직접 작성하지 않습니다.

## AWS S3 정적 웹사이트 배포 URL

제출 전 실제 S3 정적 웹사이트 URL을 입력합니다.

```txt
https://your-s3-static-website-url.example.com
```

## AWS Amplify 배포 URL

제출 전 실제 Amplify Hosting URL을 입력합니다.

```txt
https://your-amplify-app-url.amplifyapp.com
```

## 시연 영상 링크

제출 전 YouTube 시연 영상 링크를 입력합니다.

```txt
https://youtube.com/watch?v=your-demo-video-id
```

## 트러블슈팅

### npm run build 실패

- TypeScript import 경로가 올바른지 확인합니다.
- `any`를 사용하지 않았는지 확인합니다.
- Vite build output이 `dist`로 생성되는지 확인합니다.

### GitHub Secrets 누락

- repository settings의 Secrets and variables 메뉴를 확인합니다.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME`이 모두 등록되어 있는지 확인합니다.

### S3 bucket policy 문제

- GitHub Actions에서 사용하는 IAM user 또는 role에 `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` 권한이 있는지 확인합니다.
- 정적 웹사이트 호스팅 정책과 public access 설정을 프로젝트 요구사항에 맞게 확인합니다.

### Amplify baseDirectory 오류

- Vite의 build output은 `dist`입니다.
- `amplify.yml`의 artifacts `baseDirectory`가 `dist`로 설정되어 있는지 확인합니다.

### Vite build output 설정

- 별도 설정이 없다면 Vite는 `npm run build` 시 `dist` 폴더를 생성합니다.
- S3 sync와 Amplify artifacts 경로 모두 `dist`를 기준으로 맞춥니다.

## 프로젝트 의의

FlowShip은 단순 정적 페이지 배포에서 끝나지 않고, CI/CD 상태 자체를 서비스 주제로 확장한 프로젝트입니다.

- TypeScript 기반 데이터 모델링
- TanStack Query와 Zustand의 역할 분리
- 현업형 대시보드 UI 구성
- GitHub Actions 기반 AWS S3 자동 배포 경험
- AWS Amplify Hosting 설정 경험

신입 프론트엔드 개발자가 배포 자동화, 운영 가시성, 상태 관리 구조를 함께 설명할 수 있도록 구성했습니다.
