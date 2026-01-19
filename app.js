// В app.js обновим метод handleSearch
handleSearch(query) {
    const searchResults = document.getElementById('searchResults');
    
    if (query.trim().length < 1) {
        searchResults.classList.remove('active');
        this.searchResults = [];
        return;
    }

    // Показываем индикатор загрузки
    const searchLoading = document.getElementById('searchLoading');
    if (searchLoading) searchLoading.classList.remove('hidden');

    // Реальный поиск с учетом онлайн статуса
    setTimeout(() => {
        // Получаем всех пользователей
        const allUsers = Array.from(authManager.users.values());
        
        // Фильтруем по запросу и статусу
        this.searchResults = allUsers.filter(user => {
            // Пропускаем текущего пользователя
            if (authManager.currentUser && user.username === authManager.currentUser.username) {
                return false;
            }
            
            // Применяем фильтр
            if (this.searchFilter === 'online' && !user.isOnline) return false;
            if (this.searchFilter === 'contacts' && !user.isContact) return false;
            
            // Ищем по всем полям
            const searchFields = [
                user.username,
                user.displayName,
                user.country,
                user.bio
            ].map(field => field ? field.toLowerCase() : '');
            
            const lowerQuery = query.toLowerCase();
            return searchFields.some(field => field.includes(lowerQuery));
        });
        
        // Сортируем: онлайн пользователи сначала
        this.searchResults.sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return 0;
        });
        
        if (searchLoading) searchLoading.classList.add('hidden');
        this.renderSearchResults();
        
        // Обновляем результаты на странице поиска
        if (!document.getElementById('searchPage').classList.contains('hidden')) {
            this.renderSearchPage();
        }
    }, 300);
}
