(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasGsap = typeof window.gsap !== 'undefined';

    // Header turns solid once the page scrolls.
    const header = document.querySelector('.header');
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ---------- Diagonal split ----------
    const split = document.getElementById('split');
    if (split) {
        const slices = [...split.querySelectorAll('.slice')];
        // Boundary positions (percent of width) for: none, slice 1, slice 2, slice 3 open.
        const LAYOUTS = {
            0: { b1: 33.333, b2: 66.667 },
            1: { b1: 56, b2: 78 },
            2: { b1: 22, b2: 78 },
            3: { b1: 22, b2: 44 },
        };
        let active = 0;

        const setActive = (n) => {
            if (n === active) return;
            active = n;
            split.dataset.active = n;
            split.classList.toggle('has-active', n !== 0);
            slices.forEach((s, i) => s.classList.toggle('is-active', i + 1 === n));

            const { b1, b2 } = LAYOUTS[n];
            const vars = { '--b1': `${b1}%`, '--b2': `${b2}%` };
            if (hasGsap && !reduceMotion) {
                gsap.to(split, { ...vars, duration: 0.8, ease: 'expo.out', overwrite: true });
            } else {
                split.style.setProperty('--b1', vars['--b1']);
                split.style.setProperty('--b2', vars['--b2']);
            }
        };

        if (canHover) {
            slices.forEach((s, i) => s.addEventListener('pointerenter', () => setActive(i + 1)));
            split.addEventListener('pointerleave', () => {
                if (!split.contains(document.activeElement)) setActive(0);
            });
            split.addEventListener('focusin', (e) => {
                const i = slices.indexOf(e.target.closest('.slice'));
                if (i > -1) setActive(i + 1);
            });
            split.addEventListener('focusout', (e) => {
                if (!split.contains(e.relatedTarget) && !split.matches(':hover')) setActive(0);
            });
        } else {
            // Touch: the first tap opens a slice, the second tap follows its link.
            slices.forEach((s, i) => s.addEventListener('click', (e) => {
                if (active !== i + 1) {
                    e.preventDefault();
                    setActive(i + 1);
                }
            }));
        }
    }

    // ---------- Intro ----------
    if (hasGsap && !reduceMotion) {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.header__inner > *', { y: -16, opacity: 0, duration: 0.6, stagger: 0.06, clearProps: 'all' })
          .from('.hero__line, .page-hero h1, .page-hero .eyebrow', { y: 36, opacity: 0, duration: 0.9, stagger: 0.12, clearProps: 'all' }, '-=0.35')
          .from('.hero__sub, .page-hero__lead, .page-hero__actions', { y: 20, opacity: 0, duration: 0.7, stagger: 0.08, clearProps: 'all' }, '-=0.6');

        if (split) {
            tl.from('.slice', { yPercent: 12, opacity: 0, duration: 1, stagger: 0.12, ease: 'expo.out', clearProps: 'transform,opacity' }, '-=0.5')
              .from('.slice__body', { y: 24, opacity: 0, duration: 0.7, stagger: 0.12, clearProps: 'all' }, '-=0.75')
              .from('.split__hint', { opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.3');
        }
        if (document.querySelector('.page-hero__media img')) {
            tl.from('.page-hero__media img', { clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)', duration: 1.2, ease: 'expo.inOut', clearProps: 'clipPath' }, 0.2);
        }

        // Section content rises in as it scrolls into view.
        const revealables = document.querySelectorAll('.start__inner, .contact__inner > *, .section__title, .section__intro, .item, .step, .other, .split-text > *');
        gsap.set(revealables, { opacity: 0, y: 28 });
        const io = new IntersectionObserver((entries) => {
            const shown = entries.filter((en) => en.isIntersecting).map((en) => en.target);
            if (!shown.length) return;
            gsap.to(shown, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', clearProps: 'transform' });
            shown.forEach((el) => io.unobserve(el));
        }, { rootMargin: '0px 0px -8% 0px' });
        revealables.forEach((el) => io.observe(el));
    }

    // ---------- Contact form ----------
    const form = document.getElementById('contact-form');
    if (form) {
        const service = form.querySelector('#service');
        const requested = new URLSearchParams(location.search).get('service');
        if (requested && service.querySelector(`option[value="${CSS.escape(requested)}"]`)) service.value = requested;

        const error = document.getElementById('form-error');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = form.elements.name;
            const email = form.elements.email;
            const problems = [];
            [name, email].forEach((f) => f.removeAttribute('aria-invalid'));
            if (!name.value.trim()) { problems.push('your name'); name.setAttribute('aria-invalid', 'true'); }
            if (!email.validity.valid || !email.value.trim()) { problems.push('a valid email'); email.setAttribute('aria-invalid', 'true'); }
            if (problems.length) {
                error.textContent = `Add ${problems.join(' and ')} so we can reply.`;
                error.hidden = false;
                form.querySelector('[aria-invalid="true"]').focus();
                return;
            }
            error.hidden = true;

            const chosen = service.selectedOptions[0];
            const subject = `Website inquiry${service.value ? `: ${chosen.text}` : ''}`;
            const company = form.elements.company.value.trim();
            const details = [`Name: ${name.value.trim()}`, `Email: ${email.value.trim()}`];
            if (company) details.push(`Company: ${company}`);
            const body = [details.join('\n'), form.elements.message.value.trim()].filter(Boolean).join('\n\n');
            window.location.href = `mailto:contact@quantumog.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    }
})();
