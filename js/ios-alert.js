const IOSAlert = {
    alert(title, message, buttonText = '确定') {
        return new Promise((resolve) => {
            const alertEl = document.getElementById('iosAlert');
            const titleEl = document.getElementById('iosAlertTitle');
            const messageEl = document.getElementById('iosAlertMessage');
            const actionsEl = document.getElementById('iosAlertActions');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            messageEl.style.display = message ? 'block' : 'none';
            
            actionsEl.innerHTML = `
                <button class="ios-alert-btn primary">${buttonText}</button>
            `;
            
            alertEl.classList.add('active');
            
            const btn = actionsEl.querySelector('button');
            btn.addEventListener('click', () => {
                alertEl.classList.remove('active');
                resolve(true);
            });
        });
    },
    
    confirm(title, message, confirmText = '确定', cancelText = '取消') {
        return new Promise((resolve) => {
            const alertEl = document.getElementById('iosAlert');
            const titleEl = document.getElementById('iosAlertTitle');
            const messageEl = document.getElementById('iosAlertMessage');
            const actionsEl = document.getElementById('iosAlertActions');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            messageEl.style.display = message ? 'block' : 'none';
            
            actionsEl.innerHTML = `
                <button class="ios-alert-btn cancel">${cancelText}</button>
                <button class="ios-alert-btn primary">${confirmText}</button>
            `;
            
            alertEl.classList.add('active');
            
            const buttons = actionsEl.querySelectorAll('button');
            buttons[0].addEventListener('click', () => {
                alertEl.classList.remove('active');
                resolve(false);
            });
            
            buttons[1].addEventListener('click', () => {
                alertEl.classList.remove('active');
                resolve(true);
            });
        });
    },
    
    confirmDestructive(title, message, confirmText = '删除', cancelText = '取消') {
        return new Promise((resolve) => {
            const alertEl = document.getElementById('iosAlert');
            const titleEl = document.getElementById('iosAlertTitle');
            const messageEl = document.getElementById('iosAlertMessage');
            const actionsEl = document.getElementById('iosAlertActions');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            messageEl.style.display = message ? 'block' : 'none';
            
            actionsEl.innerHTML = `
                <button class="ios-alert-btn cancel">${cancelText}</button>
                <button class="ios-alert-btn destructive">${confirmText}</button>
            `;
            
            alertEl.classList.add('active');
            
            const buttons = actionsEl.querySelectorAll('button');
            buttons[0].addEventListener('click', () => {
                alertEl.classList.remove('active');
                resolve(false);
            });
            
            buttons[1].addEventListener('click', () => {
                alertEl.classList.remove('active');
                resolve(true);
            });
        });
    }
};
