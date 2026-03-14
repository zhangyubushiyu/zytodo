const ResponsibleManager = {
    editingId: null,
    
    init() {
        this.bindEvents();
        this.renderList();
    },
    
    bindEvents() {
        document.getElementById('addResponsibleBtn').addEventListener('click', () => {
            this.addResponsible();
        });
        
        document.getElementById('closeResponsibleModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('newResponsibleName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addResponsible();
            }
        });
        
        document.getElementById('newResponsiblePosition').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addResponsible();
            }
        });
        
        // 编辑负责人模态框事件
        document.getElementById('closeEditResponsibleModal').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('cancelEditResponsibleBtn').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('editResponsibleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveResponsible();
        });
    },
    
    closeModal() {
        document.getElementById('responsibleModal').classList.remove('active');
    },
    
    closeEditModal() {
        document.getElementById('editResponsibleModal').classList.remove('active');
        this.editingId = null;
    },
    
    async addResponsible() {
        const nameInput = document.getElementById('newResponsibleName');
        const positionInput = document.getElementById('newResponsiblePosition');
        
        const name = nameInput.value.trim();
        const position = positionInput.value.trim();
        
        if (!name) {
            App.showNotification('请输入负责人姓名', 'warning');
            return;
        }
        
        const responsible = {
            name,
            position: position || ''
        };
        
        await Storage.addResponsible(responsible);
        App.showNotification('负责人已添加', 'success');
        
        nameInput.value = '';
        positionInput.value = '';
        
        this.renderList();
        TodoManager.loadFilters();
    },
    
    editResponsible(id) {
        const responsible = Storage.getResponsibles().find(r => r.id === id);
        if (responsible) {
            this.editingId = id;
            document.getElementById('editResponsibleId').value = id;
            document.getElementById('editResponsibleName').value = responsible.name;
            document.getElementById('editResponsiblePosition').value = responsible.position || '';
            document.getElementById('editResponsibleModal').classList.add('active');
        }
    },
    
    async saveResponsible() {
        const id = document.getElementById('editResponsibleId').value;
        const name = document.getElementById('editResponsibleName').value.trim();
        const position = document.getElementById('editResponsiblePosition').value.trim();
        
        if (!name) {
            App.showNotification('请输入负责人名称', 'warning');
            return;
        }
        
        await Storage.updateResponsible(id, {
            name,
            position: position || ''
        });
        
        App.showNotification('负责人已更新', 'success');
        this.closeEditModal();
        this.renderList();
        TodoManager.loadFilters();
        
        Calendar.render();
        if (Calendar.getSelectedDate()) {
            Calendar.showDayDetail(Calendar.getSelectedDate());
        }
    },
    
    deleteResponsible(id) {
        const todos = Storage.getTodos();
        const hasTodos = todos.some(t => {
            if (Array.isArray(t.responsible)) {
                return t.responsible.includes(id);
            }
            return t.responsible === id;
        });
        
        const handleDelete = async () => {
            await Storage.deleteResponsible(id);
            App.showNotification('负责人已删除', 'success');
            this.renderList();
            TodoManager.loadFilters();
            Calendar.render();
            if (Calendar.getSelectedDate()) {
                Calendar.showDayDetail(Calendar.getSelectedDate());
            }
        };
        
        if (hasTodos) {
            App.confirm('确认删除', '该负责人有关联的待办事项，删除后待办事项的负责人将被清空，是否继续？', handleDelete);
        } else {
            App.confirm('确认删除', '确定要删除这个负责人吗？', handleDelete);
        }
    },
    
    renderList() {
        const container = document.getElementById('responsibleList');
        const responsibles = Storage.getResponsibles();
        
        if (responsibles.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无负责人</p>';
            return;
        }
        
        container.innerHTML = '';
        responsibles.forEach(resp => {
            const div = document.createElement('div');
            div.className = 'list-item';
            
            const positionText = resp.position ? ` (${resp.position})` : '';
            
            div.innerHTML = `
                <div class="list-item-info">
                    <span>${resp.name}${positionText}</span>
                </div>
                <div class="list-item-actions">
                    <button onclick="ResponsibleManager.editResponsible('${resp.id}')">编辑</button>
                    <button class="delete" onclick="ResponsibleManager.deleteResponsible('${resp.id}')">删除</button>
                </div>
            `;
            
            container.appendChild(div);
        });
    }
};

