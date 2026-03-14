/**
 * 云开发Web SDK初始化和操作
 * 实现PC web端与小程序的数据实时同步
 */

const CloudDBWeb = {
    // 云开发配置
    config: {
        env: 'cloudbase-1g13m49b8fe5009c', // 云开发环境ID
        region: 'ap-shanghai' // 地域，根据实际情况修改
    },
    
    app: null,
    db: null,
    auth: null,
    currentUser: null,
    
    /**
     * 初始化云开发
     */
    async init() {
        try {
            // 初始化云开发SDK
            this.app = cloudbase.init({
                env: this.config.env,
                region: this.config.region
            });
            
            // 获取数据库实例
            this.db = this.app.database();
            
            // 跳过登录，直接使用未登录模式访问
            console.log('云开发初始化成功（未登录模式）');
            return true;
        } catch (error) {
            console.error('云开发初始化失败:', error);
            return false;
        }
    },
    
    // ==================== 待办相关 ====================
    
    /**
     * 获取所有待办
     */
    async getTodos() {
        try {
            const res = await this.db.collection('todos').get();
            return res.data;
        } catch (error) {
            console.error('获取待办失败:', error);
            return [];
        }
    },
    
    /**
     * 根据日期获取待办
     */
    async getTodosByDate(date) {
        try {
            const res = await this.db.collection('todos')
                .where({ date: date })
                .get();
            return res.data;
        } catch (error) {
            console.error('获取待办失败:', error);
            return [];
        }
    },
    
    /**
     * 添加待办
     */
    async addTodo(todo) {
        try {
            const res = await this.db.collection('todos').add({
                ...todo,
                createdAt: new Date().toISOString()
            });
            return res.id;
        } catch (error) {
            console.error('添加待办失败:', error);
            throw error;
        }
    },
    
    /**
     * 更新待办
     */
    async updateTodo(id, todo) {
        try {
            await this.db.collection('todos').doc(id).update({
                ...todo,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('更新待办失败:', error);
            throw error;
        }
    },
    
    /**
     * 删除待办
     */
    async deleteTodo(id) {
        try {
            await this.db.collection('todos').doc(id).remove();
        } catch (error) {
            console.error('删除待办失败:', error);
            throw error;
        }
    },
    
    // ==================== 分类相关 ====================
    
    /**
     * 获取所有分类
     */
    async getCategories() {
        try {
            const res = await this.db.collection('categories')
                .orderBy('order', 'asc')
                .get();
            return res.data;
        } catch (error) {
            console.error('获取分类失败:', error);
            return [];
        }
    },
    
    /**
     * 添加分类
     */
    async addCategory(category) {
        try {
            console.log('准备添加分类:', category);
            const res = await this.db.collection('categories').add({
                ...category,
                createdAt: new Date().toISOString()
            });
            console.log('添加分类成功，返回ID:', res.id);
            return res.id; // Web SDK返回的是{id: xxx}格式
        } catch (error) {
            console.error('添加分类失败:', error);
            console.error('错误详情:', {
                message: error.message,
                stack: error.stack,
                category: category
            });
            throw error;
        }
    },
    
    /**
     * 更新分类
     */
    async updateCategory(id, category) {
        try {
            await this.db.collection('categories').doc(id).update({
                ...category,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('更新分类失败:', error);
            throw error;
        }
    },
    
    /**
     * 删除分类
     */
    async deleteCategory(id) {
        try {
            await this.db.collection('categories').doc(id).remove();
        } catch (error) {
            console.error('删除分类失败:', error);
            throw error;
        }
    },
    
    // ==================== 负责人相关 ====================
    
    /**
     * 获取所有负责人
     */
    async getResponsibles() {
        try {
            const res = await this.db.collection('responsibles').get();
            return res.data;
        } catch (error) {
            console.error('获取负责人失败:', error);
            return [];
        }
    },
    
    /**
     * 添加负责人
     */
    async addResponsible(responsible) {
        try {
            const res = await this.db.collection('responsibles').add({
                ...responsible,
                createdAt: new Date().toISOString()
            });
            return res.id;
        } catch (error) {
            console.error('添加负责人失败:', error);
            throw error;
        }
    },
    
    /**
     * 更新负责人
     */
    async updateResponsible(id, responsible) {
        try {
            await this.db.collection('responsibles').doc(id).update({
                ...responsible,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('更新负责人失败:', error);
            throw error;
        }
    },
    
    /**
     * 删除负责人
     */
    async deleteResponsible(id) {
        try {
            await this.db.collection('responsibles').doc(id).remove();
        } catch (error) {
            console.error('删除负责人失败:', error);
            throw error;
        }
    },
    
    // ==================== 数据迁移 ====================
    
    /**
     * 迁移localStorage数据到云数据库
     */
    async migrateData() {
        try {
            console.log('开始迁移数据...');
            
            // 获取localStorage中的数据
            const todos = JSON.parse(localStorage.getItem('todo_system_todos') || '[]');
            const categories = JSON.parse(localStorage.getItem('todo_system_categories') || '[]');
            const responsibles = JSON.parse(localStorage.getItem('todo_system_responsibles') || '[]');
            
            console.log(`待迁移数据: ${todos.length}个待办, ${categories.length}个分类, ${responsibles.length}个负责人`);
            
            // 建立ID映射关系
            const categoryIdMap = {};
            const responsibleIdMap = {};
            
            // 迁移分类
            for (const category of categories) {
                const newId = await this.addCategory({
                    name: category.name,
                    color: category.color
                });
                categoryIdMap[category.id] = newId;
                console.log(`分类迁移: ${category.name} (${category.id} -> ${newId})`);
            }
            
            // 迁移负责人
            for (const responsible of responsibles) {
                const newId = await this.addResponsible({
                    name: responsible.name,
                    position: responsible.position || ''
                });
                responsibleIdMap[responsible.id] = newId;
                console.log(`负责人迁移: ${responsible.name} (${responsible.id} -> ${newId})`);
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
                
                await this.addTodo({
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
                    completed: todo.completed || false
                });
                console.log(`待办迁移: ${todo.title}`);
            }
            
            console.log('数据迁移完成！');
            
            // 备份localStorage数据
            localStorage.setItem('todo_system_backup', JSON.stringify({
                todos,
                categories,
                responsibles,
                backupTime: new Date().toISOString()
            }));
            
            return true;
        } catch (error) {
            console.error('数据迁移失败:', error);
            throw error;
        }
    }
};
