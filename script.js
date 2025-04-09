async function uploadFile(){
    const fileInput = document.getElementById('fileInput');
    const resultText = document.getElementById('transcript');
    const loader = document.getElementById('loader');

    if(!fileInput.files.length){
        alert('Por favor, seleccione un archivo.');
        return;
    }

    const file = fileInput.files[0];
    loader.classList.remove('hidden');

    try{
        const uploadedFileResponse = await fetch('https://api.assemblyai.com/v2/upload',{
            method: 'POST',
            headers:{
                'authorization': '1bb9f77b343a4d10bd1e7c45d0fd8009'
            },
            body: file
        });

        const uploadFileRes = await uploadedFileResponse.json();

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

        const transcriptRes = await transcriptResponse.json();

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

document.getElementById('fileInput').addEventListener('change', function () {
    const label = document.querySelector('label[for="fileInput"]');
    if (this.files.length > 0) {
      label.textContent = `📎 ${this.files[0].name}`;
    } else {
      label.textContent = '📁 Seleccionar archivo';
    }
  });