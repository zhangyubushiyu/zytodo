const TodoManager = {
    currentFilter: {
        category: 'all',
        responsible: 'all'
    },
    
    init() {
        this.bindEvents();
        this.loadFilters();
        this.initQuickAdd();
    },
    
    bindEvents() {
        const closeTodoModal = document.getElementById('closeTodoModal');
        if (closeTodoModal) {
            closeTodoModal.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        const cancelTodoBtn = document.getElementById('cancelTodoBtn');
        if (cancelTodoBtn) {
            cancelTodoBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }
        
        const todoForm = document.getElementById('todoForm');
        if (todoForm) {
            todoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTodo();
            });
        }
        
        const todoReminder = document.getElementById('todoReminder');
        if (todoReminder) {
            todoReminder.addEventListener('change', (e) => {
                const reminderGroup = document.getElementById('reminderTimeGroup');
                reminderGroup.style.display = e.target.checked ? 'block' : 'none';
            });
        }
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilter.category = e.target.value;
                const selectedDate = Calendar.getSelectedDate();
                if (selectedDate) {
                    Calendar.showDayDetail(selectedDate);
                }
            });
        }
        
        const responsibleFilter = document.getElementById('responsibleFilter');
        if (responsibleFilter) {
            responsibleFilter.addEventListener('change', (e) => {
                this.currentFilter.responsible = e.target.value;
                const selectedDate = Calendar.getSelectedDate();
                if (selectedDate) {
                    Calendar.showDayDetail(selectedDate);
                }
            });
        }
        
        const inheritBtn = document.getElementById('inheritBtn');
        if (inheritBtn) {
            inheritBtn.addEventListener('click', () => {
                TodoManager.inheritFromDayBefore();
            });
        }
        
        // 为模态框中的时间输入框添加回车键事件监听
        const todoTimeInput = document.getElementById('todoTime');
        if (todoTimeInput) {
            todoTimeInput.addEventListener('timeEnter', () => {
                this.saveTodo();
            });
        }
    },
    
    initQuickAdd() {
        // 设置完成日期的默认值为当前日历选择的日期
        const quickDueDate = document.getElementById('quickDueDate');
        if (quickDueDate) {
            quickDueDate.value = Calendar.getSelectedDate() || Calendar.formatDate(new Date());
        }
        
        // 为时间输入框添加回车键事件监听
        const quickTimeInput = document.getElementById('quickTime');
        if (quickTimeInput) {
            quickTimeInput.addEventListener('timeEnter', () => {
                this.quickAddTodo();
            });
        }
        
        document.getElementById('quickAddTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.quickAddTodo();
            }
        });
        
        document.getElementById('quickAddBtn').addEventListener('click', () => {
            this.quickAddTodo();
        });
    },
    
    async quickAddTodo() {
        const title = document.getElementById('quickAddTitle').value.trim();
        if (!title) {
            App.showNotification('请输入待办内容', 'warning');
            return;
        }
        
        const responsible = document.getElementById('quickResponsible').value;
        const selectedCalendarDate = Calendar.getSelectedDate() || Calendar.formatDate(new Date());
        
        const todo = {
            title: title,
            type: document.getElementById('quickType').value,
            category: document.getElementById('quickCategory').value,
            responsible: responsible,
            date: selectedCalendarDate,
            dueDate: document.getElementById('quickDueDate').value || selectedCalendarDate,
            time: document.getElementById('quickTime').value,
            priority: document.getElementById('quickPriority').value,
            reminder: document.getElementById('quickReminder').checked,
            reminderTime: 30,
            completed: false,
            completedAt: null
        };
        
        await Storage.addTodo(todo);
        App.showNotification('待办已添加', 'success');
        
        document.getElementById('quickAddTitle').value = '';
        
        Calendar.render();
        
        if (Calendar.getSelectedDate()) {
            Calendar.showDayDetail(Calendar.getSelectedDate());
        }
        
        Reminder.scheduleReminder(todo);
    },
    
    loadFilters() {
        const categorySelect = document.getElementById('categoryFilter');
        const todoCategorySelect = document.getElementById('todoCategory');
        const quickCategorySelect = document.getElementById('quickCategory');
        const categories = Storage.getCategories();
        
        categorySelect.innerHTML = '<option value="all">全部分类</option>';
        todoCategorySelect.innerHTML = '<option value="">选择分类</option>';
        quickCategorySelect.innerHTML = '<option value="">选择分类</option>';
        
        categories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            todoCategorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
            quickCategorySelect.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
        
        // 更新自定义下拉列表
        if (categorySelect.customSelect) CustomSelect.updateOptions(categorySelect);
        if (todoCategorySelect.customSelect) CustomSelect.updateOptions(todoCategorySelect);
        if (quickCategorySelect.customSelect) CustomSelect.updateOptions(quickCategorySelect);
        
        const responsibleSelect = document.getElementById('responsibleFilter');
        const responsibles = Storage.getResponsibles();
        
        responsibleSelect.innerHTML = '<option value="all">全部责任人</option>';
        
        responsibles.forEach(resp => {
            responsibleSelect.innerHTML += `<option value="${resp.id}">${resp.name}</option>`;
        });
        
        // 更新自定义下拉列表
        if (responsibleSelect.customSelect) CustomSelect.updateOptions(responsibleSelect);
        
        // Initialize multi-select for todo modal
        const todoResponsibleContainer = document.getElementById('todoResponsibleContainer');
        if (todoResponsibleContainer && responsibles.length > 0) {
            // 只初始化一次
            if (!todoResponsibleContainer.options) {
                MultiSelect.init('todoResponsibleContainer', responsibles, [], (selectedValues) => {
                    document.getElementById('todoResponsible').value = selectedValues.join(',');
                });
            } else {
                // 更新选项
                MultiSelect.updateOptions('todoResponsibleContainer', responsibles);
            }
        }
        
        // Initialize multi-select for quick add
        const quickResponsibleContainer = document.getElementById('quickResponsibleContainer');
        if (quickResponsibleContainer && responsibles.length > 0) {
            // 只初始化一次
            if (!quickResponsibleContainer.options) {
                MultiSelect.init('quickResponsibleContainer', responsibles, [], (selectedValues) => {
                    document.getElementById('quickResponsible').value = selectedValues.join(',');
                });
            } else {
                // 更新选项
                MultiSelect.updateOptions('quickResponsibleContainer', responsibles);
            }
        }
    },
    
    openModal(todo = null) {
        const modal = document.getElementById('todoModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('todoForm');
        const dateGroup = document.getElementById('todoDate').closest('.form-group');
        const dueDateGroup = document.getElementById('todoDueDate').closest('.form-group');
        
        this.loadFilters();
        
        if (todo) {
            title.textContent = '编辑待办';
            document.getElementById('todoId').value = todo.id;
            document.getElementById('todoTitle').value = todo.title;
            document.getElementById('todoType').value = todo.type || 'check';
            document.getElementById('todoCategory').value = todo.category;
            document.getElementById('todoDate').value = todo.date;
            document.getElementById('todoDueDate').value = todo.dueDate || todo.date;
            document.getElementById('todoTime').value = todo.time || '';
            document.getElementById('todoPriority').value = todo.priority || 'normal';
            document.getElementById('todoReminder').checked = todo.reminder;
            document.getElementById('todoReminderTime').value = todo.reminderTime || 30;
            document.getElementById('reminderTimeGroup').style.display = todo.reminder ? 'block' : 'none';
            
            // 编辑待办时显示日期选择器
            dateGroup.style.display = 'block';
            dueDateGroup.style.display = 'block';
            
            // Set multi-select values
            const responsibleValues = Array.isArray(todo.responsible) ? todo.responsible : (todo.responsible ? [todo.responsible] : []);
            MultiSelect.setSelectedValues('todoResponsibleContainer', responsibleValues);
            
            // Update time select display
            const todoTimeInput = document.getElementById('todoTime');
            if (todoTimeInput.timeSelect) {
                TimeSelect.setValue(todoTimeInput, todo.time || '');
            }
            
            // Update category select display
            const todoCategorySelect = document.getElementById('todoCategory');
            if (todoCategorySelect.customSelect) {
                CustomSelect.updateOptions(todoCategorySelect);
            }
            
            // Update type select display
            const todoTypeSelect = document.getElementById('todoType');
            if (todoTypeSelect.customSelect) {
                CustomSelect.updateOptions(todoTypeSelect);
            }
            
            // Update priority select display
            const todoPrioritySelect = document.getElementById('todoPriority');
            if (todoPrioritySelect.customSelect) {
                CustomSelect.updateOptions(todoPrioritySelect);
            }
        } else {
            title.textContent = '添加待办';
            form.reset();
            document.getElementById('todoId').value = '';
            document.getElementById('todoDate').value = Calendar.getSelectedDate() || Calendar.formatDate(new Date());
            document.getElementById('todoDueDate').value = '';
            document.getElementById('todoReminderTime').value = 30;
            document.getElementById('reminderTimeGroup').style.display = 'none';
            
            // 新建待办时隐藏日期选择器（自动使用当前日期）
            dateGroup.style.display = 'none';
            dueDateGroup.style.display = 'block';
            
            // Reset multi-select
            MultiSelect.setSelectedValues('todoResponsibleContainer', []);
            
            // Reset time select display
            const todoTimeInput = document.getElementById('todoTime');
            if (todoTimeInput.timeSelect) {
                TimeSelect.setValue(todoTimeInput, '');
            }
        }
        
        modal.classList.add('active');
    },
    
    closeModal() {
        document.getElementById('todoModal').classList.remove('active');
    },
    
    async saveTodo() {
        const id = document.getElementById('todoId').value;
        const responsibleValue = document.getElementById('todoResponsible').value;
        const responsible = responsibleValue ? responsibleValue.split(',').filter(v => v) : [];
        
        let todoDate;
        
        if (id) {
            todoDate = document.getElementById('todoDate').value;
        } else {
            todoDate = Calendar.formatDate(new Date());
        }
        
        const todo = {
            title: document.getElementById('todoTitle').value,
            type: document.getElementById('todoType').value,
            category: document.getElementById('todoCategory').value,
            responsible: responsible,
            date: todoDate,
            dueDate: document.getElementById('todoDueDate').value || todoDate,
            time: document.getElementById('todoTime').value,
            priority: document.getElementById('todoPriority').value,
            reminder: document.getElementById('todoReminder').checked,
            reminderTime: parseInt(document.getElementById('todoReminderTime').value) || 30,
            completed: false
        };
        
        if (id) {
            const existing = Storage.getTodos().find(t => t.id === id);
            todo.completed = existing ? existing.completed : false;
            todo.completedAt = existing ? existing.completedAt : null;
            await Storage.updateTodo(id, todo);
            App.showNotification('待办已更新', 'success');
        } else {
            await Storage.addTodo(todo);
            App.showNotification('待办已添加', 'success');
        }
        
        this.closeModal();
        Calendar.render();
        
        if (Calendar.getSelectedDate()) {
            Calendar.showDayDetail(Calendar.getSelectedDate());
        }
        
        Reminder.scheduleReminder(todo);
    },
    
    editTodo(id) {
        const todo = Storage.getTodos().find(t => t.id === id);
        if (todo) {
            this.openModal(todo);
        }
    },
    
    deleteTodo(id) {
        App.confirm('确认删除', '确定要删除这个待办吗？', async () => {
            await Storage.deleteTodo(id);
            App.showNotification('待办已删除', 'success');
            Calendar.render();
            if (Calendar.getSelectedDate()) {
                Calendar.showDayDetail(Calendar.getSelectedDate());
            }
        });
    },
    
    inheritFromDayBefore() {
        const selectedDate = Calendar.getSelectedDate();
        if (!selectedDate) {
            App.showNotification('请先选择日期', 'warning');
            return;
        }
        
        const dateObj = new Date(selectedDate + 'T00:00:00');
        dateObj.setDate(dateObj.getDate() - 1);
        const dayBefore = Calendar.formatDate(dateObj);
        
        const todos = Storage.getTodosByDate(dayBefore);
        
        if (todos.length === 0) {
            App.showNotification('昨天没有待办事项可继承', 'warning');
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
            App.showNotification(message, 'warning');
            return;
        }
        
        let confirmMessage = `将继承昨天(${dayBefore})的${todosToInherit.length}个待办事项`;
        if (duplicateTodos.length > 0) {
            confirmMessage += `\n\n跳过${duplicateTodos.length}个重复待办：\n${duplicateTodos.map(t => `• ${t.title}`).join('\n')}`;
        }
        confirmMessage += '\n\n是否继续？';
        
        App.confirm('确认继承', confirmMessage, async () => {
            let successCount = 0;
            let failCount = 0;
            
            for (const todo of todosToInherit) {
                let newDate = selectedDate;
                if (todo.date) {
                    const originalDate = new Date(todo.date + 'T00:00:00');
                    originalDate.setDate(originalDate.getDate() + 1);
                    newDate = Calendar.formatDate(originalDate);
                }
                
                let newDueDate = todo.dueDate;
                if (todo.dueDate) {
                    const originalDueDate = new Date(todo.dueDate + 'T00:00:00');
                    originalDueDate.setDate(originalDueDate.getDate() + 1);
                    newDueDate = Calendar.formatDate(originalDueDate);
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
                
                const result = await Storage.addTodo(newTodo);
                if (result) {
                    successCount++;
                } else {
                    failCount++;
                }
            }
            
            let successMessage = `已继承${successCount}个待办事项`;
            if (failCount > 0) {
                successMessage += `，失败${failCount}个`;
            }
            if (duplicateTodos.length > 0) {
                successMessage += `，跳过${duplicateTodos.length}个重复待办`;
            }
            App.showNotification(successMessage, 'success');
            Calendar.render();
            Calendar.showDayDetail(selectedDate);
        });
    }
};