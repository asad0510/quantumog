document.addEventListener('DOMContentLoaded', () => {
    const header = document.getElementById('header');
    const toggle = document.getElementById('nav-toggle');
    const close = document.getElementById('nav-close');
    const menu = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 50);
    });

    if (toggle) toggle.addEventListener('click', () => menu.classList.add('show'));
    if (close) close.addEventListener('click', () => menu.classList.remove('show'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('show')));

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    document.querySelectorAll('.card, .contact__form, .about__stats').forEach(el => { el.classList.add('fade-in'); obs.observe(el); });

    const form = document.getElementById('contact-form');
    if (form) form.addEventListener('submit', e => {
        e.preventDefault();
        const btn = form.querySelector('button');
        btn.textContent = 'Sent!';
        btn.style.background = '#22c55e';
        btn.style.color = '#fff';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; form.reset(); }, 3000);
    });
});
