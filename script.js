// Variável para armazenar o evento beforeinstallprompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

// Registrar o Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration.scope);
            })
            .catch(error => {
                console.error('Erro ao registrar o Service Worker:', error);
            });
    });
}

// Capturar o evento beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

// Adicionar evento de clique ao botão de instalação
if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Resposta do usuário ao prompt de instalação: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    });
}

// Detectar quando o app foi instalado
window.addEventListener('appinstalled', () => {
    console.log('PWA instalado com sucesso!');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
});