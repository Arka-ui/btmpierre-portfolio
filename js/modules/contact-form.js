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

        // Generate available dates and times
        const generateAvailableDates = () => {
            const dates = [];
            const today = new Date();
            
            // Generate next 14 days
            for (let i = 1; i <= 14; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                const dayOfWeek = date.getDay();
                
                // Skip Sundays (0)
                if (dayOfWeek !== 0) {
                    dates.push({
                        date: date,
                        isWeekday: dayOfWeek >= 1 && dayOfWeek <= 5,
                        isSaturday: dayOfWeek === 6
                    });
                }
            }
            return dates;
        };

        const getAvailableHours = (date) => {
            const dayOfWeek = date.getDay();
            const hours = [];
            
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                // Lun-Ven: 18:00-20:00
                hours.push('18:00', '18:30', '19:00', '19:30', '20:00');
            } else if (dayOfWeek === 6) {
                // Sam: 14:00-18:00
                hours.push('14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00');
            }
            return hours;
        };

        // Set min date and populate dates
        if (bookingDateInput) {
            const today = new Date();
            today.setDate(today.getDate() + 1);
            const minDate = today.toISOString().split('T')[0];
            bookingDateInput.setAttribute('min', minDate);

            bookingDateInput.addEventListener('change', (e) => {
                const selectedDate = new Date(e.target.value + 'T00:00:00');
                const availableHours = getAvailableHours(selectedDate);
                
                // Update time dropdown
                bookingTimeInput.innerHTML = '<option value="" disabled selected>-- Choisir une heure --</option>';
                availableHours.forEach(hour => {
                    const option = document.createElement('option');
                    option.value = hour;
                    option.textContent = hour;
                    bookingTimeInput.appendChild(option);
                });
                bookingTimeInput.value = '';
            });
        }

        // Open modal
        bookingToggleBtn.addEventListener('click', () => {
            bookingModal.classList.add('open');
            document.body.style.overflow = 'hidden';
            
            // Trigger date change to populate times
            if (bookingDateInput && bookingDateInput.value) {
                bookingDateInput.dispatchEvent(new Event('change'));
            }
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
