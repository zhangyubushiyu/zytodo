const MobileNav = {
    currentView: 'calendar',
    
    init() {
        this.checkDevice();
        this.bindEvents();
        this.handleResize();
        
        window.addEventListener('resize', () => this.handleResize());
    },
    
    checkDevice() {
        const isMobile = window.innerWidth <= 768;
        const mobileNav = document.getElementById('mobileNav');
        
        if (mobileNav) {
            mobileNav.style.display = isMobile ? 'flex' : 'none';
        }
        
        if (isMobile) {
            this.showCalendarView();
        }
    },
    
    handleResize() {
        this.checkDevice();
    },
    
    bindEvents() {
        const calendarBtn = document.getElementById('mobileNavCalendar');
        const todoBtn = document.getElementById('mobileNavTodo');
        const addBtn = document.getElementById('mobileNavAdd');
        const manageBtn = document.getElementById('mobileNavManage');
        
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => this.showCalendarView());
        }
        
        if (todoBtn) {
            todoBtn.addEventListener('click', () => this.showTodoView());
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddView());
        }
        
        if (manageBtn) {
            manageBtn.addEventListener('click', () => this.showManageView());
        }
    },
    
    setActiveBtn(activeId) {
        const buttons = document.querySelectorAll('.mobile-nav-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const activeBtn = document.getElementById(activeId);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    },
    
    showCalendarView() {
        this.currentView = 'calendar';
        this.setActiveBtn('mobileNavCalendar');
        
        const calendarSection = document.getElementById('calendarSection');
        const todoSection = document.getElementById('todoSection');
        const quickAddSection = document.querySelector('.quick-add-section');
        const manageSection = document.querySelector('.manage-section');
        
        if (calendarSection) calendarSection.classList.remove('hidden');
        if (todoSection) todoSection.classList.remove('hidden');
        if (quickAddSection) quickAddSection.style.display = 'none';
        if (manageSection) manageSection.style.display = 'none';
        
        if (window.innerWidth <= 768) {
            if (calendarSection) {
                calendarSection.style.flex = '0 0 auto';
                calendarSection.style.minHeight = '40vh';
            }
            if (todoSection) {
                todoSection.style.flex = '1';
            }
        }
    },
    
    showTodoView() {
        this.currentView = 'todo';
        this.setActiveBtn('mobileNavTodo');
        
        const calendarSection = document.getElementById('calendarSection');
        const todoSection = document.getElementById('todoSection');
        const quickAddSection = document.querySelector('.quick-add-section');
        const manageSection = document.querySelector('.manage-section');
        
        if (calendarSection) calendarSection.classList.add('hidden');
        if (todoSection) todoSection.classList.remove('hidden');
        if (quickAddSection) quickAddSection.style.display = 'none';
        if (manageSection) manageSection.style.display = 'none';
    },
    
    showAddView() {
        this.currentView = 'add';
        this.setActiveBtn('mobileNavAdd');
        
        const calendarSection = document.getElementById('calendarSection');
        const todoSection = document.getElementById('todoSection');
        const quickAddSection = document.querySelector('.quick-add-section');
        const manageSection = document.querySelector('.manage-section');
        
        if (calendarSection) calendarSection.classList.add('hidden');
        if (todoSection) todoSection.classList.add('hidden');
        if (quickAddSection) quickAddSection.style.display = 'block';
        if (manageSection) manageSection.style.display = 'none';
    },
    
    showManageView() {
        this.currentView = 'manage';
        this.setActiveBtn('mobileNavManage');
        
        const calendarSection = document.getElementById('calendarSection');
        const todoSection = document.getElementById('todoSection');
        const quickAddSection = document.querySelector('.quick-add-section');
        const manageSection = document.querySelector('.manage-section');
        
        if (calendarSection) calendarSection.classList.add('hidden');
        if (todoSection) todoSection.classList.add('hidden');
        if (quickAddSection) quickAddSection.style.display = 'none';
        if (manageSection) manageSection.style.display = 'block';
    }
};
