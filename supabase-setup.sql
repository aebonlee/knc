-- =============================================================
-- K&C 산업안전 RBF 사회비용 성과 대시보드 — Supabase DB 설정
-- 생성일: 2026-04-19
-- 엑셀: (K&C)산업안전_RBF_사회비용 성과_1차_260417.xlsx
-- =============================================================

-- 기존 테이블 삭제 (의존성 순서)
DROP TABLE IF EXISTS knc_activities CASCADE;
DROP TABLE IF EXISTS knc_demand_companies CASCADE;
DROP TABLE IF EXISTS knc_companies CASCADE;
DROP TABLE IF EXISTS knc_reference_data CASCADE;
DROP TABLE IF EXISTS knc_project_settings CASCADE;

-- =============================================================
-- 1. 기준데이터 (13개 위험요인)
-- =============================================================
CREATE TABLE knc_reference_data (
  id SERIAL PRIMARY KEY,
  no INTEGER NOT NULL UNIQUE,
  risk_name TEXT NOT NULL,
  social_cost NUMERIC NOT NULL,
  weight_engineering NUMERIC DEFAULT 0.70,
  weight_ppe NUMERIC DEFAULT 0.15,
  weight_education NUMERIC DEFAULT 0.15
);

INSERT INTO knc_reference_data (no, risk_name, social_cost, weight_engineering, weight_ppe, weight_education) VALUES
(1, '떨어짐', 37216793, 0.7, 0.15, 0.15),
(2, '넘어짐', 13387391, 0.7, 0.15, 0.15),
(3, '깔림·뒤집힘', 35663798, 0.7, 0.15, 0.15),
(4, '부딪힘', 24227840, 0.7, 0.15, 0.15),
(5, '물체에 맞음', 23091624, 0.7, 0.15, 0.15),
(6, '무너짐', 75765595, 0.7, 0.15, 0.15),
(7, '끼임', 21532128, 0.7, 0.15, 0.15),
(8, '절단·베임·찔림', 11123148, 0.7, 0.15, 0.15),
(9, '화재·폭발·파열', 98121824, 0.7, 0.15, 0.15),
(10, '교통사고', 25437247, 0.7, 0.15, 0.15),
(11, '무리한 동작', 11158448, 0.7, 0.15, 0.15),
(12, '감전', 61427885, 0.7, 0.15, 0.15),
(13, '기타', 19618150, 0.7, 0.15, 0.15);

