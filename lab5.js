const express=require('express')
const app=express();
const path = require('path');
const fs=require('fs');
const {program}=require('commander')
app.use(express.json());
app.use(express.static('bummer'));
app.use(express.urlencoded({ extended: true }));
program
    .option('-h, --host <host>')
    .option('-p, --port <port>')
    .option('-c, --cache <cachePath>');

program.parse();
const options = program.opts();

if (!options.host || !options.port ||!options.cache) {
    console.error('Всі параметри є обов’язковими: --host, --port, --cache');
    process.exit(1);
}
app.listen(options.port, options.host, function(){
    console.log(`server started on port ${options.port}`)
})
app.get('/notes/:note_name', (req, res)=>{
    const filePath=path.join(__dirname, options.cache);
    fs.readFile(filePath, (err,data)=>{
        if(err) return res.status(404).send('Файл не існує');
   
    try{
    const json= JSON.parse(data);
    const filter=json.notes.find(note => note.name===req.params.note_name );
    if (filter) {
        res.send(filter.text);
    } else {
        res.status(404).send('Нотатка не існує');
    }
    }
    catch(error){
        res.status(500).send('Помилка обробки даних');
    };
 });
});
app.put('/notes/:note_name', (req, res)=>{
    const filePath=path.join(__dirname, options.cache);
    const newnote_name=req.body.note_name;
    const newnote=req.body.note;
    fs.readFile(filePath, (err,data)=>{
        if(err) return res.status(404).send('Файл не існує');
    try{
const json=JSON.parse(data);
const find=json.notes.find(not=>not.name===req.params.note_name);
if (!find) {
    return res.status(404).send('Нотатка не знайдена');
}
if(newnote_name)find.name=newnote_name;
if(newnote)find.text=newnote;
fs.writeFile(filePath, JSON.stringify(json, null, 2), (err)=>{
    if(err) return res.status(500).send('Помилка збереження даних');
    res.status(200).send('Нотатка успішно оновлена');
        })
    }
    catch(error){
if(error) res.status(500).send('Помилка обробки даних');
    };
    });
    
});
app.delete('/notes/:note_name', (req, res)=>{
    const filePath=path.join(__dirname, options.cache);
    fs.readFile(filePath, (err,data)=>{
        if(err) return res.status(404).send('Файл не існує');
   
    try{
    const json= JSON.parse(data);
    const updatedJSON=json.notes.filter(note => note.name!==req.params.note_name );
    if(updatedJSON.length===json.notes.length){
        return res.status(404).send('Нотатка не знайдена');
    }
    json.notes=updatedJSON;
    fs.writeFile(filePath, JSON.stringify(json, null, 2), (err)=>{
if(err) return res.status(500).send('Помилка збереження даних');
res.status(200).send('Нотатка успішно видалена');
    })
    }
    catch(error){
        res.status(500).send('Помилка обробки даних');
    };
 });
    
});
app.get('/notes',(req,res)=>{
const filePath=path.join(__dirname, options.cache);
res.status(200).sendFile(filePath);
});

app.post('/write', (req, res) => {
    const filePath = path.join(__dirname, options.cache);
    const note_name = req.body.note_name;
    const note = req.body.note;

    fs.readFile(filePath, 'utf8', (err, data) => {
        let jsonData = { notes: [] }; 

        if (!err && data) {
            try {
                jsonData = JSON.parse(data);
                
                if (jsonData.notes.find(existingNote => existingNote.name === note_name)) {
                    return res.status(400).send('Нотатка з таким ім\'ям уже існує');
                }
                if (!jsonData.notes) {
                    jsonData.notes = [];
                }
            } catch (parseError) {
                console.error('Помилка парсингу JSON:', parseError);
            }
        }

        jsonData.notes.push({
            name: note_name,
            text: note,
        });

        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).send('Помилка збереження даних');
            }
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Submitted Note</title>
                </head>
                <body>
                  <h2>Note Submitted</h2>
                  <p><strong>Note Name:</strong> ${note_name}</p>
                  <p><strong>Note Content:</strong> ${note}</p>
                </body>
                </html>
            `);
        });
   
    });
});
app.get('/UploadForm', (req,res)=>{
   const filePath=path.join(__dirname, 'UploadForm.html');
   const htmlContent=fs.readFileSync(filePath, 'utf-8');
   res.send(htmlContent); 
});