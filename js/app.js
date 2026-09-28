document.documentElement.classList.add('js');

const storedLanguage = localStorage.getItem('portfolio-language');
const SITE_URL = 'https://zoltanbabko.fr';

const currentCanonicalUrl = () => {
    const file = window.location.pathname.split('/').filter(Boolean).pop() || '';
    return `${SITE_URL}/${file && file !== 'index.html' ? file : ''}`;
};

const setMetaContent = (selector, attributes, value) => {
    if (!value) return;
    let element = document.head.querySelector(selector);
    if (!element) {
        element = document.createElement('meta');
        Object.entries(attributes).forEach(([attribute, attributeValue]) => {
            element.setAttribute(attribute, attributeValue);
        });
        document.head.appendChild(element);
    }
    element.setAttribute('content', value);
};

const ensureCanonical = () => {
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
    }
    link.setAttribute('href', currentCanonicalUrl());
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz6in5pUE9yGlQPJ7zUX36XCG5dYdC1ykDko2hPilF9bQO8jmejtI4uXLp8DndO6LmZ/exec';

const state = {
    language: storedLanguage === 'en' ? 'en' : 'fr',
    content: null,
    projectFilter: 'all',
    journeyTab: 'experience'
};

const getValue = (object, path) => path.split('.').reduce((value, key) => value?.[key], object);

const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const currentContent = () => state.content?.[state.language] || state.content?.fr;

const replaceYear = (value) => String(value).replace('{year}', new Date().getFullYear());

