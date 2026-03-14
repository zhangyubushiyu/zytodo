const DatePicker = {
    currentDate: null,
    selectedDate: null,
    onSelect: null,
    
    init() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.createPicker();
    },
    
    createPicker() {
        const pickerHTML = `
            <div class="date-picker-modal" id="datePickerModal">
                <div class="date-picker-content">
                    <div class="date-picker-header">
                        <button class="date-picker-cancel" id="datePickerCancel">取消</button>
                        <h3>选择日期</h3>
                        <button class="date-picker-confirm" id="datePickerConfirm">确定</button>
                    </div>
                    <div class="date-picker-quick">
                        <button class="quick-btn" data-offset="0">今天</button>
                        <button class="quick-btn" data-offset="1">明天</button>
                        <button class="quick-btn" data-offset="2">后天</button>
                        <button class="quick-btn custom" id="customDateBtn">自定义</button>
                    </div>
                    <div class="date-picker-calendar" id="datePickerCalendar">
                        <div class="date-picker-month">
                            <button class="month-nav" id="prevMonth">‹</button>
                            <span id="currentMonthLabel"></span>
                            <button class="month-nav" id="nextMonth">›</button>
                        </div>
                        <div class="date-picker-weekdays">
                            <div>日</div>
                            <div>一</div>
                            <div>二</div>
                            <div>三</div>
                            <div>四</div>
                            <div>五</div>
                            <div>六</div>
                        </div>
                        <div class="date-picker-days" id="datePickerDays"></div>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('datePickerModal')) {
            document.body.insertAdjacentHTML('beforeend', pickerHTML);
            this.bindEvents();
        }
    },
    
    bindEvents() {
        document.getElementById('datePickerCancel').addEventListener('click', () => this.hide());
        document.getElementById('datePickerConfirm').addEventListener('click', () => this.confirm());
        
        document.querySelectorAll('.quick-btn:not(.custom)').forEach(btn => {
            btn.addEventListener('click', () => {
                const offset = parseInt(btn.dataset.offset);
                const date = new Date();
                date.setDate(date.getDate() + offset);
                this.selectedDate = date;
                this.highlightSelectedDate();
                document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        document.getElementById('customDateBtn').addEventListener('click', () => {
            document.getElementById('datePickerCalendar').classList.toggle('show');
        });
        
        document.getElementById('prevMonth').addEventListener('click', () => this.navigateMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.navigateMonth(1));
    },
    
    show(selectedDate, onSelect) {
        this.selectedDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
        this.currentDate = new Date(this.selectedDate);
        this.onSelect = onSelect;
        
        this.renderCalendar();
        document.getElementById('datePickerModal').classList.add('show');
    },
    
    hide() {
        document.getElementById('datePickerModal').classList.remove('show');
        document.getElementById('datePickerCalendar').classList.remove('show');
    },
    
    confirm() {
        if (this.onSelect) {
            const year = this.selectedDate.getFullYear();
            const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(this.selectedDate.getDate()).padStart(2, '0');
            this.onSelect(`${year}-${month}-${day}`);
        }
        this.hide();
    },
    
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        document.getElementById('currentMonthLabel').textContent = `${year}年${month + 1}月`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        
        const today = new Date();
        const todayStr = this.formatDate(today);
        const selectedStr = this.formatDate(this.selectedDate);
        
        let html = '';
        
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            html += `<div class="picker-day other-month">${day}</div>`;
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.formatDate(date);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedStr;
            
            let classes = 'picker-day';
            if (isToday) classes += ' today';
            if (isSelected) classes += ' selected';
            
            html += `<div class="${classes}" data-date="${dateStr}">${day}</div>`;
        }
        
        const totalCells = startDay + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7;
        
        for (let i = 1; i <= remainingCells; i++) {
            html += `<div class="picker-day other-month">${i}</div>`;
        }
        
        document.getElementById('datePickerDays').innerHTML = html;
        
        document.querySelectorAll('.picker-day:not(.other-month)').forEach(day => {
            day.addEventListener('click', () => {
                this.selectedDate = new Date(day.dataset.date + 'T00:00:00');
                this.highlightSelectedDate();
                document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));
            });
        });
    },
    
    navigateMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    },
    
    highlightSelectedDate() {
        document.querySelectorAll('.picker-day').forEach(day => {
            day.classList.remove('selected');
            if (day.dataset.date === this.formatDate(this.selectedDate)) {
                day.classList.add('selected');
            }
        });
    },
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};
