export function initContactForm({ config, t }) {
    const contactForm = document.getElementById('contact-form');
    const feedback = document.getElementById('form-feedback');

    if (!contactForm || !feedback) return;

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
}
