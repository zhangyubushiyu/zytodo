const App = {
    calendarHidden: false,
    sidebarHidden: false,
    useBmob: false,
    
    async init() {
        const bmobInitialized = await this.initBmob();
        
        if (bmobInitialized) {
            this.useBmob = true;
            console.log('使用Bmob云数据库');
        } else {
            console.log('使用本地存储');
        }
        
        await Storage.init();
        Calendar.init();
        TodoManager.init();
        ResponsibleManager.init();
        CategoryManager.init();
        Reminder.init();
        iOSModal.init();
        CustomSelect.initAll();
        TimeSelect.initAll();
        MobileNav.init();
        
        this.bindEvents();
        this.updateLayout();
        
        const today = Calendar.formatDate(new Date());
        Calendar.selectDate(today);
        
        console.log('团队待办管理系统已初始化');
    },
    
    async initBmob() {
        try {
            const initialized = await BmobService.init();
            if (initialized) {
                const todos = await BmobService.getTodos();
                console.log('Bmob连接测试成功，当前待办数量:', todos.length);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Bmob初始化失败:', error);
            return false;
        }
    },
    
    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
        
        const clearTodayBtn = document.getElementById('clearTodayBtn');
        if (clearTodayBtn) {
            clearTodayBtn.addEventListener('click', () => {
                this.clearTodayTodos();
            });
        }
        
        const toggleCalendar = document.getElementById('toggleCalendar');
        if (toggleCalendar) {
            toggleCalendar.addEventListener('click', () => {
                this.toggleCalendar();
            });
        }
        
        const toggleSidebar = document.getElementById('toggleSidebar');
        if (toggleSidebar) {
            toggleSidebar.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
        
        const testCloudBtn = document.getElementById('testCloudBtn');
        if (testCloudBtn) {
            testCloudBtn.addEventListener('click', () => {
                this.testCloudConnection();
            });
        }
        
        const todoReminder = document.getElementById('todoReminder');
        if (todoReminder) {
            todoReminder.addEventListener('change', (e) => {
                const reminderTimeGroup = document.getElementById('reminderTimeGroup');
                if (reminderTimeGroup) {
                    reminderTimeGroup.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        }
        
        const cancelTodoBtn = document.getElementById('cancelTodoBtn');
        if (cancelTodoBtn) {
            cancelTodoBtn.addEventListener('click', () => {
                document.getElementById('todoModal').classList.remove('active');
            });
        }
        
        const closeTodoModal = document.getElementById('closeTodoModal');
        if (closeTodoModal) {
            closeTodoModal.addEventListener('click', () => {
                document.getElementById('todoModal').classList.remove('active');
            });
        }
        
        const closeConfirmModal = document.getElementById('closeConfirmModal');
        if (closeConfirmModal) {
            closeConfirmModal.addEventListener('click', () => {
                this.closeConfirmModal();
            });
        }
        
        const confirmCancelBtn = document.getElementById('confirmCancelBtn');
        if (confirmCancelBtn) {
            confirmCancelBtn.addEventListener('click', () => {
                this.closeConfirmModal();
            });
        }
        
        const exportDataBtn = document.getElementById('exportDataBtn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                FileSystemStorage.exportData();
            });
        }
        
        const importDataBtn = document.getElementById('importDataBtn');
        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                document.getElementById('importFileInput').click();
            });
        }
        
        const importFileInput = document.getElementById('importFileInput');
        if (importFileInput) {
            importFileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        await FileSystemStorage.importData(file);
                        Calendar.render();
                        TodoManager.loadFilters();
                        App.showNotification('数据导入成功', 'success');
                    } catch (error) {
                        console.error('导入失败:', error);
                    }
                }
                e.target.value = '';
            });
        }
        
        const selectFileBtn = document.getElementById('selectFileBtn');
        if (selectFileBtn) {
            selectFileBtn.addEventListener('click', async () => {
                if (!FileSystemStorage.isSupported) {
                    this.showNotification('您的浏览器不支持文件系统API，请使用Chrome或Edge', 'warning');
                    return;
                }
                
                try {
                    const granted = await FileSystemStorage.requestPermission();
                    if (granted) {
                        Storage.setStoragePreference(true);
                        this.updateStorageStatus();
                        this.showNotification('已选择本地文件存储', 'success');
                    }
                } catch (error) {
                    console.error('选择文件失败:', error);
                    this.showNotification('选择文件失败', 'error');
                }
            });
        }
        
        const manageCategoryBtn = document.getElementById('manageCategoryBtn');
        if (manageCategoryBtn) {
            manageCategoryBtn.addEventListener('click', () => {
                document.getElementById('categoryModal').classList.add('active');
            });
        }
        
        const manageResponsibleBtn = document.getElementById('manageResponsibleBtn');
        if (manageResponsibleBtn) {
            manageResponsibleBtn.addEventListener('click', () => {
                document.getElementById('responsibleModal').classList.add('active');
            });
        }
        
        this.updateStorageStatus();
    },
    
    toggleCalendar() {
        this.calendarHidden = !this.calendarHidden;
        const calendarSection = document.getElementById('calendarSection');
        const toggleBtn = document.getElementById('toggleCalendar');
        
        if (this.calendarHidden) {
            calendarSection.classList.add('hidden');
            toggleBtn.textContent = '▶';
            toggleBtn.title = '显示日历';
        } else {
            calendarSection.classList.remove('hidden');
            toggleBtn.textContent = '◀';
            toggleBtn.title = '隐藏日历';
        }
        
        this.updateLayout();
    },
    
    toggleSidebar() {
        this.sidebarHidden = !this.sidebarHidden;
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('toggleSidebar');
        
        if (this.sidebarHidden) {
            sidebar.classList.add('hidden');
            toggleBtn.textContent = '◀';
            toggleBtn.title = '显示管理面板';
        } else {
            sidebar.classList.remove('hidden');
            toggleBtn.textContent = '▶';
            toggleBtn.title = '隐藏管理面板';
        }
        
        this.updateLayout();
    },
    
    /**
     * 测试云开发连接
     */
    async testCloudConnection() {
        const btn = document.getElementById('testCloudBtn');
        const originalText = btn.textContent;
        
        try {
            btn.textContent = '⏳';
            btn.disabled = true;
            
            // 测试初始化
            const initialized = await BmobService.init();
            
            if (initialized) {
                const todos = await BmobService.getTodos();
                const categories = await BmobService.getCategories();
                const responsibles = await BmobService.getResponsibles();
                
                btn.textContent = '✅';
                btn.classList.add('connected');
                
                const localTodos = JSON.parse(localStorage.getItem('todo_system_todos') || '[]');
                const localCategories = JSON.parse(localStorage.getItem('todo_system_categories') || '[]');
                const localResponsibles = JSON.parse(localStorage.getItem('todo_system_responsibles') || '[]');
                
                let message = `Bmob连接成功！\n\n`;
                message += `云数据库数据：\n`;
                message += `- 待办数量: ${todos.length}\n`;
                message += `- 分类数量: ${categories.length}\n`;
                message += `- 负责人数量: ${responsibles.length}\n\n`;
                message += `本地存储数据：\n`;
                message += `- 待办数量: ${localTodos.length}\n`;
                message += `- 分类数量: ${localCategories.length}\n`;
                message += `- 负责人数量: ${localResponsibles.length}\n\n`;
                
                if (localTodos.length > 0 || localCategories.length > 0 || localResponsibles.length > 0) {
                    if (confirm(message + '是否迁移本地数据到云数据库？')) {
                        await this.migrateData();
                    }
                } else {
                    alert(message);
                }
                
                console.log('Bmob连接测试成功');
                console.log('待办:', todos);
                console.log('分类:', categories);
                console.log('负责人:', responsibles);
            } else {
                throw new Error('初始化失败');
            }
        } catch (error) {
            btn.textContent = '❌';
            btn.classList.remove('connected');
            
            alert(`Bmob连接失败！\n\n错误: ${error.message}\n\n请检查：\n1. Bmob应用是否已创建\n2. 数据表是否已创建\n3. 网络连接是否正常`);
            
            console.error('Bmob连接测试失败:', error);
        } finally {
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 3000);
        }
    },
    
    /**
     * 迁移数据
     */
    async migrateData() {
        try {
            this.showNotification('开始迁移数据...', 'info');
            
            const todos = JSON.parse(localStorage.getItem('todo_system_todos') || '[]');
            const categories = JSON.parse(localStorage.getItem('todo_system_categories') || '[]');
            const responsibles = JSON.parse(localStorage.getItem('todo_system_responsibles') || '[]');
            
            console.log('准备迁移数据:', {
                todos: todos.length,
                categories: categories.length,
                responsibles: responsibles.length
            });
            
            // 建立ID映射关系
            const categoryIdMap = {};
            const responsibleIdMap = {};
            
            for (const category of categories) {
                const result = await BmobService.addCategory({
                    name: category.name,
                    color: category.color,
                    order: category.order || 0
                });
                categoryIdMap[category.id] = result.id;
                console.log(`分类迁移: ${category.name} (${category.id} -> ${result.id})`);
            }
            
            for (const responsible of responsibles) {
                const result = await BmobService.addResponsible({
                    name: responsible.name,
                    position: responsible.position || ''
                });
                responsibleIdMap[responsible.id] = result.id;
                console.log(`负责人迁移: ${responsible.name} (${responsible.id} -> ${result.id})`);
            }
            
            // 迁移待办
            for (const todo of todos) {
                // 转换分类ID
                let newCategoryId = '';
                if (todo.category && categoryIdMap[todo.category]) {
                    newCategoryId = categoryIdMap[todo.category];
                }
                
                // 转换负责人ID列表
                let newResponsibleIds = [];
                if (todo.responsible && todo.responsible.length > 0) {
                    newResponsibleIds = todo.responsible.map(oldId => responsibleIdMap[oldId]).filter(id => id);
                }
                
                await BmobService.addTodo({
                    title: todo.title,
                    type: todo.type || 'check',
                    category: newCategoryId,
                    responsible: newResponsibleIds,
                    date: todo.date,
                    dueDate: todo.dueDate || todo.date,
                    time: todo.time || '',
                    priority: todo.priority || 'normal',
                    reminder: todo.reminder || false,
                    reminderTime: todo.reminderTime || 30,
                    completed: todo.completed || false,
                    completedAt: todo.completedAt || null
                });
                console.log(`待办迁移: ${todo.title}`);
            }
            
            // 备份localStorage数据
            localStorage.setItem('todo_system_backup', JSON.stringify({
                todos,
                categories,
                responsibles,
                backupTime: new Date().toISOString()
            }));
            
            this.showNotification(`数据迁移成功！待办: ${todos.length}, 分类: ${categories.length}, 负责人: ${responsibles.length}`, 'success');
            
            // 刷新页面
            setTimeout(() => {
                location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('数据迁移失败:', error);
            this.showNotification('数据迁移失败: ' + error.message, 'error');
        }
    },
    
    updateLayout() {
        const todoSection = document.getElementById('todoSection');
        const calendarSection = document.getElementById('calendarSection');
        const sidebar = document.getElementById('sidebar');
        
        todoSection.classList.remove('expanded', 'full');
        
        if (this.calendarHidden && this.sidebarHidden) {
            todoSection.classList.add('full');
        } else if (this.calendarHidden || this.sidebarHidden) {
            todoSection.classList.add('expanded');
        }
        
        if (calendarSection) {
            if (this.calendarHidden) {
                calendarSection.style.flex = '0 0 0';
            } else {
                calendarSection.style.flex = '0 0 50%';
            }
        }
        
        if (sidebar) {
            if (this.sidebarHidden) {
                sidebar.style.flex = '0 0 0';
            } else {
                sidebar.style.flex = '0 0 20%';
            }
        }
    },
    
    toggleFilter(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.toggle('collapsed');
        }
    },
    
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },
    
    updateStorageStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        const storageHint = document.getElementById('storageHint');
        
        if (statusIndicator && statusText) {
            if (Storage.useFileSystem && FileSystemStorage.fileHandle) {
                statusIndicator.classList.add('file-system');
                statusText.textContent = '使用本地文件存储';
                if (storageHint) {
                    storageHint.classList.add('hidden');
                }
            } else {
                statusIndicator.classList.remove('file-system');
                statusText.textContent = '使用浏览器存储';
                if (storageHint) {
                    storageHint.classList.remove('hidden');
                }
            }
        }
    },
    
    confirm(title, message, callback) {
        iOSModal.confirm(title, message, callback);
    },
    
    closeConfirmModal() {
        iOSModal.hide();
    },
    
    confirmNoEnter(title, message, callback) {
        iOSModal.confirm(title, message, callback);
    },
    
    clearTodayTodos() {
        const selectedDate = Calendar.getSelectedDate();
        if (!selectedDate) {
            this.showNotification('请先选择日期', 'warning');
            return;
        }
        
        const todos = Storage.getTodosByDate(selectedDate);
        if (todos.length === 0) {
            this.showNotification('当天没有待办事项', 'warning');
            return;
        }
        
        iOSModal.confirm('确认清除', `确定要清除${selectedDate}的所有${todos.length}个待办事项吗？此操作不可恢复！`, () => {
            todos.forEach(todo => {
                Storage.deleteTodo(todo.id);
            });
            this.showNotification(`已清除${todos.length}个待办事项`, 'success');
            Calendar.render();
            Calendar.showDayDetail(selectedDate);
        }, null, true);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
