# FlowShip

**내 배포가 지금 어디까지 갔는지, 왜 실패했는지 — 한눈에 파악하는 배포 컨트롤 센터**

GitHub Actions로 배포하는 프론트엔드 프로젝트라면, FlowShip 하나로 여러 레포지토리의 배포 상태를 실시간으로 추적할 수 있습니다.

## 라이브 주소

Amplify:

```
https://main.d1cvodkenfaorb.amplifyapp.com
```

S3 정적 웹사이트:

```
http://mybucket-20263620.s3-website-us-east-1.amazonaws.com
```

---

## 시연 영상 (Demo Videos)

### GitHub Actions를 활용한 CI/CD 환경 구축 (S3 배포)
```
https://youtu.be/QjVTCSNxVBg
```

### AWS Amplify 서비스를 활용한 호스팅
```
https://youtu.be/n298cOE3dog
```

---

## 초보 프론트엔드 개발자에게 FlowShip이 필요한 이유

처음 GitHub Actions로 배포를 설정하면 이런 상황을 겪게 됩니다.

> "분명히 push 했는데 배포가 됐는지 안 됐는지 모르겠다."
> "Actions 탭에 들어가서 빨간 x 는 봤는데, 어느 단계에서 왜 실패한 건지 모르겠다."
> "레포지토리가 두 개 이상이 되면서 각각 들어가서 확인하기가 너무 번거롭다."

FlowShip은 이 문제를 해결하기 위해 만들어졌습니다.

### 배포 파이프라인이 눈에 보인다

GitHub Actions의 잡(job)과 스텝(step)을 단계별 흐름으로 시각화합니다. 왼쪽에서 오른쪽으로 흐르는 파이프라인 그래프를 보면, 현재 어느 단계가 실행 중이고 어디서 멈췄는지 즉시 알 수 있습니다.

직접 Actions 탭에 들어가서 로그를 뒤질 필요 없이, 그래프에서 해당 노드를 클릭하면 시작 시간·소요 시간·결론을 바로 확인할 수 있습니다.

### 실패 원인을 바로 짚어준다

배포가 실패했을 때 "어느 잡의 어느 스텝에서 실패했는지"를 자동으로 파악해서 보여줍니다. 로그 전체를 읽지 않아도 실패 지점이 어디인지, 어떤 조치가 필요한지 대시보드에서 바로 확인할 수 있습니다.

### 여러 레포지토리를 한 곳에서

레포지토리를 여러 개 등록해두면, 사이드바에서 프로젝트를 전환하는 것만으로 각 레포지토리의 배포 현황을 비교할 수 있습니다. 탭을 여러 개 열어둘 필요가 없습니다.

### 배포된 사이트가 살아있는지도 확인

S3나 Amplify URL을 등록해두면, 배포 후 해당 URL이 실제로 응답하는지 자동으로 확인합니다. 배포는 성공했는데 사이트가 안 열리는 상황도 바로 감지할 수 있습니다.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| 파이프라인 그래프 | 잡/스텝 기반 배포 흐름을 단계별로 시각화. pan/zoom으로 자유롭게 탐색 |
| 노드 상세 정보 | 각 잡·스텝 클릭 시 시작 시간·완료 시간·소요 시간·상태 표시 |
| 실패 진단 | 실패한 잡·스텝을 자동 감지하고 원인 및 권장 조치 제시 |
| 잡 & 스텝 타임라인 | 잡 목록 accordion 형식, 스텝 클릭 시 인라인 상세 확장 |
| 배포 타겟 상태 | S3·Amplify URL이 실제로 응답하는지 확인 |
| 멀티 레포지토리 | 여러 프로젝트를 등록하고 사이드바에서 빠르게 전환 |
| 워크플로우 메트릭 | 성공률·평균 소요 시간 등 히스토리 통계 |
| 다크 모드 | 라이트/다크 테마 전환 및 설정 유지 |
| 비공개 레포지토리 | GitHub 토큰 등록 시 private·조직 레포지토리도 조회 가능 |

---

## 시작하기

```bash
npm install
npm run dev
```

빌드:

```bash
npm run build
```

### 사용 순서

1. **계정 만들기** — 로컬 워크스페이스 계정으로 회원가입합니다 (브라우저 전용, 별도 서버 불필요)
2. **레포지토리 추가** — GitHub 소유자(owner)와 레포지토리 이름을 입력합니다
3. **토큰 입력** *(선택)* — 비공개 또는 조직 레포지토리라면 GitHub 토큰을 입력하고 검증합니다
4. **브랜치 선택** — 추적할 브랜치를 확인합니다
5. **URL 입력** *(선택)* — S3 Website URL과 Amplify URL을 입력하면 배포 타겟 상태도 확인 가능합니다
6. **대시보드 확인** — 파이프라인 그래프, 실패 진단, 잡 상세 정보를 바로 확인합니다

---

## 로컬 워크스페이스 계정

별도 서버 없이 브라우저 안에서 계정을 만들고 로그인합니다. 사용자별 레포지토리 설정은 `localStorage`에 분리 저장되어, 같은 브라우저에서 여러 계정을 독립적으로 운용할 수 있습니다.

비밀번호는 SHA-256 해시로 저장하며 평문은 보관하지 않습니다. 다만 이는 프론트엔드 전용 데모용 인증입니다. 실제 프로덕션 서비스에서는 백엔드 인증과 GitHub OAuth를 사용하세요.

## GitHub 토큰 안내

공개 레포지토리는 토큰 없이 바로 사용할 수 있습니다. 비공개 또는 조직 레포지토리 접근이 필요하다면:

- **Fine-grained 토큰**: Repository 접근 + Actions 읽기 권한
- **Classic 토큰**: `repo`, `workflow`, `read:org`

토큰 값은 UI에 표시되지 않으며, 이 브라우저의 `localStorage`에만 저장됩니다.

---

## 기술 스택

- React + TypeScript + Vite
- Tailwind CSS
- TanStack Query — GitHub API 서버 상태
- Zustand — 레포지토리 설정·UI 상태·테마
- Recharts — 워크플로우 메트릭 차트
- Lucide React — 아이콘
- GitHub Actions — CI/CD
- AWS S3 + AWS Amplify — 배포 타겟

---

## 배포 구성

`main` 브랜치에 push하면 S3 배포 워크플로우가 자동 실행됩니다.

```
main push → npm ci → npm run build → aws s3 sync dist s3://S3_BUCKET_NAME --delete
```

필요한 GitHub Actions 시크릿:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
AWS_REGION
S3_BUCKET_NAME
```

`amplify.yml`은 AWS Amplify Hosting 전용 빌드 설정입니다.

---

## 문제 해결

**레포지토리를 찾을 수 없을 때** — owner 이름, 레포지토리 이름, 브랜치를 다시 확인하세요. 비공개 레포지토리는 토큰이 필요합니다.

**조직 레포지토리가 안 보일 때** — 토큰에 `read:org` 권한이 있는지 확인하세요.

**API 요청 제한에 걸렸을 때** — 토큰 없는 공개 API 요청은 시간당 60회로 제한됩니다. GitHub 토큰을 등록하면 5,000회로 늘어납니다.

**배포 타겟 상태가 확인 안 될 때** — 브라우저 CORS 정책상 HTTP 상태 코드는 확인할 수 없습니다. 서버 응답 여부만 판단하며, 자세한 확인은 URL을 직접 열어보세요.

**S3 배포 AccessDenied** — `s3:ListBucket`, `s3:PutObject`, `s3:DeleteObject` 권한을 확인하고, AWS Academy Learner Lab 사용 시 역할 제한도 점검하세요.
