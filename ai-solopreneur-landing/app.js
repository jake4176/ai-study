/**
 * AutoMarkAI - Interactive Landing Page Logic
 * Developed by AI 개발부장 코다리 & 대표님
 */

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const form = document.getElementById('ai-generator-form');
    const productNameInput = document.getElementById('product-name');
    const targetAudienceInput = document.getElementById('target-audience');
    const keyBenefitInput = document.getElementById('key-benefit');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');

    const loadingSpinner = document.getElementById('loading-spinner');
    const outputContainer = document.getElementById('output-container');
    const titleList = document.getElementById('title-list');
    const blogBody = document.getElementById('blog-body');

    const presetChips = document.querySelectorAll('.btn-chip');
    const selectPlanBtns = document.querySelectorAll('.select-plan-btn');
    const modal = document.getElementById('plan-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalPlanName = document.getElementById('modal-plan-name');
    const modalForm = document.getElementById('modal-form');

    // 1. Preset Chip Click Handler
    presetChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const product = chip.getAttribute('data-product');
            const target = chip.getAttribute('data-target');
            const benefit = chip.getAttribute('data-benefit');

            productNameInput.value = product;
            targetAudienceInput.value = target;
            keyBenefitInput.value = benefit;

            // Trigger AI Generation immediately
            generateAIContent(product, target, benefit);
        });
    });

    // 2. Form Submit Handler
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const product = productNameInput.value.trim();
        const target = targetAudienceInput.value.trim();
        const benefit = keyBenefitInput.value.trim();

        if (!product || !target || !benefit) {
            alert('모든 필드를 입력해 주세요!');
            return;
        }

        generateAIContent(product, target, benefit);
    });

    // 3. AI Marketing Content Generation Engine Logic
    function generateAIContent(product, target, benefit) {
        // Show Spinner
        outputContainer.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');

        setTimeout(() => {
            // Generate Hooking Headlines
            const titles = [
                `🔥 [필독] ${target}라면 반드시 알아야 할 ${product} 3가지 비밀!`,
                `💡 아직도 고생하세요? ${product} 하나로 ${benefit} 달성하는 법`,
                `✨ 진짜 후기! ${target}가 강력 추천하는 ${product} 솔직 사용기`,
                `🚀 2026년 최신 트렌드: ${product}로 ${benefit} 10배 빠르게 땡기기`,
                `📢 [특가/이벤트] ${target} 맞춤 ${product} 도입 가이드 대공개!`
            ];

            // Render Headlines
            titleList.innerHTML = titles.map((t, idx) => `<li>${idx + 1}. ${t}</li>`).join('');

            // Render Blog Post Body
            const cleanTagProduct = product.replace(/\s+/g, '');
            const cleanTagTarget = target.replace(/\s+/g, '');
            const cleanTagBenefit = benefit.replace(/\s+/g, '');

            blogBody.innerHTML = `
                <p><strong>[블로그 원고] ${titles[0]}</strong></p>
                <p>안녕하세요! ${target} 여러분! 👋<br>오늘 많은 분들이 궁금해하셨던 <strong>${product}</strong>에 대해 솔직하고 명쾌하게 정리해 드리려고 합니다.</p>
                <hr>
                <p><strong>❓ 왜 지금 ${product}에 주목해야 할까요?</strong></p>
                <p>요즘 ${target}분들의 가장 큰 고민은 무엇일까요? 바로 시간과 비용은 줄이면서 <strong>${benefit}</strong>을 이루는 것인데요!</p>
                <p>기존 방식으로는 많은 시간과 시행착오가 필요했지만, 이제 <strong>${product}</strong>를 활용하면 놀라운 변화를 경험하실 수 있습니다.</p>
                <hr>
                <p><strong>🌟 ${product} 핵심 장점 TOP 3</strong></p>
                <ol>
                    <li><strong>초스피드 실행</strong>: 복잡한 과정 없이 단 5분 만에 세팅 완료!</li>
                    <li><strong>비용 극대화</strong>: 최소 비용으로 최대 효용(${benefit}) 창출!</li>
                    <li><strong>100% 맞춤형</strong>: ${target}의 니즈에 딱 맞춘 최적화 시스템 제공.</li>
                </ol>
                <hr>
                <p><strong>💬 실제 이용 고객 반응</strong></p>
                <p><em>"${benefit}을 이렇게 쉽게 달성할 줄 몰랐어요! ${target}분들에게 무조건 추천합니다!"</em></p>
                <hr>
                <p><strong>🎁 마무리하며 & 특별 혜택</strong></p>
                <p>지금 바로 <strong>${product}</strong>를 경험해 보시고, 여러분의 업무와 삶의 질을 한 단계 업그레이드해 보세요!</p>
                <p class="hashtag">#${cleanTagProduct} #${cleanTagTarget} #${cleanTagBenefit} #마케팅자동화 #AutoMarkAI</p>
            `;

            // Hide Spinner and Show Output
            loadingSpinner.classList.add('hidden');
            outputContainer.classList.remove('hidden');

            // Scroll gently to output
            outputContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 800);
    }

    // 4. Copy to Clipboard Handler
    copyBtn.addEventListener('click', () => {
        const textToCopy = `
[🔥 후킹 제목 5선]
${Array.from(titleList.querySelectorAll('li')).map(li => li.innerText).join('\n')}

[📝 네이버 블로그 최적화 원고]
${blogBody.innerText}
        `.trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = '✅ 복사 완료!';
            copyBtn.style.backgroundColor = 'var(--success)';
            setTimeout(() => {
                copyBtn.innerText = originalText;
                copyBtn.style.backgroundColor = '';
            }, 2000);
        }).catch(err => {
            alert('복사에 실패했습니다.');
        });
    });

    // 5. Subscription Plan Modal Handler
    selectPlanBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const planName = btn.getAttribute('data-plan');
            modalPlanName.innerText = planName;
            modal.classList.remove('hidden');
        });
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('🎉 신청이 완료되었습니다! 14일 무료 체험 계정이 이메일로 발송됩니다.');
        modal.classList.add('hidden');
    });
});
