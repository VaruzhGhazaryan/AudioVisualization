((global) => {
    let
        player,
        options,
        visualization,
        fileList = [],
        wrappedSource = [],

        dropArea = document.getElementById('drop-area'),
        uploadButton = document.querySelector('.upload-btn'),
        fileInput = document.querySelector('#upload'),

        supportedFormats = ['mp3', 'wav', 'ogg', 'm4a', 'aac'],
        dragEventTypes   = ['dragenter','dragleave','dragover','drop'];
        colorGradient = ['#845EC2', '#009EFA', '#00D2FC', '#4FFBDF', '#845EC2'];

    options = {
        ball: {
            geometry: {
                radius: 20,
                detail: 4
            },
            material: {
                color: 0xffffff,
                wireframe: true,
            }
        },

        camera: {
            position: [0,0,100], // x, y, z
            fow: 70,   // Camera frustum vertical field of view.
            near: 0.1, // Camera frustum near plane.
            far: 1000  // Camera frustum far plane
        },
        spotLights: [
            {
                name: 'dark',
                color: 0x4b6a87,
                intensity: 0.6,
                shadow: true,
                position: [150, 80, 200] // x, y, z
            },
            {
                name: 'ligth',
                color: 0x21ca7b,
                intensity: 0.9,
                shadow: true,
                position: [-50, 80, 20] // x, y, z
            }
        ],
        ambientLight: {
            color: 0x000000,
            intensity: 0.6,
        }
    };

    visualization = new SoundVisualisation(options).init();
    player = new Player('.player');

    new ColorMap(colorGradient).animate(function (color) {
        visualization.ligthgroup.getObjectByName('ligth').color = new THREE.Color(color);
    }, 20000, true);

    global.addEventListener( 'resize', () => {
        visualization.updateSceneScreenSize()
    }, false );

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    upload.addEventListener('change', (e) => {
        load(e.target.files);
    });

    dragEventTypes.forEach(type => {
        dropArea.addEventListener(type, handlerFunction, false);
    });

    function handlerFunction(e) {
        e.preventDefault();
        e.stopPropagation();
        changeDropAreaClass(e.type);
        if(e.type === 'drop') load(e.dataTransfer.files);
    }

    function changeDropAreaClass(type){
        if(type === 'dragenter' || type === 'dragover'){
            dropArea.classList.add('dragging')
        }else{
            dropArea.classList.remove('dragging');
        }
    }

    function getFileFormat(file) {
        return file.name.split('.').pop();
    }

    function isSupportedFile(ext){
        return supportedFormats.includes(ext);
    }

    function load(files) {
        for(let i = 0; i < files.length; i++){
            let file = files[i];
            let ext = getFileFormat(file);
            if(isSupportedFile(ext)){
                dropArea.classList.add('hide');
                fileList.push(file)
            }else{
                alertify.error('Not Supported type \''+ext+'\'');
            }
        }
        if(!fileList.length) return;
        wrapAudioSource(fileList, (data) => {
            wrappedSource.push(data.source);
        },() => {
            player.onTrackChanges(function (audio) {
                visualization.audioInput = audio
            });
            player.setAudioInput(wrappedSource);
        });
    }

    function wrapAudioSource(sourceList, next, success) {
        let loaded   = 0;
        let totalCnt = sourceList.length;
        sourceList.map((e) => {
            new p5.SoundFile(e, c => {
                loaded ++;
                next({loaded: loaded, total: totalCnt, source: c});
                if(totalCnt === loaded) success();
            })
        });
    }
})(window);
