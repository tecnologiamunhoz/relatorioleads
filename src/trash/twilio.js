const accountSid = 'AC8bc490d44d5d1d5fbea5a666b4815ebc'; 
const authToken = 'ef63dff85eff5348e394f9ae403a011b'; 
const client = require('twilio')(accountSid, authToken); 
 
const enviar = () => {client.messages 
      .create({ 
        body: 'Testando', 
        from: 'whatsapp:+14155238886',       
        to: 'whatsapp:+558196695985' 
       }) 
      .then(message => console.log(message.sid)) 
      .done();}


enviar();