const Calendar = {
    currentDate: new Date(),
    selectedDate: null,
    viewMode: 'month',
    searchQuery: '',
    
    init() {
        this.render();
        this.bindEvents();
    },
    
    bindEvents() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            if (this.viewMode === 'month') {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            } else {
                this.currentDate.setDate(this.currentDate.getDate() - 7);
            }
            this.render();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            if (this.viewMode === 'month') {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            } else {
                this.currentDate.setDate(this.currentDate.getDate() + 7);
            }
            this.render();
        });
        
        document.getElementById('todayBtn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.selectedDate = this.formatDate(new Date());
            this.render();
            this.showDayDetail(this.selectedDate);
        });
        
        document.getElementById('viewToggleBtn').addEventListener('click', () => {
            this.viewMode = this.viewMode === 'month' ? 'week' : 'month';
            document.getElementById('viewToggleBtn').textContent = this.viewMode === 'month' ? '月视图' : '周视图';
            this.render();
        });
        
        // 搜索框事件
        const searchInput = document.getElementById('todoSearchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.searchQuery = searchInput.value.trim();
                    if (this.selectedDate) {
                        this.showDayDetail(this.selectedDate);
                    }
                }
            });
            
            // 清空搜索框时重置搜索
            searchInput.addEventListener('input', (e) => {
                if (e.target.value.trim() === '' && this.searchQuery !== '') {
                    this.searchQuery = '';
                    if (this.selectedDate) {
                        this.showDayDetail(this.selectedDate);
                    }
                }
            });
        }
    },
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        return d;
    },
    
    render() {
        if (this.viewMode === 'month') {
            this.renderMonthView();
        } else {
            this.renderWeekView();
        }
    },
    
    renderMonthView() {
        const container = document.getElementById('calendarDays');
        container.innerHTML = '';
        container.classList.remove('week-mode');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        document.getElementById('currentMonth').textContent = `${year}年${month + 1}月`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        const today = new Date();
        const todayStr = this.formatDate(today);
        
        for (let i = 0; i < startDay; i++) {
            const prevDate = new Date(year, month, -startDay + i + 1);
            container.appendChild(this.createDayElement(prevDate.getDate(), this.formatDate(prevDate), true, false));
        }
        
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(year, month, i);
            const dateStr = this.formatDate(date);
            const isToday = dateStr === todayStr;
            container.appendChild(this.createDayElement(i, dateStr, false, isToday));
        }
        
        const remainingDays = (7 - ((startDay + totalDays) % 7)) % 7;
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(year, month + 1, i);
            container.appendChild(this.createDayElement(nextDate.getDate(), this.formatDate(nextDate), true, false));
        }
    },
    
    renderWeekView() {
        const container = document.getElementById('calendarDays');
        container.innerHTML = '';
        container.classList.add('week-mode');
        
        const weekStart = this.getWeekStart(this.currentDate);
        const today = new Date();
        const todayStr = this.formatDate(today);
        
        // 计算第几周
        const year = weekStart.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const days = Math.floor((weekStart - firstDayOfYear) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + firstDayOfYear.getDay() + 1) / 7);
        
        // 更新标题显示
        const month = weekStart.getMonth() + 1;
        document.getElementById('currentMonth').textContent = `${year}年${month}月 第${weekNumber}周`;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = this.formatDate(date);
            const isToday = dateStr === todayStr;
            container.appendChild(this.createDayElement(date.getDate(), dateStr, false, isToday, true));
        }
    },
    
    createDayElement(day, date, isOtherMonth, isToday = false, isWeekView = false) {
        const div = document.createElement('div');
        div.className = 'calendar-day';
        if (isOtherMonth) div.classList.add('other-month');
        if (isToday) div.classList.add('today');
        if (this.selectedDate === date) div.classList.add('selected');
        
        const todos = Storage.getTodosByDate(date);
        const completed = todos.filter(t => t.completed).length;
        const pending = todos.filter(t => !t.completed).length;
        const urgent = todos.filter(t => t.priority === 'urgent' && !t.completed).length;
        
        if (isWeekView) {
            div.innerHTML = `
                <div class="day-header">
                    <div class="day-number">${day}</div>
                    <div class="day-stats-inline">
                        ${completed > 0 ? `<div class="stat-item"><span class="stat-dot completed"></span>${completed} 完成</div>` : ''}
                        ${pending > 0 ? `<div class="stat-item"><span class="stat-dot pending"></span>${pending} 待办</div>` : ''}
                        ${urgent > 0 ? `<div class="stat-item"><span class="stat-dot urgent"></span>${urgent} 重要</div>` : ''}
                    </div>
                </div>
                <div class="day-todos">
                    ${todos.slice(0, 20).map(todo => `
                        <div class="day-todo-item ${todo.completed ? 'completed' : ''} ${todo.priority === 'urgent' ? 'urgent' : ''}">
                            <span class="todo-status">${todo.completed ? '✓' : '○'}</span>
                            <span class="todo-text">${todo.title}</span>
                        </div>
                    `).join('')}
                    ${todos.length > 20 ? `<div class="more-todos">+${todos.length - 20} 更多</div>` : ''}
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="day-stats">
                    ${completed > 0 ? `<div class="stat-item"><span class="stat-dot completed"></span>${completed} 完成</div>` : ''}
                    ${pending > 0 ? `<div class="stat-item"><span class="stat-dot pending"></span>${pending} 待办</div>` : ''}
                    ${urgent > 0 ? `<div class="stat-item"><span class="stat-dot urgent"></span>${urgent} 重要</div>` : ''}
                </div>
            `;
        }
        
        div.addEventListener('click', () => this.selectDate(date));
        
        return div;
    },
    
    selectDate(date) {
        this.selectedDate = date;
        this.render();
        this.showDayDetail(date);
        this.updateQuickAddDate(date);
    },
    
    updateQuickAddDate(date) {
        const quickDueDate = document.getElementById('quickDueDate');
        if (quickDueDate) {
            quickDueDate.value = date;
        }
    },
    
    getSelectedDate() {
        return this.selectedDate;
    },
    
    showDayDetail(date) {
        const todoHeader = document.getElementById('todoHeaderTitle');
        const todoContent = document.getElementById('todoContent');
        
        const dateObj = new Date(date + 'T00:00:00');
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        todoHeader.textContent = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日 ${weekdays[dateObj.getDay()]}`;
        
        let todos = Storage.getTodosByDate(date);
        
        // Apply filters
        if (TodoManager.currentFilter.category !== 'all') {
            todos = todos.filter(t => t.category === TodoManager.currentFilter.category);
        }
        if (TodoManager.currentFilter.responsible !== 'all') {
            todos = todos.filter(t => {
                if (Array.isArray(t.responsible)) {
                    return t.responsible.includes(TodoManager.currentFilter.responsible);
                }
                return t.responsible === TodoManager.currentFilter.responsible;
            });
        }
        
        // Apply search filter
        if (this.searchQuery) {
            todos = todos.filter(t => {
                // 搜索待办标题
                if (t.title.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                    return true;
                }
                
                // 搜索负责人
                if (t.responsible) {
                    const responsibleIds = Array.isArray(t.responsible) ? t.responsible : [t.responsible];
                    const names = responsibleIds.map(id => {
                        const resp = Storage.getResponsibleById(id);
                        return resp ? resp.name : null;
                    }).filter(name => name);
                    
                    if (names.some(name => name.toLowerCase().includes(this.searchQuery.toLowerCase()))) {
                        return true;
                    }
                }
                
                return false;
            });
        }
        
        if (todos.length === 0) {
            todoContent.innerHTML = '<p style="text-align:center;color:#999;padding:40px;">暂无待办事项</p>';
            return;
        }
        
        todoContent.innerHTML = '';
        todos.sort((a, b) => {
            // 未完成的待办排在前面
            if (a.completed !== b.completed) return a.completed ? 1 : -1;
            
            // 重要待办排在前面
            if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
            if (a.priority !== 'urgent' && b.priority === 'urgent') return 1;
            
            // 按照完成日期和时间升序排列
            const aDateTime = a.dueDate && a.time ? `${a.dueDate}T${a.time}` : (a.dueDate || '');
            const bDateTime = b.dueDate && b.time ? `${b.dueDate}T${b.time}` : (b.dueDate || '');
            
            if (aDateTime && bDateTime) return aDateTime.localeCompare(bDateTime);
            if (aDateTime && !bDateTime) return -1;
            if (!aDateTime && bDateTime) return 1;
            
            return 0;
        }).forEach(todo => {
            const responsible = Storage.getResponsibleById(todo.responsible);
            const category = Storage.getCategoryById(todo.category);
            
            const div = document.createElement('div');
            div.className = `todo-detail-item ${todo.completed ? 'completed' : ''} ${todo.priority === 'urgent' ? 'urgent' : ''}`;
            
            const typeLabel = todo.type === 'feedback' ? '反馈' : '检查';
            const typeClass = todo.type === 'feedback' ? 'feedback' : 'check';
            
            // Handle multiple responsibles
            let responsibleNames = '';
            if (todo.responsible) {
                const responsibleIds = Array.isArray(todo.responsible) ? todo.responsible : [todo.responsible];
                const names = responsibleIds.map(id => {
                    const resp = Storage.getResponsibleById(id);
                    if (resp) {
                        return resp.position ? `${resp.position}:${resp.name}` : resp.name;
                    }
                    return null;
                }).filter(name => name);
                responsibleNames = names.length > 0 ? names.join(', ') : '';
            }
            
            let overtimeHtml = '';
            if (todo.completed && todo.completedAt && todo.dueDate && todo.time) {
                const deadlineTime = new Date(`${todo.dueDate}T${todo.time}`);
                const completedTime = new Date(todo.completedAt);
                if (completedTime > deadlineTime) {
                    const diffMinutes = Math.floor((completedTime - deadlineTime) / 60000);
                    overtimeHtml = `<span class="overtime-tag">超时${diffMinutes}分钟</span>`;
                }
            }
            
            // 格式化完成日期和时间
            let dueDateTimeHtml = '';
            if (todo.dueDate && todo.time) {
                const dueDate = new Date(todo.dueDate);
                const month = dueDate.getMonth() + 1;
                const day = dueDate.getDate();
                dueDateTimeHtml = `${month}/${day} ${todo.time}`;
            } else if (todo.dueDate) {
                const dueDate = new Date(todo.dueDate);
                const month = dueDate.getMonth() + 1;
                const day = dueDate.getDate();
                dueDateTimeHtml = `${month}/${day}`;
            } else if (todo.time) {
                dueDateTimeHtml = todo.time;
            }
            
            div.innerHTML = `
                <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                <div class="todo-detail-info">
                    <div class="todo-detail-title">${todo.title}</div>
                    <div class="todo-detail-meta">
                        <span class="type-tag ${typeClass}">${typeLabel}</span>
                        ${category ? `<span style="color:${category.color}">${category.name}</span>` : ''}
                        ${dueDateTimeHtml}
                        ${todo.priority === 'urgent' ? '| <span style="color:#FF3B30">重要</span>' : ''}
                        ${overtimeHtml}
                    </div>
                    ${responsibleNames ? `<div class="todo-detail-responsible">负责人: ${responsibleNames}</div>` : ''}
                </div>
                <div class="todo-detail-actions">
                    <button onclick="TodoManager.editTodo('${todo.id}')" title="编辑">✏️</button>
                    <button onclick="TodoManager.deleteTodo('${todo.id}')" title="删除">🗑️</button>
                </div>
            `;
            
            const checkbox = div.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const todoId = e.target.dataset.id;
                const todo = Storage.getTodos().find(t => t.id === todoId);
                if (todo) {
                    todo.completed = e.target.checked;
                    todo.completedAt = e.target.checked ? new Date().toISOString() : null;
                    Storage.updateTodo(todoId, todo);
                    this.render();
                    
                    // 重新渲染待办列表
                    if (this.selectedDate) {
                        this.showDayDetail(this.selectedDate);
                    }
                    
                    // Check overtime
                    if (todo.completed && todo.dueDate && todo.time) {
                        const deadlineTime = new Date(`${todo.dueDate}T${todo.time}`);
                        const completedTime = new Date(todo.completedAt);
                        if (completedTime > deadlineTime) {
                            const diffMinutes = Math.floor((completedTime - deadlineTime) / 60000);
                            App.showNotification(`待办已完成，但超时${diffMinutes}分钟`, 'warning');
                        } else {
                            App.showNotification('待办已完成', 'success');
                        }
                    } else {
                        App.showNotification('待办已完成', 'success');
                    }
                }
            });
            
            todoContent.appendChild(div);
        });
    }
};
