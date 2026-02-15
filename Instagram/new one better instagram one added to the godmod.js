/* ========================================
   MODULE 6: GITHUB & INSTA
   ======================================== */
const ghFolder = createFolder('GITHUB & INSTA', '🌟');

addBtn(ghFolder, 'Star All Repos', () => {
    const btns = document.querySelectorAll('.js-toggler-target[aria-label="Star this repository"]');
    if(confirm`Star ${btns.length} repos?`) btns.forEach(b => b.click());
});

addBtn(ghFolder, 'Insta Download', () => {
    const cfg = { minSize: 200, retryDelay: 1000, successDelay: 2000 };
    
    async function dl(url, name, btn) {
        const orig = btn.dataset.orig;
        try {
            btn.innerHTML = '⏳'; btn.disabled = true;
            const r = await fetch(url);
            if(!r.ok) throw Error(`HTTP ${r.status}`);
            const blob = await r.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl; a.download = name;
            document.body.appendChild(a); a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(blobUrl);
            btn.innerHTML = '✔'; btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.innerHTML = orig; btn.disabled = false;
                btn.style.background = btn.dataset.bg;
            }, cfg.successDelay);
        } catch(e) {
            console.error('DL failed:', e);
            btn.innerHTML = '❌'; btn.style.background = '#f44336';
            setTimeout(() => {
                btn.innerHTML = '↗'; btn.style.background = '#2196F3';
                btn.disabled = false;
                btn.onclick = ev => { ev.stopPropagation(); window.open(url, '_blank'); };
            }, cfg.retryDelay);
        }
    }
    
    function makeBtn(icon, type) {
        const b = document.createElement('button');
        b.className = 'ig-dl-btn';
        b.innerHTML = icon; b.dataset.orig = icon;
        b.title = type === 'v' ? 'Download Video' : 'Download Image';
        const isVid = type === 'v';
        const bg = isVid ? '#e1306c' : 'white';
        const fg = isVid ? 'white' : 'black';
        b.dataset.bg = bg;
        b.style.cssText = `position:absolute;top:10px;right:10px;z-index:999999;background:${bg};color:${fg};border:none;width:35px;height:35px;border-radius:50%;font-weight:bold;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.3);font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.2s;opacity:0.9;`;
        b.onmouseover = () => { b.style.transform = 'scale(1.15)'; b.style.opacity = '1'; };
        b.onmouseout = () => { b.style.transform = 'scale(1)'; b.style.opacity = '0.9'; };
        return b;
    }
    
    function attach(el, btn) {
        const p = el.parentNode;
        if(getComputedStyle(p).position === 'static') p.style.position = 'relative';
        p.appendChild(btn);
    }
    
    function getBestSrc(img) {
        if(img.srcset) {
            const srcs = img.srcset.split(',').map(s => {
                const [url, w] = s.trim().split(' ');
                return { url, w: parseInt(w) || 0 };
            });
            srcs.sort((a, b) => b.w - a.w);
            return srcs[0].url;
        }
        return img.src;
    }
    
    function getVidSrc(v) {
        if(v.src && !v.src.startsWith('blob:')) return v.src;
        const srcs = v.querySelectorAll('source');
        if(srcs.length > 0) return srcs[srcs.length - 1].src;
        const res = performance.getEntriesByType('resource');
        const vids = res.filter(r => 
            (r.name.includes('.mp4') || r.name.includes('video') || r.name.includes('cdninstagram')) &&
            !r.name.includes('.jpg') && !r.name.includes('.webp')
        );
        return vids.length > 0 ? vids[vids.length - 1].name : null;
    }
    
    function processImgs() {
        Array.from(document.querySelectorAll('img')).filter(i => 
            i.naturalWidth > cfg.minSize && i.naturalHeight > cfg.minSize &&
            !i.closest('.ig-dl-btn')
        ).forEach(i => {
            if(i.parentNode.querySelector('.ig-dl-btn')) return;
            const src = getBestSrc(i);
            const btn = makeBtn('⬇', 'i');
            btn.onclick = e => {
                e.preventDefault(); e.stopPropagation();
                dl(src, `insta_img_${Date.now()}.jpg`, btn);
            };
            attach(i, btn);
        });
    }
    
    function processVids() {
        Array.from(document.querySelectorAll('video')).forEach(v => {
            if(v.parentNode.querySelector('.ig-dl-btn')) return;
            const btn = makeBtn('🎥', 'v');
            btn.onclick = e => {
                e.preventDefault(); e.stopPropagation();
                const src = getVidSrc(v);
                if(!src) {
                    alert('⚠️ Video not loaded yet.\n1. Play the video for a few seconds\n2. Wait for it to buffer\n3. Try downloading again');
                    return;
                }
                dl(src, `insta_vid_${Date.now()}.mp4`, btn);
            };
            attach(v, btn);
        });
    }
    
    processImgs();
    processVids();
    
    const obs = new MutationObserver(() => {
        processImgs();
        processVids();
    });
    obs.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => obs.disconnect(), 30000);
    
    alert('✅ Smart Instagram Downloader activated!\n\n📸 Images: Click ⬇ button\n🎥 Videos: Click 🎥 button\n\nButtons appear on hover over media.');
});
})();
