/**
 * 99COMLABS - Interactive Web Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initEstimatorTool();
    initDrawerModal();
    initFormSubmission();
});

/* ==========================================
   1. Interactive Scope & Timeline Estimator
   ========================================== */
function initEstimatorTool() {
    const pillarButtons = document.querySelectorAll('#servicePillarOptions .opt-btn');
    const scaleButtons = document.querySelectorAll('#scaleOptions .opt-btn');
    
    const resPillar = document.getElementById('resPillar');
    const resTime = document.getElementById('resTime');
    const resArch = document.getElementById('resArch');
    const requestEstimateBtn = document.getElementById('requestEstimateBtn');

    let currentPillar = 'software';
    let currentScale = 'mvp';

    const pillarLabels = {
        software: 'Full-Stack Web/App',
        hardware: 'Embedded IoT / PCB',
        cloud: 'Cloud & Hosting Infra',
        ecosystem: 'Full Hardware + Software'
    };

    const timelines = {
        software: { mvp: '2 - 3 Weeks', production: '4 - 6 Weeks', enterprise: '8+ Weeks' },
        hardware: { mvp: '3 - 4 Weeks', production: '6 - 8 Weeks', enterprise: '10+ Weeks' },
        cloud: { mvp: '1 - 2 Weeks', production: '2 - 3 Weeks', enterprise: '4+ Weeks' },
        ecosystem: { mvp: '4 - 6 Weeks', production: '8 - 12 Weeks', enterprise: '14+ Weeks' }
    };

    const architectures = {
        software: 'Modular React / Node API',
        hardware: 'ARM Microcontroller + PCB',
        cloud: 'Docker Containerized Cluster',
        ecosystem: 'Integrated IoT + Cloud Hub'
    };

    function updateBlueprint() {
        resPillar.textContent = pillarLabels[currentPillar];
        resTime.textContent = timelines[currentPillar][currentScale];
        resArch.textContent = architectures[currentPillar];
    }

    pillarButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            pillarButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPillar = btn.dataset.pillar;
            updateBlueprint();
        });
    });

    scaleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            scaleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentScale = btn.dataset.scale;
            updateBlueprint();
        });
    });

    if (requestEstimateBtn) {
        requestEstimateBtn.addEventListener('click', () => {
            openDrawerWithPreset(pillarLabels[currentPillar]);
        });
    }
}

/* ==========================================
   2. Slide-Over Drawer Modal Control
   ========================================== */
function initDrawerModal() {
    const drawerOverlay = document.getElementById('drawerOverlay');
    const closeBtn = document.getElementById('drawerClose');
    const openBtns = [
        document.getElementById('openDrawerNav'),
        document.getElementById('openDrawerHero')
    ];

    function openDrawer() {
        if (drawerOverlay) drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (drawerOverlay) drawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    openBtns.forEach(btn => {
        if (btn) btn.addEventListener('click', openDrawer);
    });

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', (e) => {
            if (e.target === drawerOverlay) closeDrawer();
        });
    }
}

function openDrawerWithPreset(serviceName) {
    const drawerOverlay = document.getElementById('drawerOverlay');
    const projectTypeSelect = document.getElementById('projectType');
    
    if (projectTypeSelect) {
        for (let i = 0; i < projectTypeSelect.options.length; i++) {
            if (projectTypeSelect.options[i].text.toLowerCase().includes(serviceName.toLowerCase())) {
                projectTypeSelect.selectedIndex = i;
                break;
            }
        }
    }
    
    if (drawerOverlay) {
        drawerOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

/* ==========================================
   3. Form Submission & Direct Action Trigger
   ========================================== */
function initFormSubmission() {
    const form = document.getElementById('projectForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('clientName').value;
        const email = document.getElementById('clientEmail').value;
        const type = document.getElementById('projectType').value;
        const details = document.getElementById('projectDetails').value;

        const subject = encodeURIComponent(`Project Inquiry: ${type} - ${name}`);
        const body = encodeURIComponent(`Client Name: ${name}\nClient Email: ${email}\nRequirement: ${type}\n\nProject Scope & Details:\n${details}`);

        // Direct mailto trigger
        const mailtoUrl = `mailto:connect@99comlabs.co.in?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;

        // Feedback toast
        alert('Thank you for initiating your inquiry! Opening your email client to send message to connect@99comlabs.co.in...');
        
        const drawerOverlay = document.getElementById('drawerOverlay');
        if (drawerOverlay) drawerOverlay.classList.remove('active');
        document.body.style.overflow = '';
    });
}
