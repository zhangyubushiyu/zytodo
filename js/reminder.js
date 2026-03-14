const Reminder = {
    scheduledTimeouts: new Map(),
    triggeredReminders: new Set(),
    checkInterval: null,
    
    init() {
        this.requestPermission();
        this.startChecking();
        this.scheduleAllReminders();
        
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    },
    
    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        
        this.scheduledTimeouts.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });
        this.scheduledTimeouts.clear();
        this.triggeredReminders.clear();
    },
    
    requestPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        App.showNotification('提醒功能已启用', 'success');
                    }
                });
            }
        }
    },
    
    startChecking() {
        this.checkInterval = setInterval(() => {
            this.checkReminders();
        }, 60000);
        
        this.checkReminders();
    },
    
    checkReminders() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const today = Calendar.formatDate(now);
        
        const todos = Storage.getTodos().filter(t => 
            t.date === today && 
            !t.completed && 
            t.reminder && 
            t.time
        );
        
        todos.forEach(todo => {
            const [hours, minutes] = todo.time.split(':').map(Number);
            const todoTime = hours * 60 + minutes;
            const reminderTime = todoTime - (todo.reminderTime || 30);
            
            if (currentTime >= reminderTime && currentTime < todoTime) {
                const key = `${todo.id}-${today}-${reminderTime}`;
                if (!this.triggeredReminders.has(key)) {
                    this.showReminder(todo);
                    this.triggeredReminders.add(key);
                }
            }
        });
    },
    
    scheduleReminder(todo) {
        if (!todo.reminder || !todo.time || todo.completed) {
            return;
        }
        
        const now = new Date();
        const todoDateTime = new Date(`${todo.date}T${todo.time}:00`);
        const reminderDateTime = new Date(todoDateTime.getTime() - (todo.reminderTime || 30) * 60000);
        
        if (reminderDateTime > now) {
            const delay = reminderDateTime.getTime() - now.getTime();
            
            if (this.scheduledTimeouts.has(todo.id)) {
                clearTimeout(this.scheduledTimeouts.get(todo.id));
            }
            
            const timeoutId = setTimeout(() => {
                this.showReminder(todo);
                this.scheduledTimeouts.delete(todo.id);
            }, delay);
            
            this.scheduledTimeouts.set(todo.id, timeoutId);
        }
    },
    
    scheduleAllReminders() {
        const todos = Storage.getTodos().filter(t => t.reminder && !t.completed);
        todos.forEach(todo => this.scheduleReminder(todo));
    },
    
    showReminder(todo) {
        const responsible = Storage.getResponsibleById(todo.responsible);
        const category = Storage.getCategoryById(todo.category);
        
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('待办提醒', {
                body: `${todo.title}\n时间: ${todo.time}\n责任人: ${responsible ? responsible.name : '未分配'}\n分类: ${category ? category.name : '未分类'}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📋</text></svg>',
                tag: todo.id,
                requireInteraction: true
            });
            
            notification.onclick = () => {
                window.focus();
                Calendar.selectDate(todo.date);
                notification.close();
            };
        }
        
        App.showNotification(`提醒: ${todo.title} (${todo.time})`, 'warning');
        
        if (todo.priority === 'urgent') {
            this.playSound();
        }
    },
    
    playSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('无法播放提醒声音:', error);
        }
    },
    
    cancelReminder(todoId) {
        if (this.scheduledTimeouts.has(todoId)) {
            clearTimeout(this.scheduledTimeouts.get(todoId));
            this.scheduledTimeouts.delete(todoId);
        }
    }
};
