const Storage = {
    KEYS: {
        TODOS: 'todo_system_todos',
        RESPONSIBLES: 'todo_system_responsibles',
        CATEGORIES: 'todo_system_categories',
        TEMPLATES: 'todo_system_templates'
    },
    
    useFileSystem: false,
    firstTimeUse: true,
    useBmob: false,
    bmobDataCache: {
        todos: null,
        categories: null,
        responsibles: null,
        lastUpdate: null
    },
    
    async init() {
        try {
            if (typeof BmobService !== 'undefined') {
                const initialized = await BmobService.init();
                if (initialized) {
                    this.useBmob = true;
                    console.log('使用Bmob云数据库');
                    await this.refreshBmobCache();
                    
                    // 检查Bmob云端是否有数据
                    const hasBmobData = this.bmobDataCache.todos.length > 0 || 
                                        this.bmobDataCache.categories.length > 0 || 
                                        this.bmobDataCache.responsibles.length > 0;
                    
                    // 如果云端没有数据，检查localStorage是否有数据
                    if (!hasBmobData) {
                        const localTodos = JSON.parse(localStorage.getItem(this.KEYS.TODOS) || '[]');
                        const localCategories = JSON.parse(localStorage.getItem(this.KEYS.CATEGORIES) || '[]');
                        const localResponsibles = JSON.parse(localStorage.getItem(this.KEYS.RESPONSIBLES) || '[]');
                        
                        // 如果localStorage有数据，提示用户迁移
                        if (localTodos.length > 0 || localCategories.length > 0 || localResponsibles.length > 0) {
                            console.log('检测到本地有数据，建议迁移到Bmob');
                            // 可以在这里触发迁移提示，或者自动迁移
                            // 暂时先使用本地数据
                            this.bmobDataCache.todos = localTodos;
                            this.bmobDataCache.categories = localCategories;
                            this.bmobDataCache.responsibles = localResponsibles;
                            console.log('已加载本地数据到缓存');
                        }
                    }
                    return;
                } else {
                    console.log('Bmob初始化失败，使用本地存储');
                }
            } else {
                console.log('BmobService未定义，使用本地存储');
            }
            
            // 仅在不使用Bmob时初始化本地默认数据
            this.loadStoragePreference();
            
            if (!this.getCategories().length) {
                this.setCategories([
                    { id: this.generateId(), name: '工作', color: '#4CAF50' },
                    { id: this.generateId(), name: '会议', color: '#2196F3' },
                    { id: this.generateId(), name: '项目', color: '#FF9800' },
                    { id: this.generateId(), name: '其他', color: '#9C27B0' }
                ]);
            }
            
            if (!this.getResponsibles().length) {
                this.setResponsibles([
                    { id: this.generateId(), name: '张三', position: '开发工程师' },
                    { id: this.generateId(), name: '李四', position: '产品经理' },
                    { id: this.generateId(), name: '王五', position: '设计师' }
                ]);
            }
            
            if (!localStorage.getItem(this.KEYS.TODOS)) {
                this.setTodos([]);
            }
            
            if (!this.getTemplates().length) {
                this.setTemplates([
                    { id: this.generateId(), title: '日常会议', time: '09:00', priority: 'normal', reminder: true },
                    { id: this.generateId(), title: '项目进度检查', time: '14:00', priority: 'urgent', reminder: true },
                    { id: this.generateId(), title: '代码审查', time: '16:00', priority: 'normal', reminder: false },
                    { id: this.generateId(), title: '团队周会', time: '10:00', priority: 'normal', reminder: true }
                ]);
            }
        } catch (error) {
            console.error('Storage 初始化失败:', error);
            this.handleStorageError(error);
        }
    },
    
    async refreshBmobCache() {
        if (!this.useBmob) return;
        
        try {
            this.bmobDataCache.todos = await BmobService.getTodos();
            this.bmobDataCache.categories = await BmobService.getCategories();
            this.bmobDataCache.responsibles = await BmobService.getResponsibles();
            this.bmobDataCache.lastUpdate = Date.now();
        } catch (error) {
            console.error('刷新Bmob缓存失败:', error);
        }
    },
    
    loadStoragePreference() {
        const preference = localStorage.getItem('storage_preference');
        if (preference === null) {
            this.useFileSystem = false;
            this.firstTimeUse = true;
        } else {
            this.useFileSystem = preference === 'filesystem';
            this.firstTimeUse = false;
        }
    },
    
    setStoragePreference(useFileSystem) {
        this.useFileSystem = useFileSystem;
        localStorage.setItem('storage_preference', useFileSystem ? 'filesystem' : 'localstorage');
    },
    
    generateId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 11);
        const counter = (this.idCounter = (this.idCounter || 0) + 1);
        return `${timestamp}-${randomPart}-${counter}`;
    },
    
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            App.showNotification('存储空间不足，请清理浏览器缓存', 'error');
        } else {
            App.showNotification('数据存储失败，请检查浏览器设置', 'error');
        }
    },
    
    safeGetItem(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`读取 ${key} 失败:`, error);
            return null;
        }
    },
    
    safeSetItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`保存 ${key} 失败:`, error);
            this.handleStorageError(error);
            return false;
        }
    },
    
    // ==================== 待办相关 ====================
    
    getTodos() {
        if (this.useBmob && this.bmobDataCache.todos) {
            return this.bmobDataCache.todos;
        }
        return this.safeGetItem(this.KEYS.TODOS) || [];
    },
    
    setTodos(todos) {
        if (this.useBmob) {
            this.bmobDataCache.todos = todos;
            return true;
        }
        return this.safeSetItem(this.KEYS.TODOS, todos);
    },
    
    async addTodo(todo) {
        try {
            if (this.useBmob) {
                const result = await BmobService.addTodo({
                    ...todo,
                    createdAt: new Date().toISOString()
                });
                await this.refreshBmobCache();
                return result;
            } else {
                const todos = this.getTodos();
                todo.id = this.generateId();
                todo.createdAt = new Date().toISOString();
                todo.updatedAt = new Date().toISOString();
                todos.push(todo);
                if (this.setTodos(todos)) {
                    return todo;
                }
                return null;
            }
        } catch (error) {
            console.error('添加待办失败:', error);
            this.handleStorageError(error);
            return null;
        }
    },
    
    async updateTodo(id, updates) {
        try {
            if (this.useBmob) {
                await BmobService.updateTodo(id, updates);
                await this.refreshBmobCache();
                return { id, ...updates };
            } else {
                const todos = this.getTodos();
                const index = todos.findIndex(t => t.id === id);
                if (index !== -1) {
                    todos[index] = { ...todos[index], ...updates, updatedAt: new Date().toISOString() };
                    if (this.setTodos(todos)) {
                        return todos[index];
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('更新待办失败:', error);
            this.handleStorageError(error);
            return null;
        }
    },
    
    async deleteTodo(id) {
        try {
            if (this.useBmob) {
                await BmobService.deleteTodo(id);
                await this.refreshBmobCache();
                return true;
            } else {
                const todos = this.getTodos();
                const filtered = todos.filter(t => t.id !== id);
                return this.setTodos(filtered);
            }
        } catch (error) {
            console.error('删除待办失败:', error);
            this.handleStorageError(error);
            return false;
        }
    },
    
    getTodosByDate(date) {
        const todos = this.getTodos();
        return todos.filter(t => t.date === date);
    },
    
    getTodosByDateRange(startDate, endDate) {
        const todos = this.getTodos();
        return todos.filter(t => t.date >= startDate && t.date <= endDate);
    },
    
    // ==================== 分类相关 ====================
    
    getCategories() {
        if (this.useBmob && this.bmobDataCache.categories) {
            return this.bmobDataCache.categories;
        }
        return this.safeGetItem(this.KEYS.CATEGORIES) || [];
    },
    
    setCategories(categories) {
        if (this.useBmob) {
            this.bmobDataCache.categories = categories;
            return true;
        }
        return this.safeSetItem(this.KEYS.CATEGORIES, categories);
    },
    
    async addCategory(category) {
        try {
            if (this.useBmob) {
                const result = await BmobService.addCategory(category);
                await this.refreshBmobCache();
                return result;
            } else {
                const categories = this.getCategories();
                category.id = this.generateId();
                categories.push(category);
                if (this.setCategories(categories)) {
                    return category;
                }
                return null;
            }
        } catch (error) {
            console.error('添加分类失败:', error);
            this.handleStorageError(error);
            return null;
        }
    },
    
    async updateCategory(id, updates) {
        try {
            if (this.useBmob) {
                await BmobService.updateCategory(id, updates);
                await this.refreshBmobCache();
                return { id, ...updates };
            } else {
                const categories = this.getCategories();
                const index = categories.findIndex(c => c.id === id);
                if (index !== -1) {
                    categories[index] = { ...categories[index], ...updates };
                    if (this.setCategories(categories)) {
                        return categories[index];
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('更新分类失败:', error);
            this.handleStorageError(error);
            return null;
        }
    },
    
    async deleteCategory(id) {
        try {
            if (this.useBmob) {
                await BmobService.deleteCategory(id);
                await this.refreshBmobCache();
                return true;
            } else {
                const categories = this.getCategories();
                const filtered = categories.filter(c => c.id !== id);
                return this.setCategories(filtered);
            }
        } catch (error) {
            console.error('删除分类失败:', error);
            this.handleStorageError(error);
            return false;
        }
    },
    
    getCategoryById(id) {
        const categories = this.getCategories();
        return categories.find(c => c.id === id);
    },
    
    getTodoById(id) {
        const todos = this.getTodos();
        return todos.find(t => t.id === id);
    },
    
    // ==================== 负责人相关 ====================
    
    getResponsibles() {
        if (this.useBmob && this.bmobDataCache.responsibles) {
            return this.bmobDataCache.responsibles;
        }
        return this.safeGetItem(this.KEYS.RESPONSIBLES) || [];
    },
    
    setResponsibles(responsibles) {
        if (this.useBmob) {
            this.bmobDataCache.responsibles = responsibles;
            return true;
        }
        return this.safeSetItem(this.KEYS.RESPONSIBLES, responsibles);
    },
    
    async addResponsible(responsible) {
        try {
            if (this.useBmob) {
                const result = await BmobService.addResponsible(responsible);
                await this.refreshBmobCache();
                return result;
            } else {
                const responsibles = this.getResponsibles();
                responsible.id = this.generateId();
                responsible.createdAt = new Date().toISOString();
                responsibles.push(responsible);
                if (this.setResponsibles(responsibles)) {
                    return responsible;
                }
                return null;
            }
        } catch (error) {
            console.error('添加责任人失败:', error);
            this.handleStorageError(error);
            return null;
        }
    },
    
    async updateResponsible(id, updates) {
        try {
            if (this.useBmob) {
                await BmobService.updateResponsible(id, updates);
                await this.refreshBmobCache();
                return { id, ...updates };
            } else {
                const responsibles = this.getResponsibles();
                const index = responsibles.findIndex(r => r.id === id);
                if (index !== -1) {
                    responsibles[index] = { ...responsibles[index], ...updates };
                    if (this.setResponsibles(responsibles)) {
                        return responsibles[index];
                    }
                }
                return null;
            }
        } catch (error) {
            console.error('更新责任人失败:', error);
            this.handleStorageError(error);
            return null;
        }
    },
    
    async deleteResponsible(id) {
        try {
            if (this.useBmob) {
                await BmobService.deleteResponsible(id);
                await this.refreshBmobCache();
                return true;
            } else {
                const responsibles = this.getResponsibles();
                const filtered = responsibles.filter(r => r.id !== id);
                return this.setResponsibles(filtered);
            }
        } catch (error) {
            console.error('删除责任人失败:', error);
            this.handleStorageError(error);
            return false;
        }
    },
    
    getResponsibleById(id) {
        const responsibles = this.getResponsibles();
        return responsibles.find(r => r.id === id);
    },
    
    // ==================== 模板相关（暂时保留localStorage）====================
    
    getTemplates() {
        return this.safeGetItem(this.KEYS.TEMPLATES) || [];
    },
    
    setTemplates(templates) {
        return this.safeSetItem(this.KEYS.TEMPLATES, templates);
    },
    
    addTemplate(template) {
        try {
            const templates = this.getTemplates();
            template.id = this.generateId();
            templates.push(template);
            if (this.setTemplates(templates)) {
                return template;
            }
            return null;
        } catch (error) {
            console.error('添加模板失败:', error);
            this.handleStorageError(error);
            return null;
        }
    },
    
    updateTemplate(id, updates) {
        try {
            const templates = this.getTemplates();
            const index = templates.findIndex(t => t.id === id);
            if (index !== -1) {
                templates[index] = { ...templates[index], ...updates };
                if (this.setTemplates(templates)) {
                    return templates[index];
                }
            }
            return null;
        } catch (error) {
            console.error('更新模板失败:', error);
            this.handleStorageError(error);
            return null;
        }
    },
    
    deleteTemplate(id) {
        try {
            const templates = this.getTemplates();
            const filtered = templates.filter(t => t.id !== id);
            return this.setTemplates(filtered);
        } catch (error) {
            console.error('删除模板失败:', error);
            this.handleStorageError(error);
            return false;
        }
    },
    
    getTemplateById(id) {
        const templates = this.getTemplates();
        return templates.find(t => t.id === id);
    }
};

Storage.init();
