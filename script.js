(function() {
    let area = document.getElementById('drop-area');

    // 阻止默认行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // 高亮拖拽区域
    ['dragenter', 'dragover'].forEach(eventName => {
        area.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, unhighlight, false);
    });

    // 处理拖拽的文件
    area.addEventListener('drop', handleDrop, false);

    // 监听粘贴事件
    document.addEventListener('paste', handlePaste, false);

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        area.classList.add('highlight');
    }

    function unhighlight() {
        area.classList.remove('highlight');
    }

    function handleDrop(e) {
        let dt = e.dataTransfer;
        let files = dt.files;

        handleFiles(files);
    }

    function handlePaste(e) {
        let items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            let item = items[index];
            if (item.kind === 'file') {
                let blob = item.getAsFile();
                let files = [blob];
                handleFiles(files);
            }
        }
    }

    window.handleFiles = function(files) {
        convertToGif(files);
    };

    function convertToGif(files) {
        const gif = new GIF({
            workers: 2,
            quality: 10
        });

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    gif.addFrame(img, {delay: 200});
                    if (gif.frames.length === files.length) {
                        gif.on('finished', function(blob) {
                            const url = URL.createObjectURL(blob);
                            const previewElement = document.getElementById('preview');
                            previewElement.innerHTML = `<img src="${url}" style="display: block; margin: 20px auto;" />`;
                            const tipText = document.createElement('p');
                            tipText.innerText = "直接把上面的图片拖拽到微信发送即可";
                            tipText.style.textAlign = 'center';
                            tipText.style.marginTop = '10px';
                            previewElement.appendChild(tipText);
                        });
                        gif.render();
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
})();
