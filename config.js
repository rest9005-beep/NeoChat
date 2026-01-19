// Создадим новый файл profile-customization.js или добавим в app.js

class ProfileCustomization {
    constructor() {
        this.customizationData = this.loadCustomization();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applyCustomization();
    }

    setupEventListeners() {
        // Копирование ссылки на профиль
        document.getElementById('copyProfileLinkBtn')?.addEventListener('click', () => {
            this.copyProfileLink();
        });

        // Загрузка аватара
        document.getElementById('uploadAvatarBtn')?.addEventListener('click', () => {
            this.uploadAvatar();
        });

        // Загрузка баннера
        document.getElementById('uploadBannerBtn')?.addEventListener('click', () => {
            this.uploadBanner();
        });

        // Удаление баннера
        document.getElementById('removeBannerBtn')?.addEventListener('click', () => {
            this.removeBanner();
        });

        // Генерация аватара
        document.getElementById('generateAvatarBtn')?.addEventListener('click', () => {
            this.generateAvatar();
        });

        // Выбор цвета
        document.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.currentTarget.dataset.color;
                this.selectColor(color);
            });
        });

        // Выбор своей темы
        document.getElementById('chooseCustomColorBtn')?.addEventListener('click', () => {
            document.getElementById('customColorPicker').click();
        });

        document.getElementById('customColorPicker').addEventListener('change', (e) => {
            this.selectColor(e.target.value);
        });

        // Выбор темы профиля
        document.querySelectorAll('.profile-theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.selectProfileTheme(theme);
            });
        });

        // Сохранение кастомизации
        document.getElementById('saveCustomizationBtn')?.addEventListener('click', () => {
            this.saveCustomization();
        });

        // Сброс кастомизации
        document.getElementById('resetCustomizationBtn')?.addEventListener('click', () => {
            this.resetCustomization();
        });

        // Переключение вкладок профиля
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchProfileTab(tabName);
            });
        });

        // Редактирование профиля
        document.getElementById('editProfileBtn')?.addEventListener('click', () => {
            this.editProfile();
        });
    }

    loadCustomization() {
        const saved = localStorage.getItem('neochat_profile_customization');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            profileColor: '#00ff88',
            profileTheme: 'default',
            banner: null,
            customAvatar: null,
            accentColor: '#00ff88'
        };
    }

    applyCustomization() {
        // Применяем цвет профиля
        if (this.customizationData.profileColor) {
            document.documentElement.style.setProperty('--profile-color', this.customizationData.profileColor);
            
            // Обновляем баннер если он не установлен
            const banner = document.getElementById('profileBanner');
            if (banner && !this.customizationData.banner) {
                banner.style.background = `linear-gradient(135deg, ${this.customizationData.profileColor}, ${this.darkenColor(this.customizationData.profileColor, 20)})`;
            }
        }

        // Применяем тему профиля
        document.body.classList.remove('profile-theme-gradient', 'profile-theme-glass', 'profile-theme-dark');
        if (this.customizationData.profileTheme !== 'default') {
            document.body.classList.add(`profile-theme-${this.customizationData.profileTheme}`);
        }

        // Применяем баннер если есть
        if (this.customizationData.banner) {
            this.applyBanner(this.customizationData.banner);
        }

        // Применяем кастомный аватар если есть
        if (this.customizationData.customAvatar) {
            this.applyCustomAvatar(this.customizationData.customAvatar);
        }
    }

    copyProfileLink() {
        const linkInput = document.getElementById('profileLink');
        linkInput.select();
        linkInput.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(linkInput.value)
            .then(() => {
                neochatApp.showNotification('Ссылка на профиль скопирована!', 'success');
            })
            .catch(err => {
                console.error('Ошибка копирования:', err);
                neochatApp.showNotification('Не удалось скопировать ссылку', 'error');
            });
    }

    uploadAvatar() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 5 * 1024 * 1024) { // 5MB
                neochatApp.showNotification('Файл слишком большой. Максимальный размер: 5MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                this.customizationData.customAvatar = event.target.result;
                this.applyCustomAvatar(event.target.result);
                neochatApp.showNotification('Аватар загружен!', 'success');
            };
            reader.readAsDataURL(file);
        };
        
        input.click();
    }

    uploadBanner() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 10 * 1024 * 1024) { // 10MB
                neochatApp.showNotification('Файл слишком большой. Максимальный размер: 10MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                this.customizationData.banner = event.target.result;
                this.applyBanner(event.target.result);
                neochatApp.showNotification('Баннер загружен!', 'success');
            };
            reader.readAsDataURL(file);
        };
        
        input.click();
    }

    removeBanner() {
        this.customizationData.banner = null;
        const banner = document.getElementById('profileBanner');
        if (banner) {
            banner.style.background = `linear-gradient(135deg, ${this.customizationData.profileColor}, ${this.darkenColor(this.customizationData.profileColor, 20)})`;
            banner.style.backgroundImage = 'none';
        }
        neochatApp.showNotification('Баннер удален', 'info');
    }

    generateAvatar() {
        // Генерируем случайный градиент для аватара
        const colors = [
            '#00ff88', '#5865f2', '#ff5555', '#ffaa00', '#9b59b6',
            '#1abc9c', '#3498db', '#e74c3c', '#2ecc71', '#f1c40f'
        ];
        
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        
        const gradient = `linear-gradient(135deg, ${color1}, ${color2})`;
        
        // Создаем canvas для генерации аватара
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        
        // Рисуем градиентный фон
        const grd = ctx.createLinearGradient(0, 0, 200, 200);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, 200, 200);
        
        // Добавляем инициалы
        const user = authManager.currentUser;
        if (user && user.displayName) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(user.avatarLetters, 100, 100);
        }
        
        // Сохраняем как data URL
        this.customizationData.customAvatar = canvas.toDataURL('image/png');
        this.applyCustomAvatar(this.customizationData.customAvatar);
        
        neochatApp.showNotification('Новый аватар сгенерирован!', 'success');
    }

    applyCustomAvatar(dataUrl) {
        const avatarPreview = document.getElementById('avatarPreview');
        const profileAvatar = document.getElementById('profileAvatar');
        const sidebarAvatar = document.getElementById('userAvatar');
        
        if (avatarPreview) {
            avatarPreview.style.backgroundImage = `url(${dataUrl})`;
            avatarPreview.style.backgroundSize = 'cover';
            avatarPreview.textContent = '';
        }
        
        if (profileAvatar) {
            profileAvatar.style.backgroundImage = `url(${dataUrl})`;
            profileAvatar.style.backgroundSize = 'cover';
            profileAvatar.textContent = '';
        }
        
        if (sidebarAvatar) {
            sidebarAvatar.style.backgroundImage = `url(${dataUrl})`;
            sidebarAvatar.style.backgroundSize = 'cover';
            sidebarAvatar.textContent = '';
        }
    }

    applyBanner(dataUrl) {
        const banner = document.getElementById('profileBanner');
        if (banner) {
            banner.style.backgroundImage = `url(${dataUrl})`;
            banner.style.backgroundSize = 'cover';
            banner.style.backgroundPosition = 'center';
        }
    }

    selectColor(color) {
        this.customizationData.profileColor = color;
        this.customizationData.accentColor = color;
        
        // Обновляем UI
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const selectedOption = document.querySelector(`[data-color="${color}"]`);
        if (selectedOption) {
            selectedOption.classList.add('active');
        } else {
            // Если цвет кастомный, добавляем его в палитру
            this.addCustomColorToPalette(color);
        }
        
        // Применяем цвет
        document.documentElement.style.setProperty('--profile-color', color);
        document.documentElement.style.setProperty('--primary-color', color);
        
        // Обновляем баннер если нет кастомного
        if (!this.customizationData.banner) {
            const banner = document.getElementById('profileBanner');
            if (banner) {
                banner.style.background = `linear-gradient(135deg, ${color}, ${this.darkenColor(color, 20)})`;
            }
        }
    }

    addCustomColorToPalette(color) {
        // Можно добавить логику для добавления кастомного цвета в палитру
        console.log('Кастомный цвет выбран:', color);
    }

    selectProfileTheme(theme) {
        this.customizationData.profileTheme = theme;
        
        document.querySelectorAll('.profile-theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    }

    switchProfileTab(tabName) {
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.profile-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}Pane`).classList.add('active');
    }

    saveCustomization() {
        localStorage.setItem('neochat_profile_customization', JSON.stringify(this.customizationData));
        this.applyCustomization();
        neochatApp.showNotification('Кастомизация профиля сохранена!', 'success');
    }

    resetCustomization() {
        if (confirm('Вы уверены, что хотите сбросить всю кастомизацию профиля?')) {
            this.customizationData = {
                profileColor: '#00ff88',
                profileTheme: 'default',
                banner: null,
                customAvatar: null,
                accentColor: '#00ff88'
            };
            
            this.applyCustomization();
            this.saveCustomization();
            neochatApp.showNotification('Кастомизация сброшена', 'success');
        }
    }

    editProfile() {
        // Переключаем на вкладку информации и открываем редактирование
        this.switchProfileTab('info');
        
        // Можно добавить модальное окно редактирования профиля
        neochatApp.showNotification('Редактирование профиля', 'info');
    }

    darkenColor(color, percent) {
        // Функция для затемнения цвета
        let r = parseInt(color.substring(1, 3), 16);
        let g = parseInt(color.substring(3, 5), 16);
        let b = parseInt(color.substring(5, 7), 16);

        r = Math.floor(r * (100 - percent) / 100);
        g = Math.floor(g * (100 - percent) / 100);
        b = Math.floor(b * (100 - percent) / 100);

        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
}

// Обновим поиск для реального онлайна
class EnhancedSearch {
    constructor() {
        this.onlineUsers = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadOnlineUsers();
        setInterval(() => this.updateOnlineUsers(), 30000); // Обновлять каждые 30 секунд
    }

    setupEventListeners() {
        // Улучшенный поиск
        document.getElementById('findPeopleBtn')?.addEventListener('click', () => {
            this.showEnhancedSearch();
        });

        // Быстрые фильтры в поиске
        document.querySelectorAll('.search-suggestion').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const query = e.target.textContent;
                document.getElementById('globalSearch').value = query;
                neochatApp.handleSearch(query);
            });
        });

        // Сортировка результатов
        document.getElementById('searchSort')?.addEventListener('change', (e) => {
            this.sortSearchResults(e.target.value);
        });
    }

    showEnhancedSearch() {
        // Показываем красивую страницу поиска
        const searchPage = document.getElementById('searchPage');
        const originalContent = searchPage.innerHTML;
        
        searchPage.innerHTML = `
            <div class="find-people-container">
                <div class="find-people-header">
                    <h2>Найдите новых друзей</h2>
                    <p>Общайтесь с людьми со всего мира в реальном времени</p>
                </div>
                
                <div class="find-people-search">
                    <div class="enhanced-search-box">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" class="search-input" id="enhancedSearchInput" placeholder="Поиск по имени, никнейму или стране...">
                    </div>
                    
                    <div class="search-suggestions">
                        <button class="search-suggestion">Онлайн сейчас</button>
                        <button class="search-suggestion">Новые пользователи</button>
                        <button class="search-suggestion">Из вашей страны</button>
                        <button class="search-suggestion">Разработчики</button>
                        <button class="search-suggestion">Дизайнеры</button>
                    </div>
                </div>
                
                <div class="find-people-features">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-bolt"></i>
                        </div>
                        <h3>Мгновенный поиск</h3>
                        <p>Находите пользователей в реальном времени</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-globe"></i>
                        </div>
                        <h3>По всему миру</h3>
                        <p>Общайтесь с людьми из разных стран</p>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-icon">
                            <i class="fas fa-user-check"></i>
                        </div>
                        <h3>Проверенные профили</h3>
                        <p>Только активные и реальные пользователи</p>
                    </div>
                </div>
                
                <div class="online-users-list">
                    <div class="online-users-header">
                        <h3>Сейчас онлайн</h3>
                        <div class="online-count">
                            <i class="fas fa-circle"></i>
                            <span id="onlineCount">0</span> пользователей
                        </div>
                    </div>
                    
                    <div class="online-users-grid" id="onlineUsersGrid">
                        <!-- Онлайн пользователи будут здесь -->
                    </div>
                </div>
            </div>
        `;

        // Добавляем обработчики для новой страницы
        const searchInput = document.getElementById('enhancedSearchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchOnlineUsers(e.target.value);
        });

        // Загружаем онлайн пользователей
        this.loadOnlineUsers();

        // Кнопка назад
        const backBtn = document.createElement('button');
        backBtn.className = 'back-button';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backBtn.addEventListener('click', () => {
            searchPage.innerHTML = originalContent;
            neochatApp.showPage('search');
        });
        
        const sectionHeader = searchPage.querySelector('.section-header');
        if (sectionHeader) {
            sectionHeader.appendChild(backBtn);
        }
    }

    async loadOnlineUsers() {
        try {
            // В реальном приложении здесь будет запрос к API
            // Для демо используем симуляцию
            
            // Получаем всех пользователей и фильтруем онлайн
            const allUsers = Array.from(authManager.users.values());
            this.onlineUsers = allUsers.filter(user => 
                user.isOnline && user.username !== authManager.currentUser?.username
            );
            
            // Добавляем случайное количество "онлайн" пользователей
            const offlineUsers = allUsers.filter(user => 
                !user.isOnline && user.username !== authManager.currentUser?.username
            );
            
            // Для демо добавляем некоторых пользователей в онлайн
            if (Math.random() > 0.5 && offlineUsers.length > 0) {
                const randomUser = offlineUsers[Math.floor(Math.random() * offlineUsers.length)];
                randomUser.isOnline = true;
                randomUser.lastSeen = null;
                this.onlineUsers.push(randomUser);
            }
            
            this.renderOnlineUsers();
            
        } catch (error) {
            console.error('Ошибка загрузки онлайн пользователей:', error);
        }
    }

    renderOnlineUsers() {
        const container = document.getElementById('onlineUsersGrid');
        if (!container) return;

        document.getElementById('onlineCount')?.textContent = this.onlineUsers.length;

        if (this.onlineUsers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-users"></i>
                    <h3>Никого нет онлайн</h3>
                    <p>Будьте первым, кто начнет общение!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.onlineUsers.map(user => `
            <div class="online-user-card">
                <div class="online-user-avatar online">
                    ${user.customAvatar ? 
                        `<img src="${user.customAvatar}" alt="${user.displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : 
                        user.avatarLetters
                    }
                </div>
                <div class="online-user-info">
                    <div class="online-user-name">${user.displayName}</div>
                    <div class="online-user-username">@${user.username}</div>
                    <div class="online-user-country">${user.country}</div>
                </div>
                <button class="btn-primary online-user-action start-chat-btn" data-user-id="${user.username}">
                    <i class="fas fa-comment"></i>
                    Написать
                </button>
            </div>
        `).join('');
    }

    updateOnlineUsers() {
        this.loadOnlineUsers();
        
        // Обновляем счетчик в реальном времени
        const onlineCount = this.onlineUsers.length;
        const onlineBadge = document.querySelector('.online-count');
        if (onlineBadge) {
            onlineBadge.textContent = `${onlineCount} онлайн`;
        }
    }

    searchOnlineUsers(query) {
        if (!query.trim()) {
            this.renderOnlineUsers();
            return;
        }

        const filteredUsers = this.onlineUsers.filter(user => 
            user.displayName.toLowerCase().includes(query.toLowerCase()) ||
            user.username.toLowerCase().includes(query.toLowerCase()) ||
            user.country.toLowerCase().includes(query.toLowerCase())
        );

        const container = document.getElementById('onlineUsersGrid');
        if (!container) return;

        container.innerHTML = filteredUsers.map(user => `
            <div class="online-user-card">
                <div class="online-user-avatar online">
                    ${user.avatarLetters}
                </div>
                <div class="online-user-info">
                    <div class="online-user-name">${user.displayName}</div>
                    <div class="online-user-username">@${user.username}</div>
                    <div class="online-user-country">${user.country}</div>
                </div>
                <button class="btn-primary online-user-action start-chat-btn" data-user-id="${user.username}">
                    <i class="fas fa-comment"></i>
                    Написать
                </button>
            </div>
        `).join('');
    }

    sortSearchResults(sortBy) {
        let sortedResults = [...neochatApp.searchResults];
        
        switch(sortBy) {
            case 'online':
                sortedResults.sort((a, b) => {
                    if (a.isOnline && !b.isOnline) return -1;
                    if (!a.isOnline && b.isOnline) return 1;
                    return 0;
                });
                break;
                
            case 'new':
                sortedResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
                
            case 'name':
                sortedResults.sort((a, b) => a.displayName.localeCompare(b.displayName));
                break;
        }
        
        neochatApp.searchResults = sortedResults;
        neochatApp.renderSearchPage();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем кастомизацию профиля
    window.profileCustomization = new ProfileCustomization();
    
    // Инициализируем улучшенный поиск
    window.enhancedSearch = new EnhancedSearch();
    
    // Обновляем ссылку на профиль
    updateProfileLink();
});

function updateProfileLink() {
    const user = authManager.currentUser;
    if (user) {
        const profileLink = `https://neochat.com/@${user.username}`;
        document.getElementById('profileLink').value = profileLink;
    }
}
