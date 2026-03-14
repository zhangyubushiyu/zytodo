const iOSModal = {
    onOk: null,
    onCancel: null,
    eventsBound: false,
    noEnter: false,
    
    init() {
        this.createModal();
        if (!this.eventsBound) {
            this.bindEvents();
            this.eventsBound = true;
        }
    },
    
    createModal() {
        if (document.getElementById('iosModal')) return;
        
        const modal = document.createElement('div');
        modal.id = 'iosModal';
        modal.className = 'ios-modal';
        modal.innerHTML = `
            <div class="ios-modal-content">
                <div class="ios-modal-header">
                    <h3 id="iosModalTitle"></h3>
                </div>
                <div class="ios-modal-body">
                    <p id="iosModalMessage"></p>
                </div>
                <div class="ios-modal-footer">
                    <button id="iosModalCancel" class="ios-modal-btn cancel">取消</button>
                    <button id="iosModalOk" class="ios-modal-btn ok">确定</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    bindEvents() {
        const self = this;
        const modal = document.getElementById('iosModal');
        const cancelBtn = document.getElementById('iosModalCancel');
        const okBtn = document.getElementById('iosModalOk');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                const callback = self.onCancel;
                self.onCancel = null;
                self.onOk = null;
                self.hide();
                if (callback) {
                    setTimeout(() => callback(), 0);
                }
            });
        }
        
        if (okBtn) {
            okBtn.addEventListener('click', () => {
                const callback = self.onOk;
                self.onOk = null;
                self.onCancel = null;
                self.hide();
                if (callback) {
                    setTimeout(() => callback(), 0);
                }
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    const callback = self.onCancel;
                    self.onCancel = null;
                    self.onOk = null;
                    self.hide();
                    if (callback) {
                        setTimeout(() => callback(), 0);
                    }
                }
            });
        }
        
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('iosModal');
            if (!modal) return;
            
            // 只支持Escape键取消，不支持Enter键确认
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                const callback = self.onCancel;
                self.onCancel = null;
                self.onOk = null;
                self.hide();
                if (callback) {
                    setTimeout(() => callback(), 0);
                }
            }
        });
    },
    
    show(title, message, onOk, onCancel, noEnter = false) {
        const modal = document.getElementById('iosModal');
        const titleEl = document.getElementById('iosModalTitle');
        const messageEl = document.getElementById('iosModalMessage');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        
        this.onOk = onOk;
        this.onCancel = onCancel;
        this.noEnter = noEnter;
        
        if (modal) {
            modal.classList.add('show');
        }
    },
    
    hide() {
        const modal = document.getElementById('iosModal');
        if (modal) {
            modal.classList.remove('show');
        }
    },
    
    confirm(title, message, onOk, onCancel, noEnter = false) {
        this.show(title, message, onOk, onCancel, noEnter);
    }
};
