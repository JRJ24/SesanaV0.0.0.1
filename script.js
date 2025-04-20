// Funcion asincrona para subir el archivo que queremos transcribir 
async function uploadFile(){
    const fileInput = document.getElementById('fileInput');
    const resultText = document.getElementById('transcript');
    const loader = document.getElementById('loader');

    // Validamos el archivo
    if(!fileInput.files.length){
        alert('Por favor, seleccione un archivo.');
        return;
    }

    const file = fileInput.files[0];
    loader.classList.remove('hidden');

    // Empezamos a utilizar la API de assemblyai
    try{
        const uploadedFileResponse = await fetch('https://api.assemblyai.com/v2/upload',{
            method: 'POST',
            headers:{
                'authorization': '1bb9f77b343a4d10bd1e7c45d0fd8009' // la clave de la API para poder conectarnos a la funcion upload de la API 
            },
            body: file
        });

        // Guardamos el resultado de la subida del archivo
        const uploadFileRes = await uploadedFileResponse.json();

        // Comenzamos a transcribir el archivo
        const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
            method: 'POST',
            headers: {
                'authorization': '1bb9f77b343a4d10bd1e7c45d0fd8009',
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                'audio_url': await uploadFileRes.upload_url
            })
        });

        // Guardamos el resultado de la transcripcion
        const transcriptRes = await transcriptResponse.json();

        // Comenzamos a hacer polling para verificar el estado de la transcripcion
        // El estado inicial es queued
        // y se va actualizando a medida que la transcripcion avanza
        // El estado final es completed o error
        // Si el estado es completed, mostramos el resultado
        // Si el estado es error, mostramos un mensaje de error
        // El polling se hace cada 5 segundos
        // y se detiene cuando el estado es completed o error
        let status = 'queued';
        let transcriptResult = null;

        while(status !== 'completed' && status !== 'error'){
            await new Promise(resolve => setTimeout(resolve, 5000));

            const pollinRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptRes.id}`, {
                headers: {
                    'authorization': '1bb9f77b343a4d10bd1e7c45d0fd8009'
                }
            });

            transcriptResult = await pollinRes.json();
            status = transcriptResult.status;
        }

        if(status === 'completed'){
            resultText.value = transcriptResult.text;
            console.log(transcriptResult);
        }
        else{
            resultText.value = 'Error';
        }
        
            
    }catch (error){
        console.error(error);
        resultText.value = 'Ocurrio un Error' + error.message;

    }

    loader.classList.add('hidden');
}


// Cambiamos el texto del label al seleccionar un archivo
document.getElementById('fileInput').addEventListener('change', function () {
    const label = document.querySelector('label[for="fileInput"]');
    if (this.files.length > 0) {
      label.textContent = `📎 ${this.files[0].name}`;
    } else {
      label.textContent = '📁 Seleccionar archivo';
    }
});