-- =============================================================
-- 2. 기업 정보 (50개)
-- =============================================================
CREATE TABLE knc_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_no INTEGER NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  biz_number TEXT,
  manager_name TEXT,
  manager_title TEXT,
  manager_email TEXT,
  manager_phone TEXT,
  sub_manager_name TEXT,
  sub_manager_title TEXT,
  sub_manager_email TEXT,
  sub_manager_phone TEXT,
  budget NUMERIC,
  solution_type TEXT DEFAULT '공학',
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO knc_companies (company_no, company_name, biz_number, manager_name, manager_title, manager_email, manager_phone, sub_manager_name, sub_manager_title, sub_manager_email, sub_manager_phone, budget, solution_type) VALUES
(1, '강양HTS', '354-87-00193', '홍승필', '차장', 'gangyanghts@naver.com', '010-5432-6596', '안승일', '대표', 'gangyanghts@naver.com', '010-4582-3908', 60, '공학'),
(2, '네오펜스', '502-87-02960', '이기철', '대표이사(연구책임자)', 'neo@neofence.net', '010-3203-7133', '', '', '', '', 70, '공학'),
(3, '라이브워크', '665-88-01764', '엄봉식', '대표이사', 'bliss21@livewalk.co.kr', '010-9844-8321', '임민지', '차장', 'min123@livewalk.co.kr', '010-5185-9627', 100, '공학'),
(4, '루미테크', '622-09-87246', '김명진', '대표', 'kmj4star@naver.com', '010-5081-1843', '박영선', '실장', 'lumipark1004@naver.com', '010-8233-1843', 80, '공학'),
(5, '리튬코리아', '397-87-02733', '김성준', '선임연구원', 'lk-korea@lkkor.com', '010-3726-3142', '장성임', '실장', 'ion-korea@naver.com', '010-5750-1029', 100, '공학'),
(6, '린솔', '766-87-02884', '도예영', '사원', 'yy1110@linsol.kr', '010-3422-1444', '정다영', '대리', 'wjdekdud95@linsol.kr', '010-7721-2274', 100, '공학'),
(7, '마이오티', '801-87-02718', '김상억', '부사장', 'rnbd@maiot.kr', '010-2564-0744', '김탁규', '책임', 'tahkkyoo.kim@maiot.kr', '010-9129-3325', 70, '공학'),
(8, '메이크순', '724-86-00468', '이항준', '원장', '011join001@hanmail.net', '010-2308-2533', '김민재', '대리', 'makesoon@naver.com', '010-8846-4705', 80, '공학'),
(9, '미리코', '134-81-79643', '김동현', '책임연구원(연구소소장)', 'mirico@mirico.net', '010-7715-1632', '박승현', '선임연구원', 'mirico@mirico.net', '010-6364-0904', 70, '공학'),
(10, '베스트씨피알', '138-81-41310', '김은경', '부장', 'kimeg@aed.kr', '010-5745-7777', '최지호', '부장', 'geo@aed.kr', '010-8294-3075', 80, '공학'),
(11, '볼타온', '106-87-14633', '유신디(Yoo Cynthia Hyein)', '이사', 'cyoo@voltaon.com', '010-7232-5133', '홍용진', '상무', 'yjhong@voltaon.com', '010-5319-7624', 70, '공학'),
(12, '브랜드뉴', '610-86-32701', '홍영정', '대리', 'hong.youngjung@brandnew-inc.com', '010-3585-4341', '홍송헌', '과장', 'hong.songheon@brandnew-inc.com', '010-3289-9595', 60, '공학'),
(13, '세계실업', '502-81-68126', '이정우', '과장', 'yolo807@worlde.co.kr', '010-6774-3767', '고미숙', '이사', 'world5700@worlde.co.kr', '010-8426-7424', 60, '공학'),
(14, '세르보테크', '263-87-02916', '김현진', '책임연구원', 'svtech23@naver.com', '010-5486-9419', '', '', '', '', 60, '공학'),
(15, '신화테크', '138-81-69400', '설재호', '프로(선임연구원)', 'lab2@shth.co.kr', '010-2699-7336', '유정후', '책임 연구원', 'lab@shth.co.kr', '메일로 연락', 80, '공학'),
(16, '아와소프트', '105-86-57078', '김양수', '이사', 'amadeuce@awasoft.co.kr', '010-2720-0369', '이재관', '선임', 'jk.lee0207@awasoft.co.kr', '010-5044-6839', 70, '공학'),
(17, '아임삭', '120-81-50894', '최문영', '주임', 'mychoi@aimsak.com', '010-8030-4416', '김영삼', '부장', 'ys.kim@aimsak.com', '010-9029-0760', 90, '공학'),
(18, '에이엘테크', '503-81-46125', '구나리', '선임연구원', 'nrkoo@al-tech.kr', '010-7762-4753', '김희진', '수석연구원', 'dkim@al-tech.kr', '010-7508-5503', 80, '공학'),
(19, '예스산업시스템', '305-81-99784', '김지은', '차장', 'yes5756@daum.net', '010-7280-0316', '이진숙', '과장', 'yes5756@daum.net', '010-2322-3066', 60, '공학'),
(20, '오메가오토메이션', '722-86-00292', '양경식', '실장', 'ps@omegaautomation.co.kr', '010-2223-8296', '김유한', '사원', 'ps@omegaautomation.co.kr', '010-8306-5305', 70, '공학'),
(21, '이노넷', '129-86-56468', '성봉희', '경영지원팀장', 'admin@innonet.net', '010-2714-3804', '장혜원', '경영지원팀 매니저', 'admin@innonet.net', '010-5668-8187', 80, '공학'),
(22, '인제컴퍼니', '673-01-02119', '이정율', '대표', 'inje3482@naver.com', '010-9695-8238', '홍미지', '대리', 'inje3482@naver.com', '010-6537-0758', 70, '공학'),
(23, '인포카', '110-88-00402', '곽지선', '경영지원팀 팀장', 'rnd@infocarmobility.com', '010-3108-8926', '황근중', '영업팀 팀장', 'market@infocarmobility.com', '010-6698-6940', 70, '공학'),
(24, '정한스틸', '312-86-39867', '한금수', '대표이사', 'jhst1217@daum.net', '010-9393-9346', '한동우', '대리', 'jhst1217@daum.net', '010-2516-9346', 60, '공학'),
(25, '지노시스', '314-86-31783', '오장진', '부장', 'jinosys@naver.com', '010-9688-0512', '박영진', '대표이사', 'pyjpark@nate.com', '010-4452-4492', 60, '공학'),
(26, '지우테크', '129-81-31064', '방준호', '대리', 'jhbang@jiwootech.kr', '010-5920-8536', '최진수', '부장', 'zschoi@jiwootech.kr', '010-7777-4684', 100, '공학'),
(27, '큐브더모먼트', '246-86-01399', '안민규', '차장', 'ahnmg@cubetm.com', '010-2640-3611', '조남열', '본부장', 'winer25@cubetm.com', '010-6804-3208', 80, '공학'),
(28, '킨스미디어', '264-81-14922', '손광석', '대표', 'ceo@kinsmedia.com', '010-9532-0420', '이재협', '수석연구원', 'id98032@kinsmedia.com', '010-8963-2733', 70, '공학'),
(29, '태흥', '135-81-82200', '박훈철', '이사', 'hcpark@tae-heung.co.kr', '010-9060-2642', '이승준', '본부장', 'sjlee@tae-heung.co.kr', '010-2922-1793', 80, '공학'),
(30, '탱크테크', '622-81-02199', '주영진', '책임', 'yjjoo@tanktech.co.kr', '010-9321-1680', '이은실', '선임', 'account@tanktech.co.kr', '010-8793-2522', 100, '공학'),
(31, '티비에이치', '474-87-00634', '최원영', '대표', 'wychoi@daum.net', '010-3509-8440', '김주열', '부장', 'bethe1st@daum.net', '010-9967-7910', 60, '공학'),
(32, '티앤엠에이아이', '549-86-03374', '남현', '실장', 'hnam@tnmtech.com', '010-8207-0517', '윤지은', '차장', 'jeyoon@tnmtech.com', '010-9136-7912', 70, '공학'),
(33, '파이어킴이에스', '219-88-00602', '오태구', '이사', 'bridgeind@firekimes.com', '010-9133-5618', '곽영선', '주임', 'yuhu0904@firekimes.com', '010-8931-0458', 80, '공학'),
(34, '피원', '279-87-00932', '임건우', '대표이사', 'poneict0502@gmail.com', '010-9023-4887', '박창제', '부장', 'messil848@gmail.com', '010-9878-3811', 60, '공학'),
(35, '해동실업', '306-87-02381', '조성철', '대표', 'hd7274@naver.com', '010-8505-5383', '김오영', '부장', 'hd7274@naver.com', '010-2869-1850', 80, '공학'),
(36, '휴먼디펜스', '495-86-02516', '이재환', '대표이사', 'human-defence@naver.com', '010-6303-8684', '', '', '', '', 70, '공학'),
(37, '무브엔', '267-81-00219', '박찬희', '과장', 'roypark3@muveen.com', '010-7675-9100', '백준협', '이사', 'joonbaek@muveen.com', '010-3728-1310', 50, '보호구'),
(38, '비앤알', '131-81-78500', '김훈희', '팀장', 'hoony220@vaxcon.com', '010-8817-2256', '이태경', '팀장', 'LeeT@vaxcon.com', '010-4119-1272', 50, '보호구'),
(39, '세이프웨어 ', '587-81-00466', '김영환', '실장', 'brian@safeware.co.kr', '010-3010-0375', '', '', '', '', 50, '보호구'),
(40, '에네스', '448-88-01169', '정재진', '대표이사', 'dnflsksna@naver.com', '010-7749-5986', '이길호', '전무이사', 'matrix307@naver.com', '010-5511-6121', 60, '보호구'),
(41, '에이치에이치에스', '545-86-00259', '김정욱', '전임', 'hhskorea2016@gmail.com', '010-6676-9913', '김정욱', '전임', 'jungwook312662@naver.com', '010-6676-9913', 60, '보호구'),
(42, '에일리언테크놀로지아시아', '131-86-00327', '한승식', '부장', 'rubyon@alienasia.com', '010-6261-9801', '박정은', '부장', 'jepark@alienasia.com', '010-2788-3927', 40, '보호구'),
(43, '유니드', '613-81-61025', '허석형', '과장', 'hsh6055@unids.kr', '010-6585-6055', '강미리', '과장', 'kkang7165@unids.kr', '010-5375-4128', 50, '보호구'),
(44, '대한건설구조안전', '301-87-02858', '유승우', '차장', 'sw.yoo@ikcss.co.kr', '010-3743-8745', '정기훈', '과장', 'gh.jeong@ikcss.co.kr', '010-8323-9949', 30, '행동교정'),
(45, '대한안전보건교육원', '513-86-02814', '이범석', '부대표', 'edu@kesh.co.kr', '010-9361-3944', '안유현', '팀장', 'edu@kesh.co.kr', '010-2544-9652', 30, '행동교정'),
(46, '드림캠퍼스', '457-81-00976', '서재홍', '대표이사', 'miz@dreamcampus.co.kr', '010-7556-3721', '박명선', '실장', 'supergirl35@dreamcampus.co.kr', '010-3919-0035', 30, '행동교정'),
(47, '엠라인스튜디오', '211-88-85418', '이재호', '책임', 'jaylee@m-line.tv', '010-2992-6595', '', '', '', '', 40, '행동교정'),
(48, '한국산업안전협회', '416-81-80299', '서애민', '대리', 'hanguksafe1@naver.com', '010-5607-5319', '안나경', '사원', 'hanguksafe1@naver.com', '010-5731-4473', 30, '행동교정'),
(49, '한국지식가교', '175-86-03606', '박창욱', '대표', 'bridge4k@hanmail.net', '010-6287-1328', '송향연', '부장', 'ronya99@hanmail.net', '010-2624-3090', 30, '행동교정'),
(50, '휴디스텍', '138-81-48458', '이혜원', '차장', 'lina@hudistech.com', '010-2846-1273', '김유선', '이사', 'david@axentpro.co.kr', '010-5005-5130', 50, '행동교정');

