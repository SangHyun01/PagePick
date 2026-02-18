# 📖 PagePick
> **책 속의 영감을 데이터로, 독서 기록 아카이빙 앱**

[![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

**PagePick**은 독서 중 간직하고 싶은 문장을 사진으로 찍어 텍스트로 추출하고, AI를 통해 문맥을 교정하여 나만의 지식 라이브러리에 보관하는 서비스입니다. 단순히 문장을 저장하는 것을 넘어, 사진을 아카이빙하고 공유함으로써 독서의 가치를 지속시킵니다.

---

## 📱 서비스 화면

| 문장 OCR 인식 | 외부 인텐트 공유 | 
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/fdbee642-abe5-44d2-a297-95bcc500d860" width="100%"> | <img src="https://github.com/user-attachments/assets/1b03fbb0-1b5c-4a5b-9504-03d1ca378e98" width="30%"> |


---



## ✨ 주요 기능

* **OCR 엔진:** `react-native-ml-kit`을 활용하여 이미지 내 텍스트 좌표를 정밀하게 분석하고 정형화된 데이터로 추출합니다.
* **AI 문장 교정:** 추출된 텍스트의 오타를 수정하고, 사용자가 설정한 문맥에 맞는 자연스러운 문장으로 교정하는 기능을 제공합니다.
* **외부 인텐트 공유:** 브라우저나 갤러리 앱에서 '공유하기' 기능을 통해 이미지를 PagePick으로 즉시 전송하여 아카이빙 프로세스를 단축합니다.

---

## 🛠 기술 스택

### Frontend
- **Framework:** React Native 
- **Navigation:** Expo Router 
- **OCR:** `react-native-ml-kit` 

### Backend & Infrastructure
- **BaaS:** Supabase (Auth, PostgreSQL, Storage)
- **CI/CD:** Husky, GitHub Actions, EAS (Cloud Build)
- **Version Control:** Git 


---

## 📂 프로젝트 구조
**MVVM 아키텍처 적용**: UI 로직과 비즈니스 로직을 엄격히 분리하여, 기능 확장 시 기존 코드의 수정을 최소화하고 안정적인 개발 환경을 구축했습니다.
```text
src/
 ├── app/               # Expo Router 기반 파일 시스템 라우팅
 ├── view-models/       # UI 상태 관리 및 비즈니스 로직 처리
 ├── assets/            # 이미지, 폰트 등 정적 리소스
 ├── components/        # 재사용 가능한 UI 컴포넌트 (Atomic Design)
 ├── hooks/             # 비즈니스 로직 캡슐화를 위한 Custom Hooks
 ├── services/          # API 호출, OCR 엔진, Supabase 연동
 ├── types/             # TypeScript 인터페이스 및 타입 정의
 └── utils/             # 날짜 포맷팅, 텍스트 가공 등 공통 함수
