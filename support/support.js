/**
 * 99COMLABS Support Portal Logic
 * Direct Ticket Dispatch to support@99comlabs.co.in & Interactive Knowledge Base
 */

document.addEventListener('DOMContentLoaded', () => {
    initKnowledgeBase();
    initSearch();
    initTicketForm();
    initModalControls();
    initKeyboardShortcuts();
});

/* ==========================================================================
   1. Dynamic Category Fast-Track
   ========================================================================== */
function prefillCategory(categoryName) {
    const select = document.getElementById('supportCategory');
    const ticketSection = document.getElementById('ticket-section');

    if (select) {
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === categoryName || select.options[i].text.includes(categoryName)) {
                select.selectedIndex = i;
                break;
            }
        }
    }

    if (ticketSection) {
        ticketSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const formCard = document.querySelector('.ticket-form-card');
        if (formCard) {
            formCard.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            setTimeout(() => {
                formCard.style.borderColor = '';
            }, 1200);
        }
    }
}

// Make globally accessible for onclick in HTML
window.prefillCategory = prefillCategory;

/* ==========================================================================
   2. Knowledge Base Accordion & Filtering
   ========================================================================== */
function initKnowledgeBase() {
    const accordionItems = document.querySelectorAll('.kb-item');
    const filterChips = document.querySelectorAll('.filter-chip');

    // Accordion expand / collapse
    accordionItems.forEach(item => {
        const trigger = item.querySelector('.kb-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other accordions for clean UX
            accordionItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });

    // Filter Chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const filter = chip.dataset.filter;
            const searchInput = document.getElementById('kbSearchInput');
            if (searchInput) searchInput.value = ''; // Reset search on category change

            filterAccordionItems(filter, '');
        });
    });
}

function filterAccordionItems(categoryFilter, searchQuery) {
    const items = document.querySelectorAll('.kb-item');
    const noResults = document.getElementById('noKbResults');
    let visibleCount = 0;

    const query = searchQuery.trim().toLowerCase();

    items.forEach(item => {
        const itemCategory = item.dataset.category || '';
        const questionText = item.querySelector('.kb-question')?.textContent.toLowerCase() || '';
        const contentText = item.querySelector('.kb-content')?.textContent.toLowerCase() || '';

        const matchesCategory = (categoryFilter === 'all' || itemCategory === categoryFilter);
        const matchesQuery = !query || questionText.includes(query) || contentText.includes(query);

        if (matchesCategory && matchesQuery) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });

    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

/* ==========================================================================
   3. Real-time Search Input
   ========================================================================== */
function initSearch() {
    const searchInput = document.getElementById('kbSearchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const activeChip = document.querySelector('.filter-chip.active');
        const currentFilter = activeChip ? activeChip.dataset.filter : 'all';

        filterAccordionItems(currentFilter, query);

        // Auto scroll to FAQ if typing search
        if (query.trim().length > 2) {
            const faqSection = document.getElementById('faq');
            if (faqSection && window.scrollY < faqSection.offsetTop - 300) {
                // Keep smooth focus
            }
        }
    });
}

