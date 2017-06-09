
console.log('aa');

process.on('message', data => {
    process.send('echo');
});