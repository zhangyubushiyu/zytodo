const TimeSelect = {
    init(inputElement) {
        if (!inputElement || inputElement.tagName !== 'INPUT') return;
        
        // 如果已经初始化过，先销毁
        if (inputElement.timeSelect) {
            this.destroy(inputElement);
        }
        
        // 创建时间输入框容器
        const container = document.createElement('div');
        container.className = 'time-select-container';
        
        // 创建输入框容器
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'time-input-wrapper';
        
        // 克隆原生 input 元素的属性
        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = inputElement.className;
        newInput.placeholder = inputElement.placeholder || '时间';
        newInput.value = inputElement.value;
        newInput.id = inputElement.id;
        
        // 创建错误提示
        const errorTip = document.createElement('div');
        errorTip.className = 'time-error-tip';
        errorTip.style.display = 'none';
        
        // 组装输入框容器
        inputWrapper.appendChild(newInput);
        
        // 组装容器
        container.appendChild(inputWrapper);
        container.appendChild(errorTip);
        
        // 隐藏原生 input，插入新组件
        inputElement.style.display = 'none';
        inputElement.parentNode.insertBefore(container, inputElement.nextSibling);
        
        // 存储引用
        inputElement.timeSelect = { container, newInput, errorTip };
        
        // 绑定事件
        this.bindEvents(inputElement, newInput, errorTip);
        
        // 如果有初始值，设置选中状态
        if (inputElement.value) {
            newInput.value = inputElement.value;
        }
    },
    
    bindEvents(inputElement, newInput, errorTip) {
        let inputTimer = null;
        
        // 输入框输入时验证格式
        newInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            
            // 清除之前的定时器
            if (inputTimer) {
                clearTimeout(inputTimer);
            }
            
            // 隐藏错误提示
            errorTip.style.display = 'none';
            newInput.classList.remove('error');
            
            // 如果输入为空，清空值
            if (!value) {
                inputElement.value = '';
                return;
            }
            
            // 尝试解析时间
            const timeResult = this.parseTimeInput(value);
            
            if (timeResult) {
                const { hour, minute } = timeResult;
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                inputElement.value = timeString;
                newInput.value = timeString;
                
                // 触发 change 事件
                const event = new Event('change', { bubbles: true });
                inputElement.dispatchEvent(event);
            } else {
                // 如果输入的是纯数字且长度>=4，显示错误提示
                if (/^\d+$/.test(value) && value.length >= 4) {
                    inputTimer = setTimeout(() => {
                        this.showError(newInput, errorTip, '请输入有效的时间（00:00-23:59）');
                    }, 500);
                }
            }
        });
        
        // 失去焦点时验证
        newInput.addEventListener('blur', () => {
            const value = newInput.value.trim();
            
            if (value && !this.parseTimeInput(value)) {
                this.showError(newInput, errorTip, '请输入有效的时间（00:00-23:59）');
            }
        });
        
        // 获得焦点时隐藏错误提示
        newInput.addEventListener('focus', () => {
            errorTip.style.display = 'none';
            newInput.classList.remove('error');
        });
        
        // 键盘事件处理
        newInput.addEventListener('keydown', (e) => {
            // 回车键处理
            if (e.key === 'Enter') {
                e.preventDefault();
                
                const value = newInput.value.trim();
                
                // 验证时间格式
                if (value && !this.parseTimeInput(value)) {
                    this.showError(newInput, errorTip, '请输入有效的时间（00:00-23:59）');
                    return;
                }
                
                // 触发自定义的 enter 事件
                const event = new CustomEvent('timeEnter', { bubbles: true });
                inputElement.dispatchEvent(event);
                return;
            }
            
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const value = e.target.value;
                
                // 如果当前值是 HH:MM 格式
                if (/^\d{2}:\d{2}$/.test(value)) {
                    e.preventDefault();
                    
                    const [hour, minute] = value.split(':');
                    
                    // 如果分钟不是 00，删除分钟
                    if (minute !== '00') {
                        e.target.value = hour + ':00';
                        inputElement.value = hour + ':00';
                    } else {
                        // 如果分钟是 00，删除小时和冒号
                        e.target.value = '';
                        inputElement.value = '';
                    }
                    
                    // 隐藏错误提示
                    errorTip.style.display = 'none';
                    newInput.classList.remove('error');
                    
                    // 触发 change 事件
                    const event = new Event('change', { bubbles: true });
                    inputElement.dispatchEvent(event);
                }
            }
        });
    },
    
    showError(inputElement, errorTip, message) {
        errorTip.textContent = message;
        errorTip.style.display = 'block';
        inputElement.classList.add('error');
    },
    
    parseTimeInput(value) {
        if (!value) return null;
        
        // 移除所有空格
        value = value.replace(/\s/g, '');
        
        // 格式1: HH:MM 或 H:MM
        if (/^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.test(value)) {
            const [hour, minute] = value.split(':').map(Number);
            return { hour, minute };
        }
        
        // 格式2: 纯数字（如 2321 表示 23:21）
        // 只有在输入完整的4位数字后才进行转换
        if (/^\d+$/.test(value) && value.length === 4) {
            const num = parseInt(value);
            const hour = Math.floor(num / 100);
            const minute = num % 100;
            
            if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
                return { hour, minute };
            }
        }
        
        return null;
    },
    
    getValue(inputElement) {
        return inputElement.value;
    },
    
    setValue(inputElement, value) {
        inputElement.value = value;
        
        if (inputElement.timeSelect) {
            const { newInput, errorTip } = inputElement.timeSelect;
            
            if (value) {
                newInput.value = value;
            } else {
                newInput.value = '';
            }
            
            // 隐藏错误提示
            errorTip.style.display = 'none';
            newInput.classList.remove('error');
        }
    },
    
    destroy(inputElement) {
        if (!inputElement.timeSelect) return;
        
        const { container } = inputElement.timeSelect;
        container.remove();
        inputElement.style.display = '';
        delete inputElement.timeSelect;
    },
    
    initAll() {
        // 初始化所有时间输入框
        document.querySelectorAll('input[type="time"]').forEach(input => {
            if (!input.timeSelect) {
                this.init(input);
            }
        });
    }
};