const applyTranslations = () => {
    const content = currentContent();
    if (!content) return;

    document.documentElement.lang = state.language;

    document.querySelectorAll('[data-i18n]').forEach((element) => {
        const value = getValue(content, element.dataset.i18n);
        if (typeof value === 'string') element.textContent = replaceYear(value);
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((element) => {
        element.dataset.i18nAttr.split(';').forEach((definition) => {
            const [attribute, ...pathParts] = definition.split(':');
            const value = getValue(content, pathParts.join(':'));
            if (attribute && typeof value === 'string') element.setAttribute(attribute, value);
        });
    });

    document.querySelectorAll('[data-lang]').forEach((button) => {
        const active = button.dataset.lang === state.language;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });

    const page = document.body.dataset.page;
    const pageData = content[page];
    const pageTitle = pageData?.seoTitle || pageData?.title;
    const pageDescription = pageData?.seoDescription;

    if (pageTitle) {
        document.title = pageTitle;
        setMetaContent('meta[property="og:title"]', {property: 'og:title'}, pageTitle);
        setMetaContent('meta[name="twitter:title"]', {name: 'twitter:title'}, pageTitle);
    }

    if (pageDescription) {
        setMetaContent('meta[name="description"]', {name: 'description'}, pageDescription);
        setMetaContent('meta[property="og:description"]', {property: 'og:description'}, pageDescription);
        setMetaContent('meta[name="twitter:description"]', {name: 'twitter:description'}, pageDescription);
    }

    setMetaContent('meta[property="og:url"]', {property: 'og:url'}, currentCanonicalUrl());
    setMetaContent('meta[property="og:locale"]', {property: 'og:locale'}, state.language === 'en' ? 'en_US' : 'fr_FR');
    setMetaContent('meta[property="og:locale:alternate"]', {property: 'og:locale:alternate'}, state.language === 'en' ? 'fr_FR' : 'en_US');
    ensureCanonical();
};

const setActiveNav = () => {
    const page = document.body.dataset.page;
    document.querySelectorAll('[data-nav]').forEach((link) => {
        const active = link.dataset.nav === page;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
};

const renderServices = () => {
    const picker = document.querySelector('#service-picker');
    if (!picker) return;

    const services = currentContent().home.services;
    picker.innerHTML = services.map((service, index) => `
        <button type="button" role="listitem" data-service-id="${escapeHtml(service.id)}">
            <span>${escapeHtml(service.label)}</span>
            <span>0${index + 1}</span>
        </button>
    `).join('');

    picker.querySelectorAll('[data-service-id]').forEach((button) => {
        button.addEventListener('click', () => selectService(button.dataset.serviceId));
    });

    selectService(services[0].id);
};

const selectService = (serviceId) => {
    const service = currentContent()?.home.services.find((item) => item.id === serviceId);
    if (!service) return;

    document.querySelectorAll('[data-service-id]').forEach((button) => {
        const active = button.dataset.serviceId === serviceId;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });

    const title = document.querySelector('#service-result-title');
    const description = document.querySelector('#service-result-description');
    const list = document.querySelector('#service-result-list');
    const link = document.querySelector('#service-result-link');
    if (!title || !description || !list || !link) return;

    title.textContent = service.title;
    description.textContent = service.description;
    list.innerHTML = service.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
    link.href = `contact.html?need=${encodeURIComponent(service.id)}`;
};

const renderFeaturedProjects = () => {
    const container = document.querySelector('#featured-projects');
    if (!container) return;

    const projects = currentContent().projects.items.slice(0, 3);
    container.innerHTML = projects.map((project, index) => {
        const destination = project.demo || project.repo || `projets.html#${project.id}`;
        return `
            <article class="project-preview reveal${index === 1 ? ' delay-1' : ''}">
                <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.alt)}" loading="lazy">
                <div class="project-preview-content">
                    <span class="label">${escapeHtml(project.type)}</span>
                    <h3>${escapeHtml(project.title)}</h3>
                    <a href="${escapeHtml(destination)}" target="_blank" rel="noreferrer">${escapeHtml(currentContent().common.ui.viewProject)} ↗</a>
                </div>
            </article>
        `;
    }).join('');
};

const renderFacts = () => {
    const container = document.querySelector('#facts-grid');
    if (!container) return;

    container.innerHTML = currentContent().about.facts.map((fact) => `
        <div class="fact"><span class="fact-label">${escapeHtml(fact.label)}</span><span class="fact-value">${escapeHtml(fact.value)}</span></div>
    `).join('');
};

const renderSkills = () => {
    const container = document.querySelector('#skills-grid');
    if (!container) return;

    container.innerHTML = currentContent().about.skillGroups.map((group) => `
        <article class="skill-group"><h3>${escapeHtml(group.title)}</h3><p>${escapeHtml(group.items)}</p></article>
    `).join('');
};

const renderJourney = () => {
    const container = document.querySelector('#timeline-content');
    if (!container) return;

    const content = currentContent().journey;
    const items = content[state.journeyTab];
    container.className = state.journeyTab === 'education' ? 'education-list' : 'timeline';

    if (state.journeyTab === 'education') {
        container.innerHTML = items.map((item) => `
            <article class="education-item reveal">
                <span>${escapeHtml(item.date)}</span>
                <div><h3>${escapeHtml(item.degree)}</h3><p>${escapeHtml(item.school)} · ${escapeHtml(item.description)}</p></div>
            </article>
        `).join('');
    } else {
        container.innerHTML = items.map((item, index) => `
            <article class="timeline-item reveal${index === 1 ? ' delay-1' : ''}">
                <div class="timeline-date">${escapeHtml(item.date)}</div>
                <div class="timeline-content"><p class="timeline-company">${escapeHtml(item.company)}</p><h3>${escapeHtml(item.role)}</h3><p>${escapeHtml(item.description)}</p></div>
                <span class="timeline-mark">${String(index + 1).padStart(2, '0')}</span>
            </article>
        `).join('');
    }

    document.querySelectorAll('[data-tab]').forEach((button) => {
        const active = button.dataset.tab === state.journeyTab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
    });
};

const initJourneyTabs = () => {
    document.querySelectorAll('[data-tab]').forEach((button) => {
        button.addEventListener('click', () => {
            if (button.dataset.tab === state.journeyTab) return;
            state.journeyTab = button.dataset.tab;
            renderJourney();
            revealElements();
        });
    });
};

const renderProjectFilters = () => {
    const container = document.querySelector('#project-filters');
    if (!container) return;

    const filters = currentContent().projects.filters;
    container.innerHTML = Object.entries(filters).map(([key, label]) => `
        <button class="filter-button${key === state.projectFilter ? ' active' : ''}" type="button" data-filter="${escapeHtml(key)}" aria-pressed="${String(key === state.projectFilter)}">${escapeHtml(label)}</button>
    `).join('');

    container.querySelectorAll('[data-filter]').forEach((button) => {
        button.addEventListener('click', () => {
            state.projectFilter = button.dataset.filter;
            renderProjectFilters();
            renderProjects();
        });
    });
};

const renderProjects = () => {
    const container = document.querySelector('#project-grid');
    if (!container) return;

    const allProjects = currentContent().projects.items;
    const projects = state.projectFilter === 'all'
        ? allProjects
        : allProjects.filter((project) => project.category === state.projectFilter);

    const count = document.querySelector('#project-count');
    if (count) count.textContent = `${String(projects.length).padStart(2, '0')} / ${String(allProjects.length).padStart(2, '0')}`;

    if (!projects.length) {
        container.innerHTML = `<p class="empty-state">${escapeHtml(currentContent().common.ui.emptyProjects)}</p>`;
        return;
    }

    container.innerHTML = projects.map((project) => {
        const links = [];
        if (project.demo) links.push(`<a href="${escapeHtml(project.demo)}" target="_blank" rel="noreferrer">${escapeHtml(currentContent().common.ui.demo)} ↗</a>`);
        if (project.repo) links.push(`<a href="${escapeHtml(project.repo)}" target="_blank" rel="noreferrer">${escapeHtml(currentContent().common.ui.repository)} ↗</a>`);
        return `
            <article class="project-card reveal">
                <div class="project-image"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.alt)}" loading="lazy"><span class="label">${escapeHtml(project.type)}</span></div>
                <div class="project-info"><span class="project-type">${escapeHtml(currentContent().projects.filters[project.category] || project.category)}</span><h2>${escapeHtml(project.title)}</h2><p>${escapeHtml(project.description)}</p><div class="tag-list">${project.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div><div class="project-actions">${links.join('')}</div></div>
            </article>
        `;
    }).join('');
    revealElements();
};

const renderNeedOptions = () => {
    const select = document.querySelector('#need');
    if (!select) return;

    const previousValue = select.value || new URLSearchParams(window.location.search).get('need') || '';
    const needs = currentContent().contact.form.needs;
    select.innerHTML = `<option value="" data-i18n="contact.form.needPlaceholder">${escapeHtml(currentContent().contact.form.needPlaceholder)}</option>`;
    Object.entries(needs).forEach(([value, label]) => {
        select.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`);
    });
    select.value = Object.prototype.hasOwnProperty.call(needs, previousValue) ? previousValue : '';
};

const initContactForm = () => {
    const form = document.querySelector('#contact-form');
    if (!form || form.dataset.ready === 'true') return;
    form.dataset.ready = 'true';
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const name = String(data.get('name') || '').trim();
        const email = String(data.get('email') || '').trim();
        const need = String(data.get('need') || '').trim();
        const message = String(data.get('message') || '').trim();
        const status = document.querySelector('#form-status');

        if (!name || !email || !need || !message) {
            if (status) {
                status.textContent = currentContent().common.ui.formError;
                status.classList.add('is-visible');
            }
            return;
        }

        const selectedNeed = currentContent().contact.form.needs[need] || need;
        const payload = new URLSearchParams({
            name,
            email,
            need: selectedNeed,
            message,
            language: state.language,
            website: String(data.get('website') || '')
        });

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: payload,
                mode: 'no-cors'
            });

            form.reset();
            if (status) {
                status.textContent = currentContent().common.ui.formSent;
                status.classList.add('is-visible');
            }
        } catch (error) {
            console.error('Unable to save the contact form.', error);
            if (status) {
                status.textContent = currentContent().common.ui.formServerError;
                status.classList.add('is-visible');
            }
        }
    });
};

const revealElements = () => {
    const elements = document.querySelectorAll('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) {
        elements.forEach((element) => element.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                currentObserver.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });

    elements.forEach((element) => observer.observe(element));
};

const renderPage = () => {
    applyTranslations();
    setActiveNav();
    renderServices();
    renderFeaturedProjects();
    renderFacts();
    renderSkills();
    renderJourney();
    renderProjectFilters();
    renderProjects();
    renderNeedOptions();
    initContactForm();
    revealElements();
};

const initMenu = () => {
    const toggle = document.querySelector('#menu-toggle');
    const menu = document.querySelector('#site-menu');
    if (!toggle || !menu) return;

    const setMenu = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        menu.classList.toggle('is-open', open);
        const label = toggle.querySelector('[data-i18n="common.ui.menu"]');
        const content = currentContent();
        if (label && content) label.textContent = open ? content.common.ui.close : content.common.ui.menu;
    };

    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (event) => {
        if (!menu.contains(event.target) && !toggle.contains(event.target)) setMenu(false);
    });
    window.addEventListener('resize', () => {
        if (window.innerWidth > 760) setMenu(false);
    });
};

const initLanguage = () => {
    document.querySelectorAll('[data-lang]').forEach((button) => {
        button.addEventListener('click', () => {
            if (!state.content || button.dataset.lang === state.language) return;
            state.language = button.dataset.lang;
            localStorage.setItem('portfolio-language', state.language);
            renderPage();
        });
    });
};

const init = async () => {
    initMenu();
    initLanguage();
    initJourneyTabs();
    try {
        const response = await fetch('js/content.json', { cache: 'no-store' });
        if (!response.ok) throw new Error(`content.json: ${response.status}`);
        state.content = await response.json();
        renderPage();
    } catch (error) {
        console.error('Unable to load the portfolio content.', error);
        document.documentElement.classList.remove('js');
    }
};

document.addEventListener('DOMContentLoaded', init);
