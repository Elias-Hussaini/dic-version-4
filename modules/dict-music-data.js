/* dict-music-data.js — Music, Data Management (lines 15771-17226) */

GermanDictionary.prototype.setupPasswordLock = function() {
    // با تأخیر کوچک برای اطمینان از وجود المان‌ها
    setTimeout(() => {
        const saveBtn = document.getElementById('save-password-btn');
        const removeBtn = document.getElementById('remove-password-btn');
        const setPasswordInput = document.getElementById('set-password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const lockStatusText = document.getElementById('lock-status-text');
        
        // اگر دکمه وجود نداشت، برگرد
        if (!saveBtn) {
            console.log('⚠️ دکمه ذخیره رمز پیدا نشد');
            return;
        }
        
        const isGerman = LanguageSystem.isGerman();
        
        // بروزرسانی وضعیت قفل
        const updateLockStatus = () => {
            const hasPass = localStorage.getItem('dictionary_password');
            if (lockStatusText) {
                if (hasPass) {
                    lockStatusText.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> ${isGerman ? 'قفل فعال است' : 'Lock is active'}`;
                    lockStatusText.style.color = '#10b981';
                } else {
                    lockStatusText.innerHTML = `<i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i> ${isGerman ? 'قفل غیرفعال است' : 'Lock is disabled'}`;
                    lockStatusText.style.color = '#f59e0b';
                }
            }
        };
        
        // ذخیره رمز عبور
        saveBtn.onclick = () => {
            const password = setPasswordInput?.value;
            const confirm = confirmPasswordInput?.value;
            
            if (!password || password.length < 4) {
                this.showToast('⚠️ رمز عبور باید حداقل ۴ کاراکتر باشد', 'warning');
                return;
            }
            
            if (password !== confirm) {
                this.showToast('❌ رمز عبور و تکرار آن مطابقت ندارند', 'error');
                return;
            }
            
            // رمزگذاری ساده
            const encrypted = btoa(password);
            localStorage.setItem('dictionary_password', encrypted);
            
            if (setPasswordInput) setPasswordInput.value = '';
            if (confirmPasswordInput) confirmPasswordInput.value = '';
            updateLockStatus();
            this.showToast('✅ رمز عبور با موفقیت ذخیره شد', 'success');
        };
        
        // حذف رمز عبور
        if (removeBtn) {
            removeBtn.onclick = () => {
                if (confirm('⚠️ آیا از حذف رمز عبور مطمئن هستید؟')) {
                    localStorage.removeItem('dictionary_password');
                    sessionStorage.removeItem('dictionary_unlocked');
                    updateLockStatus();
                    this.showToast('🔓 رمز عبور حذف شد', 'success');
                }
            };
        }
        
        updateLockStatus();
        
    }, 100);
};

GermanDictionary.prototype.checkAndLock = function() {
    const hasPassword = localStorage.getItem('dictionary_password');
    
    if (hasPassword) {
        const isUnlocked = sessionStorage.getItem('dictionary_unlocked');
        
        if (!isUnlocked) {
            this.showLockModal();
        }
    }
};

GermanDictionary.prototype.showLockModal = function() {
    let modal = document.getElementById('lock-modal');
    
    // اگر مودال وجود نداشت، بسازش
    if (!modal) {
        const isGerman = LanguageSystem.isGerman();
        const modalHTML = `
            <div id="lock-modal" class="modal-overlay" style="display: none; z-index: 999999;">
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3><i class="fas fa-lock"></i> ${isGerman ? 'ورود به دیکشنری' : 'Dictionary Unlock'}</h3>
                    </div>
                    <div class="modal-body">
                        <div style="text-align: center; margin-bottom: 20px;">
                            <i class="fas fa-graduation-cap" style="font-size: 50px; color: var(--primary);"></i>
                            <p style="margin-top: 10px;">${isGerman ? 'لطفاً رمز عبور را وارد کنید' : 'Please enter the password'}</p>
                        </div>
                        <input type="password" id="unlock-password" class="form-control" placeholder="${isGerman ? 'رمز عبور...' : 'Password...'}" style="text-align: center; font-size: 18px; padding: 12px;">
                        <div id="unlock-error" style="color: #ef4444; text-align: center; margin-top: 10px; display: none;"></div>
                    </div>
                    <div class="modal-footer">
                        <button id="unlock-btn" class="btn btn-primary btn-block" style="width: 100%;">
                            <i class="fas fa-unlock-alt"></i> ${isGerman ? 'ورود' : 'Unlock'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('lock-modal');
    }
    
    if (!modal) return;
    
    modal.style.display = 'flex';
    
    const unlockInput = document.getElementById('unlock-password');
    const unlockBtn = document.getElementById('unlock-btn');
    const unlockError = document.getElementById('unlock-error');
    
    const checkPassword = () => {
        const enteredPassword = unlockInput?.value;
        const savedPassword = localStorage.getItem('dictionary_password');
        
        if (!savedPassword) {
            modal.style.display = 'none';
            return;
        }
        
        try {
            const decrypted = atob(savedPassword);
            
            if (enteredPassword === decrypted) {
                sessionStorage.setItem('dictionary_unlocked', 'true');
                modal.style.display = 'none';
                if (unlockInput) unlockInput.value = '';
                this.showToast('🔓 دیکشنری باز شد', 'success');
            } else {
                if (unlockError) {
                    unlockError.style.display = 'block';
                    unlockError.innerHTML = '<i class="fas fa-times-circle"></i> رمز عبور اشتباه است';
                }
                if (unlockInput) {
                    unlockInput.value = '';
                    unlockInput.focus();
                }
                
                let attempts = parseInt(sessionStorage.getItem('lock_attempts') || '0');
                attempts++;
                sessionStorage.setItem('lock_attempts', attempts);
                
                if (attempts >= 5) {
                    if (unlockBtn) unlockBtn.disabled = true;
                    if (unlockError) unlockError.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ۵ بار تلاش ناموفق. لطفاً صفحه را رفرش کنید.';
                    setTimeout(() => location.reload(), 3000);
                }
            }
        } catch (e) {
            console.error('خطا در بررسی رمز:', e);
            if (unlockError) {
                unlockError.style.display = 'block';
                unlockError.innerHTML = '<i class="fas fa-exclamation-triangle"></i> خطا در بررسی رمز عبور';
            }
        }
    };
    
    if (unlockBtn) {
        unlockBtn.onclick = checkPassword;
    }
    
    if (unlockInput) {
        unlockInput.onkeypress = (e) => {
            if (e.key === 'Enter') {
                checkPassword();
            }
        };
        setTimeout(() => unlockInput.focus(), 100);
    }
    
    // جلوگیری از بسته شدن با کلیک خارج
    modal.onclick = (e) => {
        if (e.target === modal) {
            // نمیذاریم بسته بشه
            return;
        }
    };
};

GermanDictionary.prototype.getAllMusic = async function() {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            resolve([]);
            return;
        }

        const transaction = this.db.transaction(['music'], 'readonly');
        const store = transaction.objectStore('music');
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (event) => {
            console.error('خطا در دریافت موسیقی:', event.target.error);
            resolve([]);
        };
    });
};

GermanDictionary.prototype.getMusicById = async function(musicId) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['music'], 'readonly');
        const store = transaction.objectStore('music');
        const request = store.get(musicId);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

GermanDictionary.prototype.saveMusicToStorage = async function(musicData) {
    return new Promise((resolve, reject) => {
        if (!this.db) {
            reject(new Error('دیتابیس در دسترس نیست'));
            return;
        }

        const transaction = this.db.transaction(['music'], 'readwrite');
        const store = transaction.objectStore('music');
        
        musicData.id = Date.now();
        musicData.uploadDate = new Date().toISOString();
        
        const request = store.add(musicData);
        
        request.onsuccess = () => {
            this.showToast(`🎵 "${musicData.name}" آپلود شد`, 'success');
            this.renderUploadedMusicList();
            resolve(request.result);
        };
        
        request.onerror = (event) => {
            this.showToast('❌ خطا در ذخیره موسیقی', 'error');
            reject(event.target.error);
        };
    });
};

GermanDictionary.prototype.deleteMusicById = async function(musicId) {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['music'], 'readwrite');
        const store = transaction.objectStore('music');
        const request = store.delete(musicId);
        
        request.onsuccess = () => {
            this.showToast('🗑️ موسیقی حذف شد', 'info');
            this.renderUploadedMusicList();
            resolve();
        };
        
        request.onerror = (event) => {
            this.showToast('❌ خطا در حذف موسیقی', 'error');
            reject(event.target.error);
        };
    });
};

