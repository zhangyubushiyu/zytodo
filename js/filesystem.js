const FileSystemStorage = {
    fileHandle: null,
    isSupported: 'showSaveFilePicker' in window,
    
    async requestPermission() {
        if (!this.isSupported) {
            throw new Error('您的浏览器不支持文件系统API，请使用Chrome、Edge等现代浏览器');
        }
        
        try {
            this.fileHandle = await window.showSaveFilePicker({
                suggestedName: 'todo-data.json',
                types: [{
                    description: 'JSON文件',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('用户取消了文件选择');
                return false;
            }
            throw error;
        }
    },
    
    async selectFile() {
        if (!this.isSupported) {
            throw new Error('您的浏览器不支持文件系统API');
        }
        
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{
                    description: 'JSON文件',
                    accept: { 'application/json': ['.json'] }
                }]
            });
            
            this.fileHandle = handle;
            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('用户取消了文件选择');
                return false;
            }
            throw error;
        }
    },
    
    async saveToFile(data) {
        if (!this.fileHandle) {
            const granted = await this.requestPermission();
            if (!granted) return false;
        }
        
        try {
            const writable = await this.fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
            
            console.log('数据已保存到本地文件');
            return true;
        } catch (error) {
            console.error('保存文件失败:', error);
            throw error;
        }
    },
    
    async loadFromFile() {
        if (!this.fileHandle) {
            const granted = await this.selectFile();
            if (!granted) return null;
        }
        
        try {
            const file = await this.fileHandle.getFile();
            const text = await file.text();
            const data = JSON.parse(text);
            
            console.log('数据已从本地文件加载');
            return data;
        } catch (error) {
            console.error('加载文件失败:', error);
            throw error;
        }
    },
    
    async checkPermission() {
        if (!this.fileHandle) return false;
        
        try {
            const permission = await this.fileHandle.queryPermission({ mode: 'readwrite' });
            return permission === 'granted';
        } catch (error) {
            return false;
        }
    },
    
    async requestWritePermission() {
        if (!this.fileHandle) return false;
        
        try {
            const permission = await this.fileHandle.requestPermission({ mode: 'readwrite' });
            return permission === 'granted';
        } catch (error) {
            return false;
        }
    },
    
    exportData() {
        const data = {
            todos: Storage.getTodos(),
            categories: Storage.getCategories(),
            responsibles: Storage.getResponsibles(),
            templates: Storage.getTemplates(),
            exportTime: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        App.showNotification('数据已导出', 'success');
    },
    
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (Storage.useBmob) {
                        const idMaps = {
                            categories: {},
                            responsibles: {}
                        };
                        
                        if (data.categories) {
                            for (const category of data.categories) {
                                const result = await BmobService.addCategory(category);
                                idMaps.categories[category.id] = result.id;
                            }
                        }
                        
                        if (data.responsibles) {
                            for (const responsible of data.responsibles) {
                                const result = await BmobService.addResponsible(responsible);
                                idMaps.responsibles[responsible.id] = result.id;
                            }
                        }
                        
                        if (data.todos) {
                            for (const todo of data.todos) {
                                const newTodo = {
                                    ...todo,
                                    categoryId: idMaps.categories[todo.categoryId] || todo.categoryId,
                                    responsible: Array.isArray(todo.responsible) 
                                        ? todo.responsible.map(id => idMaps.responsibles[id] || id)
                                        : todo.responsible
                                };
                                await BmobService.addTodo(newTodo);
                            }
                        }
                        
                        await Storage.refreshBmobCache();
                    } else {
                        if (data.todos) Storage.setTodos(data.todos);
                        if (data.categories) Storage.setCategories(data.categories);
                        if (data.responsibles) Storage.setResponsibles(data.responsibles);
                        if (data.templates) Storage.setTemplates(data.templates);
                    }
                    
                    App.showNotification('数据已导入', 'success');
                    resolve(data);
                } catch (error) {
                    console.error('导入失败:', error);
                    App.showNotification('导入失败：' + error.message, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                App.showNotification('读取文件失败', 'error');
                reject(new Error('读取文件失败'));
            };
            
            reader.readAsText(file);
        });
    }
};
