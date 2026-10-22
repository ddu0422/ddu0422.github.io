# DHistory

Next.js Static Export 기반의 라이트 테마 기술 블로그입니다. 글 목록은 한 페이지에 최대 10개씩 표시하며 검색어나 카테고리 선택을 변경하면 첫 페이지로 돌아갑니다. 카테고리·검색어·페이지 번호는 URL에 저장하여 글에서 뒤로 가거나 새로고침해도 유지됩니다. MDX 글, 검색, 코드 강조와 Mermaid를 지원합니다. 글의 h2·h3에서 목차를 자동 생성합니다. 데스크톱에서는 오른쪽에 고정하고, 모바일에서는 상단의 접이식 메뉴로 제공합니다. 원문 주소는 이관 근거로 보관하며 상세 페이지에 외부 원문 링크를 표시하지 않습니다. GitHub Pages의 `https://ddu0422.github.io`를 기준으로 구성합니다.

## 실행

Node.js 22 이상과 pnpm 10.30.3을 사용합니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## 글 작성

`content/posts/`에 MDX 파일을 추가합니다. 파일 이름이 `/posts/파일이름/` 주소가 됩니다. 티스토리에서 이관한 글은 원문 발행일·분류·주소를 보존하며 원문 발행일 최신순으로 표시합니다. 모든 공개 글은 `publishedAt` 최신순으로 정렬합니다. 시각까지 같으면 파일명으로 순서를 일정하게 유지하므로 별도 순서 번호를 관리하지 않습니다.

```yaml
---
title: 글 제목
description: 글 요약
category: 백엔드
tags: [Java, JPA]
status: Draft
featured: false
publishedAt: "2026-10-20"
---
```

카테고리는 백엔드, 데이터베이스, 인프라, 시스템 설계, 리더십으로 나누고 Java·JPA·Spring Boot 같은 구체적인 기술명은 태그로 사용합니다. 원문의 `[Spring]` 같은 접두어는 태그에 보존하고, 화면의 제목 앞에는 데이터의 카테고리를 사용해 `[백엔드] 글 제목` 형태로 표시합니다. `category`는 상단 선택 필터로 사용하며 글 제목 위에는 발행일만 표시합니다. `src/lib/site.ts`에서 기본 카테고리를 관리하며 글이 없는 카테고리도 선택할 수 있습니다. 별도의 카테고리 페이지는 만들지 않습니다. `Published` 글만 웹과 사이트맵에 노출합니다. `publishedAt`는 공개 글에 필수이며 `"2026-10-20"`처럼 날짜만 입력해도 됩니다. 시각까지 지정하려면 `"2026-10-20T09:00:00+09:00"` 형식으로 작성합니다. 날짜만 있는 값은 한국 시간 자정으로 해석합니다. `featured`는 메타데이터로 보관합니다. `publishedAt`, `sourceUrl`, `sourceCategory`는 이관 글의 원문 정보를 보존합니다.

회사명, 역할, 재직 기간, 업무 성과를 글 메타데이터로 사용하지 않습니다. 기술 설명은 공식 문서로 연결하고 예시 코드와 설명용 데이터는 실제 적용 결과와 구분합니다. 이력서·경력 페이지와 PDF 출력 기능은 포함하지 않습니다.

## 확인과 배포

```sh
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm qa:web
pnpm public:package
```

로컬 Chrome을 사용하는 경우 `PLAYWRIGHT_CHANNEL=chrome`을 지정합니다. `out/`이 배포할 정적 사이트이며 `dist/public-source.tar.gz`는 공개 가능한 프로젝트 소스만 묶습니다.

`ddu0422/ddu0422.github.io` 저장소에서 운영합니다. Pages의 Source는 GitHub Actions를 사용하며 `main` push 시 검사 후 배포합니다. PR에서는 검사만 실행합니다. 계정 프로필용 `ddu0422/ddu0422` 저장소의 README와 별도로 운영합니다.

새 글을 작성한 뒤 변경한 MDX와 이미지를 커밋하고 `main`에 push하면 자동 배포됩니다.

## 티스토리 이관

공개 글 중 알고리즘 카테고리 244개와 코딩테스트 회고 1개를 제외한 27개를 이관했습니다. 원문 분류는 백엔드·데이터베이스·인프라·시스템 설계·리더십으로 연결하며, 원래 분류와 원문 주소도 보관합니다. 이미지 62개는 `public/images/tistory/`에 저장합니다. 이관 목록과 제외 기준은 `content/tistory-migration.json`에서 확인할 수 있습니다. 리더십 글의 공개된 회사 경험은 작성자의 명시적 요청으로 원문을 유지했습니다. AWS 계정 설정 글에는 원문 보존과 구분되는 현재 공식 보안 지침을 덧붙였습니다.

## 폰트

Pretendard Variable v1.3.9를 로컬 파일로 제공합니다. 코드 블록은 고정폭 글꼴을 사용합니다. 폰트 라이선스는 `public/fonts/Pretendard-LICENSE.txt`에 포함합니다.