GermanDictionary.prototype.setupMusicUploadEventListeners = function() {
    const uploadArea = document.getElementById('music-upload-area');
    const musicUpload = document.getElementById('music-upload');
    
    if (uploadArea && musicUpload) {
        uploadArea.addEventListener('click', () => {
            musicUpload.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                this.handleMusicUpload(e.dataTransfer.files);
            }
        });
        
        musicUpload.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.handleMusicUpload(e.target.files);
            }
        });
    }
    
    // دکمه‌های پلیر پیشرفته
    const playBtn = document.getElementById('play-music-btn');
    const stopBtn = document.getElementById('stop-music-btn');
    const volumeSlider = document.getElementById('music-volume');
    const bgMusicSelect = document.getElementById('background-music');
    
    if (playBtn) {
        playBtn.onclick = () => this.playBackgroundMusic();
    }
    
    if (stopBtn) {
        stopBtn.onclick = () => this.stopBackgroundMusic();
    }
    
    if (volumeSlider) {
        volumeSlider.oninput = (e) => {
            this.setMusicVolume(e.target.value);
            const volumeValue = document.getElementById('volume-value');
            if (volumeValue) volumeValue.textContent = e.target.value + '%';
        };
    }
    
    if (bgMusicSelect) {
        bgMusicSelect.onchange = (e) => {
            this.changeBackgroundMusic(e.target.value);
        };
    }
};

