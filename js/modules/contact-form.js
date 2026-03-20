export function initContactForm({ config, t }) {
    const contactForm = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');
    const messageInput = document.getElementById('contact-message');
    const templateButtons = document.querySelectorAll('[data-contact-template]');

    // Booking Modal Elements
    const bookingToggleBtn = document.getElementById('booking-toggle-btn');
    const bookingModal = document.getElementById('booking-modal');
    const bookingForm = document.getElementById('booking-form');
    const bookingCloseBtn = document.querySelector('.booking-close-btn');
    const bookingCancelBtn = document.getElementById('booking-cancel-btn');
    const bookingFeedback = document.getElementById('booking-feedback');

    if (!contactForm || !feedback) return;

    // Template buttons handler for main contact form
    if (messageInput && templateButtons.length > 0) {
        templateButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const templateKey = button.getAttribute('data-contact-template');
                const template = t(`contact.booking.messages.${templateKey}`);
                if (!template || template === `contact.booking.messages.${templateKey}`) return;

                messageInput.value = template;
                messageInput.dispatchEvent(new Event('input', { bubbles: true }));
                messageInput.focus();
                messageInput.setSelectionRange(messageInput.value.length, messageInput.value.length);
            });
        });
    }

    // Main contact form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('contact-submit');
        const originalText = submitBtn.innerHTML;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loader-dots">...</span>';

        const formData = new FormData(contactForm);
        const payload = {
            embeds: [{
                title: 'Nouveau Message du Portfolio 📬',
                color: 0x8b5cf6,
                fields: [
                    { name: 'Nom', value: formData.get('name'), inline: true },
                    { name: 'Email', value: formData.get('email'), inline: true },
                    { name: 'Message', value: formData.get('message') }
                ],
                timestamp: new Date().toISOString()
            }]
        };

        if (!config.supabaseUrl || config.supabaseUrl.includes('{{')) {
            console.warn('⚠️ Supabase not configured.');
            feedback.textContent = t('contact.error');
            feedback.className = 'form-feedback error';
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            return;
        }

        const functionUrl = `${config.supabaseUrl}/functions/v1/contact-handler`;

        try {
            const res = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${config.supabaseAnonKey}`
                },
                body: JSON.stringify({ payload })
            });

            if (res.ok) {
                feedback.textContent = t('contact.success');
                feedback.classList.remove('error');
                feedback.classList.add('success');
                feedback.style.display = 'block';
                contactForm.reset();
            } else {
                throw new Error();
            }
        } catch {
            feedback.textContent = t('contact.error');
            feedback.classList.remove('success');
            feedback.classList.add('error');
            feedback.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            setTimeout(() => {
                feedback.style.display = 'none';
            }, 5000);
        }
    });

    // Booking Modal Handlers
    if (bookingToggleBtn && bookingModal && bookingForm) {
        const bookingDateInput = document.getElementById('booking-date');
        const bookingTimeInput = document.getElementById('booking-time');
        const calendarDaysEl = document.querySelector('.calendar-days');
        const calendarMonthEl = document.querySelector('.calendar-month');
        const calendarYearEl = document.querySelector('.calendar-year');
        const timeGridEl = document.querySelector('.time-grid');
        const calendarPrevBtn = document.querySelector('.calendar-nav.prev');
        const calendarNextBtn = document.querySelector('.calendar-nav.next');
        const selectedDateDisplay = document.getElementById('selected-date-display');
        const selectedTimeDisplay = document.getElementById('selected-time-display');

        let currentDate = new Date();
        currentDate.setHours(12, 0, 0, 0);

        const getMonthDays = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDayOfWeek = firstDay.getDay();

            return { daysInMonth, startingDayOfWeek, year, month };
        };

        const isDateAvailable = (date) => {
            const dayOfWeek = date.getDay();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Must be after today
            if (date < today) return false;
            // Must not be Sunday (0)
            if (dayOfWeek === 0) return false;
            return true;
        };

        const getAvailableHours = (date) => {
            const dayOfWeek = date.getDay();
            const hours = [];

            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                // Lun-Ven: 18:00-20:00
                for (let h = 18; h <= 20; h++) {
                    hours.push(`${h.toString().padStart(2, '0')}:00`);
                    if (h < 20) hours.push(`${h.toString().padStart(2, '0')}:30`);
                }
            } else if (dayOfWeek === 6) {
                // Sam: 14:00-18:00
                for (let h = 14; h <= 18; h++) {
                    hours.push(`${h.toString().padStart(2, '0')}:00`);
                    if (h < 18) hours.push(`${h.toString().padStart(2, '0')}:30`);
                }
            }
            return hours;
        };

        const renderCalendar = () => {
            const { daysInMonth, startingDayOfWeek, year, month } = getMonthDays(currentDate);

            calendarMonthEl.textContent = currentDate.toLocaleDateString('fr-FR', { month: 'long' });
            calendarYearEl.textContent = year;

            calendarDaysEl.innerHTML = '';

            // Empty cells for days before month starts (adjust for Monday start)
            const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
            for (let i = 0; i < adjustedStart; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'calendar-day empty';
                calendarDaysEl.appendChild(emptyCell);
            }

            // Days of month
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayEl = document.createElement('button');
                dayEl.type = 'button';
                dayEl.className = 'calendar-day';
                dayEl.textContent = day;

                const isAvailable = isDateAvailable(date);
                const isSelected = bookingDateInput.value === date.toISOString().split('T')[0];

                if (!isAvailable) {
                    dayEl.disabled = true;
                    dayEl.className += ' disabled';
                } else if (isSelected) {
                    dayEl.className += ' selected';
                }

                dayEl.addEventListener('click', () => {
                    if (isAvailable) {
                        bookingDateInput.value = date.toISOString().split('T')[0];
                        selectedDateDisplay.textContent = date.toLocaleDateString('fr-FR', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        });
                        renderCalendar();
                        renderTimeGrid();
                    }
                });

                calendarDaysEl.appendChild(dayEl);
            }
        };

        const renderTimeGrid = () => {
            const selectedDate = bookingDateInput.value;
            if (!selectedDate) {
                timeGridEl.innerHTML = '<p class="time-placeholder">Sélectionner une date d\'abord</p>';
                return;
            }

            const date = new Date(selectedDate + 'T00:00:00');
            const hours = getAvailableHours(date);

            timeGridEl.innerHTML = '';

            hours.forEach(time => {
                const timeBtn = document.createElement('button');
                timeBtn.type = 'button';
                timeBtn.className = 'time-slot';
                timeBtn.textContent = time;

                if (bookingTimeInput.value === time) {
                    timeBtn.className += ' selected';
                }

                timeBtn.addEventListener('click', () => {
                    bookingTimeInput.value = time;
                    selectedTimeDisplay.textContent = time;
                    document.querySelectorAll('.time-slot').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    timeBtn.classList.add('selected');
                });

                timeGridEl.appendChild(timeBtn);
            });
        };

        if (calendarPrevBtn) {
            calendarPrevBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });
        }

        if (calendarNextBtn) {
            calendarNextBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });
        }

        // Open modal
        bookingToggleBtn.addEventListener('click', () => {
            bookingModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            // Initialize pickers
            renderCalendar();
            renderTimeGrid();
        });

        // Close modal
        const closeModal = () => {
            bookingModal.classList.remove('open');
            document.body.style.overflow = '';
        };

        if (bookingCloseBtn) {
            bookingCloseBtn.addEventListener('click', closeModal);
        }

        if (bookingCancelBtn) {
            bookingCancelBtn.addEventListener('click', closeModal);
        }

        // Close on overlay click
        bookingModal.addEventListener('click', (e) => {
            if (e.target === bookingModal) {
                closeModal();
            }
        });

        // Form submission
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loader-dots">...</span>';

            const formData = new FormData(bookingForm);
            const selectedDate = formData.get('date');
            const selectedTime = formData.get('time');
            const dateObj = new Date(selectedDate + 'T' + selectedTime);
            const dateDisplay = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

            const payload = {
                embeds: [{
                    title: '📅 Nouvelle Résa Rapide',
                    color: 0x7c3ae5,
                    fields: [
                        { name: 'Nom', value: formData.get('name'), inline: true },
                        { name: 'Email', value: formData.get('email'), inline: true },
                        { name: 'Téléphone', value: formData.get('phone') || 'Non fourni', inline: true },
                        { name: 'Date et Heure', value: `${dateDisplay} à ${selectedTime}`, inline: false },
                        { name: 'Description du Projet', value: formData.get('description') }
                    ],
                    timestamp: new Date().toISOString()
                }]
            };

            if (!config.supabaseUrl || config.supabaseUrl.includes('{{')) {
                console.warn('⚠️ Supabase not configured.');
                bookingFeedback.textContent = t('contact.booking.error');
                bookingFeedback.className = 'form-feedback error';
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                return;
            }

            const functionUrl = `${config.supabaseUrl}/functions/v1/contact-handler`;

            try {
                const res = await fetch(functionUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${config.supabaseAnonKey}`
                    },
                    body: JSON.stringify({ payload })
                });

                if (res.ok) {
                    bookingFeedback.textContent = t('contact.booking.success');
                    bookingFeedback.classList.remove('error');
                    bookingFeedback.classList.add('success');
                    bookingFeedback.style.display = 'block';
                    bookingForm.reset();

                    // Close modal after 2 seconds
                    setTimeout(() => {
                        closeModal();
                        bookingFeedback.style.display = 'none';
                    }, 2000);
                } else {
                    throw new Error();
                }
            } catch (error) {
                console.error('Booking error:', error);
                bookingFeedback.textContent = t('contact.booking.error');
                bookingFeedback.classList.remove('success');
                bookingFeedback.classList.add('error');
                bookingFeedback.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
}
