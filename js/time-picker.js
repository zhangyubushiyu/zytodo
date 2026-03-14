const TimePicker = {
    selectedHour: 9,
    selectedMinute: 0,
    onSelect: null,
    
    init() {
        this.selectedHour = 9;
        this.selectedMinute = 0;
        this.createPicker();
    },
    
    createPicker() {
        const pickerHTML = `
            <div class="time-picker-modal" id="timePickerModal">
                <div class="time-picker-content">
                    <div class="time-picker-header">
                        <button class="time-picker-cancel" id="timePickerCancel">取消</button>
                        <h3>选择时间</h3>
                        <button class="time-picker-confirm" id="timePickerConfirm">确定</button>
                    </div>
                    <div class="time-picker-body">
                        <div class="time-picker-column">
                            <div class="time-picker-label">时</div>
                            <div class="time-picker-scroll" id="hourScroll">
                                ${this.generateHours()}
                            </div>
                        </div>
                        <div class="time-picker-separator">:</div>
                        <div class="time-picker-column">
                            <div class="time-picker-label">分</div>
                            <div class="time-picker-scroll" id="minuteScroll">
                                ${this.generateMinutes()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('timePickerModal')) {
            document.body.insertAdjacentHTML('beforeend', pickerHTML);
            this.bindEvents();
        }
    },
    
    generateHours() {
        let html = '';
        for (let i = 0; i < 24; i++) {
            const hour = String(i).padStart(2, '0');
            html += `<div class="time-picker-item" data-value="${i}">${hour}</div>`;
        }
        return html;
    },
    
    generateMinutes() {
        let html = '';
        for (let i = 0; i < 60; i += 5) {
            const minute = String(i).padStart(2, '0');
            html += `<div class="time-picker-item" data-value="${i}">${minute}</div>`;
        }
        return html;
    },
    
    bindEvents() {
        document.getElementById('timePickerCancel').addEventListener('click', () => this.hide());
        document.getElementById('timePickerConfirm').addEventListener('click', () => this.confirm());
        
        const hourScroll = document.getElementById('hourScroll');
        const minuteScroll = document.getElementById('minuteScroll');
        
        hourScroll.addEventListener('click', (e) => {
            const item = e.target.closest('.time-picker-item');
            if (item) {
                this.selectedHour = parseInt(item.dataset.value);
                this.highlightSelected();
            }
        });
        
        minuteScroll.addEventListener('click', (e) => {
            const item = e.target.closest('.time-picker-item');
            if (item) {
                this.selectedMinute = parseInt(item.dataset.value);
                this.highlightSelected();
            }
        });
    },
    
    show(selectedTime, onSelect) {
        if (selectedTime) {
            const [hour, minute] = selectedTime.split(':');
            this.selectedHour = parseInt(hour) || 9;
            this.selectedMinute = parseInt(minute) || 0;
        } else {
            const now = new Date();
            this.selectedHour = now.getHours();
            this.selectedMinute = Math.floor(now.getMinutes() / 5) * 5;
        }
        
        this.onSelect = onSelect;
        this.highlightSelected();
        setTimeout(() => {
            this.scrollToSelected();
        }, 0);
        document.getElementById('timePickerModal').classList.add('show');
    },
    
    hide() {
        document.getElementById('timePickerModal').classList.remove('show');
    },
    
    confirm() {
        if (this.onSelect) {
            const hour = String(this.selectedHour).padStart(2, '0');
            const minute = String(this.selectedMinute).padStart(2, '0');
            this.onSelect(`${hour}:${minute}`);
        }
        this.hide();
    },
    
    highlightSelected() {
        const hourScroll = document.getElementById('hourScroll');
        const minuteScroll = document.getElementById('minuteScroll');
        
        hourScroll.querySelectorAll('.time-picker-item').forEach(item => {
            item.classList.remove('selected');
            if (parseInt(item.dataset.value) === this.selectedHour) {
                item.classList.add('selected');
            }
        });
        
        minuteScroll.querySelectorAll('.time-picker-item').forEach(item => {
            item.classList.remove('selected');
            if (parseInt(item.dataset.value) === this.selectedMinute) {
                item.classList.add('selected');
            }
        });
    },
    
    scrollToSelected() {
        const hourScroll = document.getElementById('hourScroll');
        const minuteScroll = document.getElementById('minuteScroll');
        
        const hourItem = hourScroll.querySelector(`.time-picker-item[data-value="${this.selectedHour}"]`);
        const minuteItem = minuteScroll.querySelector(`.time-picker-item[data-value="${this.selectedMinute}"]`);
        
        const hourScrollStyle = window.getComputedStyle(hourScroll);
        const minuteScrollStyle = window.getComputedStyle(minuteScroll);
        const hourPaddingTop = parseInt(hourScrollStyle.paddingTop) || 0;
        const minutePaddingTop = parseInt(minuteScrollStyle.paddingTop) || 0;
        
        if (hourItem) {
            const itemHeight = hourItem.offsetHeight;
            const itemIndex = this.selectedHour;
            const itemTop = itemIndex * itemHeight + hourPaddingTop;
            const containerHeight = hourScroll.clientHeight;
            const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
            hourScroll.scrollTop = scrollTop;
        }
        
        if (minuteItem) {
            const itemHeight = minuteItem.offsetHeight;
            const itemIndex = this.selectedMinute / 5;
            const itemTop = itemIndex * itemHeight + minutePaddingTop;
            const containerHeight = minuteScroll.clientHeight;
            const scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
            minuteScroll.scrollTop = scrollTop;
        }
    }
};
