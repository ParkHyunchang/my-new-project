# my-new-project (Frontend)

Vue 3 기반 프론트엔드 프로젝트입니다.

## 기술 스택

- **Vue 3**
- **Vue Router 4**
- **Vue CLI 5**
- **Axios** (API 통신)

## 로컬 실행 방법

### 사전 준비

- [Node.js 18+](https://nodejs.org/) 설치 확인

```bash
node -v
npm -v
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run serve
```

브라우저에서 [http://localhost:8080](http://localhost:8080) 접속

### 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## 백엔드 연결

### API baseURL 자동 설정

`src/axios.js`에서 접속 주소에 따라 백엔드 URL을 자동 설정합니다.

| 프론트 접속 주소    | API 요청 주소               |
| ------------------- | --------------------------- |
| localhost:8080      | http://localhost:3210       |
| 125.141.20.218:3110 | http://125.141.20.218:3210  |
| xxx.synology.me     | http://xxx.synology.me:3210 |

### API 호출 예시

```javascript
import axios from "@/axios";

axios.get("/health");
axios.get("/api/...");
axios.post("/api/...", data);
```

### 사전 요구사항

백엔드 서버(`my-new-project_backend`)가 **포트 3210**에서 실행 중이어야 합니다.

백엔드 실행 방법은 `my-new-project_backend/README.md`를 참고하세요.
