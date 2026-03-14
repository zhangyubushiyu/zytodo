const SelectPicker = {
    options: [],
    selectedValue: null,
    onSelect: null,
    title: '',
    multiSelect: false,
    selectedValues: [],
    
    init() {
        this.createPicker();
    },
    
    createPicker() {
        const pickerHTML = `
            <div class="select-picker-modal" id="selectPickerModal">
                <div class="select-picker-content">
                    <div class="select-picker-header">
                        <button class="select-picker-cancel" id="selectPickerCancel">取消</button>
                        <h3 id="selectPickerTitle">选择</h3>
                        <button class="select-picker-confirm" id="selectPickerConfirm">确定</button>
                    </div>
                    <div class="select-picker-list" id="selectPickerList"></div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('selectPickerModal')) {
            document.body.insertAdjacentHTML('beforeend', pickerHTML);
            this.bindEvents();
        }
    },
    
    bindEvents() {
        document.getElementById('selectPickerCancel').addEventListener('click', () => this.hide());
        document.getElementById('selectPickerConfirm').addEventListener('click', () => this.confirm());
    },
    
    show(options, selectedValue, onSelect, title = '选择', multiSelect = false) {
        this.options = options;
        this.selectedValue = selectedValue;
        this.onSelect = onSelect;
        this.title = title;
        this.multiSelect = multiSelect;
        
        if (multiSelect) {
            this.selectedValues = Array.isArray(selectedValue) ? selectedValue : [];
        } else {
            this.selectedValues = [];
        }
        
        document.getElementById('selectPickerTitle').textContent = title;
        this.renderList();
        document.getElementById('selectPickerModal').classList.add('show');
    },
    
    renderList() {
        const list = document.getElementById('selectPickerList');
        
        list.innerHTML = this.options.map(option => {
            const isSelected = this.multiSelect 
                ? this.selectedValues.includes(option.value)
                : this.selectedValue === option.value;
            
            return `
                <div class="select-picker-item ${isSelected ? 'selected' : ''}" data-value="${option.value}">
                    <span class="select-picker-label">${option.label}</span>
                    ${isSelected ? '<span class="select-picker-check">✓</span>' : ''}
                </div>
            `;
        }).join('');
        
        list.querySelectorAll('.select-picker-item').forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                
                if (this.multiSelect) {
                    const index = this.selectedValues.indexOf(value);
                    if (index > -1) {
                        this.selectedValues.splice(index, 1);
                    } else {
                        this.selectedValues.push(value);
                    }
                    this.renderList();
                } else {
                    this.selectedValue = value;
                    this.renderList();
                    setTimeout(() => this.confirm(), 200);
                }
            });
        });
    },
    
    hide() {
        document.getElementById('selectPickerModal').classList.remove('show');
    },
    
    confirm() {
        if (this.onSelect) {
            if (this.multiSelect) {
                this.onSelect(this.selectedValues);
            } else {
                this.onSelect(this.selectedValue);
            }
        }
        this.hide();
    }
};
