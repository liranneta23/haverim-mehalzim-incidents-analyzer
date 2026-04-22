const API_BASE = window.location.origin;

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/api/dashboard`);
        const result = await res.json();
        if (result.success) {
            renderDashboard(result.data);
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('he-IL');
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
        } else {
            showError('Failed to load dashboard data');
        }
    } catch (err) {
        showError(`Connection error: ${err.message}`);
    }
}

function showError(msg) {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    document.getElementById('dashboard-content').innerHTML =
        `<div class="error-box">⚠ ${msg}</div>`;
}

function renderDashboard(data) {
    const { summary, all_time, current_month, impact } = data;

    const html = `
        <div class="section-label fade-in">
            <div class="section-label-text">סיכום כללי</div>
            <div class="section-label-line"></div>
        </div>

        <div class="kpi-grid">
            ${kpiCard('', summary.total_all_incidents, 'סך הכל אירועים', '', iconSignal())}
            ${kpiCard('', summary.total_handled_incidents, 'אירועים שטופלו', '', iconShield())}
            ${kpiCard('blue', summary.active_volunteers, 'מתנדבים פעילים', '', iconUsers())}
            ${kpiCard('amber', summary.countries_operated, 'מדינות פעולה', '', iconGlobe())}
        </div>

        <div class="section-label fade-in stagger-1">
            <div class="section-label-text">אימפקט</div>
            <div class="section-label-line"></div>
        </div>

        <div class="impact-strip fade-in stagger-2">
            <div class="impact-card danger">
                <div class="impact-info">
                    <div class="impact-label">מקרי חירום</div>
                    <div class="impact-number">${impact.count_life_threatening_incidents}</div>
                </div>
                <div class="impact-badge">CRITICAL</div>
            </div>
            <div class="impact-card success">
                <div class="impact-info">
                    <div class="impact-label">חיים שניצלו</div>
                    <div class="impact-number">${impact.count_life_saved}</div>
                </div>
                <div class="impact-badge">SAVED</div>
            </div>
        </div>

        <div class="section-label fade-in stagger-2">
            <div class="section-label-text">סוגי אירועים — סך הכל</div>
            <div class="section-label-line"></div>
        </div>

        <div class="two-col fade-in stagger-3">
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">כל האירועים</div>
                    <div class="panel-count">${Object.keys(all_time.incident_types).length} סוגים</div>
                </div>
                <div class="panel-body">${renderTypeRows(all_time.incident_types)}</div>
            </div>
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">אירועים שטופלו</div>
                    <div class="panel-count">${Object.keys(all_time.handled_incident_types).length} סוגים</div>
                </div>
                <div class="panel-body">${renderTypeRows(all_time.handled_incident_types)}</div>
            </div>
        </div>

        <div class="section-label fade-in stagger-3">
            <div class="section-label-text">פריסה גיאוגרפית</div>
            <div class="section-label-line"></div>
        </div>

        <div class="two-col fade-in stagger-4">
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">כל המדינות</div>
                    <div class="panel-count">${Object.keys(all_time.countries).length} מדינות</div>
                </div>
                <div class="panel-body">${renderCountryRows(all_time.countries)}</div>
            </div>
            <div class="panel">
                <div class="panel-header">
                    <div class="panel-title">מדינות שטיפלנו</div>
                    <div class="panel-count">${Object.keys(all_time.handled_countries).length} מדינות</div>
                </div>
                <div class="panel-body">${renderCountryRows(all_time.handled_countries)}</div>
            </div>
        </div>

        <div class="section-label fade-in stagger-4">
            <div class="section-label-text">החודש הנוכחי — ${getHebrewMonth()}</div>
            <div class="section-label-line"></div>
        </div>

        <div class="month-hero fade-in stagger-5">
            <div class="month-stats">
                <div class="month-stat">
                    <div class="month-stat-value">${current_month.total_incidents}</div>
                    <div class="month-stat-label">סך אירועים בחודש</div>
                </div>
                <div class="month-stat">
                    <div class="month-stat-value" style="color: var(--accent-teal);">${current_month.handled_incidents}</div>
                    <div class="month-stat-label">אירועים שטופלו</div>
                </div>
            </div>
            <div class="month-divider"></div>
            <div class="month-breakdown">${renderTypeRows(current_month.incident_types)}</div>
        </div>

        <div class="two-col fade-in stagger-5">
            <div class="panel">
                <div class="panel-header"><div class="panel-title">מדינות בחודש — כל האירועים</div></div>
                <div class="panel-body">${renderCountryRows(current_month.countries)}</div>
            </div>
            <div class="panel">
                <div class="panel-header"><div class="panel-title">מדינות בחודש — אירועים שטופלו</div></div>
                <div class="panel-body">${renderCountryRows(current_month.handled_countries)}</div>
            </div>
        </div>
    `;

    document.getElementById('dashboard-content').innerHTML = html;
}

function kpiCard(colorClass, value, label, extra, iconSvg) {
    return `
        <div class="kpi-card ${colorClass} fade-in">
            <div class="kpi-icon">${iconSvg}</div>
            <div class="kpi-number">${value}</div>
            <div class="kpi-label">${label}</div>
        </div>
    `;
}

function renderTypeRows(types) {
    if (!types || !Object.keys(types).length)
        return '<div class="empty">אין נתונים</div>';
    const entries = Object.entries(types).sort((a, b) => b[1] - a[1]);
    const max = entries[0][1];
    return entries.map(([type, count]) => `
        <div class="type-row">
            <div class="type-name">${type || 'לא ידוע'}</div>
            <div class="type-bar-container">
                <div class="type-bar" style="width: ${Math.round((count / max) * 100)}%"></div>
            </div>
            <div class="type-count">${count}</div>
        </div>
    `).join('');
}

function renderCountryRows(countries) {
    if (!countries || !Object.keys(countries).length)
        return '<div class="empty">אין נתונים</div>';
    return Object.entries(countries)
        .sort((a, b) => b[1] - a[1])
        .map(([country, count], i) => `
            <div class="country-row">
                <div class="country-rank">${String(i + 1).padStart(2, '0')}</div>
                <div class="country-name">${country || 'לא ידוע'}</div>
                <div class="country-badge">${count}</div>
            </div>
        `).join('');
}

function getHebrewMonth() {
    return new Date().toLocaleString('he-IL', { month: 'long', year: 'numeric' });
}

function iconSignal() {
    return `<svg viewBox="0 0 16 16" fill="none" stroke="#00e6a0" stroke-width="1.5" stroke-linecap="round">
        <circle cx="8" cy="8" r="2"/>
        <path d="M3 13a7 7 0 0 1 0-10M13 3a7 7 0 0 1 0 10"/>
    </svg>`;
}
function iconShield() {
    return `<svg viewBox="0 0 16 16" fill="none" stroke="#00e6a0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M8 2L3 4.5v4c0 3 2 5 5 5.5 3-.5 5-2.5 5-5.5v-4L8 2z"/>
    </svg>`;
}
function iconUsers() {
    return `<svg viewBox="0 0 16 16" fill="none" stroke="#4da6ff" stroke-width="1.5" stroke-linecap="round">
        <circle cx="6" cy="5" r="2.5"/>
        <path d="M1.5 13.5c0-2.5 2-4 4.5-4s4.5 1.5 4.5 4"/>
        <path d="M11 3.5a2.5 2.5 0 0 1 0 5M14.5 13.5c0-2-1.5-3.5-3.5-3.5"/>
    </svg>`;
}
function iconGlobe() {
    return `<svg viewBox="0 0 16 16" fill="none" stroke="#ffb930" stroke-width="1.5" stroke-linecap="round">
        <circle cx="8" cy="8" r="6"/>
        <path d="M2 8h12M8 2a10 10 0 0 1 0 12M8 2a10 10 0 0 0 0 12"/>
    </svg>`;
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    setInterval(loadDashboard, 5 * 60 * 1000);
});
