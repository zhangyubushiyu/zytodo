const MobileApp = {
    currentPage: 'todoPage',
    selectedDate: new Date(),
    currentMonth: new Date(),
    editingTodoId: null,
    
    async init() {
        await this.initBmob();
        await Storage.init();
        
        DatePicker.init();
        TimePicker.init();
        SelectPicker.init();
        
        this.bindEvents();
        this.loadTodos();
        this.loadCategories();
        this.loadResponsibles();
        this.loadResponsibles('editTodoResponsible', []);
        this.renderCalendar();
        this.renderCategoryList();
        this.renderResponsibleList();
    },
    
    async initBmob() {
        try {
            await BmobService.init();
        } catch (error) {
            console.error('Bmob初始化失败:', error);
        }
    },
    
    bindEvents() {
        document.getElementById('prevDayBtn').addEventListener('click', () => this.navigateDate(-1));
        document.getElementById('nextDayBtn').addEventListener('click', () => this.navigateDate(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.goToToday());
        document.getElementById('todoSearchInput').addEventListener('input', (e) => this.searchTodos(e.target.value));
        
        document.getElementById('floatingAddBtn').addEventListener('click', () => this.showPage('addTodoPage'));
        document.getElementById('submitTodoBtn').addEventListener('click', () => this.submitTodo());
        
        document.getElementById('inheritBtn').addEventListener('click', () => this.inheritFromDayBefore());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCurrentDateTodos());
        
        document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
            btn.addEventListener('click', () => this.showPage(btn.dataset.page));
        });
        
        document.getElementById('prevMonthBtn').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonthBtn').addEventListener('click', () => this.navigateMonth(1));
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.addCategory());
        document.getElementById('addResponsibleBtn').addEventListener('click', () => this.addResponsible());
        
        document.getElementById('closeDetailModal').addEventListener('click', () => this.closeModal('todoDetailModal'));
        document.getElementById('closeEditModal').addEventListener('click', () => this.closeModal('editTodoModal'));
        document.getElementById('editTodoBtn').addEventListener('click', () => this.editTodo());
        document.getElementById('deleteTodoBtn').addEventListener('click', () => this.deleteTodo());
        document.getElementById('cancelEditBtn').addEventListener('click', () => this.closeModal('editTodoModal'));
        document.getElementById('saveEditBtn').addEventListener('click', () => this.saveEditTodo());
        
        document.getElementById('moreTodosBtn').addEventListener('click', () => this.showMoreTodos());
        
        document.getElementById('todoDate').addEventListener('click', (e) => {
            e.preventDefault();
            DatePicker.show(e.target.value, (date) => {
                e.target.value = date;
            });
        });
        
        document.getElementById('editTodoDate').addEventListener('click', (e) => {
            e.preventDefault();
            DatePicker.show(e.target.value, (date) => {
                e.target.value = date;
            });
        });
        
        document.getElementById('todoTime').addEventListener('click', (e) => {
            e.preventDefault();
            TimePicker.show(e.target.value, (time) => {
                e.target.value = time;
            });
        });
        
        document.getElementById('editTodoTime').addEventListener('click', (e) => {
            e.preventDefault();
            TimePicker.show(e.target.value, (time) => {
                e.target.value = time;
            });
        });
        
        document.getElementById('todoType').addEventListener('mousedown', (e) => {
            e.preventDefault();
            const currentValue = e.target.value;
            const options = [
                { value: '', label: '选择动作' },
                { value: 'check', label: '检查' },
                { value: 'feedback', label: '反馈' }
            ];
            SelectPicker.show(options, currentValue, (value) => {
                e.target.value = value;
                e.target.dispatchEvent(new Event('change'));
            }, '选择类型', false);
        });
        
        document.getElementById('todoPriority').addEventListener('mousedown', (e) => {
            e.preventDefault();
            const currentValue = e.target.value;
            const options = [
                { value: 'normal', label: '普通' },
                { value: 'urgent', label: '紧急' },
                { value: 'important', label: '重要' }
            ];
            SelectPicker.show(options, currentValue, (value) => {
                e.target.value = value;
                e.target.dispatchEvent(new Event('change'));
            }, '选择优先级', false);
        });
        
        document.getElementById('editTodoType').addEventListener('mousedown', (e) => {
            e.preventDefault();
            const currentValue = e.target.value;
            const options = [
                { value: 'check', label: '检查' },
                { value: 'feedback', label: '反馈' }
            ];
            SelectPicker.show(options, currentValue, (value) => {
                e.target.value = value;
                e.target.dispatchEvent(new Event('change'));
            }, '选择类型', false);
        });
        
        document.getElementById('editTodoPriority').addEventListener('mousedown', (e) => {
            e.preventDefault();
            const currentValue = e.target.value;
            const options = [
                { value: 'normal', label: '普通' },
                { value: 'urgent', label: '紧急' },
                { value: 'important', label: '重要' }
            ];
            SelectPicker.show(options, currentValue, (value) => {
                e.target.value = value;
                e.target.dispatchEvent(new Event('change'));
            }, '选择优先级', false);
        });
    },
    
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
        
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (navItem) navItem.classList.add('active');
        
        this.currentPage = pageId;
        
        const titles = {
            'todoPage': '待办事项',
            'calendarPage': '日历',
            'managePage': '管理',
            'addTodoPage': '添加待办'
        };
        document.getElementById('pageTitle').textContent = titles[pageId] || '待办管理';
        
        const floatingBtn = document.getElementById('floatingAddBtn');
        if (pageId === 'managePage') {
            floatingBtn.classList.add('hidden');
        } else {
            floatingBtn.classList.remove('hidden');
        }
        
        if (pageId === 'calendarPage') {
            this.loadPreviewTodos();
        }
    },
    
    showMoreTodos() {
        const selectedDate = this.selectedDate;
        this.showPage('todoPage');
        this.selectedDate = selectedDate;
        this.updateDateDisplay();
        this.loadTodos();
    },
    
    loadPreviewTodos() {
        const dateStr = this.formatDate(this.selectedDate);
        const todos = Storage.getTodosByDate(dateStr);
        const previewList = document.getElementById('previewTodoList');
        const previewTitle = document.getElementById('previewDateTitle');
        
        const today = new Date();
        const isToday = this.selectedDate.toDateString() === today.toDateString();
        previewTitle.textContent = isToday ? '今日待办' : `${dateStr} 待办`;
        
        if (todos.length === 0) {
            previewList.innerHTML = `
                <div class="empty-state">
                    <p>暂无待办事项</p>
                </div>
            `;
            return;
        }
        
        previewList.innerHTML = todos.slice(0, 3).map(todo => {
            const category = Storage.getCategoryById(todo.categoryId);
            const responsibles = todo.responsible.map(id => Storage.getResponsibleById(id)).filter(Boolean);
            const responsibleNames = responsibles.map(r => r.name).join(', ');
            
            return `
                <div class="preview-todo-item">
                    <div class="preview-todo-title ${todo.completed ? 'completed' : ''}">${todo.title}</div>
                    <div class="preview-todo-meta">
                        ${category ? `<span class="preview-todo-tag">${category.name}</span>` : ''}
                        ${responsibleNames ? `<span class="preview-todo-tag">${responsibleNames}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    },
    
    toggleAddPage() {
        const addBtnText = document.getElementById('addBtnText');
        
        if (this.currentPage === 'addTodoPage') {
            this.showPage('todoPage');
            addBtnText.textContent = '+';
        } else {
            this.showPage('addTodoPage');
            addBtnText.textContent = '查看待办';
        }
    },
    
    navigateDate(delta) {
        const date = new Date(this.selectedDate);
        date.setDate(date.getDate() + delta);
        this.selectedDate = date;
        this.updateDateDisplay();
        this.loadTodos();
    },
    
    goToToday() {
        this.selectedDate = new Date();
        this.updateDateDisplay();
        this.loadTodos();
    },
    
    updateDateDisplay() {
        const today = new Date();
        const isToday = this.selectedDate.toDateString() === today.toDateString();
        
        const options = { month: 'long', day: 'numeric', weekday: 'short' };
        const dateText = isToday ? '今天' : this.selectedDate.toLocaleDateString('zh-CN', options);
        
        document.getElementById('selectedDateText').textContent = dateText;
    },
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    async loadTodos() {
        const dateStr = this.formatDate(this.selectedDate);
        const todos = Storage.getTodosByDate(dateStr);
        
        const sortedTodos = todos.sort((a, b) => {
            if (a.completed === b.completed) return 0;
            return a.completed ? 1 : -1;
        });
        
        this.renderTodos(sortedTodos);
    },
    
    renderTodos(todos) {
        const container = document.getElementById('todoList');
        
        if (todos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>暂无待办事项</p>
                    <p class="hint">点击下方 + 按钮添加</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = todos.map(todo => this.renderTodoItem(todo)).join('');
        
        container.querySelectorAll('.todo-item').forEach(item => {
            item.addEventListener('click', () => this.showTodoDetail(item.dataset.id));
        });
        
        container.querySelectorAll('.todo-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTodo(checkbox.dataset.id);
            });
        });
        
        container.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editTodoById(btn.dataset.id);
            });
        });
        
        container.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTodoById(btn.dataset.id);
            });
        });
    },
    
    renderTodoItem(todo) {
        const category = Storage.getCategoryById(todo.categoryId);
        const responsibles = todo.responsible.map(id => Storage.getResponsibleById(id)).filter(Boolean);
        const responsibleNames = responsibles.map(r => r.name + (r.position ? ` (${r.position})` : '')).join(', ');
        
        const priorityClass = todo.priority === 'urgent' ? 'priority-urgent' : 
                             todo.priority === 'important' ? 'priority-important' : '';
        
        return `
            <div class="todo-item" data-id="${todo.id}">
                <div class="todo-checkbox ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    ${todo.completed ? '✓' : ''}
                </div>
                <div class="todo-content">
                    <div class="todo-title ${todo.completed ? 'completed' : ''}">${todo.title}</div>
                    <div class="todo-meta">
                        ${category ? `<span class="todo-tag category">${category.name}</span>` : ''}
                        ${todo.priority !== 'normal' ? `<span class="todo-tag ${priorityClass}">${todo.priority === 'urgent' ? '紧急' : '重要'}</span>` : ''}
                        ${responsibleNames ? `<span class="todo-tag">${responsibleNames}</span>` : ''}
                        ${todo.time ? `<span class="todo-tag">${todo.time}</span>` : ''}
                    </div>
                </div>
                <div class="todo-actions">
                    <button class="todo-action-btn edit-btn" data-id="${todo.id}">编辑</button>
                    <button class="todo-action-btn delete-btn" data-id="${todo.id}">删除</button>
                </div>
            </div>
        `;
    },
    
    async toggleTodo(id) {
        const todo = Storage.getTodoById(id);
        if (todo) {
            await Storage.updateTodo(id, { completed: !todo.completed });
            this.loadTodos();
        }
    },
    
    editTodoById(id) {
        this.editingTodoId = id;
        const todo = Storage.getTodoById(id);
        if (!todo) return;
        
        document.getElementById('editTodoTitle').value = todo.title;
        document.getElementById('editTodoType').value = todo.type;
        document.getElementById('editTodoDate').value = todo.date;
        document.getElementById('editTodoTime').value = todo.time || '';
        document.getElementById('editTodoPriority').value = todo.priority;
        
        this.loadCategories('editTodoCategory', todo.categoryId);
        this.loadResponsibles('editTodoResponsible', todo.responsible);
        
        this.openModal('editTodoModal');
    },
    
    async deleteTodoById(id) {
        const confirmed = await IOSAlert.confirmDestructive(
            '删除待办',
            '确定要删除这个待办吗？',
            '删除',
            '取消'
        );
        
        if (confirmed) {
            await Storage.deleteTodo(id);
            this.loadTodos();
            this.renderCalendar();
        }
    },
    
    async inheritFromDayBefore() {
        const selectedDate = this.formatDate(this.selectedDate);
        
        const dateObj = new Date(selectedDate + 'T00:00:00');
        dateObj.setDate(dateObj.getDate() - 1);
        const dayBefore = this.formatDate(dateObj);
        
        const todos = Storage.getTodosByDate(dayBefore);
        
        if (todos.length === 0) {
            await IOSAlert.alert('提示', '昨天没有待办事项可继承');
            return;
        }
        
        const existingTodos = Storage.getTodosByDate(selectedDate);
        
        const todosToInherit = [];
        const duplicateTodos = [];
        
        for (const todo of todos) {
            const isDuplicate = existingTodos.some(existingTodo => {
                const titleMatch = existingTodo.title === todo.title;
                
                let responsibleMatch = false;
                if (Array.isArray(todo.responsible) && Array.isArray(existingTodo.responsible)) {
                    responsibleMatch = todo.responsible.length === existingTodo.responsible.length &&
                        todo.responsible.every(id => existingTodo.responsible.includes(id));
                } else if (!Array.isArray(todo.responsible) && !Array.isArray(existingTodo.responsible)) {
                    responsibleMatch = todo.responsible === existingTodo.responsible;
                }
                
                return titleMatch && responsibleMatch;
            });
            
            if (isDuplicate) {
                duplicateTodos.push(todo);
            } else {
                todosToInherit.push(todo);
            }
        }
        
        if (todosToInherit.length === 0) {
            let message = '昨天所有待办事项已存在于今天，无需继承';
            if (duplicateTodos.length > 0) {
                message += `\n\n重复的待办：\n${duplicateTodos.map(t => `• ${t.title}`).join('\n')}`;
            }
            await IOSAlert.alert('提示', message);
            return;
        }
        
        let confirmMessage = `将继承昨天(${dayBefore})的${todosToInherit.length}个待办事项`;
        if (duplicateTodos.length > 0) {
            confirmMessage += `\n\n跳过${duplicateTodos.length}个重复待办：\n${duplicateTodos.map(t => `• ${t.title}`).join('\n')}`;
        }
        confirmMessage += '\n\n是否继续？';
        
        const confirmed = await IOSAlert.confirm(
            '继承待办',
            confirmMessage,
            '继承',
            '取消'
        );
        
        if (confirmed) {
            for (const todo of todosToInherit) {
                let newDate = selectedDate;
                if (todo.date) {
                    const originalDate = new Date(todo.date + 'T00:00:00');
                    originalDate.setDate(originalDate.getDate() + 1);
                    newDate = this.formatDate(originalDate);
                }
                
                let newDueDate = todo.dueDate;
                if (todo.dueDate) {
                    const originalDueDate = new Date(todo.dueDate + 'T00:00:00');
                    originalDueDate.setDate(originalDueDate.getDate() + 1);
                    newDueDate = this.formatDate(originalDueDate);
                }
                
                const newTodo = {
                    ...todo,
                    date: newDate,
                    dueDate: newDueDate,
                    completed: false,
                    completedAt: null
                };
                delete newTodo.id;
                delete newTodo.createdAt;
                delete newTodo.updatedAt;
                await Storage.addTodo(newTodo);
            }
            
            let successMessage = `已继承${todosToInherit.length}个待办事项`;
            if (duplicateTodos.length > 0) {
                successMessage += `，跳过${duplicateTodos.length}个重复待办`;
            }
            await IOSAlert.alert('成功', successMessage);
            this.loadTodos();
            this.renderCalendar();
        }
    },
    
    async clearCurrentDateTodos() {
        const selectedDate = this.formatDate(this.selectedDate);
        const todos = Storage.getTodosByDate(selectedDate);
        
        if (todos.length === 0) {
            await IOSAlert.alert('提示', '当前日期没有待办事项');
            return;
        }
        
        const confirmed = await IOSAlert.confirmDestructive(
            '清除待办',
            `确定要清除${selectedDate}的所有${todos.length}个待办事项吗？`,
            '清除',
            '取消'
        );
        
        if (confirmed) {
            for (const todo of todos) {
                await Storage.deleteTodo(todo.id);
            }
            this.loadTodos();
            this.renderCalendar();
            await IOSAlert.alert('成功', '已清除所有待办事项');
        }
    },
    
    showTodoDetail(id) {
        const todo = Storage.getTodoById(id);
        if (!todo) return;
        
        this.editingTodoId = id;
        
        const category = Storage.getCategoryById(todo.categoryId);
        const responsibles = todo.responsible.map(id => Storage.getResponsibleById(id)).filter(Boolean);
        const responsibleNames = responsibles.map(r => r.name).join(', ');
        
        const content = `
            <div class="todo-detail">
                <div class="detail-item">
                    <strong>内容：</strong>${todo.title}
                </div>
                <div class="detail-item">
                    <strong>类型：</strong>${todo.type === 'check' ? '待办' : '反馈'}
                </div>
                ${category ? `<div class="detail-item"><strong>分类：</strong>${category.name}</div>` : ''}
                ${responsibleNames ? `<div class="detail-item"><strong>负责人：</strong>${responsibleNames}</div>` : ''}
                <div class="detail-item">
                    <strong>日期：</strong>${todo.date}
                </div>
                ${todo.time ? `<div class="detail-item"><strong>时间：</strong>${todo.time}</div>` : ''}
                <div class="detail-item">
                    <strong>优先级：</strong>${todo.priority === 'urgent' ? '紧急' : todo.priority === 'important' ? '重要' : '普通'}
                </div>
                <div class="detail-item">
                    <strong>状态：</strong>${todo.completed ? '已完成' : '未完成'}
                </div>
            </div>
        `;
        
        document.getElementById('todoDetailContent').innerHTML = content;
        this.openModal('todoDetailModal');
    },
    
    editTodo() {
        const todo = Storage.getTodoById(this.editingTodoId);
        if (!todo) return;
        
        this.closeModal('todoDetailModal');
        
        document.getElementById('editTodoTitle').value = todo.title;
        document.getElementById('editTodoType').value = todo.type;
        document.getElementById('editTodoDate').value = todo.date;
        document.getElementById('editTodoTime').value = todo.time || '';
        document.getElementById('editTodoPriority').value = todo.priority;
        
        this.loadCategories('editTodoCategory', todo.categoryId);
        this.loadResponsibles('editTodoResponsible', todo.responsible);
        
        this.openModal('editTodoModal');
    },
    
    async saveEditTodo() {
        const todo = {
            title: document.getElementById('editTodoTitle').value.trim(),
            type: document.getElementById('editTodoType').value,
            categoryId: document.getElementById('editTodoCategory').value,
            responsible: Array.from(document.getElementById('editTodoResponsible').selectedOptions).map(opt => opt.value),
            date: document.getElementById('editTodoDate').value,
            time: document.getElementById('editTodoTime').value,
            priority: document.getElementById('editTodoPriority').value
        };
        
        if (!todo.title) {
            await IOSAlert.alert('提示', '请输入待办内容');
            return;
        }
        
        await Storage.updateTodo(this.editingTodoId, todo);
        this.closeModal('editTodoModal');
        this.loadTodos();
        this.renderCalendar();
    },
    
    async deleteTodo() {
        const confirmed = await IOSAlert.confirmDestructive(
            '删除待办',
            '确定要删除这个待办吗？',
            '删除',
            '取消'
        );
        
        if (confirmed) {
            await Storage.deleteTodo(this.editingTodoId);
            this.closeModal('todoDetailModal');
            this.loadTodos();
            this.renderCalendar();
        }
    },
    
    searchTodos(keyword) {
        const dateStr = this.formatDate(this.selectedDate);
        const todos = Storage.getTodosByDate(dateStr);
        
        if (!keyword) {
            this.renderTodos(todos);
            return;
        }
        
        const filtered = todos.filter(todo => {
            const titleMatch = todo.title.toLowerCase().includes(keyword.toLowerCase());
            const responsibles = todo.responsible.map(id => Storage.getResponsibleById(id)).filter(Boolean);
            const responsibleMatch = responsibles.some(r => r.name.toLowerCase().includes(keyword.toLowerCase()));
            return titleMatch || responsibleMatch;
        });
        
        this.renderTodos(filtered);
    },
    
    async submitTodo() {
        const todo = {
            title: document.getElementById('todoTitle').value.trim(),
            type: document.getElementById('todoType').value,
            categoryId: document.getElementById('todoCategory').value,
            responsible: Array.from(document.getElementById('todoResponsible').selectedOptions).map(opt => opt.value),
            date: document.getElementById('todoDate').value || this.formatDate(new Date()),
            time: document.getElementById('todoTime').value,
            priority: document.getElementById('todoPriority').value,
            reminder: document.getElementById('todoReminder').checked
        };
        
        if (!todo.title) {
            await IOSAlert.alert('提示', '请输入待办内容');
            return;
        }
        
        await Storage.addTodo(todo);
        
        document.getElementById('todoTitle').value = '';
        document.getElementById('todoTime').value = '';
        document.getElementById('todoReminder').checked = false;
        
        this.showPage('todoPage');
        this.loadTodos();
        this.renderCalendar();
    },
    
    loadCategories(selectId = 'todoCategory', selectedId = null) {
        const categories = Storage.getCategories();
        const select = document.getElementById(selectId);
        
        const isInitialized = select.getAttribute('data-picker-initialized') === 'true';
        
        select.innerHTML = '<option value="">选择分类</option>' +
            categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
        
        if (selectedId) {
            select.value = selectedId;
        }
        
        if (!isInitialized) {
            select.setAttribute('data-picker-initialized', 'true');
            select.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const options = [
                    { value: '', label: '选择分类' },
                    ...categories.map(cat => ({
                        value: cat.id,
                        label: cat.name
                    }))
                ];
                SelectPicker.show(options, select.value, (value) => {
                    select.value = value;
                    select.dispatchEvent(new Event('change'));
                }, '选择分类', false);
            });
        }
    },
    
    loadResponsibles(selectId = 'todoResponsible', selectedIds = []) {
        const select = document.getElementById(selectId);
        
        if (!select) {
            return;
        }
        
        const responsibles = Storage.getResponsibles();
        
        const isInitialized = select.getAttribute('data-picker-initialized') === 'true';
        
        select.innerHTML = '<option value="">选择负责人</option>' +
            responsibles.map(resp => 
                `<option value="${resp.id}">${resp.name}${resp.position ? ` (${resp.position})` : ''}</option>`
            ).join('');
        
        if (selectedIds && selectedIds.length > 0) {
            selectedIds.forEach(id => {
                const option = select.querySelector(`option[value="${id}"]`);
                if (option) {
                    option.selected = true;
                }
            });
        } else {
            select.value = '';
        }
        
        let displayInput = select.parentElement.querySelector('.responsible-display');
        if (!displayInput) {
            displayInput = document.createElement('input');
            displayInput.type = 'text';
            displayInput.className = 'responsible-display';
            displayInput.readOnly = true;
            displayInput.placeholder = '选择负责人';
            select.parentElement.appendChild(displayInput);
            
            displayInput.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const mousedownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                select.dispatchEvent(mousedownEvent);
            });
        }
        
        if (selectedIds && selectedIds.length > 0) {
            const selectedNames = selectedIds.map(id => {
                const resp = responsibles.find(r => r.id === id);
                return resp ? resp.name + (resp.position ? ` (${resp.position})` : '') : '';
            }).filter(Boolean).join(', ');
            displayInput.value = selectedNames;
        } else {
            displayInput.value = '';
        }
        
        if (!isInitialized) {
            select.setAttribute('data-picker-initialized', 'true');
            
            select.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const currentResponsibles = Storage.getResponsibles();
                const options = [
                    { value: '', label: '选择负责人' },
                    ...currentResponsibles.map(resp => ({
                        value: resp.id,
                        label: resp.name + (resp.position ? ` (${resp.position})` : '')
                    }))
                ];
                
                const currentSelected = Array.from(this.selectedOptions)
                    .map(opt => opt.value)
                    .filter(v => v !== '');
                
                const displayInput = this.parentElement.querySelector('.responsible-display');
                
                SelectPicker.show(options, currentSelected, (values) => {
                    const allOptions = this.querySelectorAll('option');
                    allOptions.forEach(opt => opt.selected = false);
                    
                    if (values.length === 0) {
                        this.value = '';
                        if (displayInput) {
                            displayInput.value = '';
                        }
                    } else {
                        values.forEach(value => {
                            const opt = this.querySelector(`option[value="${value}"]`);
                            if (opt) {
                                opt.selected = true;
                            }
                        });
                        
                        if (displayInput) {
                            const selectedNames = values.map(id => {
                                const resp = currentResponsibles.find(r => r.id === id);
                                return resp ? resp.name + (resp.position ? ` (${resp.position})` : '') : '';
                            }).filter(Boolean).join(', ');
                            displayInput.value = selectedNames;
                        }
                    }
                    
                    this.dispatchEvent(new Event('change'));
                }, '选择负责人', true);
            });
            
            select.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
            });
        }
    },
    
    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        document.getElementById('currentMonthText').textContent = 
            `${year}年${month + 1}月`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        const today = new Date();
        const todayStr = this.formatDate(today);
        const selectedStr = this.formatDate(this.selectedDate);
        
        let html = '';
        
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            html += `<div class="calendar-day other-month">${day}</div>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedStr;
            const todos = Storage.getTodosByDate(dateStr);
            const hasTodo = todos.length > 0;
            
            let classes = 'calendar-day';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            if (hasTodo) classes += ' has-todo';
            
            html += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
        }
        
        const totalCells = startDay + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        
        for (let i = 1; i <= remainingCells; i++) {
            html += `<div class="calendar-day other-month">${i}</div>`;
        }
        
        document.getElementById('calendarDays').innerHTML = html;
        
        document.querySelectorAll('.calendar-day:not(.other-month)').forEach(day => {
            day.addEventListener('click', () => {
                this.selectedDate = new Date(day.dataset.date);
                this.updateDateDisplay();
                this.loadTodos();
                this.loadPreviewTodos();
            });
        });
    },
    
    navigateMonth(delta) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
        this.renderCalendar();
    },
    
    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`${tabId}Tab`).classList.add('active');
    },
    
    async addCategory() {
        const name = document.getElementById('newCategoryName').value.trim();
        const color = document.getElementById('newCategoryColor').value;
        
        if (!name) {
            await IOSAlert.alert('提示', '请输入分类名称');
            return;
        }
        
        await Storage.addCategory({ name, color });
        document.getElementById('newCategoryName').value = '';
        this.loadCategories();
        this.renderCategoryList();
    },
    
    async addResponsible() {
        const name = document.getElementById('newResponsibleName').value.trim();
        const position = document.getElementById('newResponsiblePosition').value.trim();
        
        if (!name) {
            await IOSAlert.alert('提示', '请输入负责人姓名');
            return;
        }
        
        await Storage.addResponsible({ name, position });
        document.getElementById('newResponsibleName').value = '';
        document.getElementById('newResponsiblePosition').value = '';
        this.loadResponsibles();
        this.renderResponsibleList();
    },
    
    renderCategoryList() {
        const categories = Storage.getCategories();
        const container = document.getElementById('categoryList');
        
        container.innerHTML = categories.map(cat => `
            <div class="item-card">
                <div class="item-info">
                    <span class="color-badge" style="background: ${cat.color}"></span>
                    <span>${cat.name}</span>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="MobileApp.deleteCategory('${cat.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },
    
    renderResponsibleList() {
        const responsibles = Storage.getResponsibles();
        const container = document.getElementById('responsibleList');
        
        container.innerHTML = responsibles.map(resp => `
            <div class="item-card">
                <div class="item-info">
                    <span>${resp.name}</span>
                    ${resp.position ? `<span style="color: #8E8E93; font-size: 12px;">(${resp.position})</span>` : ''}
                </div>
                <div class="item-actions">
                    <button class="delete-btn" onclick="MobileApp.deleteResponsible('${resp.id}')">删除</button>
                </div>
            </div>
        `).join('');
    },
    
    async deleteCategory(id) {
        const confirmed = await IOSAlert.confirmDestructive(
            '删除分类',
            '确定要删除这个分类吗？',
            '删除',
            '取消'
        );
        
        if (confirmed) {
            await Storage.deleteCategory(id);
            this.renderCategoryList();
            this.loadCategories();
        }
    },
    
    async deleteResponsible(id) {
        const confirmed = await IOSAlert.confirmDestructive(
            '删除负责人',
            '确定要删除这个负责人吗？',
            '删除',
            '取消'
        );
        
        if (confirmed) {
            await Storage.deleteResponsible(id);
            this.renderResponsibleList();
            this.loadResponsibles();
        }
    },
    
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    },
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MobileApp.init();
});