GermanDictionary.prototype.handleMusicUpload = function(files) {
    if (!files || files.length === 0) return;

    const audioFile = Array.from(files).find(file => file.type.startsWith('audio/'));
    const imageFile = Array.from(files).find(file => file.type.startsWith('image/'));

    if (!audioFile) {
        this.showToast('❌ لطفاً یک فایل صوتی انتخاب کنید', 'error');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = async (e) => {
        const musicData = {
            name: audioFile.name.replace(/\.[^/.]+$/, ""),
            audioData: e.target.result,
            audioType: audioFile.type,
            audioSize: audioFile.size
        };

        if (imageFile) {
            try {
                const imageData = await this.readFileAsDataURL(imageFile);
                musicData.imageData = imageData;
                musicData.imageType = imageFile.type;
            } catch (error) {
                console.error('خطا در خواندن عکس:', error);
            }
        }

        await this.saveMusicToStorage(musicData);
    };
    
    reader.onerror = () => {
        this.showToast('❌ خطا در خواندن فایل', 'error');
    };
    
    reader.readAsDataURL(audioFile);
};

GermanDictionary.prototype.readFileAsDataURL = function(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

GermanDictionary.prototype.renderUploadedMusicList = async function() {
    const container = document.getElementById('uploaded-music-list');
    if (!container) return;
    
    try {
        const musicList = await this.getAllMusic();
        
        if (musicList.length === 0) {
            container.innerHTML = `
                <div class="empty-music-list">
                    <i class="fas fa-music"></i>
                    <p>هنوز موسیقی آپلود نکرده‌اید</p>
                </div>
            `;
            return;
        }
        
        musicList.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        
        container.innerHTML = musicList.map(music => `
            <div class="music-item" data-id="${music.id}">
                <div class="music-cover">
                    ${music.imageData ? 
                        `<img src="${music.imageData}" alt="${music.name}" class="music-cover-image">` :
                        `<i class="fas fa-music"></i>`
                    }
                </div>
                <div class="music-info">
                    <div class="music-name">${this.escapeHtml(music.name)}</div>
                    <div class="music-details">
                        ${this.formatFileSize(music.audioSize)} • 
                        ${new Date(music.uploadDate).toLocaleDateString('fa-IR')}
                    </div>
                </div>
                <div class="music-actions">
                    <button class="music-btn play" data-id="${music.id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="music-btn delete" data-id="${music.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // رویداد دکمه‌های پلی و حذف
        document.querySelectorAll('.music-btn.play').forEach(btn => {
            btn.onclick = () => {
                const id = parseInt(btn.dataset.id);
                this.playUploadedMusic(id);
            };
        });
        
        document.querySelectorAll('.music-btn.delete').forEach(btn => {
            btn.onclick = async () => {
                const id = parseInt(btn.dataset.id);
                if (confirm('آیا از حذف این موسیقی مطمئن هستید؟')) {
                    await this.deleteMusicById(id);
                }
            };
        });
        
    } catch (error) {
        console.error('خطا در نمایش لیست موسیقی:', error);
    }
};

GermanDictionary.prototype.playUploadedMusic = async function(musicId) {
    try {
        const music = await this.getMusicById(musicId);
        
        if (!music) {
            this.showToast('❌ موسیقی پیدا نشد', 'error');
            return;
        }

        // توقف پخش قبلی
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
        }

        this.audioPlayer = new Audio();
        this.audioPlayer.src = music.audioData;
        this.audioPlayer.loop = false;
        
        // تنظیم صدا
        const volumeSlider = document.getElementById('player-volume-slider');
        const musicVolumeSlider = document.getElementById('music-volume');
        if (volumeSlider) {
            this.audioPlayer.volume = volumeSlider.value / 100;
        } else if (musicVolumeSlider) {
            this.audioPlayer.volume = musicVolumeSlider.value / 100;
        }
        
        // آپدیت عنوان آهنگ
        const trackNameSpan = document.getElementById('player-track-name');
        if (trackNameSpan) {
            trackNameSpan.textContent = music.name;
        }
        
        // آپدیت لیست پخش برای دکمه‌های قبلی/بعدی
        const allMusic = await this.getAllMusic();
        this.currentPlaylist = allMusic.map(m => m.id);
        this.currentIndex = this.currentPlaylist.findIndex(id => id === musicId);
        this.currentMusicId = musicId;
        
        // آپدیت نوار پیشرفت
        this.audioPlayer.ontimeupdate = () => {
            const progressFill = document.getElementById('progress-fill');
            const currentTimeSpan = document.getElementById('current-time-display');
            if (progressFill && this.audioPlayer.duration) {
                const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
                progressFill.style.width = percent + '%';
            }
            if (currentTimeSpan) {
                currentTimeSpan.textContent = this.formatMusicTime(this.audioPlayer.currentTime);
            }
        };
        
        this.audioPlayer.onloadedmetadata = () => {
            const totalTimeSpan = document.getElementById('total-time-display');
            if (totalTimeSpan) {
                totalTimeSpan.textContent = this.formatMusicTime(this.audioPlayer.duration);
            }
        };
        
        this.audioPlayer.onended = () => {
            this.playNext();
        };
        
        await this.audioPlayer.play();
        this.showToast(`🎵 در حال پخش: ${music.name}`, 'success');
        
        // بروزرسانی دکمه پخش/توقف
        const playPauseBtn = document.getElementById('player-play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        // بروزرسانی آیکون شناور
        this.updateMusicFloatingIcon(true, music.name);
        this.isMusicPlaying = true;
        this.currentPlayingMusic = music;
        
    } catch (error) {
        console.error('خطا در پخش:', error);
        this.showToast('❌ خطا در پخش موسیقی', 'error');
    }
};

GermanDictionary.prototype.updateMusicFloatingIcon = function(isPlaying, trackName = '') {
    let icon = document.getElementById('music-floating-icon');
    
    if (!icon) {
        icon = document.createElement('div');
        icon.id = 'music-floating-icon';
        icon.className = 'music-floating-icon';
        icon.innerHTML = '<i class="fas fa-music"></i>';
        document.body.appendChild(icon);
        
        icon.onclick = () => {
            if (this.isMusicPlaying) {
                this.stopBackgroundMusic();
            } else if (this.currentPlayingMusic) {
                this.playUploadedMusic(this.currentPlayingMusic.id);
            } else {
                const musicList = document.querySelectorAll('.music-item');
                if (musicList.length > 0) {
                    const firstMusicId = parseInt(musicList[0].dataset.id);
                    this.playUploadedMusic(firstMusicId);
                }
            }
        };
    }
    
    if (isPlaying) {
        icon.style.display = 'flex';
        icon.classList.add('playing');
        icon.setAttribute('title', trackName || 'در حال پخش...');
        // تغییر آیکون به note
        icon.innerHTML = '<i class="fas fa-music"></i>';
    } else {
        icon.classList.remove('playing');
        icon.setAttribute('title', 'موسیقی متوقف شد');
        icon.innerHTML = '<i class="fas fa-music"></i>';
    }
};

GermanDictionary.prototype.startMusicProgressUpdate = function() {
    // پاک کردن interval قبلی
    if (this.progressInterval) {
        clearInterval(this.progressInterval);
    }
    
    const progressFill = document.getElementById('music-progress-fill');
    const currentTimeSpan = document.getElementById('current-time');
    const totalTimeSpan = document.getElementById('total-time');
    
    if (!progressFill || !currentTimeSpan) return;
    
    // نمایش زمان کل
    this.audioPlayer.onloadedmetadata = () => {
        if (totalTimeSpan) {
            totalTimeSpan.textContent = this.formatMusicTime(this.audioPlayer.duration);
        }
    };
    
    // آپدیت هر ثانیه
    this.progressInterval = setInterval(() => {
        if (this.audioPlayer && !this.audioPlayer.paused) {
            const percent = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            progressFill.style.width = percent + '%';
            currentTimeSpan.textContent = this.formatMusicTime(this.audioPlayer.currentTime);
        }
    }, 1000);
};

GermanDictionary.prototype.formatMusicTime = function(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

GermanDictionary.prototype.stopBackgroundMusic = function() {
    if (this.audioPlayer) {
        this.audioPlayer.pause();
        this.audioPlayer.currentTime = 0;
        
        // بروزرسانی دکمه پخش/توقف
        const playPauseBtn = document.getElementById('player-play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        
        // ریست عنوان آهنگ
        const trackNameSpan = document.getElementById('player-track-name');
        if (trackNameSpan) {
            trackNameSpan.textContent = 'هیچ آهنگی در حال پخش نیست';
        }
        
        this.showToast('⏹️ موسیقی متوقف شد', 'info');
        this.updateMusicFloatingIcon(false);
        this.isMusicPlaying = false;
        this.currentPlayingMusic = null;
        
        // ریست نوار پیشرفت
        const progressFill = document.getElementById('progress-fill');
        const currentTimeSpan = document.getElementById('current-time-display');
        const totalTimeSpan = document.getElementById('total-time-display');
        
        if (progressFill) progressFill.style.width = '0%';
        if (currentTimeSpan) currentTimeSpan.textContent = '00:00';
        if (totalTimeSpan) totalTimeSpan.textContent = '00:00';
    }
};

GermanDictionary.prototype.setMusicVolume = function(volume) {
    if (this.audioPlayer) {
        this.audioPlayer.volume = volume / 100;
    }
};

GermanDictionary.prototype.changeBackgroundMusic = function(type) {
    if (this.audioPlayer && !this.audioPlayer.paused) {
        this.stopBackgroundMusic();
        setTimeout(() => this.playBackgroundMusic(), 100);
    }
};

GermanDictionary.prototype.formatFileSize = function(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

GermanDictionary.prototype.setupMusicControls = function() {
    console.log('🎵 راه‌اندازی دکمه‌های پلیر موسیقی...');
    
    // دکمه پخش/توقف
    const playPauseBtn = document.getElementById('player-play-pause-btn');
    if (playPauseBtn) {
        // حذف رویدادهای قبلی
        const newPlayPauseBtn = playPauseBtn.cloneNode(true);
        playPauseBtn.parentNode.replaceChild(newPlayPauseBtn, playPauseBtn);
        
        newPlayPauseBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 کلیک روی پخش/توقف');
            this.togglePlayPause();
        };
        console.log('✅ دکمه پخش/توقف متصل شد');
    } else {
        console.log('❌ دکمه پخش/توقف پیدا نشد');
    }
    
    // دکمه توقف
    const stopBtn = document.getElementById('player-stop-btn');
    if (stopBtn) {
        const newStopBtn = stopBtn.cloneNode(true);
        stopBtn.parentNode.replaceChild(newStopBtn, stopBtn);
        
        newStopBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 کلیک روی توقف');
            this.stopBackgroundMusic();
        };
        console.log('✅ دکمه توقف متصل شد');
    }
    
    // دکمه بعدی
    const nextBtn = document.getElementById('player-next-btn');
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        
        newNextBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 کلیک روی بعدی');
            this.playNext();
        };
        console.log('✅ دکمه بعدی متصل شد');
    }
    
    // دکمه قبلی
    const prevBtn = document.getElementById('player-prev-btn');
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        
        newPrevBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎵 کلیک روی قبلی');
            this.playPrevious();
        };
        console.log('✅ دکمه قبلی متصل شد');
    }
    
// نوار پیشرفت - ساده و درست
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
    const newProgressBar = progressBar.cloneNode(true);
    progressBar.parentNode.replaceChild(newProgressBar, progressBar);
    
    newProgressBar.onclick = (e) => {
        if (this.audioPlayer && this.audioPlayer.duration) {
            const rect = newProgressBar.getBoundingClientRect();
            // محاسبه مستقیم از چپ به راست
            const clickX = e.clientX - rect.left;
            const percent = clickX / rect.width;
            // محدود کردن بین 0 و 1
            const finalPercent = Math.max(0, Math.min(1, percent));
            this.audioPlayer.currentTime = finalPercent * this.audioPlayer.duration;
        }
    };
    console.log('✅ نوار پیشرفت متصل شد');
}
// اسلایدر صدا - از چپ به راست با آیکون‌های درست
const volumeSlider = document.getElementById('player-volume-slider');
if (volumeSlider) {
    const newVolumeSlider = volumeSlider.cloneNode(true);
    volumeSlider.parentNode.replaceChild(newVolumeSlider, volumeSlider);
    
    newVolumeSlider.style.direction = 'ltr';
    
    // آپدیت آیکون‌ها هنگام تغییر صدا
    const updateVolumeIcons = (value) => {
        const volumeLowIcon = document.querySelector('.fa-volume-down');
        const volumeHighIcon = document.querySelector('.fa-volume-up');
        if (volumeLowIcon && volumeHighIcon) {
            if (value == 0) {
                volumeLowIcon.style.opacity = '0.5';
                volumeHighIcon.style.opacity = '0.5';
            } else if (value < 30) {
                volumeLowIcon.style.opacity = '1';
                volumeHighIcon.style.opacity = '0.5';
            } else if (value < 70) {
                volumeLowIcon.style.opacity = '0.7';
                volumeHighIcon.style.opacity = '0.7';
            } else {
                volumeLowIcon.style.opacity = '1';
                volumeHighIcon.style.opacity = '1';
            }
        }
    };
    
    newVolumeSlider.oninput = (e) => {
        const volume = e.target.value / 100;
        if (this.audioPlayer) {
            this.audioPlayer.volume = volume;
        }
        const volumePercent = document.getElementById('volume-percent');
        if (volumePercent) {
            volumePercent.textContent = e.target.value + '%';
        }
        updateVolumeIcons(parseInt(e.target.value));
        localStorage.setItem('musicVolume', e.target.value);
    };
    
    // بارگذاری تنظیمات صدا
    const savedVolume = localStorage.getItem('musicVolume') || 50;
    newVolumeSlider.value = savedVolume;
    const volumePercent = document.getElementById('volume-percent');
    if (volumePercent) volumePercent.textContent = savedVolume + '%';
    if (this.audioPlayer) {
        this.audioPlayer.volume = savedVolume / 100;
    }
    updateVolumeIcons(parseInt(savedVolume));
    
    console.log('✅ اسلایدر صدا متصل شد (LTR)');
}
};

GermanDictionary.prototype.togglePlayPause = function() {
    console.log('🎵 togglePlayPause فراخوانی شد');
    console.log('   - audioPlayer:', !!this.audioPlayer);
    console.log('   - isMusicPlaying:', this.isMusicPlaying);
    
    if (!this.audioPlayer || !this.currentPlayingMusic) {
        // اگه آهنگی انتخاب نشده، اولین آهنگ از لیست رو پخش کن
        this.getAllMusic().then(list => {
            if (list.length > 0) {
                this.playUploadedMusic(list[0].id);
            } else {
                this.showToast('🎵 هیچ موسیقی آپلود نشده است', 'warning');
            }
        });
        return;
    }
    
    if (this.isMusicPlaying) {
        this.audioPlayer.pause();
        this.isMusicPlaying = false;
        const playPauseBtn = document.getElementById('player-play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
        this.updateMusicFloatingIcon(false);
        console.log('🎵 موسیقی متوقف شد');
    } else {
        this.audioPlayer.play();
        this.isMusicPlaying = true;
        const playPauseBtn = document.getElementById('player-play-pause-btn');
        if (playPauseBtn) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.updateMusicFloatingIcon(true, this.currentPlayingMusic?.name);
        console.log('🎵 موسیقی شروع شد');
    }
};

GermanDictionary.prototype.updatePlayPauseButton = function(isPlaying) {
    const btn = document.getElementById('player-play-pause-btn');
    if (btn) {
        btn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
};

GermanDictionary.prototype.updateFloatingIcon = function(isPlaying) {
    const icon = document.getElementById('music-floating-icon');
    if (icon) {
        icon.style.display = 'flex';
        if (isPlaying) {
            icon.classList.add('playing');
        } else {
            icon.classList.remove('playing');
        }
    }
};

GermanDictionary.prototype.playPrevious = function() {
    if (!this.currentPlaylist || this.currentPlaylist.length === 0) {
        this.getAllMusic().then(list => {
            if (list.length > 0) {
                this.currentPlaylist = list.map(m => m.id);
                this.currentIndex = list.length - 1;
                this.playUploadedMusic(this.currentPlaylist[this.currentIndex]);
            }
        });
        return;
    }
    
    this.currentIndex = (this.currentIndex - 1 + this.currentPlaylist.length) % this.currentPlaylist.length;
    this.playUploadedMusic(this.currentPlaylist[this.currentIndex]);
};

GermanDictionary.prototype.playNext = function() {
    if (!this.currentPlaylist || this.currentPlaylist.length === 0) {
        this.getAllMusic().then(list => {
            if (list.length > 0) {
                this.currentPlaylist = list.map(m => m.id);
                this.currentIndex = 0;
                this.playUploadedMusic(this.currentPlaylist[0]);
            }
        });
        return;
    }
    
    this.currentIndex = (this.currentIndex + 1) % this.currentPlaylist.length;
    this.playUploadedMusic(this.currentPlaylist[this.currentIndex]);
};

GermanDictionary.prototype.stopMusic = function() {
    if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.isPlaying = false;
        this.updatePlayPauseButton(false);
        this.updateFloatingIcon(false);
        
        const trackName = document.getElementById('player-track-name');
        const currentTime = document.getElementById('current-time-display');
        const totalTime = document.getElementById('total-time-display');
        const progressFill = document.getElementById('progress-fill');
        
        if (trackName) trackName.textContent = 'هیچ آهنگی در حال پخش نیست';
        if (currentTime) currentTime.textContent = '00:00';
        if (totalTime) totalTime.textContent = '00:00';
        if (progressFill) progressFill.style.width = '0%';
    }
};

GermanDictionary.prototype.playMusicById = function(musicId) {
    this.getMusicById(musicId).then(music => {
        if (!music) return;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
        }
        
        this.currentAudio = new Audio(music.audioData);
        this.currentAudio.loop = false;
        
        const volumeSlider = document.getElementById('player-volume-slider');
        if (volumeSlider) {
            this.currentAudio.volume = volumeSlider.value / 100;
        }
        
        this.currentAudio.ontimeupdate = () => {
            const progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
            const progressFill = document.getElementById('progress-fill');
            const currentTimeSpan = document.getElementById('current-time-display');
            
            if (progressFill) progressFill.style.width = progress + '%';
            if (currentTimeSpan) currentTimeSpan.textContent = this.formatTime(this.currentAudio.currentTime);
        };
        
        this.currentAudio.onloadedmetadata = () => {
            const totalTimeSpan = document.getElementById('total-time-display');
            const trackNameSpan = document.getElementById('player-track-name');
            
            if (totalTimeSpan) totalTimeSpan.textContent = this.formatTime(this.currentAudio.duration);
            if (trackNameSpan) trackNameSpan.textContent = music.name;
        };
        
        this.currentAudio.onended = () => {
            this.playNext();
        };
        
        this.currentAudio.play();
        this.isPlaying = true;
        this.updatePlayPauseButton(true);
        this.updateFloatingIcon(true);
        this.currentMusicId = musicId;
        this.showToast(`🎵 در حال پخش: ${music.name}`, 'success');
    });
};

GermanDictionary.prototype.formatTime = function(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

GermanDictionary.prototype.formatMusicTime = function(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

GermanDictionary.prototype.exportData = async function() {
    try {
        this.showSimpleLoadingSpinner();
        
        const words = await this.getAllWords();
        const favorites = Array.from(this.favorites);
        
        const examples = await new Promise((resolve) => {
            const transaction = this.db.transaction(['examples'], 'readonly');
            const store = transaction.objectStore('examples');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
        
        const practiceHistory = await this.getAllPracticeHistory();
        const tagsData = Array.from(this.tags.entries());
        const srsData = this.srsData;
        
        const settings = {
            darkMode: localStorage.getItem('darkMode') === 'true',
            fontSize: localStorage.getItem('fontSize') || 'medium',
            theme: localStorage.getItem('theme') || 'default',
            wordListSort: localStorage.getItem('wordListSort') || 'alphabetical',
            practiceRange: localStorage.getItem('practiceRange') || 'all',
            practiceCount: localStorage.getItem('practiceCount') || '10',
            practiceOrder: localStorage.getItem('practiceOrder') || 'random',
            studyTimePerWord: localStorage.getItem('studyTimePerWord') || '5',
            musicVolume: localStorage.getItem('musicVolume') || '50',
            lexiCardStyle: localStorage.getItem('lexiCardStyle') || 'modern',
            exportWordsPerPage: localStorage.getItem('exportWordsPerPage') || '10',
            exportSortBy: localStorage.getItem('exportSortBy') || 'alphabetical',
            exportTheme: localStorage.getItem('exportTheme') || 'light',
            exportShowGender: localStorage.getItem('exportShowGender') !== 'false',
            exportShowType: localStorage.getItem('exportShowType') !== 'false',
            exportHeaderTitle: localStorage.getItem('exportHeaderTitle') || 'LINGO.Dictionary'
        };
        
        const allChats = localStorage.getItem('all_chats');
        const currentChatId = localStorage.getItem('current_chat_id');
        const permanentMemory = localStorage.getItem('permanent_memory');
        
        const musicList = await this.getAllMusic();
        const books = await this.getAllBooksFromIndexedDB();
        
        const exportData = {
            version: 5,
            exportedAt: new Date().toISOString(),
            words: words,
            favorites: favorites,
            examples: examples,
            practiceHistory: practiceHistory,
            tags: tagsData,
            srsData: srsData,
            settings: settings,
            allChats: allChats,
            currentChatId: currentChatId,
            permanentMemory: permanentMemory,
            music: musicList.map(m => ({
                id: m.id,
                name: m.name,
                audioData: m.audioData,
                audioType: m.audioType,
                imageData: m.imageData,
                uploadDate: m.uploadDate
            })),
            books: books.map(b => ({
                id: b.id,
                title: b.title,
                author: b.author,
                pdfData: b.pdfData,
                coverData: b.coverData,
                createdAt: b.createdAt
            })),
            totalWords: words.length,
            totalPractice: practiceHistory.length,
            totalTags: this.tags.size
        };
        
        const jsonData = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `LINGO-dictionary-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.hideSimpleLoadingSpinner();
        this.showToast(`✅ تمام داده‌ها با موفقیت صادر شد (${words.length} لغت، ${this.tags.size} پوشه، ${practiceHistory.length} تمرین)`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        this.hideSimpleLoadingSpinner();
        this.showToast('❌ خطا در صدور داده‌ها: ' + error.message, 'error');
    }
};

GermanDictionary.prototype.importData = async function(file) {
    if (!file) return;

    this.showSimpleLoadingSpinner();

    try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.words || !Array.isArray(data.words)) {
            throw new Error('فرمت فایل نامعتبر است.');
        }

        const wordCount = data.words.length;
        const practiceCount = data.practiceHistory?.length || 0;
        const tagCount = data.tags?.length || 0;

        const isGerman = LanguageSystem.isGerman();
        const confirmMessage = isGerman
            ? `⚠️ آیا از وارد کردن داده‌ها مطمئن هستید؟\n\n📚 ${wordCount} لغت\n📁 ${tagCount} پوشه\n🎯 ${practiceCount} تمرین\n\n⚠️ توجه: داده‌های فعلی کاملاً حذف می‌شوند.`
            : `⚠️ Are you sure?\n\n📚 ${wordCount} words\n📁 ${tagCount} folders\n🎯 ${practiceCount} practices\n\n⚠️ Current data will be replaced.`;

        if (!confirm(confirmMessage)) {
            this.hideSimpleLoadingSpinner();
            return;
        }

        // ۱) پاکسازی کامل داده‌های قدیمی
        await this.clearAllData();

        const keysToKeep = ['darkMode', 'fontSize', 'theme', 'learningLang'];
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !keysToKeep.includes(key) && !key.startsWith('groq_')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));

        // ۲) مرحله اول: افزودن همه لغات در یک تراکنش جداگانه
        //    (بدون await بین درخواست‌ها — این الگوی صحیح IndexedDB است
        //     تا از TransactionInactiveError جلوگیری شود)
        const idMapping = new Map();

        await new Promise((resolve, reject) => {
            const wordTransaction = this.db.transaction(['words'], 'readwrite');
            const wordsStore = wordTransaction.objectStore('words');

            for (const word of data.words) {
                const oldId = word.id;
                // کپی شیء تا شیء اصلی تغییر نکند
                const wordCopy = Object.assign({}, word);
                delete wordCopy.id;
                const request = wordsStore.add(wordCopy);
                request.onsuccess = () => {
                    idMapping.set(oldId, request.result);
                };
                request.onerror = (e) => {
                    console.error('خطا در افزودن لغت:', word.german, e.target.error);
                };
            }

            wordTransaction.oncomplete = () => resolve();
            wordTransaction.onerror = (event) => reject(event.target.error);
            wordTransaction.onabort = (event) => reject(event.target.error || new Error('تراکنش لغات لغو شد'));
        });
        console.log(`✅ ${data.words.length} لغت وارد شد`);

        // ۳) مرحله دوم: افزودن علاقه‌مندی‌ها، مثال‌ها و تاریخچه تمرین
        //    (با استفاده از idMapping که حالا پر شده)
        await new Promise((resolve, reject) => {
            const relTransaction = this.db.transaction(
                ['favorites', 'examples', 'practiceHistory'],
                'readwrite'
            );

            if (data.favorites && Array.isArray(data.favorites)) {
                const favStore = relTransaction.objectStore('favorites');
                for (const favId of data.favorites) {
                    const newWordId = idMapping.get(favId);
                    if (newWordId) {
                        favStore.add({ wordId: newWordId });
                    }
                }
            }

            if (data.examples && Array.isArray(data.examples)) {
                const exStore = relTransaction.objectStore('examples');
                for (const ex of data.examples) {
                    const newWordId = idMapping.get(ex.wordId);
                    if (newWordId) {
                        const exCopy = Object.assign({}, ex);
                        delete exCopy.id;
                        exCopy.wordId = newWordId;
                        exStore.add(exCopy);
                    }
                }
            }

            if (data.practiceHistory && Array.isArray(data.practiceHistory)) {
                const phStore = relTransaction.objectStore('practiceHistory');
                for (const record of data.practiceHistory) {
                    const newWordId = idMapping.get(record.wordId);
                    if (newWordId) {
                        const recCopy = Object.assign({}, record);
                        delete recCopy.id;
                        recCopy.wordId = newWordId;
                        phStore.add(recCopy);
                    }
                }
            }

            relTransaction.oncomplete = () => resolve();
            relTransaction.onerror = (event) => reject(event.target.error);
            relTransaction.onabort = (event) => reject(event.target.error || new Error('تراکنش داده‌های مرتبط لغو شد'));
        });

        // به‌روزرسانی مجموعه علاقه‌مندی‌ها در حافظه
        this.favorites = new Set();
        if (data.favorites && Array.isArray(data.favorites)) {
            for (const favId of data.favorites) {
                const newWordId = idMapping.get(favId);
                if (newWordId) this.favorites.add(newWordId);
            }
        }

        if (data.tags && Array.isArray(data.tags)) {
            this.tags.clear();
            for (const [oldTagId, tagData] of data.tags) {
                const updatedWordIds = tagData.wordIds
                    .map(oldWordId => idMapping.get(oldWordId))
                    .filter(newId => newId !== undefined);

                this.tags.set(tagData.id, {
                    ...tagData,
                    wordIds: updatedWordIds
                });
            }
            this.saveTags();
            console.log(`✅ ${this.tags.size} تگ وارد شد`);
        }

        if (data.srsData) {
            this.srsData = {};
            for (const [oldWordId, srsItem] of Object.entries(data.srsData)) {
                const newWordId = idMapping.get(parseInt(oldWordId));
                if (newWordId) {
                    this.srsData[newWordId] = srsItem;
                }
            }
            this.saveSRSData();
            this.updateReviewWords();
        }
        
        if (data.settings) {
            const settings = data.settings;
            if (settings.darkMode !== undefined) {
                document.body.classList.toggle('dark-mode', settings.darkMode);
                localStorage.setItem('darkMode', settings.darkMode);
            }
            if (settings.fontSize) {
                document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge', 'font-xxlarge');
                document.body.classList.add(`font-${settings.fontSize}`);
                localStorage.setItem('fontSize', settings.fontSize);
            }
            if (settings.theme) {
                this.applyTheme(settings.theme);
            }
            if (settings.wordListSort) localStorage.setItem('wordListSort', settings.wordListSort);
            if (settings.practiceRange) localStorage.setItem('practiceRange', settings.practiceRange);
            if (settings.practiceCount) localStorage.setItem('practiceCount', settings.practiceCount);
            if (settings.practiceOrder) localStorage.setItem('practiceOrder', settings.practiceOrder);
            if (settings.studyTimePerWord) localStorage.setItem('studyTimePerWord', settings.studyTimePerWord);
            if (settings.musicVolume) localStorage.setItem('musicVolume', settings.musicVolume);
            if (settings.lexiCardStyle) localStorage.setItem('lexiCardStyle', settings.lexiCardStyle);
            if (settings.exportWordsPerPage) localStorage.setItem('exportWordsPerPage', settings.exportWordsPerPage);
            if (settings.exportSortBy) localStorage.setItem('exportSortBy', settings.exportSortBy);
            if (settings.exportTheme) localStorage.setItem('exportTheme', settings.exportTheme);
            if (settings.exportShowGender !== undefined) localStorage.setItem('exportShowGender', settings.exportShowGender);
            if (settings.exportShowType !== undefined) localStorage.setItem('exportShowType', settings.exportShowType);
            if (settings.exportHeaderTitle) localStorage.setItem('exportHeaderTitle', settings.exportHeaderTitle);
        }
        
        if (data.allChats) localStorage.setItem('all_chats', data.allChats);
        if (data.currentChatId) localStorage.setItem('current_chat_id', data.currentChatId);
        if (data.permanentMemory) localStorage.setItem('permanent_memory', data.permanentMemory);
        
        if (data.music && Array.isArray(data.music) && data.music.length > 0) {
            const musicTransaction = this.db.transaction(['music'], 'readwrite');
            const musicStore = musicTransaction.objectStore('music');
            for (const music of data.music) {
                musicStore.add(music);
            }
            await new Promise((resolve, reject) => {
                musicTransaction.oncomplete = () => resolve();
                musicTransaction.onerror = (e) => reject(e.target.error);
            });
        }
        
        if (data.books && Array.isArray(data.books) && data.books.length > 0) {
            const bookTransaction = this.db.transaction(['books'], 'readwrite');
            const bookStore = bookTransaction.objectStore('books');
            for (const book of data.books) {
                bookStore.add(book);
            }
            await new Promise((resolve, reject) => {
                bookTransaction.oncomplete = () => resolve();
                bookTransaction.onerror = (e) => reject(e.target.error);
            });
        }
        
        if (!data.srsData && data.practiceHistory && data.practiceHistory.length > 0) {
            await this.rebuildSRSFromHistory();
        }
        
        await this.loadFavorites();
        
        this.renderWordList();
        this.updateStats();
        this.renderTagFilterBar();
        this.updatePracticeTagFilter();
        this.addTagFilterToExportModal();
        
        this.hideSimpleLoadingSpinner();
        this.showToast(`✅ تمام داده‌ها با موفقیت وارد شد (${data.words.length} لغت، ${this.tags.size} پوشه)`, 'success');
        
        setTimeout(() => {
            if (confirm('برای اعمال کامل تغییرات، صفحه مجدداً بارگذاری شود؟')) {
                location.reload();
            }
        }, 1000);
        
    } catch (error) {
        console.error('Import error:', error);
        this.hideSimpleLoadingSpinner();
        this.showToast('❌ خطا در وارد کردن داده‌ها: ' + error.message, 'error');
    }
};

