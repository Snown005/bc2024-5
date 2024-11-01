const express=require('express')
const app=express();
const {program}=require('commander')
program
    .option('-h, --host <host>')
    .option('-p, --port <port>')
    .option('-c, --cache <cachePath>');

program.parse();
const options = program.opts();

if (!options.host || !options.port || !options.cache) {
    console.error('Всі параметри є обов’язковими: --host, --port, --cache');
    process.exit(1);
}
app.listen(options.port, options.host, function(){
    console.log(`server started on port ${options.port}`)
})
