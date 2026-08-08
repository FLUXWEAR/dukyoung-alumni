export type DepartmentProfile = {
  slug: string;
  name: string;
  englishName: string;
  tagline: string;
  summary: string;
  learning: string[];
  pathways: string[];
  alumniValue: string;
  officialUrl: string;
  tone: string;
};

export const departmentProfiles: DepartmentProfile[] = [
  {
    slug: "management-accounting",
    name: "경영회계과",
    englishName: "Management & Accounting",
    tagline: "기업의 흐름을 읽고 숫자로 경영을 설계합니다.",
    summary: "디지털 활용 능력과 비즈니스 역량을 함께 길러 차세대 경영·회계 인재를 양성하는 학과입니다.",
    learning: ["경영과 회계 실무", "디지털 비즈니스 활용", "세무·사무 행정 실무"],
    pathways: ["회계·세무 사무", "금융·일반 사무", "경영·상경계열 진학"],
    alumniValue: "경영·회계 분야에서 활동하는 선배들의 현장 경험과 진로 이야기를 연결하기 좋은 학과입니다.",
    officialUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/cm/cntnts/cntntsView.do?cntntsId=2121&mi=13013",
    tone: "gold",
  },
  {
    slug: "health-nursing",
    name: "보건간호과",
    englishName: "Health & Nursing",
    tagline: "사람을 이해하고 건강한 일상을 돌봅니다.",
    summary: "간호·진료 보조 전문교육과 인성교육을 통해 현장에 필요한 보건의료 인력을 양성하는 학과입니다.",
    learning: ["간호 기초", "기본간호 실습", "보건의료 서비스와 인성"],
    pathways: ["보건·의료 서비스", "간호·보건계열 진학", "의료기관 행정 지원"],
    alumniValue: "보건·의료 현장의 선배들과 진로 멘토링, 직업 정보 교류를 이어갈 수 있습니다.",
    officialUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/cm/cntnts/cntntsView.do?cntntsId=2129&mi=13032",
    tone: "green",
  },
  {
    slug: "big-data",
    name: "빅데이터과",
    englishName: "Big Data",
    tagline: "데이터에서 의미를 찾고 더 나은 결정을 만듭니다.",
    summary: "프로그래밍·데이터베이스·인공지능 기초를 바탕으로 빅데이터 분석 역량을 기르는 학과입니다.",
    learning: ["Python·웹·C 프로그래밍", "데이터베이스와 정보통신", "AI 기초와 빅데이터 분석"],
    pathways: ["데이터 분석 실무", "IT 서비스 운영", "데이터·컴퓨터계열 진학"],
    alumniValue: "IT·데이터 산업에서 일하는 동문과 프로젝트 사례, 진학·취업 경험을 나눌 수 있습니다.",
    officialUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/cm/cntnts/cntntsView.do?cntntsId=2128&mi=13029",
    tone: "blue",
  },
  {
    slug: "graphic-software",
    name: "그래픽소프트웨어과",
    englishName: "Graphic Software",
    tagline: "아이디어를 시각 언어와 디지털 콘텐츠로 표현합니다.",
    summary: "디자인 기초와 소프트웨어를 결합해 AR·VR·XR을 포함한 디지털 콘텐츠 창작 역량을 키우는 학과입니다.",
    learning: ["디자인·드로잉·색채", "컴퓨터 그래픽·캐릭터 제작", "Python·AR·VR·XR 콘텐츠"],
    pathways: ["콘텐츠·그래픽 디자인", "UI·UX 제작", "디자인·미디어계열 진학"],
    alumniValue: "디자인·콘텐츠 분야 동문의 포트폴리오 조언과 실무 이야기를 후배들에게 전할 수 있습니다.",
    officialUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/cm/cntnts/cntntsView.do?cntntsId=3563&mi=23018",
    tone: "purple",
  },
  {
    slug: "ai-software",
    name: "인공지능소프트웨어과",
    englishName: "AI Software",
    tagline: "소프트웨어로 배우고 인공지능으로 가능성을 넓힙니다.",
    summary: "프로그래밍·데이터베이스와 인공지능 기초·수학·모델링을 익혀 AI 전문인력으로 성장하는 학과입니다.",
    learning: ["Python·웹·C 프로그래밍", "데이터베이스와 정보통신", "AI 기초·수학·모델링"],
    pathways: ["소프트웨어 개발", "AI 서비스 운영", "컴퓨터·AI계열 진학"],
    alumniValue: "개발·AI 분야 동문과 기술 변화, 포트폴리오, 취업 준비 경험을 이어갈 수 있습니다.",
    officialUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/cm/cntnts/cntntsView.do?cntntsId=2124&mi=13016",
    tone: "navy",
  },
  {
    slug: "security-software",
    name: "정보보안소프트웨어과",
    englishName: "Information Security Software",
    tagline: "안전한 디지털 세상을 지키는 기술을 배웁니다.",
    summary: "프로그래밍·네트워크와 컴퓨터보안·암호학·웹보안을 익혀 정보보호 인력으로 성장하는 학과입니다.",
    learning: ["Python·웹·C 프로그래밍", "데이터베이스와 네트워크", "컴퓨터보안·암호학·웹보안"],
    pathways: ["정보보안 실무", "시스템·네트워크 운영", "보안·컴퓨터계열 진학"],
    alumniValue: "보안·인프라 분야 선배들의 실무 경험과 학습 방향을 나누는 연결점이 될 수 있습니다.",
    officialUrl: "https://dukyoung-h.goeyi.kr/dukyoung-h/cm/cntnts/cntntsView.do?cntntsId=3564&mi=23020",
    tone: "slate",
  },
];

export function getDepartment(slug: string) {
  return departmentProfiles.find((department) => department.slug === slug);
}