GermanDictionary.prototype.clearAllData = async function() {
    return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(
            ['words', 'favorites', 'examples', 'practiceHistory', 'music', 'books'],
            'readwrite'
        );
        
        transaction.objectStore('words').clear();
        transaction.objectStore('favorites').clear();
        transaction.objectStore('examples').clear();
        transaction.objectStore('practiceHistory').clear();
        
        if (transaction.objectStoreNames.contains('music')) {
            transaction.objectStore('music').clear();
        }
        if (transaction.objectStoreNames.contains('books')) {
            transaction.objectStore('books').clear();
        }
        
        transaction.oncomplete = () => {
            this.favorites.clear();
            this.tags.clear();
            this.srsData = {};
            resolve();
        };
        transaction.onerror = (event) => reject(event.target.error);
    });
};

GermanDictionary.prototype.rebuildSRSFromHistory = async function() {
    const practiceHistory = await this.getAllPracticeHistory();
    this.srsData = {};
    
    for (const record of practiceHistory) {
        const wordId = record.wordId;
        const isCorrect = record.correct;
        
        if (!this.srsData[wordId]) {
            this.srsData[wordId] = {
                level: 0,
                correctCount: 0,
                wrongCount: 0,
                lastPractice: record.date,
                nextReviewDate: record.date,
                totalCorrect: 0,
                totalWrong: 0
            };
        }
        
        if (isCorrect) {
            this.srsData[wordId].correctCount++;
            this.srsData[wordId].totalCorrect++;
            this.srsData[wordId].wrongCount = 0;
        } else {
            this.srsData[wordId].wrongCount++;
            this.srsData[wordId].totalWrong++;
            this.srsData[wordId].correctCount = 0;
        }
        
        // محاسبه سطح
        const correctCount = this.srsData[wordId].correctCount;
        if (isCorrect) {
            if (correctCount >= 5 && this.srsData[wordId].level < 5) this.srsData[wordId].level = 5;
            else if (correctCount >= 4 && this.srsData[wordId].level < 4) this.srsData[wordId].level = 4;
            else if (correctCount >= 3 && this.srsData[wordId].level < 3) this.srsData[wordId].level = 3;
            else if (correctCount >= 2 && this.srsData[wordId].level < 2) this.srsData[wordId].level = 2;
            else if (correctCount >= 1 && this.srsData[wordId].level < 1) this.srsData[wordId].level = 1;
        } else {
            if (this.srsData[wordId].wrongCount >= 2) {
                this.srsData[wordId].level = Math.max(0, this.srsData[wordId].level - 1);
                this.srsData[wordId].correctCount = 0;
            }
        }
        
        this.srsData[wordId].lastPractice = record.date;
        
        // محاسبه تاریخ مرور بعدی
        const intervals = [1, 2, 4, 7, 14, 30];
        const daysToAdd = intervals[this.srsData[wordId].level] || 1;
        const nextReview = new Date(record.date);
        nextReview.setDate(nextReview.getDate() + daysToAdd);
        this.srsData[wordId].nextReviewDate = nextReview.toISOString();
    }
    
    this.saveSRSData();
    this.updateReviewWords();
    console.log('✅ SRS از تاریخچه تمرین بازسازی شد');
};