function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const searchInput = document.getElementById('kbSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

/* ==========================================================================
   4. Support Ticket Form Submission & Dispatch
   ========================================================================== */
function generateTicketId() {
    const chars = '0123456789ABCDEF';
    let code = '';
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `#99LAB-${code}`;
}

function getSlaEstimate(severityVal) {
    if (severityVal.includes('P1')) return '< 2 Hours (24/7 Critical)';
    if (severityVal.includes('P2')) return '< 6 Hours (High Priority)';
    if (severityVal.includes('P3')) return '< 24 Hours (Standard)';
    return '< 48 Hours (General)';
}

let lastTicketPayload = '';

function initTicketForm() {
    const form = document.getElementById('supportTicketForm');
    const submitBtn = document.getElementById('submitTicketBtn');
    if (!form || !submitBtn) return;

    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Gather values
        const ticketId = generateTicketId();
        const clientName = document.getElementById('clientName').value.trim();
        const clientEmail = document.getElementById('clientEmail').value.trim();
        const clientPhone = document.getElementById('clientPhone').value.trim() || 'Not Provided';
        const projectId = document.getElementById('projectId').value.trim() || 'N/A';
        const domain = document.getElementById('supportCategory').value;
        const severity = document.getElementById('severityLevel').value;
        const subject = document.getElementById('ticketSubject').value.trim();
        const description = document.getElementById('ticketDescription').value.trim();

        // 2. Set hidden fields
        const ticketIdHidden = document.getElementById('ticketIdHidden');
        const subjectHidden = document.getElementById('formSubjectHidden');
        if (ticketIdHidden) ticketIdHidden.value = ticketId;
        if (subjectHidden) subjectHidden.value = `[${ticketId}] [${domain}] ${subject} (${clientName})`;

        // Construct email payload
        const payloadData = {
            Ticket_ID: ticketId,
            Client_Name: clientName,
            Client_Email: clientEmail,
            Phone_Number: clientPhone,
            Project_Reference: projectId,
            Engineering_Domain: domain,
            Urgency_Severity: severity,
            Subject: subject,
            Detailed_Description: description,
            Submitted_At: new Date().toISOString()
        };

        // Construct formatted raw string for copy / mailto
        lastTicketPayload = `=== 99COMLABS SUPPORT TICKET ===\nTicket ID: ${ticketId}\nClient: ${clientName} (${clientEmail})\nPhone: ${clientPhone}\nProject ID: ${projectId}\nDomain: ${domain}\nSeverity: ${severity}\nSubject: ${subject}\n\nDescription & Logs:\n${description}\n================================`;

        // UI Loading State
        submitBtn.disabled = true;
        if (btnText) btnText.style.display = 'none';
        if (btnSpinner) btnSpinner.style.display = 'inline-flex';

        try {
            // Send asynchronously via FormSubmit AJAX endpoint directly to support@99comlabs.co.in
            const response = await fetch('https://formsubmit.co/ajax/support@99comlabs.co.in', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payloadData)
            });

            // Show Confirmation Modal
            showTicketModal(ticketId, domain, severity, subject, clientName, clientEmail, description);
            form.reset();

        } catch (error) {
            console.warn('FormSubmit AJAX fallback triggered:', error);
            // Even if network blocks third-party CORS, show modal with prefilled mailto/whatsapp fallback
            showTicketModal(ticketId, domain, severity, subject, clientName, clientEmail, description);
        } finally {
            submitBtn.disabled = false;
            if (btnText) btnText.style.display = 'inline';
            if (btnSpinner) btnSpinner.style.display = 'none';
        }
    });
}

/* ==========================================================================
   5. Confirmation Modal & Action Triggers
   ========================================================================== */
function showTicketModal(ticketId, domain, severity, subject, clientName, clientEmail, description) {
    const modal = document.getElementById('ticketSuccessModal');
    const modalTicketId = document.getElementById('modalTicketId');
    const modalDomainSev = document.getElementById('modalDomainSev');
    const modalSlaTime = document.getElementById('modalSlaTime');
    const openMailtoBtn = document.getElementById('openMailtoBtn');
    const openWhatsAppBtn = document.getElementById('openWhatsAppBtn');

    if (modalTicketId) modalTicketId.textContent = ticketId;
    if (modalDomainSev) modalDomainSev.textContent = `${domain} • ${severity.split(' ')[0]}`;
    if (modalSlaTime) modalSlaTime.textContent = getSlaEstimate(severity);

    // Setup direct mailto client backup
    const mailSubject = encodeURIComponent(`[${ticketId}] ${subject} - ${clientName}`);
    const mailBody = encodeURIComponent(`Support Ticket Reference: ${ticketId}\nClient: ${clientName} (${clientEmail})\nDomain: ${domain}\nSeverity: ${severity}\n\nIssue Description:\n${description}`);
    if (openMailtoBtn) {
        openMailtoBtn.href = `mailto:support@99comlabs.co.in?subject=${mailSubject}&body=${mailBody}`;
    }

    // Setup direct WhatsApp escalation link
    const waText = encodeURIComponent(`*99COMLABS Support Ticket [${ticketId}]*\n*Client:* ${clientName}\n*Domain:* ${domain}\n*Severity:* ${severity}\n*Subject:* ${subject}\n\n*Details:* ${description.substring(0, 300)}...`);
    if (openWhatsAppBtn) {
        openWhatsAppBtn.href = `https://wa.me/919745551513?text=${waText}`;
    }

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function initModalControls() {
    const modal = document.getElementById('ticketSuccessModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const copyBtn = document.getElementById('copyTicketBtn');
    const copyBtnText = document.getElementById('copyBtnText');

    function closeModal() {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // Copy to clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (navigator.clipboard && lastTicketPayload) {
                navigator.clipboard.writeText(lastTicketPayload).then(() => {
                    if (copyBtnText) copyBtnText.textContent = 'Copied to Clipboard!';
                    setTimeout(() => {
                        if (copyBtnText) copyBtnText.textContent = 'Copy Reference & Payload';
                    }, 2500);
                });
            }
        });
    }
}
