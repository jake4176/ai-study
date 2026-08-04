# -*- coding: utf-8 -*-
"""
🏢 [실행 02] AI 1인 기업 급속 창업 MVP: 네이버 블로그/마케팅 원고 자동 생성기
========================================================================
- 제작: AI 개발부장 코다리 & AI 1인 기업 대표님
- 특징: 소상공인/기업용 블로그 마케팅 원고, 제목, 키워드를 자동 생성하는 초스피드 MVP 서비스
- 실행: python 02_AI_1인기업_블로그_마케팅_원고_자동생성기.py
"""

import os
import sys
import time

# Windows 터미널 한글/이모지 출력 인코딩 설정
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass


def print_banner():
    print("=" * 65)
    print("🚀 [AI 1인 기업 MVP] 초스피드 마케팅 원고 & 제목 자동 생성기 🚀")
    print("   - Developed by AI 1인 기업 대표님 & 코다리 개발부장")
    print("=" * 65)

def generate_marketing_content(product_name, target_audience, key_benefit):
    """
    마케팅 원고 및 네이버 블로그 맞춤형 노출 템플릿을 생성합니다.
    """
    print(f"\n[🔄 분석 중...] '{product_name}' 서비스의 마케팅 키워드 및 대본을 구성하고 있습니다...")
    time.sleep(1.5)
    
    # 후킹 제목 5선
    titles = [
        f"🔥 [필독] {target_audience}라면 반드시 알아야 할 {product_name} 3가지 비밀!",
        f"💡 아직도 고생하세요? {product_name} 하나로 {key_benefit} 달성하는 법",
        f"✨ 진짜 후기! {target_audience}가 강력 추천하는 {product_name} 솔직 사용기",
        f"🚀 2026년 최신 트렌드: {product_name}로 {key_benefit} 10배 빠르게 땡기기",
        f"📢 [특가/이벤트] {target_audience} 맞춤 {product_name} 도입 가이드 대공개!"
    ]
    
    # 네이버 블로그 본문 구조
    content = f"""
# [블로그 원고] {titles[0]}

안녕하세요! {target_audience} 여러분! 👋
오늘 많은 분들이 궁금해하셨던 **{product_name}**에 대해 솔직하고 명쾌하게 정리해 드리려고 합니다.

---

### ❓ 왜 지금 {product_name}에 주목해야 할까요?

요즘 {target_audience}분들의 가장 큰 고민은 무엇일까요?
바로 시간과 비용은 줄이면서 **{key_benefit}**를 이루는 것인데요!

기존 방식으로는 많은 시간과 시행착오가 필요했지만,
이제 **{product_name}**를 활용하면 놀라운 변화를 경험하실 수 있습니다.

---

### 🌟 {product_name} 핵심 장점 TOP 3

1. **초스피드 실행**: 복잡한 과정 없이 단 5분 만에 세팅 완료!
2. **비용 극대화**: 최소 비용으로 최대 효용({key_benefit}) 창출!
3. **100% 맞춤형**: {target_audience}의 니즈에 딱 맞춘 최적화 시스템 제공.

---

### 💬 실제 이용 고객 반응

> "{key_benefit}를 이렇게 쉽게 달성할 줄 몰랐어요! {target_audience}에게 무조건 추천합니다!"

---

### 🎁 마무리하며 & 특별 혜택

지금 바로 **{product_name}**를 경험해 보시고, 여러분의 업무와 삶의 질을 한 단계 업그레이드해 보세요!
더 자세한 내용은 아래 댓글 링크를 확인해 주세요! 👇

#태그: #{product_name.replace(' ', '')} #{target_audience.replace(' ', '')} #{key_benefit.replace(' ', '')} #마케팅자동화 #AI1인기업
"""
    return titles, content

def main():
    print_banner()
    
    # 인터랙티브 실행 예시
    product_name = input("1. 제품/서비스 이름 (예: AI 노코드 세팅 대행): ").strip() or "AI 노코드 세팅 대행"
    target_audience = input("2. 주요 타깃 고객 (예: 소상공인 사장님): ").strip() or "소상공인 사장님"
    key_benefit = input("3. 핵심 고객 혜택 (예: 월 200만 원 인건비 절감): ").strip() or "월 200만 원 인건비 절감"
    
    titles, content = generate_marketing_content(product_name, target_audience, key_benefit)
    
    print("\n" + "=" * 65)
    print("🎯 [자동 생성된 후킹 제목 5선]")
    print("=" * 65)
    for idx, t in enumerate(titles, 1):
        print(f"  {idx}. {t}")
        
    print("\n" + "=" * 65)
    print("📝 [자동 생성된 마케팅 블로그 본문]")
    print("=" * 65)
    print(content)
    
    # 결과를 파일로 저장
    output_filename = "02_생성된_마케팅_원고_결과.txt"
    with open(output_filename, "w", encoding="utf-8") as f:
        f.write("=== 후킹 제목 ===\n")
        f.write("\n".join(titles))
        f.write("\n\n=== 마케팅 본문 ===\n")
        f.write(content)
        
    print("=" * 65)
    print(f"✅ 결과가 '{output_filename}' 파일로 저장되었습니다!")
    print("🚀 대표님! 이 파이썬 코드를 웹사이트(Flask/FastAPI/Streamlit)로 씌우면 바로 월 구독형 1인 기업 서비스 완성입니다!")

if __name__ == "__main__":
    main()
