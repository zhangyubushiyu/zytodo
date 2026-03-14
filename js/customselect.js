const CustomSelect = {
    init(selectElement, options = {}) {
        if (!selectElement || selectElement.tagName !== 'SELECT') return;
        
        // 如果已经初始化过，先销毁
        if (selectElement.customSelect) {
            this.destroy(selectElement);
        }
        
        // 隐藏原生 select
        selectElement.style.display = 'none';
        
        // 创建自定义下拉列表容器
        const container = document.createElement('div');
        container.className = 'custom-select-container';
        
        // 创建显示框
        const display = document.createElement('div');
        display.className = 'custom-select-display';
        display.innerHTML = `<span class="custom-select-text">${this.getSelectedText(selectElement)}</span>`;
        
        // 创建下拉列表
        const dropdown = document.createElement('div');
        dropdown.className = 'custom-select-dropdown';
        
        // 渲染选项
        this.renderOptions(selectElement, dropdown);
        
        // 组装
        container.appendChild(display);
        container.appendChild(dropdown);
        selectElement.parentNode.insertBefore(container, selectElement.nextSibling);
        
        // 存储引用
        selectElement.customSelect = { container, display, dropdown };
        
        // 绑定事件
        this.bindEvents(selectElement, display, dropdown);
        
        // 如果有 placeholder 选项
        if (options.placeholder) {
            display.querySelector('.custom-select-text').textContent = options.placeholder;
            display.querySelector('.custom-select-text').classList.add('placeholder');
        }
    },
    
    renderOptions(selectElement, dropdown) {
        dropdown.innerHTML = '';
        
        const options = selectElement.querySelectorAll('option');
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'custom-select-option';
            optionDiv.textContent = option.textContent;
            optionDiv.dataset.value = option.value;
            
            if (option.selected) {
                optionDiv.classList.add('selected');
            }
            
            dropdown.appendChild(optionDiv);
        });
    },
    
    bindEvents(selectElement, display, dropdown) {
        // 切换下拉列表
        display.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(dropdown);
        });
        
        // 选择选项
        dropdown.addEventListener('click', (e) => {
            const option = e.target.closest('.custom-select-option');
            if (option) {
                this.selectOption(selectElement, option.dataset.value);
                this.hideDropdown(dropdown);
            }
        });
        
        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!display.contains(e.target) && !dropdown.contains(e.target)) {
                this.hideDropdown(dropdown);
            }
        });
    },
    
    toggleDropdown(dropdown) {
        // 关闭其他下拉列表
        document.querySelectorAll('.custom-select-dropdown.show').forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('show');
            }
        });
        dropdown.classList.toggle('show');
    },
    
    hideDropdown(dropdown) {
        dropdown.classList.remove('show');
    },
    
    selectOption(selectElement, value) {
        // 更新原生 select
        selectElement.value = value;
        
        // 触发 change 事件
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
        
        // 更新显示文本
        const display = selectElement.customSelect.display;
        const textSpan = display.querySelector('.custom-select-text');
        textSpan.textContent = this.getSelectedText(selectElement);
        textSpan.classList.remove('placeholder');
        
        // 更新选中状态
        const dropdown = selectElement.customSelect.dropdown;
        dropdown.querySelectorAll('.custom-select-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.value === value);
        });
    },
    
    getSelectedText(selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        return selectedOption ? selectedOption.textContent : '';
    },
    
    updateOptions(selectElement) {
        if (!selectElement.customSelect) return;
        
        const dropdown = selectElement.customSelect.dropdown;
        this.renderOptions(selectElement, dropdown);
        
        const display = selectElement.customSelect.display;
        const textSpan = display.querySelector('.custom-select-text');
        textSpan.textContent = this.getSelectedText(selectElement);
    },
    
    destroy(selectElement) {
        if (!selectElement.customSelect) return;
        
        const { container } = selectElement.customSelect;
        container.remove();
        selectElement.style.display = '';
        delete selectElement.customSelect;
    },
    
    initAll() {
        // 初始化所有 select 元素
        document.querySelectorAll('select:not(.no-custom)').forEach(select => {
            // 排除已经初始化的
            if (!select.customSelect) {
                this.init(select);
            }
        });
    }
};
