const MultiSelect = {
    init(containerId, options, selectedValues = [], onChange = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const display = container.querySelector('.multi-select-display');
        const dropdown = container.querySelector('.multi-select-dropdown');
        const hiddenInput = container.querySelector('input[type="hidden"]');
        
        if (!display || !dropdown) return;
        
        // Store data
        container.options = options;
        container.selectedValues = selectedValues;
        container.onChange = onChange;
        
        // Render dropdown
        this.renderDropdown(dropdown, options, selectedValues, container);
        
        // Update display
        this.updateDisplay(container);
        
        // Toggle dropdown
        display.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag')) return;
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    },
    
    renderDropdown(dropdown, options, selectedValues, container) {
        dropdown.innerHTML = '';
        
        options.forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'multi-select-option';
            if (selectedValues.includes(option.id)) {
                optionDiv.classList.add('selected');
            }
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${container.id}_${option.id}`;
            checkbox.checked = selectedValues.includes(option.id);
            checkbox.style.pointerEvents = 'none'; // 禁止直接点击 checkbox
            
            const label = document.createElement('label');
            label.textContent = option.name;
            label.style.pointerEvents = 'none'; // 禁止直接点击 label
            
            optionDiv.appendChild(checkbox);
            optionDiv.appendChild(label);
            
            // 允许点击整个选项行来选择
            optionDiv.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleOption(container, option.id);
            });
            
            dropdown.appendChild(optionDiv);
        });
    },
    
    toggleOption(container, optionId) {
        const index = container.selectedValues.indexOf(optionId);
        
        if (index === -1) {
            container.selectedValues.push(optionId);
        } else {
            container.selectedValues.splice(index, 1);
        }
        
        // Update checkbox
        const checkbox = document.getElementById(`${container.id}_${optionId}`);
        if (checkbox) {
            checkbox.checked = index === -1;
        }
        
        // Update option style
        const optionDiv = checkbox?.parentElement;
        if (optionDiv) {
            optionDiv.classList.toggle('selected', index === -1);
        }
        
        // Update display
        this.updateDisplay(container);
        
        // Update hidden input
        const hiddenInput = container.querySelector('input[type="hidden"]');
        if (hiddenInput) {
            hiddenInput.value = container.selectedValues.join(',');
        }
        
        // Call onChange callback
        if (container.onChange) {
            container.onChange(container.selectedValues);
        }
    },
    
    removeOption(container, optionId) {
        const index = container.selectedValues.indexOf(optionId);
        if (index !== -1) {
            container.selectedValues.splice(index, 1);
            
            // Update checkbox
            const checkbox = document.getElementById(`${container.id}_${optionId}`);
            if (checkbox) {
                checkbox.checked = false;
            }
            
            // Update option style
            const optionDiv = checkbox?.parentElement;
            if (optionDiv) {
                optionDiv.classList.remove('selected');
            }
            
            // Update display
            this.updateDisplay(container);
            
            // Update hidden input
            const hiddenInput = container.querySelector('input[type="hidden"]');
            if (hiddenInput) {
                hiddenInput.value = container.selectedValues.join(',');
            }
            
            // Call onChange callback
            if (container.onChange) {
                container.onChange(container.selectedValues);
            }
        }
    },
    
    updateDisplay(container) {
        const display = container.querySelector('.multi-select-display');
        const selectedValues = container.selectedValues;
        const options = container.options;
        
        display.innerHTML = '';
        
        if (selectedValues.length === 0) {
            const placeholder = document.createElement('span');
            placeholder.className = 'placeholder';
            placeholder.textContent = '选择责任人';
            display.appendChild(placeholder);
        } else if (selectedValues.length <= 2) {
            selectedValues.forEach(value => {
                const option = options.find(o => o.id === value);
                if (option) {
                    const tag = document.createElement('span');
                    tag.className = 'selected-tag';
                    tag.innerHTML = `
                        ${option.name}
                        <span class="remove-tag" data-value="${value}">×</span>
                    `;
                    
                    tag.querySelector('.remove-tag').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removeOption(container, value);
                    });
                    
                    display.appendChild(tag);
                }
            });
        } else {
            // 显示第一个责任人
            const firstValue = selectedValues[0];
            const firstOption = options.find(o => o.id === firstValue);
            if (firstOption) {
                const firstTag = document.createElement('span');
                firstTag.className = 'selected-tag';
                firstTag.innerHTML = `
                    ${firstOption.name}
                    <span class="remove-tag" data-value="${firstValue}">×</span>
                `;
                
                firstTag.querySelector('.remove-tag').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeOption(container, firstValue);
                });
                
                display.appendChild(firstTag);
            }
            
            // 显示省略号
            const moreTag = document.createElement('span');
            moreTag.className = 'selected-tag';
            moreTag.style.backgroundColor = '#8E8E93';
            moreTag.textContent = `+${selectedValues.length - 1}`;
            display.appendChild(moreTag);
        }
    },
    
    getSelectedValues(containerId) {
        const container = document.getElementById(containerId);
        return container ? container.selectedValues : [];
    },
    
    setSelectedValues(containerId, values) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.selectedValues = values || [];
        
        const dropdown = container.querySelector('.multi-select-dropdown');
        if (dropdown) {
            this.renderDropdown(dropdown, container.options, container.selectedValues, container);
        }
        
        this.updateDisplay(container);
        
        const hiddenInput = container.querySelector('input[type="hidden"]');
        if (hiddenInput) {
            hiddenInput.value = container.selectedValues.join(',');
        }
    },
    
    updateOptions(containerId, options) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.options = options;
        
        // Remove invalid selected values
        container.selectedValues = container.selectedValues.filter(value => 
            options.some(option => option.id === value)
        );
        
        const dropdown = container.querySelector('.multi-select-dropdown');
        if (dropdown) {
            this.renderDropdown(dropdown, options, container.selectedValues, container);
        }
        
        this.updateDisplay(container);
    }
};
