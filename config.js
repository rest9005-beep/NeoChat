// Модуль настроек приложения

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('neochat_app_settings');
        if (savedSettings) {
            return JSON.parse(savedSettings);
        }

        // Настройки по умолчанию
        return {
            theme: 'dark',
            fontSize: 'medium',
            borderRadius: 12,
            animations: true,
            onlineStatus: true,
            lastSeen: true,
            messageNotifications: true,
            sound: true,
            notificationType: 'all',
            preview: true,
            saveHistory: true,
            autoDeleteMessages: 'never',
            sync: true,
            whoCanMessage: 'everyone',
            forwarding: true
        };
    }

    saveSettings() {
        localStorage.setItem('neochat_app_settings', JSON.stringify(this.settings));
        this.applySettings();
    }

    setupEventListeners() {
        // Закрытие модального окна настроек
        document.getElementById('closeSettingsModal')?.addEventListener('click', () => {
            document.getElementById('settingsModal').classList.add('hidden');
        });

        // Переключение вкладок настроек
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchSettingsTab(tabName);
            });
        });

        // Выбор темы
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.selectTheme(theme);
            });
        });

        // Выбор размера шрифта
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = e.currentTarget.dataset.size;
                this.selectFontSize(size);
            });
        });

        // Слайдер скругления углов
        const borderRadiusSlider = document.getElementById('borderRadiusSlider');
        if (borderRadiusSlider) {
            borderRadiusSlider.addEventListener('input', (e) => {
                this.setBorderRadius(e.target.value);
            });
        }

        // Переключатели
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const setting = e.target.id.replace('Toggle', '').replace('Checkbox', '');
                this.toggleSetting(setting, e.target.checked);
            });
        });

        // Радио кнопки
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const setting = e.target.name;
                const value = e.target.value;
                this.setRadioSetting(setting, value);
            });
        });

        // Селекты
        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
                const setting = e.target.id;
                const value = e.target.value;
                this.setSelectSetting(setting, value);
            });
        });

        // Кнопка сброса настроек
        document.getElementById('resetSettingsBtn')?.addEventListener('click', () => {
            this.resetSettings();
        });

        // Кнопка сохранения настроек
        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            this.saveSettings();
            document.getElementById('settingsModal').classList.add('hidden');
            neochatApp.showNotification('Настройки сохранены', 'success');
        });

        // Очистка истории
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите очистить всю историю чатов? Это действие нельзя отменить.')) {
                this.clearHistory();
            }
        });

        // Показ скрытых чатов
        document.getElementById('showHiddenChatsBtn')?.addEventListener('click', () => {
            neochatApp.showNotification('Скрытые чаты не поддерживаются в демо-версии', 'info');
        });

        // Быстрые настройки из главного меню
        document.querySelectorAll('[data-action="theme"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSettings('appearance');
            });
        });
    }

    switchSettingsTab(tabName) {
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.settings-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(`${tabName}Pane`).classList.add('active');
    }

    selectTheme(theme) {
        this.settings.theme = theme;
        
        // Обновляем UI
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');
    }

    selectFontSize(size) {
        this.settings.fontSize = size;
        
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-size="${size}"]`).classList.add('active');
    }

    setBorderRadius(value) {
        this.settings.borderRadius = parseInt(value);
        document.getElementById('borderRadiusValue').textContent = `${value}px`;
    }

    toggleSetting(setting, value) {
        this.settings[setting] = value;
    }

    setRadioSetting(setting, value) {
        this.settings[setting] = value;
    }

    setSelectSetting(setting, value) {
        this.settings[setting] = value;
    }

    applySettings() {
        // Применяем тему
        document.documentElement.className = '';
        document.documentElement.classList.add(`theme-${this.settings.theme}`);

        // Применяем размер шрифта
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        document.documentElement.style.setProperty('--font-size-base', fontSizeMap[this.settings.fontSize] || '16px');

        // Применяем скругление углов
        document.documentElement.style.setProperty('--border-radius', `${this.settings.borderRadius}px`);
        document.documentElement.style.setProperty('--border-radius-sm', `${this.settings.borderRadius * 0.66}px`);
        document.documentElement.style.setProperty('--border-radius-lg', `${this.settings.borderRadius * 1.33}px`);

        // Применяем анимации
        if (!this.settings.animations) {
            document.documentElement.style.setProperty('--transition-fast', '0s');
            document.documentElement.style.setProperty('--transition-normal', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');
        } else {
            document.documentElement.style.setProperty('--transition-fast', '0.15s ease');
            document.documentElement.style.setProperty('--transition-normal', '0.3s cubic-bezier(0.4, 0, 0.2, 1)');
            document.documentElement.style.setProperty('--transition-slow', '0.5s ease');
        }

        // Обновляем значения в UI
        this.updateSettingsUI();
    }

    updateSettingsUI() {
        // Обновляем выбранную тему
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });
        const themeOption = document.querySelector(`[data-theme="${this.settings.theme}"]`);
        if (themeOption) themeOption.classList.add('active');

        // Обновляем размер шрифта
        document.querySelectorAll('.font-size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const fontSizeBtn = document.querySelector(`[data-size="${this.settings.fontSize}"]`);
        if (fontSizeBtn) fontSizeBtn.classList.add('active');

        // Обновляем слайдер скругления
        const borderRadiusSlider = document.getElementById('borderRadiusSlider');
        if (borderRadiusSlider) {
            borderRadiusSlider.value = this.settings.borderRadius;
            document.getElementById('borderRadiusValue').textContent = `${this.settings.borderRadius}px`;
        }

        // Обновляем переключатели
        document.getElementById('animationsToggle').checked = this.settings.animations;
        document.getElementById('onlineStatusToggle').checked = this.settings.onlineStatus;
        document.getElementById('lastSeenToggle').checked = this.settings.lastSeen;
        document.getElementById('messageNotificationsToggle').checked = this.settings.messageNotifications;
        document.getElementById('soundToggle').checked = this.settings.sound;
        document.getElementById('previewToggle').checked = this.settings.preview;
        document.getElementById('saveHistoryToggle').checked = this.settings.saveHistory;
        document.getElementById('syncToggle').checked = this.settings.sync;
        document.getElementById('forwardingToggle').checked = this.settings.forwarding;

        // Обновляем радио кнопки
        document.querySelector(`input[name="whoCanMessage"][value="${this.settings.whoCanMessage}"]`).checked = true;

        // Обновляем селекты
        document.getElementById('notificationType').value = this.settings.notificationType;
        document.getElementById('autoDeleteMessages').value = this.settings.autoDeleteMessages;
    }

    resetSettings() {
        if (confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
            this.settings = {
                theme: 'dark',
                fontSize: 'medium',
                borderRadius: 12,
                animations: true,
                onlineStatus: true,
                lastSeen: true,
                messageNotifications: true,
                sound: true,
                notificationType: 'all',
                preview: true,
                saveHistory: true,
                autoDeleteMessages: 'never',
                sync: true,
                whoCanMessage: 'everyone',
                forwarding: true
            };
            
            this.updateSettingsUI();
            this.applySettings();
            neochatApp.showNotification('Настройки сброшены', 'success');
        }
    }

    clearHistory() {
        // Очищаем чаты
        neochatApp.chats.clear();
        neochatApp.messages.clear();
        neochatApp.saveData();
        
        // Обновляем UI
        neochatApp.renderChats();
        neochatApp.updateUnreadCount();
        
        neochatApp.showNotification('История чатов очищена', 'success');
    }

    openSettings(tab = 'appearance') {
        document.getElementById('settingsModal').classList.remove('hidden');
        this.switchSettingsTab(tab);
        this.updateSettingsUI();
    }
}

// Инициализация менеджера настроек
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});