-- =============================================================
-- 3. 수요기업 (동적 추가)
-- =============================================================
CREATE TABLE knc_demand_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  demand_no INTEGER NOT NULL,
  demand_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, demand_no)
);

-- 수요기업 150개 INSERT
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 1;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 1;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 1;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 2;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 2;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 2;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 3;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 3;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 3;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 4;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 4;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 4;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 5;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 5;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 5;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 6;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 6;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 6;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 7;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 7;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 7;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 8;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 8;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 8;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 9;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 9;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 9;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '협력사1' FROM knc_companies WHERE company_no = 10;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '협력사2' FROM knc_companies WHERE company_no = 10;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '협력사3' FROM knc_companies WHERE company_no = 10;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 11;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 11;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 11;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 12;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 12;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 12;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 13;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 13;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 13;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 14;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 14;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 14;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 15;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 15;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 15;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 16;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 16;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 16;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 17;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 17;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 17;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 18;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 18;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 18;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 19;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 19;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 19;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 20;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 20;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 20;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 21;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 21;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 21;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 22;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 22;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 22;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 23;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 23;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 23;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 24;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 24;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 24;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 25;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 25;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 25;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 26;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 26;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 26;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 27;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 27;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 27;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 28;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 28;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 28;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 29;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 29;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 29;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 30;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 30;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 30;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 31;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 31;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 31;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 32;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 32;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 32;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 33;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 33;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 33;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 34;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 34;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 34;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 35;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 35;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 35;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 36;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 36;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 36;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 37;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 37;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 37;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 38;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 38;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 38;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 39;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 39;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 39;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 40;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 40;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 40;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 41;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 41;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 41;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 42;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 42;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 42;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 43;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 43;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 43;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 44;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 44;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 44;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 45;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 45;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 45;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 46;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 46;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 46;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 47;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 47;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 47;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 48;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 48;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 48;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 49;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 49;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 49;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 1, '수요기업1' FROM knc_companies WHERE company_no = 50;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 2, '수요기업2' FROM knc_companies WHERE company_no = 50;
INSERT INTO knc_demand_companies (company_id, demand_no, demand_name) SELECT id, 3, '수요기업3' FROM knc_companies WHERE company_no = 50;

