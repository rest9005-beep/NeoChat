// В auth.js добавьте в метод updateUser
updateUser(username, updates) {
    const user = this.users.get(username.toLowerCase());
    if (user) {
        // Обновляем поля
        Object.assign(user, updates);
        
        // Если обновили отображаемое имя, обновляем аватар
        if (updates.displayName) {
            user.avatarLetters = this.getAvatarLetters(updates.displayName);
        }
        
        this.saveUsers();
        
        // Если обновляем текущего пользователя
        if (this.currentUser && this.currentUser.username === user.username) {
            Object.assign(this.currentUser, updates);
            localStorage.setItem('neochat_current_user', JSON.stringify(this.currentUser));
            this.updateUI();
            
            // Обновляем ссылку на профиль
            updateProfileLink();
        }
        
        return true;
    }
    return false;
}
