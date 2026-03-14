const BmobService = {
    secretKey: 'e5ae278d2169f6a1',
    apiSecurityCode: 'bmob_2024_secure',
    initialized: false,
    
    async init() {
        try {
            if (!this.initialized) {
                Bmob.initialize(this.secretKey, this.apiSecurityCode);
                this.initialized = true;
                console.log('Bmob 初始化成功');
            }
            return true;
        } catch (error) {
            console.error('Bmob 初始化失败:', error);
            return false;
        }
    },
    
    async getTodos() {
        try {
            await this.init();
            const query = Bmob.Query('Todo');
            const results = await query.find();
            return results.map(item => ({
                id: item.objectId,
                title: item.title,
                type: item.type,
                category: item.category,
                categoryId: item.categoryId,
                responsible: item.responsible || [],
                priority: item.priority,
                date: item.date,
                dueDate: item.dueDate,
                time: item.time,
                reminder: item.reminder,
                reminderTime: item.reminderTime,
                completed: item.completed || false,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }));
        } catch (error) {
            console.error('获取待办失败:', error);
            return [];
        }
    },
    
    async addTodo(todo) {
        try {
            await this.init();
            const query = Bmob.Query('Todo');
            query.set('title', todo.title);
            query.set('type', todo.type || '');
            query.set('category', todo.category || '');
            query.set('categoryId', todo.categoryId || '');
            query.set('responsible', todo.responsible || []);
            query.set('priority', todo.priority || 'normal');
            query.set('date', todo.date);
            query.set('dueDate', todo.dueDate || '');
            query.set('time', todo.time || '');
            query.set('reminder', todo.reminder || false);
            query.set('reminderTime', todo.reminderTime || 30);
            query.set('completed', todo.completed || false);
            const result = await query.save();
            return {
                ...todo,
                id: result.objectId,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt
            };
        } catch (error) {
            console.error('添加待办失败:', error);
            return null;
        }
    },
    
    async updateTodo(id, updates) {
        try {
            await this.init();
            const query = Bmob.Query('Todo');
            const todo = await query.get(id);
            Object.keys(updates).forEach(key => {
                if (updates[key] !== undefined) {
                    todo.set(key, updates[key]);
                }
            });
            await todo.save();
            return { id, ...updates };
        } catch (error) {
            console.error('更新待办失败:', error);
            return null;
        }
    },
    
    async deleteTodo(id) {
        try {
            await this.init();
            const query = Bmob.Query('Todo');
            await query.destroy(id);
            return true;
        } catch (error) {
            console.error('删除待办失败:', error);
            return false;
        }
    },
    
    async getCategories() {
        try {
            await this.init();
            const query = Bmob.Query('Category');
            const results = await query.find();
            return results.map(item => ({
                id: item.objectId,
                name: item.name,
                color: item.color
            }));
        } catch (error) {
            console.error('获取分类失败:', error);
            return [];
        }
    },
    
    async addCategory(category) {
        try {
            await this.init();
            const query = Bmob.Query('Category');
            query.set('name', category.name);
            query.set('color', category.color);
            const result = await query.save();
            return {
                ...category,
                id: result.objectId
            };
        } catch (error) {
            console.error('添加分类失败:', error);
            return null;
        }
    },
    
    async updateCategory(id, updates) {
        try {
            await this.init();
            const query = Bmob.Query('Category');
            const category = await query.get(id);
            Object.keys(updates).forEach(key => {
                if (updates[key] !== undefined) {
                    category.set(key, updates[key]);
                }
            });
            await category.save();
            return { id, ...updates };
        } catch (error) {
            console.error('更新分类失败:', error);
            return null;
        }
    },
    
    async deleteCategory(id) {
        try {
            await this.init();
            const query = Bmob.Query('Category');
            await query.destroy(id);
            return true;
        } catch (error) {
            console.error('删除分类失败:', error);
            return false;
        }
    },
    
    async getResponsibles() {
        try {
            await this.init();
            const query = Bmob.Query('Responsible');
            const results = await query.find();
            return results.map(item => ({
                id: item.objectId,
                name: item.name,
                position: item.position
            }));
        } catch (error) {
            console.error('获取责任人失败:', error);
            return [];
        }
    },
    
    async addResponsible(responsible) {
        try {
            await this.init();
            const query = Bmob.Query('Responsible');
            query.set('name', responsible.name);
            query.set('position', responsible.position || '');
            const result = await query.save();
            return {
                ...responsible,
                id: result.objectId
            };
        } catch (error) {
            console.error('添加责任人失败:', error);
            return null;
        }
    },
    
    async updateResponsible(id, updates) {
        try {
            await this.init();
            const query = Bmob.Query('Responsible');
            const responsible = await query.get(id);
            Object.keys(updates).forEach(key => {
                if (updates[key] !== undefined) {
                    responsible.set(key, updates[key]);
                }
            });
            await responsible.save();
            return { id, ...updates };
        } catch (error) {
            console.error('更新责任人失败:', error);
            return null;
        }
    },
    
    async deleteResponsible(id) {
        try {
            await this.init();
            const query = Bmob.Query('Responsible');
            await query.destroy(id);
            return true;
        } catch (error) {
            console.error('删除责任人失败:', error);
            return false;
        }
    }
};