-- =============================================================
-- 4. 활동 횟수 (핵심 데이터)
-- =============================================================
CREATE TABLE knc_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES knc_companies(id) ON DELETE CASCADE,
  demand_company_id UUID REFERENCES knc_demand_companies(id) ON DELETE CASCADE,
  risk_no INTEGER NOT NULL,
  activity_type TEXT NOT NULL,
  activity_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, demand_company_id, risk_no, activity_type)
);

-- 활동데이터 344개 INSERT (activity_count > 0)
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 1;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 1;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 1;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 1;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 2;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 3;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 4;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 5;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 6;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 7;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 8;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 9;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 10;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 11;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'engineering', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 12;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 13;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 14;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 15;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 16;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 17;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 18;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 19;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 20;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 21;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 22;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 23;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 24;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 25;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 26;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 27;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 28;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 28;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 28;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 28;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 28;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 29;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 29;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 29;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 29;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 29;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 30;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 30;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 30;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 30;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 30;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 31;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 31;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 31;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 31;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 31;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 10, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 32;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 10, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 33;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 10, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 34;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 10, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 35;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 6, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 10, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 12, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'engineering', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 36;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 37;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 37;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 37;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 37;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 37;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 38;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 38;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 38;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 38;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 38;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 39;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 39;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 39;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 39;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 39;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 40;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 40;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 40;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 40;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 40;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 41;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 41;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 41;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 41;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 41;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 41;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 42;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 42;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 42;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 42;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 42;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 42;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 43;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'ppe', 2
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 43;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 43;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 5, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 43;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 43;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'ppe', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 43;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 44;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 44;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 44;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 44;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 44;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 4, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 11, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 45;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 4, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 11, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 46;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 4, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 11, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 47;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 4, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 11, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 48;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 1, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 4, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 11, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 49;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 2, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 50;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 3, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 50;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 7, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 50;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 8, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 50;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 1
WHERE c.company_no = 50;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 9, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 2
WHERE c.company_no = 50;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 11, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 50;
INSERT INTO knc_activities (company_id, demand_company_id, risk_no, activity_type, activity_count)
SELECT c.id, d.id, 13, 'education', 1
FROM knc_companies c
JOIN knc_demand_companies d ON d.company_id = c.id AND d.demand_no = 3
WHERE c.company_no = 50;

