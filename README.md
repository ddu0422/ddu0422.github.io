# DHistory

> 문제를 발견하면 해결할 때까지 파고듭니다.

Java, 데이터베이스, 시스템 설계를 다루는 이두호의 기술 블로그입니다.  
개발하며 마주친 문제와 해결 과정, 공부하며 배운 내용을 기록합니다.

**[블로그 바로가기 →](https://ddu0422.github.io)**

<br>

## 주요 기능

- 카테고리별 글 탐색과 검색
- 코드 구문 강조와 Mermaid 다이어그램
- 소제목 기반 목차와 반응형 레이아웃

<br>

## 기술 스택

Next.js · TypeScript · Tailwind CSS · MDX  
GitHub Pages · GitHub Actions

<br>

## 로컬 실행

Node.js 22 이상과 pnpm 10.30.3이 필요합니다.

```bash
git clone https://github.com/ddu0422/ddu0422.github.io.git
cd ddu0422.github.io

pnpm install --frozen-lockfile
pnpm dev
```

<br>

## 글 작성

`content/posts/`에 MDX 파일을 추가합니다.

```mdx
---
title: 비관적 락과 영속성 컨텍스트
description: 비관적 락의 동작과 엔티티 상태 갱신을 정리합니다.
category: 백엔드
tags: [Java, JPA]
status: Draft
publishedAt: "2026-10-23"
---

## 개요

본문을 작성합니다.
```

`status`를 `Published`로 변경하면 공개되며, 작성 날짜 최신순으로 표시됩니다.

<br>

## 배포

`main` 브랜치에 push하면 GitHub Actions가 테스트와 빌드를 수행한 뒤 GitHub Pages에 자동 배포합니다.
