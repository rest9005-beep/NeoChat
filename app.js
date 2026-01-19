// Основное приложение мессенджера

class NeoChatApp {
    constructor() {
        this.currentChat = null;
        this.chats = new Map();
        this.groups = new Map();
        this.contacts = new Set();
        this.messages = new Map();
        this.searchResults = [];
        this.searchFilter = 'all';
        this.chatFilter = 'all';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupWebSocket();
        this.updateUI();
        this.startBackgroundTasks();
    }

    loadData() {
        // Загружаем чаты
        const savedChats = localStorage.getItem('neochat_chats');
        if (savedChats) {
            const chatsArray = JSON.parse(savedChats);
            chatsArray.forEach(chat => {
                this.chats.set(chat.id, chat);
            });
        }

        // Загружаем группы
        const savedGroups = localStorage.getItem('neochat_groups');
        if (savedGroups) {
            const groupsArray = JSON.parse(savedGroups);
            groupsArray.forEach(group => {
                this.groups.set(group.id, group);
            });
        }

        // Загружаем контакты
        const savedContacts = localStorage.getItem('neochat_contacts');
        if (savedContacts) {
            this.contacts = new Set(JSON.parse(savedContacts));
        }

        // Загружаем сообщения
        const savedMessages = localStorage.getItem('neochat_messages');
        if (savedMessages) {
            const messagesObj = JSON.parse(savedMessages);
            Object.entries(messagesObj).forEach(([chatId, messages]) => {
                this.messages.set(chatId, messages);
            });
        }
    }

    saveData() {
        // Сохраняем чаты
        const chatsArray = Array.from(this.chats.values());
        localStorage.setItem('neochat_chats', JSON.stringify(chatsArray));

        // Сохраняем группы
        const groupsArray = Array.from(this.groups.values());
        localStorage.setItem('neochat_groups', JSON.stringify(groupsArray));

        // Сохраняем контакты
        localStorage.setItem('neochat_contacts', JSON.stringify(Array.from(this.contacts)));

        // Сохраняем сообщения
        const messagesObj = {};
        this.messages.forEach((messages, chatId) => {
            messagesObj[chatId] = messages;
        });
        localStorage.setItem('neochat_messages', JSON.stringify(messagesObj));
    }

    setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage(item.dataset.page);
            });
        });

        // Поиск пользователей
        const searchInput = document.getElementById('globalSearch');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Фильтры поиска
        document.querySelectorAll('.search-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.searchFilter = e.target.dataset.filter;
                this.updateSearchFilterButtons();
                this.handleSearch(searchInput.value);
            });
        });

        // Новый чат
        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.showPage('search');
            document.getElementById('globalSearch').focus();
        });

        // Отправка сообщения
        document.getElementById('sendButton').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
            this.autoResizeTextarea(e.target);
        });

        // Назад в чате
        document.getElementById('backButton').addEventListener('click', () => this.closeChat());

        // Фильтры чатов
        document.querySelectorAll('.chat-filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.chatFilter = e.target.dataset.filter;
                this.updateChatFilterButtons();
                this.renderChats();
            });
        });

        // Прочитать все сообщения
        document.getElementById('markAllReadBtn')?.addEventListener('click', () => this.markAllAsRead());

        // Настройки
        document.querySelectorAll('.settings-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.openSettings(action);
            });
        });

        // Прикрепление файлов
        document.getElementById('attachButton').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));

        // Изменение аватара
        document.getElementById('changeAvatarBtn')?.addEventListener('click', () => {
            document.getElementById('avatarInput').click();
        });

        document.getElementById('avatarInput').addEventListener('change', (e) => this.handleAvatarUpload(e));

        // Редактирование профиля
        document.querySelectorAll('.info-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.currentTarget.dataset.field;
                this.editProfileField(field);
            });
        });

        // Меню пользователя
        document.querySelector('.user-menu-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('userMenu').classList.toggle('show');
        });

        document.addEventListener('click', () => {
            document.getElementById('userMenu').classList.remove('show');
        });

        // Обработка выбора пользователя в результатах поиска
        document.addEventListener('click', (e) => {
            const startChatBtn = e.target.closest('.start-chat-btn');
            if (startChatBtn) {
                const userId = startChatBtn.dataset.userId;
                this.startChat(userId);
            }
        });
    }

    setupWebSocket() {
        // В реальном приложении здесь будет подключение к WebSocket серверу
        console.log('WebSocket инициализирован (демо)');
        
        // Демо: симулируем получение сообщений
        setInterval(() => {
            if (Math.random() > 0.8 && this.chats.size > 0) {
                this.simulateIncomingMessage();
            }
        }, 10000);
    }

    startBackgroundTasks() {
        // Обновление статусов онлайн
        setInterval(() => {
            this.updateOnlineStatuses();
        }, 30000);

        // Проверка новых сообщений
        setInterval(() => {
            this.checkNewMessages();
        }, 5000);
    }

    showPage(page) {
        // Скрываем все страницы
        document.querySelectorAll('.main-content > div').forEach(div => {
            if (div.id.endsWith('Page')) {
                div.classList.add('hidden');
            }
        });

        // Обновляем активную навигацию
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Показываем выбранную страницу
        document.getElementById(`${page}Page`).classList.remove('hidden');

        // Обновляем контент страницы
        switch(page) {
            case 'chats':
                this.renderChats();
                break;
            case 'search':
                this.renderSearchPage();
                break;
            case 'contacts':
                this.renderContacts();
                break;
            case 'groups':
                this.renderGroups();
                break;
            case 'profile':
                this.updateProfileStats();
                break;
        }
    }

    handleSearch(query) {
        const searchResults = document.getElementById('searchResults');
        
        if (query.trim().length < 2) {
            searchResults.classList.remove('active');
            this.searchResults = [];
            return;
        }

        // Показываем индикатор загрузки
        const searchLoading = document.getElementById('searchLoading');
        if (searchLoading) searchLoading.classList.remove('hidden');

        // Ищем пользователей
        setTimeout(() => {
            this.searchResults = authManager.searchUsers(query, this.searchFilter);
            
            if (searchLoading) searchLoading.classList.add('hidden');
            this.renderSearchResults();
            
            // Обновляем результаты на странице поиска
            if (!document.getElementById('searchPage').classList.contains('hidden')) {
                this.renderSearchPage();
            }
        }, 500);
    }

    renderSearchResults() {
        const container = document.getElementById('searchResults');
        
        if (this.searchResults.length === 0) {
            container.innerHTML = `
                <div class="search-result-item">
                    <div class="result-info">
                        <div class="result-name">Пользователи не найдены</div>
                        <div class="result-details">Попробуйте другой запрос</div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = this.searchResults.map(user => `
                <div class="search-result-item">
                    <div class="result-avatar ${user.isOnline ? 'online' : ''}">
                        ${user.avatarLetters}
                    </div>
                    <div class="result-info">
                        <div class="result-name">${user.displayName}</div>
                        <div class="result-username">@${user.username}</div>
                        <div class="result-details">${user.country} • ${user.isOnline ? 'В сети' : 'Не в сети'}</div>
                    </div>
                    <button class="result-action start-chat-btn" data-user-id="${user.username}">
                        ${user.isContact ? 'Написать' : 'Начать чат'}
                    </button>
                </div>
            `).join('');
        }
        
        container.classList.add('active');
    }

    renderSearchPage() {
        const container = document.getElementById('searchResultsPage');
        const sortBy = document.getElementById('searchSort')?.value || 'relevance';
        
        let sortedResults = [...this.searchResults];
        
        // Сортируем результаты
        switch(sortBy) {
            case 'online':
                sortedResults.sort((a, b) => b.isOnline - a.isOnline);
                break;
            case 'new':
                sortedResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'name':
                sortedResults.sort((a, b) => a.displayName.localeCompare(b.displayName));
                break;
        }
        
        if (sortedResults.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>Найдите людей</h3>
                    <p>Введите имя пользователя в поисковой строке</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="chats-list">
                    ${sortedResults.map(user => `
                        <div class="chat-item" data-user-id="${user.username}">
                            <div class="chat-header">
                                <div class="chat-user">
                                    <div class="chat-avatar ${user.isOnline ? 'online' : ''}">
                                        ${user.avatarLetters}
                                    </div>
                                    <div class="chat-info">
                                        <div class="chat-name">${user.displayName}</div>
                                        <div class="chat-last-message">@${user.username} • ${user.country}</div>
                                    </div>
                                </div>
                                <div class="chat-meta">
                                    <button class="result-action start-chat-btn" data-user-id="${user.username}">
                                        ${user.isContact ? 'Написать' : 'Начать чат'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    updateSearchFilterButtons() {
        document.querySelectorAll('.search-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${this.searchFilter}"]`).classList.add('active');
    }

    updateChatFilterButtons() {
        document.querySelectorAll('.chat-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${this.chatFilter}"]`).classList.add('active');
    }

    startChat(username) {
        const user = authManager.getUserByUsername(username);
        if (!user) return;

        // Проверяем, есть ли уже чат с этим пользователем
        let chat = Array.from(this.chats.values()).find(c => 
            c.type === 'private' && c.participants.includes(username)
        );

        if (!chat) {
            // Создаем новый чат
            chat = {
                id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'private',
                participants: [authManager.currentUser.username, username],
                title: user.displayName,
                avatarLetters: user.avatarLetters,
                lastMessage: 'Чат начат',
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                unreadCount: 0,
                isPinned: false,
                createdAt: new Date().toISOString()
            };

            this.chats.set(chat.id, chat);
            this.saveData();

            // Добавляем в контакты, если еще не добавлен
            if (!this.contacts.has(username)) {
                this.contacts.add(username);
                this.saveData();
                user.isContact = true;
                authManager.saveUsers();
            }

            // Создаем пустой список сообщений для этого чата
            this.messages.set(chat.id, []);
        }

        // Открываем чат
        this.openChat(chat);

        // Скрываем результаты поиска
        document.getElementById('searchResults').classList.remove('active');

        // Очищаем поле поиска
        document.getElementById('globalSearch').value = '';

        // Переходим на страницу чатов
        this.showPage('chats');
    }

    openChat(chat) {
        this.currentChat = chat;
        
        // Обновляем заголовок чата
        document.getElementById('currentChatName').textContent = chat.title;
        document.getElementById('currentChatAvatar').textContent = chat.avatarLetters;
        
        // Обновляем статус (для приватных чатов)
        if (chat.type === 'private') {
            const username = chat.participants.find(p => p !== authManager.currentUser.username);
            const user = authManager.getUserByUsername(username);
            if (user) {
                document.getElementById('currentChatStatus').textContent = 
                    user.isOnline ? 'В сети' : 'Не в сети';
            }
        }

        // Загружаем сообщения
        this.loadMessages(chat.id);

        // Показываем окно чата
        document.getElementById('chatsPage').classList.add('hidden');
        document.getElementById('chatWindow').classList.remove('hidden');

        // Помечаем как прочитанные
        if (chat.unreadCount > 0) {
            chat.unreadCount = 0;
            this.saveData();
            this.renderChats();
            this.updateUnreadCount();
        }
    }

    closeChat() {
        this.currentChat = null;
        document.getElementById('chatWindow').classList.add('hidden');
        document.getElementById('chatsPage').classList.remove('hidden');
    }

    loadMessages(chatId) {
        const container = document.getElementById('messagesContainer');
        const messages = this.messages.get(chatId) || [];

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 20px;">
                    <i class="fas fa-comments"></i>
                    <h3>Нет сообщений</h3>
                    <p>Начните общение!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(msg => {
            const isOutgoing = msg.sender === authManager.currentUser.username;
            const sender = isOutgoing ? authManager.currentUser : 
                          authManager.getUserByUsername(msg.sender);
            
            return `
                <div class="message ${isOutgoing ? 'outgoing' : 'incoming'}">
                    <div class="message-content">
                        ${!isOutgoing ? `<div class="message-sender">${sender?.displayName || msg.sender}</div>` : ''}
                        <div class="message-text">${this.formatMessage(msg.text)}</div>
                        <div class="message-time">
                            ${msg.time}
                            ${isOutgoing ? `<span class="message-status">${msg.status || '✓'}</span>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Прокручиваем к последнему сообщению
        container.scrollTop = container.scrollHeight;
    }

    formatMessage(text) {
        // Простая обработка текста (ссылки, эмодзи и т.д.)
        return text
            .replace(/\n/g, '<br>')
            .replace(/@(\w+)/g, '<span class="mention">@$1</span>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const text = input.value.trim();
        
        if (!text || !this.currentChat) return;

        // Создаем сообщение
        const message = {
            id: `msg_${Date.now()}`,
            chatId: this.currentChat.id,
            sender: authManager.currentUser.username,
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        // Добавляем сообщение
        const chatMessages = this.messages.get(this.currentChat.id) || [];
        chatMessages.push(message);
        this.messages.set(this.currentChat.id, chatMessages);

        // Обновляем информацию о чате
        this.currentChat.lastMessage = text.length > 30 ? text.substring(0, 30) + '...' : text;
        this.currentChat.lastMessageTime = message.time;
        
        // Сохраняем
        this.saveData();

        // Обновляем интерфейс
        this.loadMessages(this.currentChat.id);
        this.renderChats();

        // Очищаем поле ввода
        input.value = '';
        input.style.height = 'auto';

        // В реальном приложении здесь будет отправка на сервер
        console.log('Сообщение отправлено:', message);

        // Симулируем получение ответа
        if (this.currentChat.type === 'private') {
            setTimeout(() => this.simulateReply(), 1000 + Math.random() * 2000);
        }
    }

    simulateReply() {
        if (!this.currentChat || this.currentChat.type !== 'private') return;

        const username = this.currentChat.participants.find(p => p !== authManager.currentUser.username);
        const user = authManager.getUserByUsername(username);
        if (!user) return;

        const replies = [
            'Привет! Как дела?',
            'Очень интересно!',
            'Согласен с тобой',
            'Спасибо за информацию!',
            'Давай обсудим это подробнее',
            'Отличная новость!',
            'Что думаешь об этом?',
            'Жду твоего ответа'
        ];

        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const message = {
            id: `msg_${Date.now()}`,
            chatId: this.currentChat.id,
            sender: username,
            text: randomReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString(),
            status: 'delivered'
        };

        const chatMessages = this.messages.get(this.currentChat.id) || [];
        chatMessages.push(message);
        this.messages.set(this.currentChat.id, chatMessages);

        this.currentChat.lastMessage = randomReply.length > 30 ? randomReply.substring(0, 30) + '...' : randomReply;
        this.currentChat.lastMessageTime = message.time;
        this.currentChat.unreadCount++;

        this.saveData();
        this.loadMessages(this.currentChat.id);
        this.renderChats();
        this.updateUnreadCount();

        this.showNotification(`Новое сообщение от ${user.displayName}`);
    }

    simulateIncomingMessage() {
        const chatsArray = Array.from(this.chats.values());
        if (chatsArray.length === 0) return;

        const randomChat = chatsArray[Math.floor(Math.random() * chatsArray.length)];
        if (randomChat.type !== 'private') return;

        const username = randomChat.participants.find(p => p !== authManager.currentUser.username);
        const user = authManager.getUserByUsername(username);
        if (!user) return;

        const messages = [
            'Привет!',
            'Ты здесь?',
            'Посмотри на это',
            'У меня есть вопрос',
            'Как ты?'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        const newMessage = {
            id: `msg_${Date.now()}`,
            chatId: randomChat.id,
            sender: username,
            text: randomMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().toISOString(),
            status: 'delivered'
        };

        const chatMessages = this.messages.get(randomChat.id) || [];
        chatMessages.push(newMessage);
        this.messages.set(randomChat.id, chatMessages);

        randomChat.lastMessage = randomMessage.length > 30 ? randomMessage.substring(0, 30) + '...' : randomMessage;
        randomChat.lastMessageTime = newMessage.time;
        randomChat.unreadCount++;

        this.saveData();

        // Обновляем UI если открыт список чатов
        if (!document.getElementById('chatsPage').classList.contains('hidden')) {
            this.renderChats();
            this.updateUnreadCount();
        }

        // Показываем уведомление если чат не активен
        if (!this.currentChat || this.currentChat.id !== randomChat.id) {
            this.showNotification(`Новое сообщение от ${user.displayName}: ${randomMessage}`);
        }
    }

    renderChats() {
        const container = document.getElementById('chatsList');
        const emptyState = document.getElementById('emptyChatsState');
        
        let chatsArray = Array.from(this.chats.values());
        
        // Применяем фильтры
        switch(this.chatFilter) {
            case 'unread':
                chatsArray = chatsArray.filter(chat => chat.unreadCount > 0);
                break;
            case 'pinned':
                chatsArray = chatsArray.filter(chat => chat.isPinned);
                break;
            case 'groups':
                chatsArray = chatsArray.filter(chat => chat.type === 'group');
                break;
        }
        
        if (chatsArray.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // Сортируем чаты
        chatsArray.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.lastMessageTime || b.createdAt) - new Date(a.lastMessageTime || a.createdAt);
        });
        
        container.innerHTML = chatsArray.map(chat => {
            let title = chat.title;
            let avatarLetters = chat.avatarLetters;
            let status = '';
            
            if (chat.type === 'private') {
                const username = chat.participants.find(p => p !== authManager.currentUser.username);
                const user = authManager.getUserByUsername(username);
                if (user) {
                    title = user.displayName;
                    avatarLetters = user.avatarLetters;
                    status = user.isOnline ? 'online' : '';
                }
            }
            
            return `
                <div class="chat-item" data-chat-id="${chat.id}">
                    <div class="chat-header">
                        <div class="chat-user">
                            <div class="chat-avatar ${status}">
                                ${avatarLetters}
                            </div>
                            <div class="chat-info">
                                <div class="chat-name">${title}</div>
                                <div class="chat-last-message">${chat.lastMessage || 'Нет сообщений'}</div>
                            </div>
                        </div>
                        <div class="chat-meta">
                            <div class="chat-time">${chat.lastMessageTime || ''}</div>
                            ${chat.unreadCount > 0 ? `<div class="unread-count">${chat.unreadCount}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Добавляем обработчики
        container.querySelectorAll('.chat-item').forEach(item => {
            item.addEventListener('click', () => {
                const chatId = item.dataset.chatId;
                const chat = this.chats.get(chatId);
                if (chat) {
                    this.openChat(chat);
                }
            });
        });
    }

    renderContacts() {
        const container = document.getElementById('contactsList');
        const emptyState = document.getElementById('emptyContactsState');
        
        const contactsArray = Array.from(this.contacts)
            .map(username => authManager.getUserByUsername(username))
            .filter(user => user);
        
        if (contactsArray.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        container.innerHTML = contactsArray.map(user => `
            <div class="chat-item" data-user-id="${user.username}">
                <div class="chat-header">
                    <div class="chat-user">
                        <div class="chat-avatar ${user.isOnline ? 'online' : ''}">
                            ${user.avatarLetters}
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">${user.displayName}</div>
                            <div class="chat-last-message">@${user.username} • ${user.country}</div>
                        </div>
                    </div>
                    <div class="chat-meta">
                        <button class="result-action start-chat-btn" data-user-id="${user.username}">
                            Написать
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderGroups() {
        const container = document.getElementById('groupsList');
        const emptyState = document.getElementById('emptyGroupsState');
        
        const groupsArray = Array.from(this.groups.values());
        
        if (groupsArray.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        container.innerHTML = groupsArray.map(group => `
            <div class="chat-item" data-group-id="${group.id}">
                <div class="chat-header">
                    <div class="chat-user">
                        <div class="chat-avatar">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">${group.name}</div>
                            <div class="chat-last-message">${group.participants.length} участников</div>
                        </div>
                    </div>
                    <div class="chat-meta">
                        <div class="chat-time">${group.lastActivity || ''}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateProfileStats() {
        document.getElementById('activeChatsCount').textContent = this.chats.size;
        document.getElementById('contactsCountProfile').textContent = this.contacts.size;
        document.getElementById('groupsCount').textContent = this.groups.size;
    }

    updateUnreadCount() {
        let totalUnread = 0;
        this.chats.forEach(chat => {
            totalUnread += chat.unreadCount || 0;
        });
        
        document.getElementById('unreadTotal').textContent = totalUnread > 0 ? totalUnread : '';
        document.getElementById('contactsCount').textContent = this.contacts.size > 0 ? this.contacts.size : '';
    }

    markAllAsRead() {
        this.chats.forEach(chat => {
            chat.unreadCount = 0;
        });
        
        this.saveData();
        this.renderChats();
        this.updateUnreadCount();
        this.showNotification('Все сообщения прочитаны', 'success');
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // В демо просто показываем уведомление
        this.showNotification(`Файл "${file.name}" выбран для отправки`, 'info');
        
        // Очищаем input
        event.target.value = '';
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // В демо просто обновляем аватар буквами
        if (authManager.currentUser) {
            // Можно добавить реальную загрузку изображения
            this.showNotification('Аватар обновлен', 'success');
        }
        
        event.target.value = '';
    }

    editProfileField(field) {
        const currentValue = authManager.currentUser[field] || '';
        const newValue = prompt(`Введите новое значение для ${field}:`, currentValue);
        
        if (newValue !== null && newValue.trim() !== '') {
            const updates = { [field]: newValue.trim() };
            
            if (field === 'displayName') {
                updates.avatarLetters = authManager.getAvatarLetters(newValue.trim());
            }
            
            authManager.updateUser(authManager.currentUser.username, updates);
            this.showNotification('Профиль обновлен', 'success');
        }
    }

    openSettings(action) {
        // Открываем модальное окно настроек с нужной вкладкой
        document.getElementById('settingsModal').classList.remove('hidden');
        
        // Переключаем на нужную вкладку
        const tab = document.querySelector(`[data-tab="${action}"]`);
        if (tab) {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.settings-pane').forEach(p => p.classList.remove('active'));
            document.getElementById(`${action}Pane`).classList.add('active');
        }
    }

    updateOnlineStatuses() {
        // В демо случайным образом обновляем статусы пользователей
        authManager.users.forEach(user => {
            if (user.username !== authManager.currentUser?.username) {
                if (Math.random() > 0.7) {
                    user.isOnline = !user.isOnline;
                    user.lastSeen = user.isOnline ? null : new Date().toISOString();
                }
            }
        });
        
        authManager.saveUsers();
        
        // Обновляем UI если нужно
        if (!document.getElementById('chatsPage').classList.contains('hidden')) {
            this.renderChats();
        }
        if (!document.getElementById('contactsPage').classList.contains('hidden')) {
            this.renderContacts();
        }
    }

    checkNewMessages() {
        // В реальном приложении здесь будет проверка новых сообщений с сервера
        // Для демо просто обновляем счетчики
        this.updateUnreadCount();
    }

    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    updateUI() {
        this.updateUnreadCount();
        this.renderChats();
        this.renderContacts();
        this.updateProfileStats();
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
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.neochatApp = new NeoChatApp();
});