-- =============================================================
-- 5. 사업 설정
-- =============================================================
CREATE TABLE knc_project_settings (
  id SERIAL PRIMARY KEY,
  project_phase TEXT DEFAULT '1차 사업',
  total_investment NUMERIC DEFAULT 3300000000,
  underperformance_threshold NUMERIC DEFAULT 3500000000,
  max_target NUMERIC DEFAULT 6600000000,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO knc_project_settings (project_phase, total_investment, underperformance_threshold, max_target)
VALUES ('1차 사업', 3300000000, 3500000000, 6600000000);

-- =============================================================
-- RLS (Row Level Security)
-- =============================================================
ALTER TABLE knc_reference_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_demand_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE knc_project_settings ENABLE ROW LEVEL SECURITY;

-- 로그인 사용자: SELECT, INSERT, UPDATE
CREATE POLICY "knc_ref_select" ON knc_reference_data FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_ref_insert" ON knc_reference_data FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_ref_update" ON knc_reference_data FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "knc_companies_select" ON knc_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_companies_insert" ON knc_companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_companies_update" ON knc_companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_companies_delete" ON knc_companies FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_demand_select" ON knc_demand_companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_demand_insert" ON knc_demand_companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_demand_update" ON knc_demand_companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_demand_delete" ON knc_demand_companies FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_activities_select" ON knc_activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_activities_insert" ON knc_activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "knc_activities_update" ON knc_activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "knc_activities_delete" ON knc_activities FOR DELETE TO authenticated USING (true);

CREATE POLICY "knc_settings_select" ON knc_project_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "knc_settings_update" ON knc_project_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