const CategoryManager = {
    editingId: null,
    draggedItem: null,
    
    init() {
        this.bindEvents();
        this.renderList();
    },
    
    bindEvents() {
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.addCategory();
        });
        
        document.getElementById('closeCategoryModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('newCategoryName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCategory();
            }
        });
        
        // 编辑分类模态框事件
        document.getElementById('closeEditCategoryModal').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('cancelEditCategoryBtn').addEventListener('click', () => {
            this.closeEditModal();
        });
        
        document.getElementById('editCategoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });
        
        // 颜色选择器预览
        const editCategoryColor = document.getElementById('editCategoryColor');
        if (editCategoryColor) {
            editCategoryColor.addEventListener('input', (e) => {
                const colorPreview = document.getElementById('colorPreview');
                if (colorPreview) {
                    colorPreview.style.backgroundColor = e.target.value;
                }
            });
        }
    },
    
    closeModal() {
        document.getElementById('categoryModal').classList.remove('active');
    },
    
    closeEditModal() {
        document.getElementById('editCategoryModal').classList.remove('active');
        this.editingId = null;
    },
    
    async addCategory() {
        console.log('addCategory() 开始执行');
        const nameInput = document.getElementById('newCategoryName');
        const colorInput = document.getElementById('newCategoryColor');
        
        const name = nameInput.value.trim();
        const color = colorInput.value;
        
        if (!name) {
            App.showNotification('请输入分类名称', 'warning');
            return;
        }
        
        const category = {
            name,
            color
        };
        
        await Storage.addCategory(category);
        App.showNotification('分类已添加', 'success');
        
        nameInput.value = '';
        
        this.renderList();
        TodoManager.loadFilters();
    },
    
    editCategory(id) {
        const category = Storage.getCategories().find(c => c.id === id);
        if (category) {
            this.editingId = id;
            document.getElementById('editCategoryId').value = id;
            document.getElementById('editCategoryName').value = category.name;
            document.getElementById('editCategoryColor').value = category.color;
            
            const colorPreview = document.getElementById('colorPreview');
            if (colorPreview) {
                colorPreview.style.backgroundColor = category.color;
            }
            
            document.getElementById('editCategoryModal').classList.add('active');
        }
    },
    
    async saveCategory() {
        const id = document.getElementById('editCategoryId').value;
        const name = document.getElementById('editCategoryName').value.trim();
        const color = document.getElementById('editCategoryColor').value;
        
        if (!name) {
            App.showNotification('请输入分类名称', 'warning');
            return;
        }
        
        await Storage.updateCategory(id, {
            name,
            color
        });
        
        App.showNotification('分类已更新', 'success');
        this.closeEditModal();
        this.renderList();
        TodoManager.loadFilters();
        
        Calendar.render();
        if (Calendar.getSelectedDate()) {
            Calendar.showDayDetail(Calendar.getSelectedDate());
        }
    },
    
    deleteCategory(id) {
        const todos = Storage.getTodos();
        const hasTodos = todos.some(t => t.category === id);
        
        const handleDelete = async () => {
            await Storage.deleteCategory(id);
            App.showNotification('分类已删除', 'success');
            this.renderList();
            TodoManager.loadFilters();
            Calendar.render();
            if (Calendar.getSelectedDate()) {
                Calendar.showDayDetail(Calendar.getSelectedDate());
            }
        };
        
        if (hasTodos) {
            App.confirm('确认删除', '该分类有关联的待办事项，删除后待办事项的分类将被清空，是否继续？', handleDelete);
        } else {
            App.confirm('确认删除', '确定要删除这个分类吗？', handleDelete);
        }
    },
    
    renderList() {
        const container = document.getElementById('categoryList');
        const categories = Storage.getCategories();
        
        if (categories.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂无分类</p>';
            return;
        }
        
        container.innerHTML = '';
        categories.forEach(cat => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.draggable = true;
            div.dataset.id = cat.id;
            
            div.innerHTML = `
                <div class="list-item-info">
                    <span class="drag-handle">⋮⋮</span>
                    <span class="color-badge" style="background:${cat.color}"></span>
                    <span>${cat.name}</span>
                </div>
                <div class="list-item-actions">
                    <button onclick="CategoryManager.editCategory('${cat.id}')">编辑</button>
                    <button class="delete" onclick="CategoryManager.deleteCategory('${cat.id}')">删除</button>
                </div>
            `;
            
            div.addEventListener('dragstart', (e) => this.handleDragStart(e));
            div.addEventListener('dragend', (e) => this.handleDragEnd(e));
            div.addEventListener('dragover', (e) => this.handleDragOver(e));
            div.addEventListener('drop', (e) => this.handleDrop(e));
            div.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            div.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            
            container.appendChild(div);
        });
    },
    
    handleDragStart(e) {
        this.draggedItem = e.target.closest('.list-item');
        this.draggedItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedItem.dataset.id);
    },
    
    handleDragEnd(e) {
        if (this.draggedItem) {
            this.draggedItem.classList.remove('dragging');
        }
        document.querySelectorAll('.list-item').forEach(item => {
            item.classList.remove('drag-over');
        });
        this.draggedItem = null;
    },
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },
    
    handleDragEnter(e) {
        e.preventDefault();
        const item = e.target.closest('.list-item');
        if (item && item !== this.draggedItem) {
            item.classList.add('drag-over');
        }
    },
    
    handleDragLeave(e) {
        const item = e.target.closest('.list-item');
        if (item) {
            item.classList.remove('drag-over');
        }
    },
    
    handleDrop(e) {
        e.preventDefault();
        const dropTarget = e.target.closest('.list-item');
        
        if (dropTarget && this.draggedItem && dropTarget !== this.draggedItem) {
            const container = document.getElementById('categoryList');
            const items = Array.from(container.querySelectorAll('.list-item'));
            const draggedIndex = items.indexOf(this.draggedItem);
            const dropIndex = items.indexOf(dropTarget);
            
            if (draggedIndex < dropIndex) {
                dropTarget.parentNode.insertBefore(this.draggedItem, dropTarget.nextSibling);
            } else {
                dropTarget.parentNode.insertBefore(this.draggedItem, dropTarget);
            }
            
            // 保存新的顺序
            this.saveOrder();
        }
        
        dropTarget?.classList.remove('drag-over');
    },
    
    saveOrder() {
        const container = document.getElementById('categoryList');
        const items = Array.from(container.querySelectorAll('.list-item'));
        const newOrder = items.map(item => item.dataset.id);
        
        // 更新存储中的分类顺序
        Storage.updateCategoryOrder(newOrder);
        
        // 更新筛选列表
        TodoManager.loadFilters();
        
        App.showNotification('分类顺序已更新', 'success');
    }
};