GermanDictionary.prototype.exportGermanWordsToTxt = async function() {
        try {
            const words = await this.getAllWords();
            
            if (words.length === 0) {
                this.showToast('❌ هیچ لغتی برای ذخیره وجود ندارد', 'warning');
                return;
            }
            
            let txtContent = '';
            const sortedWords = words.sort((a, b) => a.german.localeCompare(b.german, 'de'));
            
            sortedWords.forEach(word => {
                txtContent += word.german + '\n';
            });
            
            const blob = new Blob([txtContent], { type: 'text/plain; charset=utf-8' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `german-words-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast(`✅ ${words.length} لغت آلمانی ذخیره شد`, 'success');
            
        } catch (error) {
            console.error('Error exporting German words:', error);
            this.showToast('❌ خطا در ذخیره‌سازی لغات', 'error');
        }
};

GermanDictionary.prototype.resetData = async function() {
        try {
            await this.clearAllData();
            localStorage.clear();
            this.favorites.clear();
            this.showToast('🔄 برنامه بازنشانی شد. صفحه مجدداً بارگذاری می‌شود...', 'info');
            setTimeout(() => location.reload(), 2000);
        } catch (error) {
            console.error('Reset error:', error);
            this.showToast('❌ خطا در بازنشانی برنامه', 'error');
        }
};

