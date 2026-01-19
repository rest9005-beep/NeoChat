// Модуль авторизации и регистрации

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.users = new Map();
        this.init();
    }

    init() {
        this.loadUsers();
        this.loadCurrentUser();
        this.setupEventListeners();
    }

    loadUsers() {
        const savedUsers = localStorage.getItem('neochat_users');
        if (savedUsers) {
            const usersArray = JSON.parse(savedUsers);
            usersArray.forEach(user => {
                this.users.set(user.username.toLowerCase(), user);
            });
        } else {
            // Создаем демо пользователей только если нет сохраненных
            this.createDemoUsers();
        }
    }

    createDemoUsers() {
        const demoUsers = [
            {
                username: 'admin',
                password: 'admin123',
                displayName: 'Администратор',
                avatarLetters: 'АД',
                country: 'Россия',
                bio: 'Привет! Я администратор NeoChat',
                createdAt: new Date().toISOString(),
                isOnline: true,
                lastSeen: null,
                isVerified: true,
                isContact: false,
                settings: this.getDefaultSettings()
            },
            {
                username: 'alex',
                password: 'alex123',
                displayName: 'Алексей',
                avatarLetters: 'АЛ',
                country: 'США',
                bio: 'Разработчик из Калифорнии',
                createdAt: new Date().toISOString(),
                isOnline: true,
                lastSeen: null,
                isVerified: false,
                isContact: false,
                settings: this.getDefaultSettings()
            },
            {
                username: 'maria',
                password: 'maria123',
                displayName: 'Мария',
                avatarLetters: 'МА',
                country: 'Германия',
                bio: 'Дизайнер из Берлина',
                createdAt: new Date().toISOString(),
                isOnline: false,
                lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                isVerified: true,
                isContact: false,
                settings: this.getDefaultSettings()
            }
        ];

        demoUsers.forEach(user => {
            this.users.set(user.username.toLowerCase(), user);
        });
        
        this.saveUsers();
    }

    loadCurrentUser() {
        const savedUser = localStorage.getItem('neochat_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateOnlineStatus(true);
            document.getElementById('appContainer').classList.remove('hidden');
        } else {
            document.getElementById('authModal').classList.remove('hidden');
        }
    }

    saveUsers() {
        const usersArray = Array.from(this.users.values());
        localStorage.setItem('neochat_users', JSON.stringify(usersArray));
    }

    getDefaultSettings() {
        return {
            theme: 'dark',
            fontSize: 'medium',
            animations: true,
            onlineStatus: true,
            lastSeen: true,
            messageNotifications: true,
            sound: true,
            preview: true,
            saveHistory: true,
            sync: true,
            whoCanMessage: 'everyone'
        };
    }

    setupEventListeners() {
        // Переключение вкладок авторизации
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        // Форма входа
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Форма регистрации
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Закрытие модального окна
        document.getElementById('closeAuthModal').addEventListener('click', () => {
            document.getElementById('authModal').classList.add('hidden');
        });

        // Выход из аккаунта
        document.querySelector('[data-action="logout"]')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
    }

    switchAuthTab(tabName) {
        // Обновляем активные вкладки
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Показываем соответствующую форму
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        document.getElementById(`${tabName}Form`).classList.add('active');
    }

    login() {
        const username = document.getElementById('loginUsername').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showError('Пожалуйста, заполните все поля');
            return;
        }

        const user = this.users.get(username);
        
        if (!user) {
            this.showError('Пользователь не найден');
            return;
        }

        if (user.password !== password) {
            this.showError('Неверный пароль');
            return;
        }

        // Обновляем статус онлайн
        user.isOnline = true;
        user.lastSeen = null;
        this.saveUsers();

        // Сохраняем текущего пользователя
        this.currentUser = user;
        localStorage.setItem('neochat_current_user', JSON.stringify(user));

        // Применяем настройки пользователя
        this.applyUserSettings(user.settings);

        // Закрываем модальное окно и показываем приложение
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');

        // Показываем уведомление
        this.showNotification(`Добро пожаловать, ${user.displayName}!`, 'success');

        // Обновляем UI
        this.updateUI();
    }

    register() {
        const username = document.getElementById('registerUsername').value.trim().toLowerCase();
        const displayName = document.getElementById('registerDisplayName').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const country = document.getElementById('registerCountry').value;
        const agree = document.getElementById('registerAgree').checked;

        // Валидация
        if (!username || !displayName || !password || !confirmPassword || !country) {
            this.showError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        if (!agree) {
            this.showError('Необходимо согласие с правилами использования');
            return;
        }

        if (username.length < 3 || username.length > 20) {
            this.showError('Никнейм должен содержать от 3 до 20 символов');
            return;
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showError('Никнейм может содержать только буквы, цифры и символ _');
            return;
        }

        if (password.length < 6) {
            this.showError('Пароль должен содержать минимум 6 символов');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Пароли не совпадают');
            return;
        }

        // Проверяем, существует ли пользователь
        if (this.users.has(username)) {
            this.showError('Этот никнейм уже занят');
            return;
        }

        // Создаем нового пользователя
        const newUser = {
            username: username,
            password: password,
            displayName: displayName,
            avatarLetters: this.getAvatarLetters(displayName),
            country: country,
            bio: 'Привет! Я новый пользователь NeoChat',
            createdAt: new Date().toISOString(),
            isOnline: true,
            lastSeen: null,
            isVerified: false,
            isContact: false,
            settings: this.getDefaultSettings()
        };

        // Добавляем пользователя
        this.users.set(username, newUser);
        this.saveUsers();

        // Авторизуем пользователя
        this.currentUser = newUser;
        localStorage.setItem('neochat_current_user', JSON.stringify(newUser));

        // Применяем настройки
        this.applyUserSettings(newUser.settings);

        // Закрываем модальное окно и показываем приложение
        document.getElementById('authModal').classList.add('hidden');
        document.getElementById('appContainer').classList.remove('hidden');

        // Показываем уведомление
        this.showNotification(`Аккаунт успешно создан! Добро пожаловать, ${displayName}!`, 'success');

        // Обновляем UI
        this.updateUI();
    }

    logout() {
        if (this.currentUser) {
            // Обновляем статус
            const user = this.users.get(this.currentUser.username.toLowerCase());
            if (user) {
                user.isOnline = false;
                user.lastSeen = new Date().toISOString();
                this.saveUsers();
            }

            // Очищаем текущего пользователя
            localStorage.removeItem('neochat_current_user');
            this.currentUser = null;
        }

        // Показываем окно авторизации
        document.getElementById('appContainer').classList.add('hidden');
        document.getElementById('authModal').classList.remove('hidden');

        // Сбрасываем формы
        document.getElementById('loginForm').reset();
        this.switchAuthTab('login');

        this.showNotification('Вы успешно вышли из аккаунта', 'info');
    }

    updateUI() {
        if (!this.currentUser) return;

        // Обновляем информацию в боковой панели
        document.getElementById('sidebarUsername').textContent = this.currentUser.displayName;
        document.getElementById('userAvatar').textContent = this.currentUser.avatarLetters;
        document.getElementById('sidebarStatus').textContent = 'В сети';

        // Обновляем профиль
        this.updateProfile();
    }

    updateProfile() {
        if (!this.currentUser) return;

        document.getElementById('profileUsername').textContent = this.currentUser.displayName;
        document.getElementById('profileUserId').textContent = `@${this.currentUser.username}`;
        document.getElementById('profileAvatar').textContent = this.currentUser.avatarLetters;
        document.getElementById('profileDisplayName').textContent = this.currentUser.displayName;
        document.getElementById('profileUsernameField').textContent = `@${this.currentUser.username}`;
        document.getElementById('profileCountry').textContent = this.currentUser.country;
        document.getElementById('profileBio').textContent = this.currentUser.bio;

        // Вычисляем возраст аккаунта
        const createdAt = new Date(this.currentUser.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('accountAge').textContent = diffDays;
    }

    updateOnlineStatus(isOnline) {
        if (this.currentUser) {
            const user = this.users.get(this.currentUser.username.toLowerCase());
            if (user) {
                user.isOnline = isOnline;
                user.lastSeen = isOnline ? null : new Date().toISOString();
                this.saveUsers();
            }
        }
    }

    getAvatarLetters(name) {
        if (!name) return '??';
        
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        
        return name.substring(0, 2).toUpperCase();
    }

    applyUserSettings(settings) {
        if (!settings) return;

        // Применяем тему
        document.documentElement.className = '';
        document.documentElement.classList.add(`theme-${settings.theme}`);

        // Применяем размер шрифта
        document.documentElement.style.setProperty('--font-size-base', this.getFontSize(settings.fontSize));

        // Другие настройки будут применяться в app.js
    }

    getFontSize(size) {
        switch(size) {
            case 'small': return '14px';
            case 'large': return '18px';
            default: return '16px';
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        switch(type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            default: return 'info-circle';
        }
    }

    // Методы для работы с пользователями
    searchUsers(query, filter = 'all') {
        const results = [];
        const lowerQuery = query.toLowerCase();
        
        for (const user of this.users.values()) {
            // Пропускаем текущего пользователя
            if (this.currentUser && user.username === this.currentUser.username) {
                continue;
            }
            
            // Проверяем фильтр
            if (filter === 'online' && !user.isOnline) continue;
            if (filter === 'contacts' && !user.isContact) continue;
            
            // Проверяем поисковый запрос
            if (user.username.toLowerCase().includes(lowerQuery) || 
                user.displayName.toLowerCase().includes(lowerQuery) ||
                user.country.toLowerCase().includes(lowerQuery)) {
                results.push(user);
            }
        }
        
        return results;
    }

    getUserByUsername(username) {
        return this.users.get(username.toLowerCase());
    }

    updateUser(username, updates) {
        const user = this.users.get(username.toLowerCase());
        if (user) {
            Object.assign(user, updates);
            this.saveUsers();
            
            // Если обновляем текущего пользователя, обновляем и его
            if (this.currentUser && this.currentUser.username === user.username) {
                Object.assign(this.currentUser, updates);
                localStorage.setItem('neochat_current_user', JSON.stringify(this.currentUser));
                this.updateUI();
            }
            
            return true;
        }
        return false;
    }
}

// Экспортируем глобальный экземпляр
window.authManager = new AuthManager();